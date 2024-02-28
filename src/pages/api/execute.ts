import { withApiAuthRequired } from '@auth0/nextjs-auth0'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession, Session } from '@auth0/nextjs-auth0'
import {
  BLOCKCHAIN,
  DAO,
  getDAOFilePath,
  getStrategyByPositionId
} from 'src/config/strategies/manager'
import { EXECUTION_TYPE } from 'src/config/strategies/manager'
import { CommonExecutePromise } from 'src/utils/execute'
import { ethers } from 'ethers'

type Status = {
  data?: Maybe<any>
  status?: Maybe<number>
  error?: Maybe<string>
}

const WEB3SIGNER_URL = process.env.WEB3SIGNER_URL

// Create a mapper for DAOs
const DAO_MAPPER: Record<string, string> = {
  'Gnosis DAO': 'GnosisDAO',
  'Gnosis Ltd': 'GnosisLtd',
  'karpatkey DAO': 'karpatkey'
}

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Status>
) {
  // Should be a post request
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const session = await getSession(req as any, res as any)

  // Validate session here
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  // Get common parameters from the body
  const {
    execution_type,
    blockchain,
    dao = ''
  } = req.body as {
    execution_type: EXECUTION_TYPE
    blockchain: Maybe<BLOCKCHAIN>
    dao: Maybe<DAO>
  }

  // Get User role, if not found, return an error
  const user = (session as Session).user
  const roles = user?.['http://localhost:3000/roles']
    ? (user?.['http://localhost:3000/roles'] as unknown as string[])
    : []

  const DAOs = roles
  if (!DAOs) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  if (dao && !DAOs.includes(dao)) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  if (!blockchain) {
    res.status(400).json({ error: 'Invalid params' })
    return
  }

  const parameters: any[] = []

  if (dao) {
    parameters.push('--dao')
    parameters.push(DAO_MAPPER[dao])
  }

  if (blockchain) {
    parameters.push('--blockchain')
    parameters.push(`${blockchain.toUpperCase()}`)
  }

  const filePath = getDAOFilePath(
    dao as DAO,
    blockchain as BLOCKCHAIN,
    execution_type as EXECUTION_TYPE
  )

  console.log('FilePath', filePath)

  if (execution_type === 'transaction_builder') {
    try {
      // Build de arguments for the transaction builder

      // Get the strategy from the body, if not found, return an error
      const { strategy, percentage, position_id, protocol, exit_arguments } = req.body as {
        strategy: Maybe<string>
        percentage: Maybe<number>
        position_id: Maybe<string>
        protocol: Maybe<string>
        exit_arguments: {
          rewards_address: Maybe<string>
          max_slippage: Maybe<number>
          token_out_address: Maybe<string>
          bpt_address: Maybe<string>
        }
      }

      // Add the rest of the parameters if needed
      if (percentage) {
        parameters.push('--percentage')
        parameters.push(`${percentage}`)
      }

      if (strategy) {
        parameters.push('--exit-strategy')
        parameters.push(`${strategy}`)
      }

      if (protocol) {
        parameters.push('--protocol')
        parameters.push(`${protocol}`)
      }

      let exitArguments = {}

      // Add CONSTANTS from the strategy
      if (protocol) {
        const { positionConfig } = getStrategyByPositionId(
          dao as DAO,
          blockchain as unknown as BLOCKCHAIN,
          protocol,
          position_id as string
        )
        const positionConfigItemFound = positionConfig?.find(
          (positionConfigItem) => positionConfigItem.function_name === strategy
        )

        positionConfigItemFound?.parameters?.forEach((parameter) => {
          if (parameter.type === 'constant') {
            exitArguments = {
              ...exitArguments,
              [parameter.name]: parameter.value
            }
          }
        })
      }

      // Add the rest of the parameters if needed
      for (const key in exit_arguments) {
        const value = exit_arguments[key as keyof typeof exit_arguments]
        if (value) {
          exitArguments = {
            ...exitArguments,
            [key]: value
          }
        }
      }

      if (Object.keys(exitArguments).length > 0) {
        parameters.push('--exit-arguments')
        parameters.push(`[${JSON.stringify(exitArguments)}]`)
      }

      console.log('Parameters', parameters)

      // Execute the transaction builder
      const { status, data, error } = await CommonExecutePromise(filePath, parameters)

      return res.status(200).json({ data, status, error })
    } catch (error) {
      console.error('TRANSACTION_BUILDER_ERROR: ', error)
      return res.status(500).json({ error: (error as Error)?.message, status: 500 })
    }
  }

  if (execution_type === 'simulate' || (execution_type === 'execute' && !WEB3SIGNER_URL)) {
    try {
      // Build de arguments for the transaction builder

      // Get the strategy from the body, if not found, return an error
      const { transaction } = req.body as {
        transaction: Maybe<any>
      }

      // Add the rest of the parameters if needed
      if (transaction) {
        parameters.push('--transaction')
        parameters.push(`${JSON.stringify(transaction)}`)
      }

      // Execute the transaction builder
      const { status, data, error } = await CommonExecutePromise(filePath, parameters)

      return res.status(200).json({ data, error, status })
    } catch (error) {
      console.error('EXECUTION_SIMULATION_ERROR: ', error)
      return res.status(500).json({ error: (error as Error)?.message, status: 500 })
    }
  }

  if (execution_type === 'execute' && WEB3SIGNER_URL) {
    try {
      const { transaction } = req.body as {
        transaction: Maybe<any>
      }

      const id = +new Date()
      const headers = { 'Content-Type': 'application/json' }
      const payload = {
        jsonrpc: '2.0',
        method: 'eth_signTransaction',
        params: [transaction],
        id: id
      }
      const response = await fetch(WEB3SIGNER_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      })
      const signed = await response.json()
      if (signed.error) {
        throw new Error('Web3Signer Error: ' + JSON.stringify(signed.error))
      }
      const provider = getEthersProvider(blockchain)
      const txResponse = await provider.broadcastTransaction(signed.result)
      await txResponse.wait()

      return res.status(200).json({ data: { tx_hash: txResponse.hash } })
    } catch (error) {
      console.error('EXECUTION_ERROR: ', error)
      return res.status(500).json({ error: (error as Error)?.message, status: 500 })
    }
  }

  return res.status(500).json({ error: 'Internal Server Error', status: 500 })
})

function getEthersProvider(blockchain: BLOCKCHAIN) {
  const { main, fallback } = {
    Ethereum: {
      main: process?.env?.ETHEREUM_RPC_ENDPOINT,
      fallback: process?.env?.ETHEREUM_RPC_ENDPOINT_FALLBACK
    },
    Gnosis: {
      main: process?.env?.GNOSIS_RPC_ENDPOINT,
      fallback: process?.env?.GNOSIS_RPC_ENDPOINT_FALLBACK
    }
  }[blockchain]

  const provider = new ethers.FallbackProvider([
    { provider: new ethers.JsonRpcProvider(main), priority: 1 },
    { provider: new ethers.JsonRpcProvider(fallback), priority: 100 }
  ])
  return provider
}
