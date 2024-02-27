import * as React from 'react'
import { useApp } from 'src/contexts/app.context'
import ErrorBoundaryWrapper from 'src/components/ErrorBoundary/ErrorBoundaryWrapper'
import BoxContainerWrapper from 'src/components/Wrappers/BoxContainerWrapper'
import Loading from 'src/components/Loading'
import PaperSection from 'src/components/PaperSection'
import Detail from 'src/views/Position/Detail'
import { HEADER_HEIGHT } from 'src/components/Layout/Header'
import { FOOTER_HEIGHT } from 'src/components/Layout/Footer'

const WrappedPosition = () => {
  const { state } = useApp()
  const { status } = state
  const title = `Strategy configuration`

  return (
    <ErrorBoundaryWrapper>
      <BoxContainerWrapper>
        {status === 'Loading' ? (
          <Loading minHeight={`calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`} />
        ) : null}
        {status === 'Finished' ? (
          <PaperSection title={title}>
            <Detail />
          </PaperSection>
        ) : null}
      </BoxContainerWrapper>
    </ErrorBoundaryWrapper>
  )
}

export default WrappedPosition
