export type DAO =
  | 'Gnosis DAO'
  | 'Balancer DAO'
  | 'karpatkey DAO'
  | 'ENS DAO'
  | 'CoW DAO'
  | 'Gnosis Ltd'

export type BLOCKCHAIN = 'Gnosis' | 'Ethereum'

export type EXECUTION_TYPE = 'execute' | 'simulate' | 'transaction_builder'

export type DAO_MAPPER_TYPE = {
  name: DAO
  blockchain: BLOCKCHAIN
  config: any
}

const EXECUTE_FILE_PATH = 'roles_royce/roles_royce/applications/panic_button_app/execute.py'
const SIMULATE_FILE_PATH = 'roles_royce/roles_royce/applications/panic_button_app/simulate.py'
const TRANSACTION_BUILDER_FILE_PATH =
  'roles_royce/roles_royce/applications/panic_button_app/transaction_builder.py'

export enum DEFAULT_VALUES_KEYS {
  position_id = 'position_id',
  protocol = 'protocol',
  blockchain = 'blockchain',
  strategy = 'strategy',
  percentage = 'percentage',
  rewards_address = 'rewards_address',
  max_slippage = 'max_slippage',
  token_out_address = 'token_out_address',
  bpt_address = 'bpt_address'
}

export type DEFAULT_VALUES_TYPE = {
  [DEFAULT_VALUES_KEYS.position_id]: Maybe<string>
  [DEFAULT_VALUES_KEYS.protocol]: Maybe<string>
  [DEFAULT_VALUES_KEYS.blockchain]: Maybe<string>
  [DEFAULT_VALUES_KEYS.strategy]: Maybe<string>
  [DEFAULT_VALUES_KEYS.percentage]: Maybe<string>
  [DEFAULT_VALUES_KEYS.rewards_address]: Maybe<string>
  [DEFAULT_VALUES_KEYS.max_slippage]: Maybe<string>
  [DEFAULT_VALUES_KEYS.token_out_address]: Maybe<string>
  [DEFAULT_VALUES_KEYS.bpt_address]: Maybe<string>
}

export const PARAMETERS_CONFIG: {
  [key in DEFAULT_VALUES_KEYS]: {
    placeholder: string
  }
} = {
  [DEFAULT_VALUES_KEYS.position_id]: {
    placeholder: 'Position ID'
  },
  [DEFAULT_VALUES_KEYS.protocol]: {
    placeholder: 'Protocol'
  },
  [DEFAULT_VALUES_KEYS.blockchain]: {
    placeholder: 'Blockchain'
  },
  [DEFAULT_VALUES_KEYS.strategy]: {
    placeholder: 'Strategy'
  },
  [DEFAULT_VALUES_KEYS.percentage]: {
    placeholder: '0.00%'
  },
  [DEFAULT_VALUES_KEYS.rewards_address]: {
    placeholder: '0x00000'
  },
  [DEFAULT_VALUES_KEYS.max_slippage]: {
    placeholder: '0.00%'
  },
  [DEFAULT_VALUES_KEYS.token_out_address]: {
    placeholder: '0x00000'
  },
  [DEFAULT_VALUES_KEYS.bpt_address]: {
    placeholder: '0x00000'
  }
}

export type Config = {
  name: DEFAULT_VALUES_KEYS
  label?: string
  type: 'input' | 'constant'
  value?: string
  rules?: {
    min?: number
    max?: number
  }
  options?: { label: string; value: string }[]
}

export type PositionConfig = {
  function_name: string
  label: string
  description: string
  parameters: Config[]
}

export type ExecConfig = {
  commonConfig: Config[]
  positionConfig: PositionConfig[]
}

export const getStrategies = (mapper: any, dao: DAO, blockchain: BLOCKCHAIN) => {
  const bc = blockchain.toLowerCase()
  return mapper?.find((daoMapper: any) => daoMapper.dao === dao && daoMapper.blockchain === bc)
}

export const getStrategyByPositionId = (
  daosConfigs: any,
  dao: DAO,
  blockchain: BLOCKCHAIN,
  _protocol: string,
  positionId: string
) => {
  const daoItem = getStrategies(daosConfigs, dao, blockchain)

  const positionKey = `${positionId}`

  const position = daoItem?.positions?.find(
    (position: any) => position.position_id.toLowerCase() === positionKey.toLowerCase()
  )

  return {
    commonConfig: daoItem?.general_parameters ?? [],
    positionConfig: position?.exec_config ?? []
  } as ExecConfig
}

export const getDAOFilePath = (
  _dao: DAO,
  _blockchain: BLOCKCHAIN,
  executionType: EXECUTION_TYPE
) => {
  // const DAO_ITEM: DAO_MAPPER_TYPE | undefined = getStrategies(dao, blockchain)
  switch (executionType) {
    case 'execute':
      return EXECUTE_FILE_PATH
    case 'simulate':
      return SIMULATE_FILE_PATH
    case 'transaction_builder':
      return TRANSACTION_BUILDER_FILE_PATH
  }
}
