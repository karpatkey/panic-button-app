import * as React from 'react'
import CustomTypography from 'src/components/CustomTypography'
import { Check } from '@mui/icons-material'
import { SetupItemStatus } from 'src/contexts/state'
import { CircularProgress } from '@mui/material'

interface StatusLabelProps {
  status: SetupItemStatus
}

const StatusIcon = ({ status }: { status: SetupItemStatus }) => {
  switch (status) {
    case 'loading':
      return <CircularProgress color="primary" size={20} />
    case 'success':
      return <Check />
  }
  return null
}

const StatusLabel = (props: StatusLabelProps) => {
  const { status } = props

  const statusColor = {
    'not done': 'black',
    loading: 'black',
    success: 'green',
    failed: 'red'
  }[status]

  if (status == 'not done') {
    return null
  }

  if (status == 'loading') {
    return <StatusIcon status={status} />
  }

  return (
    <CustomTypography variant={'body2'} sx={{ color: statusColor, textTransform: 'capitalize' }}>
      {status}
    </CustomTypography>
  )
}

export default StatusLabel
