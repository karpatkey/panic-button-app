import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { Box, Divider } from '@mui/material'
import * as React from 'react'
import { Title } from './Title'
import { USD } from './USD'
import { useApp } from 'src/contexts/app.context'
import { Token } from '../../contexts/state'

interface ListItemsProps {
  tokens: Token[] | undefined
}

export const Balances = ({ tokens }: ListItemsProps) => {
  const { state } = useApp()
  const { isFetchingTokens } = state

  return (
    <BoxWrapperColumn sx={{ gap: 2 }}>
      {isFetchingTokens ? (
        <BoxWrapperColumn sx={{ justifyContent: 'center' }}>
          <Title title="Loading..." />
        </BoxWrapperColumn>
      ) : null}
      {tokens?.map((token: Token, index: number) => {
        const { symbol, supply, borrow, price } = token
        return (
          <Box key={index}>
            <BoxWrapperColumn gap={1}>
              <Title title={symbol} />
              <Divider sx={{ borderBottomWidth: 5 }} />
            </BoxWrapperColumn>
            <BoxWrapperColumn key={index} gap={1}>
              {supply ? (
                <>
                  <BoxWrapperRow sx={{ justifyContent: 'space-between' }}>
                    <Title title="Supply" />
                    <Title title={supply + ''} />
                  </BoxWrapperRow>
                  <USD value={supply * price + ''} />
                  <Divider />
                </>
              ) : null}
              {borrow ? (
                <>
                  <BoxWrapperRow sx={{ justifyContent: 'space-between' }}>
                    <Title title="Borrow" />
                    <Title title={borrow + ''} />
                  </BoxWrapperRow>
                  <USD value={borrow * price + ''} />
                  <Divider />
                </>
              ) : null}
            </BoxWrapperColumn>
          </Box>
        )
      })}
    </BoxWrapperColumn>
  )
}
