import { Box } from '@mui/material'
import EmptyData from 'src/components/EmptyData'
import { Position } from 'src/contexts/state'
import { usePositions } from 'src/queries/positions'
import Card from 'src/views/Positions/Card'

const List = () => {
  const { data: filteredPositions, isPending } = usePositions()

  if (isPending) {
    return <EmptyData />
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '20px 20px',
      }}
    >
      {filteredPositions.map((position: Position, index: number) => {
        return (
          <Box
            key={index}
            sx={{
              width: '380px',
              minHeight: '140px',
              padding: '12px 12px',
              border: '1px solid #B6B6B6',
              background: 'background.paper',
              borderRadius: '8px',
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
