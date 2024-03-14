import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Position } from 'src/contexts/state'
import { slug } from 'src/utils/string'

export function usePositions() {
  return useQuery({
    queryKey: ['positions'],
    queryFn: () => fetch('/api/positions').then((res) => res.json()),
  })
}

export function usePosition(dao: string, chain: string, pool_id: string) {
  const q = usePositions()
  const { data } = q

  const position = useMemo(() => {
    if (q.data) {
      return findPosition(data, { dao, chain, pool_id })
    }
  }, [q.data, data, dao, chain, pool_id])

  return useMemo(() => {
    return {
      ...q,
      data: position,
    }
  }, [q, position])
}

function findPosition(
  positions: Position[],
  { dao, chain, pool_id }: { dao: string; chain: string; pool_id: string },
) {
  return positions.find(
    (position) =>
      slug(position.dao) == dao && position.blockchain == chain && position.pool_id == pool_id,
  )
}
