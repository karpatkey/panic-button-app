import { Position, SetupItemStatus, SetupStatus, Status, Strategy, TransactionBuild } from './state'

export enum ActionType {
  UpdateStatus,
  AddPositions,
  ClearPositions,
  SetSelectedPosition,
  ClearSelectedPosition,
  AddDAOs,
  ClearDAOs,
  SetSelectedDAO,
  ClearSelectedDAO,
  SetSearch,
  ClearSearch,
  SetSetupCreate,
  SetSetupCreateStatus,
  SetSetupTransactionBuild,
  SetSetupTransactionBuildStatus,
  SetSetupTransactionCheck,
  SetSetupTransactionCheckStatus,
  SetSetupSimulation,
  SetSetupSimulationStatus,
  SetSetupConfirm,
  SetSetupConfirmStatus,
  SetSetupStatus,
  ClearSetup,
  ClearSetupWithoutCreate,
  UpdateEnvNetworkData,
  Filter,
  AddDaosConfigs
}

export interface UpdateStatus {
  type: ActionType.UpdateStatus
  payload: Status
}

export interface AddPositions {
  type: ActionType.AddPositions
  payload: Position[]
}

export interface ClearPositions {
  type: ActionType.ClearPositions
}

export interface SetSelectedPosition {
  type: ActionType.SetSelectedPosition
  payload: Position
}

export interface ClearSelectedPosition {
  type: ActionType.ClearSelectedPosition
}

export interface AddDAOs {
  type: ActionType.AddDAOs
  payload: string[]
}

export interface ClearDAOs {
  type: ActionType.ClearDAOs
}

export interface SetSelectedDAO {
  type: ActionType.SetSelectedDAO
  payload: string
}

export interface ClearSelectedDAO {
  type: ActionType.ClearSelectedDAO
}

export interface SetSearch {
  type: ActionType.SetSearch
  payload: string
}

export interface ClearSearch {
  type: ActionType.ClearSearch
}

export interface SetSetupCreate {
  type: ActionType.SetSetupCreate
  payload: Strategy
}

export interface SetSetupCreateStatus {
  type: ActionType.SetSetupCreateStatus
  payload: SetupItemStatus
}

export interface SetSetupTransactionBuild {
  type: ActionType.SetSetupTransactionBuild
  payload: TransactionBuild
}

export interface SetSetupTransactionBuildStatus {
  type: ActionType.SetSetupTransactionBuildStatus
  payload: SetupItemStatus
}

export interface SetSetupTransactionCheck {
  type: ActionType.SetSetupTransactionCheck
  payload: boolean
}

export interface SetSetupTransactionCheckStatus {
  type: ActionType.SetSetupTransactionCheckStatus
  payload: SetupItemStatus
}

export interface SetSetupSimulation {
  type: ActionType.SetSetupSimulation
  payload: any
}

export interface SetSetupSimulationStatus {
  type: ActionType.SetSetupSimulationStatus
  payload: SetupItemStatus
}

export interface SetSetupConfirm {
  type: ActionType.SetSetupConfirm
  payload: any
}

export interface SetSetupConfirmStatus {
  type: ActionType.SetSetupConfirmStatus
  payload: SetupItemStatus
}

export interface SetSetupStatus {
  type: ActionType.SetSetupStatus
  payload: SetupStatus
}

export interface ClearSetup {
  type: ActionType.ClearSetup
}

export interface ClearSetupWithoutCreate {
  type: ActionType.ClearSetupWithoutCreate
}

export interface UpdateEnvNetworkData {
  type: ActionType.UpdateEnvNetworkData
  payload: any
}

export interface Filter {
  type: ActionType.Filter
}

export interface AddDaosConfigs {
  type: ActionType.AddDaosConfigs
  payload: any[]
}

export type Actions =
  | UpdateStatus
  | AddPositions
  | ClearPositions
  | SetSelectedPosition
  | ClearSelectedPosition
  | AddDAOs
  | ClearDAOs
  | SetSelectedDAO
  | ClearSelectedDAO
  | SetSearch
  | ClearSearch
  | SetSetupCreate
  | SetSetupCreateStatus
  | SetSetupTransactionBuild
  | SetSetupTransactionBuildStatus
  | SetSetupTransactionCheck
  | SetSetupTransactionCheckStatus
  | SetSetupSimulation
  | SetSetupSimulationStatus
  | SetSetupConfirm
  | SetSetupConfirmStatus
  | SetSetupStatus
  | ClearSetup
  | ClearSetupWithoutCreate
  | UpdateEnvNetworkData
  | Filter
  | AddDaosConfigs
