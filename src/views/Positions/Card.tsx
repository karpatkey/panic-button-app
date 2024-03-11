import PositionName from 'src/views/Positions/PositionName'
import ProtocolIcon from 'src/views/Positions/ProtocolIcon'
import Title from 'src/views/Positions/Title'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import * as React from 'react'
import Link from 'next/link'
import { Position } from 'src/contexts/state'

interface PositionProps {
  id: number
  position: Position
}

const Card = (props: PositionProps) => {
  const { position } = props
  const {
    position_id: positionId,
    protocol,
    blockchain,
    lptoken_name: positionName,
    dao,
    isActive
  } = position

  const CardWrapper = () => {
    return (
      <BoxWrapperColumn
        gap={4}
        sx={{
          padding: '10px',
          width: '100%',
          height: '100%',
          justifyContent: 'space-between',
          ...(isActive ? { cursor: 'pointer' } : {}),
          ...(!isActive ? { opacity: '0.2 !important' } : {})
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
          <PositionName position={positionName} />
        </BoxWrapperColumn>
      </BoxWrapperColumn>
    )
  }

  return isActive ? (
    <Link href={`/positions/${positionId}`} style={{ textDecoration: 'none' }}>
      <CardWrapper />
    </Link>
  ) : (
    <CardWrapper />
  )
}

export default Card
