import { withApiAuthRequired } from '@auth0/nextjs-auth0'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession, Session } from '@auth0/nextjs-auth0'
import { ethers } from 'ethers'
import {
  BLOCKCHAIN,
  DAO,
  getDAOFilePath,
  getStrategyByPositionId
} from 'src/config/strategies/manager'
import { EXECUTION_TYPE } from 'src/config/strategies/manager'
import { CommonExecutePromise } from 'src/utils/execute'

type Status = {
  data?: Maybe<any>
  status?: Maybe<number>
  error?: Maybe<string>
}

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

  // TODO remove this labelled break as no one uses this in JS
  // it's so that we cancel execution with signer if it's not configured
  // and continues to the "test" execution
  break_execute: if (execution_type === 'execute') {
    try {
      const { transaction } = req.body as {
        transaction: Maybe<any>
      }

      const signerUrl = getSignerUrl(transaction.chainId)
      if (!signerUrl) {
        // TODO change this
        break break_execute
      }

      const provider = getEthersProvider(blockchain)

      if (process.env.MODE == 'development') {
        // Overwrite transaction so we send transactions
        // that web3signer is configured for
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        // const priv = require('yaml').parse(
        //   // eslint-disable-next-line @typescript-eslint/no-var-requires
        //   require('fs').readFileSync(process.cwd() + '/key.yml', 'utf8')
        // ).privateKey
        const priv = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
        const wallet = new ethers.Wallet(priv)
        const address = wallet.address
        // delete transaction.chainId
        transaction.from = address
        transaction.nonce = await provider.getTransactionCount(wallet.address)
        console.log('Rewrote transaction', transaction)
      }

      const id = +new Date()
      const headers = { 'Content-Type': 'application/json' }
      const payload = {
        jsonrpc: '2.0',
        method: 'eth_signTransaction',
        params: [transaction],
        id: id
      }
      const response = await fetch(signerUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      })
      const signed = await response.json()

      if (signed.error) {
        throw new Error('Web3Signer Error: ' + JSON.stringify(signed.error))
      }
      // console.log('signed TX', signed)
      const txResponse = await provider.broadcastTransaction(signed.result)
      // await txResponse.wait()

      return res.status(200).json({ data: { tx_hash: txResponse.hash } })
    } catch (error) {
      console.error('EXECUTION_ERROR: ', error)
      return res.status(500).json({ error: (error as Error)?.message, status: 500 })
    }
  }

  if (execution_type === 'simulate' || execution_type === 'execute') {
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

  return res.status(500).json({ error: 'Internal Server Error', status: 500 })
})

function getEthersProvider(blockchain: BLOCKCHAIN) {
  const { mev, main, fallback } = {
    Ethereum: {
      production: {
        main: process?.env?.ETHEREUM_RPC_ENDPOINT,
        fallback: process?.env?.ETHEREUM_RPC_ENDPOINT_FALLBACK
      },
      development: {
        main: `http://${process?.env?.LOCAL_FORK_HOST_ETHEREUM}:${process?.env?.LOCAL_FORK_PORT_ETHEREUM}`,
        fallback: ''
      },
      test: {
        main: '',
        fallback: ''
      }
    },
    Gnosis: {
      production: {
        mev: process?.env?.ETHEREUM_RPC_ENDPOINT_MEV,
        main: process?.env?.GNOSIS_RPC_ENDPOINT,
        fallback: process?.env?.GNOSIS_RPC_ENDPOINT_FALLBACK
      },
      development: {
        main: `http://${process?.env?.LOCAL_FORK_HOST_GNOSIS}:${process?.env?.LOCAL_FORK_PORT_GNOSIS}`,
        fallback: ''
      },
      test: {
        main: '',
        test: ''
      }
    }
  }[blockchain][(process.env.MODE || 'development') as 'development' | 'production']

  const network = { Ethereum: 1, Gnosis: 100 }[blockchain]
  const options = [network, { staticNetwork: true }] as [
    ethers.Networkish,
    ethers.JsonRpcApiProviderOptions
  ]
  // console.log({ main, fallback }, options)
  const provider = new ethers.FallbackProvider(
    [mev, main, fallback]
      .filter((url) => url)
      .map((url, idx) => ({
        priority: idx,
        provider: new ethers.JsonRpcProvider(url, ...options)
      }))
  )
  return provider
}

function getSignerUrl(chainId: string) {
  return (
    {
      '1': process.env.WEB3SIGNER_ETHEREUM_URL,
      '100': process.env.WEB3SIGNER_GNOSIS_URL
    }[chainId] ?? ''
  )
}
