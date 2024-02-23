import { BLOCKCHAIN, DAO, ExecConfig, getStrategyByPositionId } from 'src/config/strategies/manager'
import { Position } from 'src/contexts/state'

export const getStrategy = (daosConfigs: any[], position: Position) => {
  const { dao, position_id: positionId, protocol, blockchain } = position

  const config: ExecConfig = getStrategyByPositionId(
    daosConfigs,
    dao as DAO,
    blockchain as unknown as BLOCKCHAIN,
    protocol,
    positionId
  )
  return config
}

// export async function positionWithStrategies(position: Position) {
//   return { ...position, hasStrategies: false }
// }
