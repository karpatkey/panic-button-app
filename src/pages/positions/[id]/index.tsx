import * as React from 'react'
import { ReactElement } from 'react'
import PageLayout from 'src/components/Layout/Layout'
import { useApp } from 'src/contexts/app.context'
import { DataWarehouse } from 'src/services/classes/dataWarehouse.class'
import BoxContainerWrapper from 'src/components/Wrappers/BoxContainerWrapper'
import PositionDetail from 'src/views/Position/WrappedPosition'
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client'
import { getSession, Session } from '@auth0/nextjs-auth0'
import { NextApiRequest, NextApiResponse } from 'next'
import {
  clearSelectedPosition,
  setSelectedPosition,
  updateEnvNetworkData,
  updateStatus
} from 'src/contexts/reducers'
import { Position, Status } from 'src/contexts/state'
import Loading from 'src/components/Loading'
import { HEADER_HEIGHT } from 'src/components/Layout/Header'
import { FOOTER_HEIGHT } from 'src/components/Layout/Footer'
import CustomTypography from 'src/components/CustomTypography'
import Button from '@mui/material/Button'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import { ALL_DAOS } from 'src/config/constants'

interface PositionIndexProps {
  positionId: Maybe<string>
  position: Maybe<Position>
  ENV_NETWORK_DATA: any
}

const PositionDoesntExist = () => {
  return (
    <BoxWrapperColumn gap={4} sx={{ alignItems: 'center' }}>
      <CustomTypography variant="h3" align="center" style={{ marginTop: '35vh' }}>
        Position doesn't exist
      </CustomTypography>
      <Button variant="contained" color="primary" href="/positions" sx={{ width: '300px' }}>
        Go to Home page
      </Button>
    </BoxWrapperColumn>
  )
}

const PositionIndex = (props: PositionIndexProps): ReactElement => {
  const { position, ENV_NETWORK_DATA } = props

  const { dispatch, state } = useApp()
  const { status } = state

  React.useEffect(() => {
    dispatch(updateStatus('Loading' as Status))
    if (!position) {
      dispatch(clearSelectedPosition())
    } else {
      dispatch(setSelectedPosition(position))
    }

    dispatch(updateEnvNetworkData(ENV_NETWORK_DATA))

    dispatch(updateStatus('Finished' as Status))
  }, [position, dispatch])

  return (
    <>
      {status === 'Loading' && (
        <Loading minHeight={`calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`} />
      )}
      {status === 'Finished' && position && (
        <BoxContainerWrapper>
          <PositionDetail />
        </BoxContainerWrapper>
      )}
      {status === 'Finished' && !position && <PositionDoesntExist />}
    </>
  )
}

PositionIndex.getTitle = 'Position'

PositionIndex.getLayout = (page: ReactElement) => <PageLayout>{page}</PageLayout>

export default withPageAuthRequired(PositionIndex)

const getServerSideProps = async (context: {
  req: NextApiRequest
  res: NextApiResponse
  params: { id: string }
}) => {
  const { req, res, params: { id = '' } = {} } = context
  const session = await getSession(req as any, res as any)

  if (!session) {
    return {
      props: {
        positionId: null,
        position: null
      }
    }
  }

  const user = (session as Session).user
  const roles = user?.['http://localhost:3000/roles']
    ? (user?.['http://localhost:3000/roles'] as unknown as string[])
    : ALL_DAOS

  const DAOs = roles

  const dataWarehouse = DataWarehouse.getInstance()
  const positionDW = (await dataWarehouse.getPositionById(id))?.[0]

  const position = positionDW && DAOs.includes(positionDW.dao) ? positionDW : null

  const ENV_NETWORK_DATA = {
    MODE: process?.env?.MODE ?? 'development',
    ETHEREUM_RPC_ENDPOINT: process?.env?.ETHEREUM_RPC_ENDPOINT,
    GNOSIS_RPC_ENDPOINT: process?.env?.GNOSIS_RPC_ENDPOINT,
    LOCAL_FORK_HOST_ETHEREUM: process?.env?.LOCAL_FORK_HOST_ETHEREUM ?? 'anvil_ethereum',
    LOCAL_FORK_PORT_ETHEREUM: process?.env?.LOCAL_FORK_PORT_ETHEREUM ?? 8546,
    LOCAL_FORK_HOST_GNOSIS: process?.env?.LOCAL_FORK_HOST_GNOSIS ?? 'anvil_gnosis',
    LOCAL_FORK_PORT_GNOSIS: process?.env?.LOCAL_FORK_PORT_GNOSIS ?? 8547
  }

  return {
    props: {
      positionId: id,
      position,
      ENV_NETWORK_DATA
    }
  }
}

export { getServerSideProps }
