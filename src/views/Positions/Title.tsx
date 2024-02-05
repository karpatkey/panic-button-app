import CustomTypography from 'src/components/CustomTypography'
import * as React from 'react'

interface TitleProps {
  title: string
}

export const Title = ({ title }: TitleProps) => {
  return (
    <CustomTypography
      sx={{
        fontFamily: 'IBM Plex Sans',
        fontStyle: 'normal',
        fontWeight: 700,
        fontSize: '16px',
        lineHeight: '20px',
        color: 'custom.grey.dark',
        wordBreak: 'break-word'
      }}
    >
      {title}
    </CustomTypography>
  )
}
