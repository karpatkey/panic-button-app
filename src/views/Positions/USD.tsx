import CustomTypography from 'src/components/CustomTypography'
import * as React from 'react'

interface USDProps {
  value: string
}

export const USD = ({ value }: USDProps) => {
  return (
    <CustomTypography
      sx={{
        fontFamily: 'IBM Plex Mono',
        fontStyle: 'normal',
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: '14px',
        color: 'custom.grey.dark',
        letterSpacing: '-0.02em',
        textAlign: 'end'
      }}
    >
      {value}
    </CustomTypography>
  )
}
