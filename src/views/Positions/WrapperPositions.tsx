import ErrorBoundaryWrapper from 'src/components/ErrorBoundary/ErrorBoundaryWrapper'
import React from 'react'
import PaperSection from 'src/components/PaperSection'
import { useApp } from 'src/contexts/app.context'
import List from 'src/views/Positions/List'
import BoxContainerWrapper from 'src/components/Wrappers/BoxContainerWrapper'
import Loading from 'src/components/Loading'
import { TextField, IconButton } from '@mui/material'
import { SearchOutlined } from '@mui/icons-material'
import { HEADER_HEIGHT } from 'src/components/Layout/Header'
import { FOOTER_HEIGHT } from 'src/components/Layout/Footer'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { DAOFilter } from 'src/components/DAOFilter'
import { filter, setSearch } from 'src/contexts/reducers'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import { Position, Status } from 'src/contexts/state'
import { getStrategy } from 'src/utils/strategies'

interface SearchPositionProps {
  onChange: (value: string) => void
}

const SearchPosition = (props: SearchPositionProps) => {
  return (
    <TextField
      size="small"
      sx={{ width: '600px' }}
      variant="outlined"
      onChange={(e) => props.onChange(e.target.value)}
      placeholder="Search position"
      InputProps={{
        endAdornment: (
          <IconButton>
            <SearchOutlined />
          </IconButton>
        )
      }}
    />
  )
}

const WrapperPositions = () => {
  const { dispatch, state } = useApp()
  const { status } = state

  const onChange = React.useCallback(
    (value: string) => {
      dispatch(setSearch(value))
      dispatch(filter())
    },
    [dispatch]
  )

  return (
    <ErrorBoundaryWrapper>
      <BoxContainerWrapper>
        {status === Status.Loading ? (
          <Loading minHeight={`calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`} />
        ) : (
          <BoxWrapperColumn>
            <BoxWrapperRow sx={{ justifyContent: 'flex-end' }}>
              <DAOFilter />
            </BoxWrapperRow>
            <PaperSection title="Positions">
              <BoxWrapperRow gap={2} sx={{ justifyContent: 'space-between' }}>
                <SearchPosition onChange={onChange} />
              </BoxWrapperRow>
              <List />
            </PaperSection>
          </BoxWrapperColumn>
        )}
      </BoxContainerWrapper>
    </ErrorBoundaryWrapper>
  )
}

const WrapperPositionsMemoized = React.memo(WrapperPositions)

export default WrapperPositionsMemoized
