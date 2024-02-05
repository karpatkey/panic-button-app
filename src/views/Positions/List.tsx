import { Box } from '@mui/material'
import * as React from 'react'
import Card from 'src/views/Positions/Card'
import { Position, Status } from 'src/contexts/state'
import { useApp } from 'src/contexts/app.context'
import EmptyData from 'src/components/EmptyData'

const List = () => {
  const { state } = useApp()
  const { filteredPositions, search, status } = state

  if (
    (filteredPositions?.length === 0 && !search) ||
    (filteredPositions?.length === 0 && status === Status.Finished)
  ) {
    return <EmptyData />
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '20px 20px'
      }}
    >
      {filteredPositions.map((position: Position, index: number) => {
        return (
          <Box
            key={index}
            sx={{
              width: '380px',
              minHeight: '140px',
              maxHeight: '200px',
              padding: '12px 12px',
              border: '1px solid #B6B6B6',
              background: 'background.paper',
              borderRadius: '8px'
            }}
          >
            <Card id={index} key={index} position={position} />
          </Box>
        )
      })}
    </Box>
  )
}

export default List
