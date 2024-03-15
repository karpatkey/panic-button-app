import { Box, Divider } from '@mui/material'
import CryptoIcon from 'src/components/CryptoIcon'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { Token } from '../../contexts/state'
import { AmountValue } from './AmountValue'
import { Title } from './Title'
import { USD } from './USD'

interface ListItemsProps {
  tokens: Token[] | undefined
}

export const Balances = ({ tokens }: ListItemsProps) => {
  return (
    <BoxWrapperColumn sx={{ gap: 2 }}>
      {tokens?.map((token: Token, index: number) => {
        const { symbol, amount, as, price } = token
        return (
          <Box key={index}>
            <BoxWrapperColumn gap={1}>
              <BoxWrapperRow gap={1} sx={{ justifyContent: 'flex-start' }}>
                <CryptoIcon symbol={symbol} />
                <Title title={symbol} />
              </BoxWrapperRow>
              <Divider sx={{ borderBottomWidth: 5 }} />
            </BoxWrapperColumn>
            <BoxWrapperColumn key={index} gap={1}>
              <BoxWrapperRow sx={{ justifyContent: 'space-between' }}>
                <Title title={as} />
                <AmountValue value={amount} />
              </BoxWrapperRow>
              <USD value={amount * price} />
              <Divider />
            </BoxWrapperColumn>
          </Box>
        )
      })}
    </BoxWrapperColumn>
  )
}
