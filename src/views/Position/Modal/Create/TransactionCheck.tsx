import CustomTypography from 'src/components/CustomTypography'
import StatusLabel from 'src/components/StatusLabel'
import * as React from 'react'
import { AccordionBoxWrapper } from 'src/components/Accordion/AccordionBoxWrapper'
import { useApp } from 'src/contexts/app.context'
import Tooltip from '@mui/material/Tooltip'
import InfoIcon from '@mui/icons-material/Info'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'

export const TransactionCheck = () => {
  const { state } = useApp()

  const transactionCheckStatus = state?.setup?.transactionCheck?.status || null

  return (
    <AccordionBoxWrapper
      gap={2}
      sx={{
        m: 3,
        backgroundColor: 'background.default',
        justifyContent: 'space-between'
      }}
    >
      <BoxWrapperRow gap={1}>
        <CustomTypography variant={'body2'}>Transaction check</CustomTypography>
        <Tooltip
          title={
            <CustomTypography variant="body2" sx={{ color: 'common.white' }}>
              Perform a simulation using a local eth_call. If it is valid, it proceeds to decode the
              transaction. If not, it will return an error.
            </CustomTypography>
          }
          sx={{ ml: 1, cursor: 'pointer' }}
        >
          <InfoIcon sx={{ fontSize: 24, cursor: 'pointer' }} />
        </Tooltip>
      </BoxWrapperRow>
      <StatusLabel status={transactionCheckStatus} />
    </AccordionBoxWrapper>
  )
}
