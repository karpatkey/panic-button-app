import { SearchOutlined } from '@mui/icons-material'
import { IconButton, TextField } from '@mui/material'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { DAOFilter } from 'src/components/DAOFilter'
import ErrorBoundaryWrapper from 'src/components/ErrorBoundary/ErrorBoundaryWrapper'
import { FOOTER_HEIGHT } from 'src/components/Layout/Footer'
import { HEADER_HEIGHT } from 'src/components/Layout/Header'
import Loading from 'src/components/Loading'
import PaperSection from 'src/components/PaperSection'
import BoxContainerWrapper from 'src/components/Wrappers/BoxContainerWrapper'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { usePositions } from 'src/queries/positions'
import List from 'src/views/Positions/List'

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
        ),
      }}
    />
  )
}

const WrapperPositions = () => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const positions = usePositions()
  const { isFetched } = positions

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (term) {
      params.set('query', term)
    } else {
      params.delete('query')
    }

    const p = params.toString()
    const uri = p ? `${pathname}?${p}` : pathname
    router.push(uri)
  }

  return (
    <ErrorBoundaryWrapper>
      <BoxContainerWrapper>
        {!isFetched ? (
          <Loading minHeight={`calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`} />
        ) : (
          <BoxWrapperColumn>
            <BoxWrapperRow sx={{ justifyContent: 'flex-end' }}>
              <DAOFilter />
            </BoxWrapperRow>
            <PaperSection title="Positions">
              <BoxWrapperRow gap={2} sx={{ justifyContent: 'space-between' }}>
                <SearchPosition onChange={handleSearch} />
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
