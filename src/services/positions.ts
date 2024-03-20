import { daoWallets } from 'src/config/constants'
import * as debank from 'src/services/debank/debank'
import { DataWarehouse } from 'src/services/dwh/dataWarehouse'

interface PositionsResponse {
  data: Position[]
  error?: string
}

export async function getPositions(daos: string[]): Promise<PositionsResponse> {
  try {
    return await debankAdapter().getPositions(daos)
  } catch (e) {
    console.error('Positions error:', e)
    // return dwAdapter().getPositions(daos)
    if (e instanceof Error) {
      e = e.message
    }
    return { error: e as string, data: [] }
  }
}

interface Token {
  symbol: string
  as: 'supply' | 'borrow' | 'reward' | 'other'
  amount: number
  price: number
  updatedAt: number
}

interface Position {
  // position_id: string
  dao: string
  protocol: string
  blockchain: string
  lptoken_address: string
  lptoken_name: string
  tokens?: Token[]
}

interface Adapter {
  getPositions: (wallets: string[]) => Promise<{ data: Position[] }>
  enabled: () => boolean
}

class DisabledAdapter implements Adapter {
  name: string

  constructor(name: string) {
    this.name = name
  }

  enabled() {
    return true
  }

  async getPositions(): Promise<{ data: Position[] }> {
    throw Error('getPositions not implemented for disabled adapter')
  }
}

const MIN_USD_AMOUNT = 5000

async function getDebankPositions(daos: string[]): Promise<{ data: Position[] }> {
  const dwallets = daos.map((dao) => ({ dao, wallets: daoWallets(dao) }))
  const wallets = dwallets.flatMap((dw) => dw.wallets)
  const walletPositions = await debank.getPositions(wallets)

  const walletDao = new Map<string, string>(
    dwallets.flatMap(({ dao, wallets }) => wallets.map((wallet) => [wallet, dao])),
  )

  const data = walletPositions.flatMap((walletPosition: any) => {
    const dao = walletDao.get(walletPosition.wallet)

    const positions = walletPosition.positions
      .map((position: any) => {
        const lptokenName = lptokenNameFromPosition(position)
        return {
          dao,
          usd_amount: position.usd_amount,
          wallet: position.wallet,
          pool_id: position.pool_id,
          protocol: position.protocol_name,
          positionType: position.position_type,
          lptokenName: position.lptoken_name || lptokenName,
          blockchain: position.chain,
          tokens: position.tokens,
          updated_at: position.updated_at,
        }
      })
      .filter((p: any) => p.usd_amount > MIN_USD_AMOUNT)

    const tokens = walletPosition.tokens
      .map((t: any) => {
        return {
          dao,
          usd_amount: t.price * t.amount,
          positionType: 'token',
          pool_id: t.id,
          blockchain: t.chain,
          protocol: t.protocol_id,
          lptokenName: t.symbol,
          tokens: [
            {
              symbol: t.symbol,
              as: 'core',
              amount: t.amount,
              price: t.price,
            },
          ],
          // "name": "Chi Gastoken by 1inch",
          // "symbol": "CHI",
          // "display_symbol": null,
          // "optimized_symbol": "CHI",
          // "decimals": 0,
          // "logo_url": "https://static.debank.com/image/eth_token/logo_url/0x0000000000004946c0e9f43f4dee607b0ef1fa1c/5d763d01aae3f0ac9a373564026cb620.png",
          // "protocol_id": "1inch",
          // "price": 0,
          // "is_core": true,
          // "is_wallet": true,
          // "time_at": 1590352004,
          // "amount": 3,
          // "raw_amount": 3
        }
      })
      .filter((p: any) => p.usd_amount > MIN_USD_AMOUNT)

    return positions.concat(tokens)
  })

  return { data }
}

function lptokenNameFromPosition(position: Position) {
  const symbols = (position.tokens || []).filter((t) => t.as == 'supply').map((t) => t.symbol)
  return symbols.sort().join('+')
}

function debankAdapter() {
  return { getPositions: getDebankPositions, enabled: () => true } as Adapter
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function dwAdapter() {
  try {
    return DataWarehouse.getInstance()
  } catch (e) {
    return new DisabledAdapter('debank')
  }
}
