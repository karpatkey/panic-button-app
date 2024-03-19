import Link from 'next/link'
import CryptoIcon from 'src/components/CryptoIcon'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { PositionWithStrategies } from 'src/contexts/state'
import { slug } from 'src/utils/string'
import PositionName from 'src/views/Positions/PositionName'
import ProtocolIcon from 'src/views/Positions/ProtocolIcon'
import { Title } from 'src/views/Positions/Title'
import { USD } from 'src/views/Positions/USD'
import { Balances } from './Balances'

interface PositionProps {
  id: number
  position: PositionWithStrategies
}

const Card = (props: PositionProps) => {
  const { position } = props
  const { protocol, blockchain, lptokenName, dao, isActive, tokens } = position

  const blockchainSymbol = { ethereum: 'eth', gnosis: 'gno' }[blockchain]

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
          <Title title={dao} />
          <BoxWrapperRow gap={1}>
            <CryptoIcon size={25} symbol={blockchainSymbol || ''} />
            <ProtocolIcon protocol={protocol} />
            <Title title={protocol} />
          </BoxWrapperRow>
        </BoxWrapperRow>
        <BoxWrapperColumn gap={1}>
          <BoxWrapperRow gap={1} sx={{ justifyContent: 'space-between' }}>
            <PositionName position={lptokenName} />
            <USD value={position.usd_amount} />
          </BoxWrapperRow>
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
