import Link from 'next/link'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { PositionWithStrategies } from 'src/contexts/state'
import { slug } from 'src/utils/string'
import PositionName from 'src/views/Positions/PositionName'
import ProtocolIcon from 'src/views/Positions/ProtocolIcon'
import { Title } from 'src/views/Positions/Title'
import { Balances } from './Balances'

interface PositionProps {
  id: number
  position: PositionWithStrategies
}

const Card = (props: PositionProps) => {
  const { position } = props
  const { protocol, blockchain, lptokenName, dao, isActive, tokens } = position

  const CardWrapper = () => {
    return (
      <BoxWrapperColumn
        gap={4}
        sx={{
          padding: '10px',
          width: '100%',
          justifyContent: 'space-between',
          ...(isActive ? { cursor: 'pointer' } : {}),
          ...(!isActive ? { opacity: '0.2 !important' } : {}),
        }}
      >
        <BoxWrapperRow sx={{ justifyContent: 'space-between' }}>
          <BoxWrapperColumn gap={1}>
            <Title title={dao} />
            <Title title={blockchain} />
          </BoxWrapperColumn>
          <BoxWrapperRow gap={1}>
            <ProtocolIcon protocol={protocol} />
            <Title title={protocol} />
          </BoxWrapperRow>
        </BoxWrapperRow>
        <BoxWrapperColumn gap={1}>
          <PositionName position={lptokenName} />
        </BoxWrapperColumn>
        <Balances tokens={tokens} />
      </BoxWrapperColumn>
    )
  }

  return isActive ? (
    <Link
      href={`/positions/${slug(position.dao)}/${position.blockchain}/${position.pool_id}`}
      style={{ textDecoration: 'none' }}
    >
      <CardWrapper />
    </Link>
  ) : (
    <CardWrapper />
  )
}

export default Card
