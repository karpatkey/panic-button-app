import CircularProgress from '@mui/material/CircularProgress'
import { FOOTER_HEIGHT } from 'src/components/Layout/Footer'
import { HEADER_HEIGHT } from 'src/components/Layout/Header'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'

interface LoadingProps {
  fullPage?: boolean
}

const Loading = (props: LoadingProps) => {
  const minHeight = props.fullPage ? `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)` : null
  return (
    <BoxWrapperColumn
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        minHeight,
      }}
    >
      <CircularProgress color="primary" />
    </BoxWrapperColumn>
  )
}

export default Loading
