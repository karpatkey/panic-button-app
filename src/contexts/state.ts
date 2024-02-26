export enum Status {
  Loading = 'Loading',
  Finished = 'Finished'
}

export type Token = {
  symbol: string
  supply: number
  borrow: number
  price: number
  updatedAt: number
}

export type Position = {
  position_id: string
  dao: string
  protocol: string
  blockchain: string
  lptoken_address: string
  lptoken_name: string
  isActive?: boolean
  tokens?: Token[]
}

export type DBankInfo = {
  chain: string
  wallet: string
  protocol_name: string
  position: string
  pool_id: string
  position_type: string
  token_type: string
  symbol: string
  amount: number
  price: number
  datetime: number
}

export type Strategy = {
  id: string
  name: string
  description: string
  rewards_address: Maybe<string>
  max_slippage: Maybe<number>
  token_out_address: Maybe<string>
  token_out_address_label: Maybe<string>
  bpt_address: Maybe<string>
  percentage: Maybe<number>
  blockchain: Maybe<string>
  protocol: Maybe<string>
  position_id: Maybe<string>
  position_name: Maybe<string>
}

export type TransactionBuild = {
  transaction: any
  decodedTransaction: any
}

export enum SetupItemStatus {
  NotDone = 'not done',
  Loading = 'loading',
  Failed = 'failed',
  Success = 'success'
}

export enum State {
  Active = 'Active',
  Inactive = 'Inactive'
}

export enum SetupStatus {
  Loading = 'loading',
  Create = 'create',
  TransactionBuild = 'transaction_build',
  TransactionCheck = 'transaction_check',
  Simulation = 'simulation',
  Confirm = 'confirm',
  Error = 'error'
}

export const initialState: InitialState = {
  status: Status.Loading,
  positions: [],
  filteredPositions: [],
  selectedPosition: null,
  selectedState: State.Active,
  search: null,
  DAOs: [],
  selectedDAO: null,
  isFetchingTokens: false,
  envNetworkData: null,
  loadedDebank: false,
  setup: {
    status: SetupStatus.Loading,
    create: {
      value: null,
      status: SetupItemStatus.NotDone
    },
    transactionBuild: {
      value: null,
      status: SetupItemStatus.NotDone
    },
    transactionCheck: {
      value: null,
      status: SetupItemStatus.NotDone
    },
    simulation: {
      value: null,
      status: SetupItemStatus.NotDone
    },
    confirm: {
      value: null,
      status: SetupItemStatus.NotDone
    }
  }
}

export type InitialState = {
  status: Status
  positions: Position[]
  filteredPositions: Position[]
  selectedPosition: Maybe<Position>
  search: Maybe<string>
  DAOs: string[]
  selectedDAO: Maybe<string>
  selectedState: Maybe<State>
  isFetchingTokens: boolean
  envNetworkData: Maybe<any>
  loadedDebank: boolean
  setup: {
    status: SetupStatus
    create: {
      value: Maybe<Strategy>
      status: SetupItemStatus
    }
    transactionBuild: {
      value: Maybe<TransactionBuild>
      status: SetupItemStatus
    }
    transactionCheck: {
      value: Maybe<boolean>
      status: SetupItemStatus
    }
    simulation: {
      value: Maybe<any>
      status: SetupItemStatus
    }
    confirm: {
      value: Maybe<any>
      status: SetupItemStatus
    }
  }
}
