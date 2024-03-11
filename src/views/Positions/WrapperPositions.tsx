import ErrorBoundaryWrapper from 'src/components/ErrorBoundary/ErrorBoundaryWrapper'
import React from 'react'
import PaperSection from 'src/components/PaperSection'
import { useApp } from 'src/contexts/app.context'
import List from 'src/views/Positions/List'
import EmptyData from 'src/components/EmptyData'
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
  const { filteredPositions, positions, search, status } = state

  const onChange = React.useCallback(
    (value: string) => {
      dispatch(setSearch(value))
      dispatch(filter())
    },
    [dispatch]
  )

  const filteredPositionsActive = React.useMemo(
    () =>
      filteredPositions
        .map((position: Position) => {
          const { positionConfig } = getStrategy(state.daosConfigs, position as Position)
          const isActive = !!positionConfig.find((p) => p.stresstest)
          return {
            ...position,
            isActive
          }
        })
        .sort((a: Position, b: Position) => {
          if (a.isActive && !b.isActive) return -1
          if (!a.isActive && b.isActive) return 1
          if (a.lptoken_name < b.lptoken_name) return -1
          if (a.lptoken_name > b.lptoken_name) return 1
          return 0
        }),
    [filteredPositions, state.daosConfigs]
  )

  return (
    <ErrorBoundaryWrapper>
      <BoxContainerWrapper>
        {status === Status.Loading ? (
          <Loading minHeight={`calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`} />
        ) : null}
        {status === Status.Finished ? (
          <BoxWrapperColumn>
            <BoxWrapperRow sx={{ justifyContent: 'flex-end' }}>
              <DAOFilter />
            </BoxWrapperRow>
            <PaperSection title="Positions">
              <BoxWrapperRow gap={2} sx={{ justifyContent: 'space-between' }}>
                <SearchPosition onChange={onChange} />
              </BoxWrapperRow>
              {filteredPositionsActive?.length > 0 ? (
                <List positions={filteredPositionsActive} />
              ) : null}
              {(filteredPositionsActive?.length === 0 && search !== '') ||
              positions?.length === 0 ? (
                <EmptyData />
              ) : null}
            </PaperSection>
          </BoxWrapperColumn>
        ) : null}
      </BoxContainerWrapper>
    </ErrorBoundaryWrapper>
  )
}

const WrapperPositionsMemoized = React.memo(WrapperPositions)

export default WrapperPositionsMemoized
