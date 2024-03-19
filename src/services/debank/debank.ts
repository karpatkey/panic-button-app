function accessKey() {
  return process.env.DEBANK_API_KEY || ''
}

function wait(delay: number) {
  return new Promise((resolve) => setTimeout(resolve, delay))
}

const MAX_RETRIES = 3
function retryBackoff(retriesLeft: number) {
  const randomPart = (Math.floor(Math.random() * 10) + 1) * 50
  const extraSecondPerRetry = (1 + MAX_RETRIES - retriesLeft) * 1000
  return extraSecondPerRetry + randomPart
}

async function getDebankWalletData(wallet: string) {
  return await getDebank(`/v1/user/all_complex_protocol_list?id=${wallet}`)
}

async function getDebank(path: string, retriesLeft: number = MAX_RETRIES) {
  try {
    const url = `https://pro-openapi.debank.com${path}`
    const headers = { accept: 'application/json', AccessKey: accessKey() }
    const response = await fetch(url, { headers })
    const data = await response.json()
    return data
  } catch (error) {
    if (retriesLeft > 0) {
      const backoff = retryBackoff(retriesLeft)
      console.log(`Retrying Debank call ${path} in ${Math.round(backoff)}ms`)
      await wait(backoff)
      return await getDebank(path, retriesLeft - 1)
    } else {
      throw error
    }
  }
}

async function transformData(wallet: string, data: any) {
  return {
    positions: data.flatMap((i: any) => transformEntry(wallet, i)),
    wallet: wallet,
  }
}

const Chains = new Map([
  ['eth', 'ethereum'],
  ['xdai', 'gnosis'],
  ['eth', 'ethereum'],
  ['xdai', 'gnosis'],
  ['matic', 'polygon'],
  ['arb', 'arbitrum'],
  ['op', 'optimism'],
  ['pls', 'pulse'],
  ['avax', 'avalanche'],
  ['bsc', 'base'],
])

const Protocols = new Map([
  ['Aura Finance', 'Aura'],
  ['Balancer V2', 'Balancer'],
  ['LIDO', 'Lido'],
])

// function transformPoolId(pool_id) {
//   return pool_id == '0xde3b7ec86b67b05d312ac8fd935b6f59836f2c41'
//     ? '0xFEdb19Ec000d38d92Af4B21436870F115db22725'
//     : pool_id
// }

import kitchen_data from './kitchen.json'
const PositionNamesFromPoolId = new Map(
  kitchen_data.map((d) => [d.lptoken_address, d.lptoken_name]),
)

function transformEntry(wallet: string, entry: any) {
  const protocol_name = Protocols.get(entry.name) || entry.name
  const chain = Chains.get(entry.chain)
  const tokenOfType =
    (t: any) =>
    ({ chain, symbol, amount, price }: any) => ({ chain, symbol, amount, price, as: t })

  return entry.portfolio_item_list.flatMap((i: any) => {
    const tokens = [
      ...(i.detail.reward_token_list || []).map(tokenOfType('reward')),
      ...(i.detail.supply_token_list || []).map(tokenOfType('supply')),
      ...(i.detail.borrow_token_list || []).map(tokenOfType('borrow')),
      ...(i.detail.other_tokens_list || []).map(tokenOfType('other')),
    ].filter((l) => l)

    const position_type = i.name
    const pool_id = i.pool.id
    const lptoken_name = PositionNamesFromPoolId.get(pool_id) || i.detail.description

    return {
      usd_amount: i.stats.asset_usd_value,
      chain,
      wallet,
      position_type,
      pool_id,
      protocol_name,
      lptoken_name,
      tokens,
      updated_at: i.updated_at,
    }
  })
}

export async function getPositions(wallets: string[]) {
  const processWallet = async (wallet: string) => {
    const data = await getDebankWalletData(wallet)
    if (data.message) {
      throw new Error(data.message)
    }
    return transformData(wallet, data)
  }
  return await Promise.all(wallets.flatMap(processWallet))
}
