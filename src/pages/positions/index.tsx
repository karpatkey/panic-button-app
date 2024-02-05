import PageLayout from 'src/components/Layout/Layout'
import * as React from 'react'
import { ReactElement } from 'react'
import WrapperPositions from 'src/views/Positions/WrapperPositions'
import { useApp } from 'src/contexts/app.context'
import { DataWarehouse } from 'src/services/classes/dataWarehouse.class'
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client'
import { getSession, Session } from '@auth0/nextjs-auth0'
import { NextApiRequest, NextApiResponse } from 'next'
import { updateStatus, addPositions, addDAOs, clearSearch, filter, updatePositionsWithTokenBalances, updateIsFetchingTokens } from 'src/contexts/reducers'
import { Position, Status } from 'src/contexts/state'

interface PositionsPageProps {
  positions: Position[]
  DAOs: string[]
}

const PositionsPage = (props: PositionsPageProps) => {
  const { positions = [], DAOs } = props

  const { dispatch, state } = useApp()
  const { status, isFetchingTokens } = state

  React.useEffect(() => {
    const start = () => {
      dispatch(updateStatus('Loading' as Status))

      dispatch(addDAOs(DAOs))
      dispatch(addPositions(positions))
      dispatch(clearSearch())
      dispatch(filter())

      dispatch(updateStatus('Finished' as Status))
    }

    start()
  }, [dispatch, DAOs, positions])

  React.useEffect(() => {
    const start = async () => {
      try {
        if (status !== 'Finished') return

        console.log('fetching tokens', isFetchingTokens, status)

        dispatch(updateIsFetchingTokens(true))
        const response = await fetch('/api/dbank')
        const { data = [] } = await response.json()
        dispatch(updatePositionsWithTokenBalances(data))
        dispatch(filter())
        dispatch(updateIsFetchingTokens(false))
      } catch (e) {
        console.error(e)
      }
    }

    start()
  }, [dispatch, status])

  return <WrapperPositions />
}

PositionsPage.getTitle = 'Home'

PositionsPage.getLayout = (page: ReactElement) => <PageLayout>{page}</PageLayout>

export default withPageAuthRequired(PositionsPage)

export const getServerSideProps = async (context: {
  req: NextApiRequest
  res: NextApiResponse
}) => {
  const { req, res } = context
  const session = await getSession(req as any, res as any)

  if (!session) {
    return {
      props: {
        positions: []
      }
    }
  }

  const user = (session as Session).user
  const roles = user?.['http://localhost:3000/roles']
    ? (user?.['http://localhost:3000/roles'] as unknown as string[])
    : []

  const DAOs = roles

  const dataWarehouse = DataWarehouse.getInstance()
  const positions: Position[] = await dataWarehouse.getPositions(DAOs)

  return { props: { positions, DAOs } }
}
