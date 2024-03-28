import { keccak256, toUtf8Bytes } from 'ethers'
// import { version } from 'package.json'

export type CowOrderRequest = {
  sellToken: string
  buyToken: string
  receiver: string
  sellAmount: string
  buyAmount: string
  validTo: number
  feeAmount: string
  kind: string
  sellTokenBalance: string
  signScheme: string
  partiallyFillable: boolean
  signature: string
  from: string
}

export type Chain = 'xdai' | 'eth'

export function createOrder(chain: Chain, args: CowOrderRequest) {
  const body = {
    ...args,
    ...appDataArgs(),
  }
  return post(chain, '/api/v1/orders', body)
}

function appDataArgs() {
  const meta = {
    appCode: 'santi_the_best',
  }

  // It could be that encoding in a deterministic here is required
  const appData = JSON.stringify(meta)
  const appDataHash = keccak256(toUtf8Bytes(appData))

  return {
    appData,
    appDataHash,
  }
}

async function post(chain: Chain, path: string, body: any) {
  const url = endpoint(chain) + path

  console.debug('calling Cowswap tx: ', url, body)
  const resp = await fetch(url, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: JSON.stringify(body),
  })

  const throwError = (message: any) => {
    // console.error(resp)
    throw new Error(`CowswapError: ${message}`)
  }
  switch (resp.status) {
    case 201:
      return await resp.json()
    case 400:
      throwError('invalid order')
    case 403:
      throwError('Forbidden, your account is deny-listed.')
    default:
      throwError(resp.status)
  }
}

function environment() {
  return process.env.ENVIRONMENT || 'development'
}

function endpoint(chain: Chain) {
  if (environment() == 'development') {
    return {
      // there's no env for gnosis testnet actually
      xdai: 'https://api.cow.fi/chiado',
      eth: 'https://api.cow.fi/sepoila',
    }[chain]
  } else {
    return {
      // there's no env for gnosis testnet actually
      xdai: 'https://api.cow.fi/xdai',
      eth: 'https://api.cow.fi/mainnet',
    }[chain]
  }
}
