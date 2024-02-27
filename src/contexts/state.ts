export enum Status {
  Loading = 'Loading',
  Finished = 'Finished'
}

export type Position = {
  position_id: string
  dao: string
  protocol: string
  blockchain: string
  lptoken_address: string
  lptoken_name: string
  isActive: boolean | undefined
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
  search: null,
  DAOs: [],
  selectedDAO: null,
  envNetworkData: null,
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
  envNetworkData: Maybe<any>
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
