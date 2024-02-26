export const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID
export const GOOGLE_CREDS = {
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  project_id: GOOGLE_PROJECT_ID,
  private_key: process.env?.GOOGLE_PRIVATE_KEY?.replace(new RegExp('\\\\n', 'g'), '\n')
}

export const DATA_WAREHOUSE_ENV = process.env.DATA_WAREHOUSE_ENV || 'production'
export const TITLE = 'karpatkey'

export const enum DAO_NAME_KEY {
  'Gnosis DAO' = 0,
  'Gnosis LTD' = 1,
  'Balancer DAO' = 2,
  'ENS DAO' = 3,
  'CoW DAO' = 4,
  'karpatkey DAO' = 5,
  'Gnosis Guild' = 6
}

export interface DAO {
  id: DAO_NAME_KEY
  name: string
  icon: string
  keyName: string
  sinceMonth: number
  sinceYear: number
  addresses: {
    address: string
    chainId: number
  }[]
}

export const ALL_DAOS = [
  'Gnosis DAO',
  'Gnosis LTD',
  'Balancer DAO',
  'ENS DAO',
  'CoW DAO',
  'karpatkey DAO',
  'Gnosis Guild'
]

export function daoWallets(dao: string): string[] {
  const config = DAO_LIST.find((d) => d.keyName == dao)
  if (!config) return []
  return config.addresses.flatMap((a) => a.address)
}

export const DAO_LIST: DAO[] = [
  {
    id: DAO_NAME_KEY['Gnosis DAO'],
    name: 'Gnosis',
    icon: '/images/protocols/gnosis.svg',
    keyName: 'Gnosis DAO',
    sinceMonth: 1,
    sinceYear: 2023,
    addresses: [
      {
        address: '0x849d52316331967b6ff1198e5e32a0eb168d039d',
        chainId: 1
      },
      {
        address: '0x458cd345b4c05e8df39d0a07220feb4ec19f5e6f',
        chainId: 100
      }
    ]
  },
  {
    id: DAO_NAME_KEY['Balancer DAO'],
    name: 'Balancer',
    icon: '/images/protocols/balancer.svg',
    keyName: 'Balancer DAO',
    sinceMonth: 2,
    sinceYear: 2023,
    addresses: [
      {
        address: '0x0efccbb9e2c09ea29551879bd9da32362b32fc89',
        chainId: 1
      }
    ]
  },
  {
    id: DAO_NAME_KEY['ENS DAO'],
    name: 'ENS',
    icon: '/images/protocols/ens.svg',
    keyName: 'ENS DAO',
    sinceMonth: 3,
    sinceYear: 2023,
    addresses: [
      {
        address: '0x4f2083f5fbede34c2714affb3105539775f7fe64',
        chainId: 1
      }
    ]
  },
  {
    id: DAO_NAME_KEY['CoW DAO'],
    name: 'CoW',
    icon: '/images/protocols/cow.svg',
    keyName: 'CoW DAO',
    sinceMonth: 2,
    sinceYear: 2023,
    addresses: [
      {
        address: '0x616de58c011f8736fa20c7ae5352f7f6fb9f0669',
        chainId: 1
      },
      {
        address: '0x616de58c011f8736fa20c7ae5352f7f6fb9f0669',
        chainId: 100
      }
    ]
  },
  {
    id: DAO_NAME_KEY['karpatkey DAO'],
    name: 'karpatkey',
    icon: '/images/protocols/karpatkey.svg',
    keyName: 'karpatkey DAO',
    sinceMonth: 1,
    sinceYear: 2023,
    addresses: [
      {
        address: '0x58e6c7ab55aa9012eacca16d1ed4c15795669e1c',
        chainId: 1
      },
      {
        address: '0x54e191B01aA9C1F61AA5C3BCe8d00956F32D3E71',
        chainId: 100
      }
    ]
  }
]
