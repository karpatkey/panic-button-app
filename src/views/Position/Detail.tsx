import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import * as React from 'react'
import { Divider } from '@mui/material'
import Form from 'src/views/Position/Form/Form'
import Primary from 'src/views/Position/Title/Primary'
import Secondary from 'src/views/Position/Title/Secondary'
import NoStrategies from 'src/views/Position/NoStrategies'
import { useApp } from 'src/contexts/app.context'
import { getStrategy } from 'src/utils/strategies'
// import { Position } from 'src/contexts/state'

const Detail = () => {
  const { state } = useApp()
  const { selectedPosition: position, daosConfigs, status } = state

  if (status !== 'Finished' || !position) {
    return null
  }

  const { positionConfig } = getStrategy(daosConfigs, position)
  const areAnyStrategies = positionConfig?.length > 0

  return (
    <BoxWrapperColumn
      gap={6}
      sx={{
        justifyContent: 'center',
        marginTop: '20px',
        border: '1px solid #B6B6B6',
        backgroundColor: 'custom.grey.light',
        borderRadius: '8px',
        padding: '30px 30px',
        minWidth: '400px',
        width: '800px'
      }}
    >
      <BoxWrapperColumn gap={2}>
        <BoxWrapperColumn gap={1}>
          <Primary title={'Overview'} />
          <Divider sx={{ borderBottomWidth: 5 }} />
        </BoxWrapperColumn>
        <BoxWrapperColumn gap={2}>
          <Secondary title={`Blockchain:`} subtitle={position?.blockchain} />
          <Secondary title={`Protocol:`} subtitle={position?.protocol} />
          <Secondary title={`Position:`} subtitle={position?.lptoken_name} />
        </BoxWrapperColumn>
      </BoxWrapperColumn>
      <BoxWrapperColumn gap={2}>{areAnyStrategies ? <Form /> : <NoStrategies />}</BoxWrapperColumn>
    </BoxWrapperColumn>
  )
}

export default Detail
