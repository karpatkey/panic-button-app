import {
  DBankInfo,
  InitialState,
  Position,
  SetupItemStatus,
  SetupStatus,
  State,
  Status,
  Strategy,
  TransactionBuild
} from './state'
import {
  Actions,
  ActionType,
  AddDAOs,
  AddPositions,
  ClearDAOs,
  ClearPositions,
  ClearSearch,
  ClearSelectedDAO,
  ClearSelectedPosition,
  ClearSetup,
  ClearSetupWithoutCreate,
  SetSearch,
  SetSelectedDAO,
  SetSelectedPosition,
  SetSetupConfirm,
  SetSetupConfirmStatus,
  SetSetupCreate,
  SetSetupCreateStatus,
  SetSetupSimulation,
  SetSetupSimulationStatus,
  SetSetupStatus,
  SetSetupTransactionBuild,
  SetSetupTransactionBuildStatus,
  SetSetupTransactionCheck,
  SetSetupTransactionCheckStatus,
  UpdateEnvNetworkData,
  Filter,
  UpdateStatus,
  AddDaosConfigs,
  UpdatePositionsWithTokenBalances,
  UpdateIsFetchingTokens
} from './actions'
import { BLOCKCHAIN, DAO, EXECUTION_TYPE, getDAOFilePath } from '../config/strategies/manager'
import { getStrategy } from '../utils/strategies'
import { daoWallets } from 'src/config/constants'

export const mainReducer = (state: InitialState, action: Actions): InitialState => {
  switch (action.type) {
    case ActionType.AddDaosConfigs:
      return {
        ...state,
        daosConfigs: action.payload
      }
    case ActionType.UpdateStatus:
      return {
        ...state,
        status: action.payload
      }

    case ActionType.AddPositions:
      return {
        ...state,
        positions: action.payload
      }

    case ActionType.ClearPositions:
      return {
        ...state,
        positions: []
      }

    case ActionType.SetSelectedPosition:
      return {
        ...state,
        selectedPosition: action.payload
      }

    case ActionType.ClearSelectedPosition:
      return {
        ...state,
        selectedPosition: null
      }

    case ActionType.AddDAOs:
      if (!action.payload.includes('All') && action.payload.length > 1) {
        return {
          ...state,
          selectedDAO: 'All',
          DAOs: ['All', ...action.payload]
        }
      } else if (action.payload.length === 1) {
        return {
          ...state,
          selectedDAO: action.payload[0],
          DAOs: action.payload
        }
      }

    case ActionType.ClearDAOs:
      return {
        ...state,
        DAOs: []
      }
    case ActionType.SetSelectedDAO:
      // Return state with selected DAO and filtered positions
      return {
        ...state,
        selectedDAO: action.payload
      }

    case ActionType.ClearSelectedDAO:
      return {
        ...state,
        selectedDAO: null
      }
    case ActionType.SetSearch:
      return {
        ...state,
        search: action.payload
      }
    case ActionType.ClearSearch:
      return {
        ...state,
        search: null
      }
    case ActionType.SetSetupCreate:
      return {
        ...state,
        setup: {
          ...state.setup,
          create: {
            value: action.payload,
            status: SetupItemStatus.Success
          }
        }
      }

    case ActionType.SetSetupCreateStatus:
      return {
        ...state,
        setup: {
          ...state.setup,
          create: {
            ...state.setup.create,
            status: action.payload
          }
        }
      }

    case ActionType.SetSetupTransactionBuild:
      return {
        ...state,
        setup: {
          ...state.setup,
          transactionBuild: {
            value: action.payload,
            status: SetupItemStatus.Success
          }
        }
      }

    case ActionType.SetSetupTransactionBuildStatus:
      return {
        ...state,
        setup: {
          ...state.setup,
          transactionBuild: {
            ...state.setup.transactionBuild,
            status: action.payload
          }
        }
      }

    case ActionType.SetSetupTransactionCheck:
      return {
        ...state,
        setup: {
          ...state.setup,
          transactionCheck: {
            value: action.payload,
            status: SetupItemStatus.Success
          }
        }
      }

    case ActionType.SetSetupTransactionCheckStatus:
      return {
        ...state,
        setup: {
          ...state.setup,
          transactionCheck: {
            ...state.setup.transactionCheck,
            status: action.payload
          }
        }
      }

    case ActionType.SetSetupSimulation:
      return {
        ...state,
        setup: {
          ...state.setup,
          simulation: {
            value: action.payload,
            status: SetupItemStatus.Success
          }
        }
      }

    case ActionType.SetSetupSimulationStatus:
      return {
        ...state,
        setup: {
          ...state.setup,
          simulation: {
            ...state.setup.simulation,
            status: action.payload
          }
        }
      }

    case ActionType.SetSetupConfirm:
      return {
        ...state,
        setup: {
          ...state.setup,
          confirm: {
            value: action.payload,
            status: SetupItemStatus.Success
          }
        }
      }

    case ActionType.SetSetupConfirmStatus:
      return {
        ...state,
        setup: {
          ...state.setup,
          confirm: {
            ...state.setup.confirm,
            status: action.payload
          }
        }
      }

    case ActionType.SetSetupStatus:
      return {
        ...state,
        setup: {
          ...state.setup,
          status: action.payload
        }
      }

    case ActionType.ClearSetup:
      return {
        ...state,
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

    case ActionType.ClearSetupWithoutCreate:
      return {
        ...state,
        setup: {
          ...state.setup,
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

    case ActionType.Filter:
      // Filter positions by DAO
      const filteredPositionsByDAO =
        state?.positions?.filter((position: Position) => {
          if (state.selectedDAO === 'All') return true
          return position?.dao?.toLowerCase() === state?.selectedDAO?.toLowerCase()
        }) ?? []

      // Filter positions by search
      const filteredPositionsByDAOAndSearch =
        filteredPositionsByDAO?.filter((position: Position) => {
          if (state?.search === null) return true
          return (
            position?.lptoken_name?.toLowerCase()?.includes(state?.search?.toLowerCase()) ||
            position?.protocol?.toLowerCase()?.includes(state?.search?.toLowerCase()) ||
            position?.lptoken_address?.toLowerCase()?.includes(state?.search?.toLowerCase())
          )
        }) ?? []

      // Order by state
      const filteredPositionsByDAOAndSearchAndOrdered =
        filteredPositionsByDAOAndSearch
          ?.map((position: Position) => {
            const { positionConfig } = getStrategy(state.daosConfigs, position as Position)
            const isActive = !!positionConfig.find((p) => p.stresstest)
            return {
              ...position,
              isActive
            }
          })
          .sort((a: Position, b: Position) => {
            // check state.selectedState 'Active' to order
            if (state.selectedState === State.Active) {
              if (a.isActive && !b.isActive) return -1
              if (!a.isActive && b.isActive) return 1
            }
            // check state.selectedState 'Inactive' to order
            if (state.selectedState === State.Inactive) {
              if (!a.isActive && b.isActive) return -1
              if (a.isActive && !b.isActive) return 1
            }
            // sort by lptoken_name
            if (a.lptoken_name < b.lptoken_name) return -1
            if (a.lptoken_name > b.lptoken_name) return 1

            // if state.selectedState is null, don't order
            return 0
          }) ?? []

      return {
        ...state,
        filteredPositions: filteredPositionsByDAOAndSearchAndOrdered
      }

    case ActionType.UpdateEnvNetworkData:
      return {
        ...state,
        envNetworkData: action.payload
      }

    case ActionType.UpdatePositionsWithTokenBalances:
      const dBankData = action.payload
      const walletsByDAO: { [key: string]: string[] } = state.DAOs.reduce(
        (acc, dao) => ({ ...acc, [dao]: daoWallets(dao) }),
        {}
      )
      const positionsWithTokens = state?.positions?.map((position: Position) => {
        const wallets = walletsByDAO[position.dao] || []
        const dBankTokens: DBankInfo[] =
          dBankData?.filter((dbankInfo: DBankInfo) => {
            if (!wallets.includes(dbankInfo.wallet)) return false
            // should match by dBandk properties chain, protocol_name, position
            return (
              dbankInfo?.chain?.toLowerCase() === position.blockchain.toLowerCase() &&
              dbankInfo?.protocol_name?.toLowerCase() === position.protocol.toLowerCase() &&
              dbankInfo?.position?.toLowerCase() === position.lptoken_name.toLowerCase() &&
              (dbankInfo?.token_type === 'supply' || dbankInfo?.token_type === 'borrow')
            )
          }) ?? []

        const tokens =
          dBankTokens
            ?.map((token: DBankInfo) => {
              const updateAt = new Date().getTime()
              return {
                symbol: token.symbol,
                supply: token.token_type === 'supply' ? token.amount : 0,
                borrow: token.token_type === 'borrow' ? token.amount : 0,
                price: token.price,
                updatedAt: updateAt
              }
            })
            ?.reduce((acc: any, token: any) => {
              // reduce tokens by supply or borrow with the biggest amount,
              // the problem is the json file in the dBank script have multiple entries for the same token
              const tokenIndex = acc.findIndex((accToken: any) => accToken.symbol === token.symbol)
              if (tokenIndex === -1) {
                acc.push(token)
              } else {
                if (acc[tokenIndex].supply < token.supply) {
                  acc[tokenIndex].supply = token.supply
                }
                if (acc[tokenIndex].borrow < token.borrow) {
                  acc[tokenIndex].borrow = token.borrow
                }
              }
              return acc
            }, []) ?? []

        return {
          ...position,
          tokens
        }
      })

      return {
        ...state,
        loadedDebank: true,
        positions: positionsWithTokens
      }

    case ActionType.UpdateIsFetchingTokens:
      return {
        ...state,
        isFetchingTokens: action.payload
      }

    default:
      return state
  }
}

// Helper functions to simplify the caller
export const updateStatus = (status: Status): UpdateStatus => ({
  type: ActionType.UpdateStatus,
  payload: status
})

export const addPositions = (positions: Position[]): AddPositions => ({
  type: ActionType.AddPositions,
  payload: positions
})

export const clearPositions = (): ClearPositions => ({
  type: ActionType.ClearPositions
})

export const addDaosConfigs = (configs: any[]): AddDaosConfigs => ({
  type: ActionType.AddDaosConfigs,
  payload: configs
})

export const setSelectedPosition = (position: Position): SetSelectedPosition => ({
  type: ActionType.SetSelectedPosition,
  payload: position
})

export const clearSelectedPosition = (): ClearSelectedPosition => ({
  type: ActionType.ClearSelectedPosition
})

export const addDAOs = (DAOs: string[]): AddDAOs => ({
  type: ActionType.AddDAOs,
  payload: DAOs
})

export const clearDAOs = (): ClearDAOs => ({
  type: ActionType.ClearDAOs
})

export const setSelectedDAO = (DAO: string): SetSelectedDAO => ({
  type: ActionType.SetSelectedDAO,
  payload: DAO
})

export const clearSelectedDAO = (): ClearSelectedDAO => ({
  type: ActionType.ClearSelectedDAO
})

export const setSearch = (search: string): SetSearch => ({
  type: ActionType.SetSearch,
  payload: search
})

export const clearSearch = (): ClearSearch => ({
  type: ActionType.ClearSearch
})

export const setSetupCreate = (strategy: Strategy): SetSetupCreate => ({
  type: ActionType.SetSetupCreate,
  payload: strategy
})

export const setSetupCreateStatus = (status: SetupItemStatus): SetSetupCreateStatus => ({
  type: ActionType.SetSetupCreateStatus,
  payload: status
})

export const setSetupTransactionBuild = (
  transactionBuild: TransactionBuild
): SetSetupTransactionBuild => ({
  type: ActionType.SetSetupTransactionBuild,
  payload: transactionBuild
})

export const setSetupTransactionBuildStatus = (
  status: SetupItemStatus
): SetSetupTransactionBuildStatus => ({
  type: ActionType.SetSetupTransactionBuildStatus,
  payload: status
})

export const setSetupTransactionCheck = (transactionCheck: boolean): SetSetupTransactionCheck => ({
  type: ActionType.SetSetupTransactionCheck,
  payload: transactionCheck
})

export const setSetupTransactionCheckStatus = (
  status: SetupItemStatus
): SetSetupTransactionCheckStatus => ({
  type: ActionType.SetSetupTransactionCheckStatus,
  payload: status
})

export const setSetupSimulation = (simulation: any): SetSetupSimulation => ({
  type: ActionType.SetSetupSimulation,
  payload: simulation
})

export const setSetupSimulationStatus = (status: SetupItemStatus): SetSetupSimulationStatus => ({
  type: ActionType.SetSetupSimulationStatus,
  payload: status
})

export const setSetupConfirm = (confirm: Maybe<{ txHash: any }>): SetSetupConfirm => ({
  type: ActionType.SetSetupConfirm,
  payload: confirm
})

export const setSetupConfirmStatus = (status: SetupItemStatus): SetSetupConfirmStatus => ({
  type: ActionType.SetSetupConfirmStatus,
  payload: status
})

export const setSetupStatus = (status: SetupStatus): SetSetupStatus => ({
  type: ActionType.SetSetupStatus,
  payload: status
})

export const clearSetup = (): ClearSetup => ({
  type: ActionType.ClearSetup
})

export const clearSetupWithoutCreate = (): ClearSetupWithoutCreate => ({
  type: ActionType.ClearSetupWithoutCreate
})

export const updateEnvNetworkData = (data: any): UpdateEnvNetworkData => ({
  type: ActionType.UpdateEnvNetworkData,
  payload: data
})

export const filter = (): Filter => ({
  type: ActionType.Filter
})

export const updatePositionsWithTokenBalances = (
  data: DBankInfo[]
): UpdatePositionsWithTokenBalances => ({
  type: ActionType.UpdatePositionsWithTokenBalances,
  payload: data
})

export const updateIsFetchingTokens = (isFetching: boolean): UpdateIsFetchingTokens => ({
  type: ActionType.UpdateIsFetchingTokens,
  payload: isFetching
})
