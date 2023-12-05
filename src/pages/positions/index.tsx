import PageLayout from 'src/components/Layout/Layout'
import * as React from 'react'
import { ReactElement } from 'react'
import WrapperPositions from 'src/views/Positions/WrapperPositions'
import { useApp } from 'src/contexts/app.context'
import { DataWarehouse } from 'src/services/classes/dataWarehouse.class'
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client'
import { getSession, Session } from '@auth0/nextjs-auth0'
import { NextApiRequest, NextApiResponse } from 'next'
import { updateStatus, addPositions, addDAOs, clearSearch, filter } from 'src/contexts/reducers'
import { Position, Status } from 'src/contexts/state'
import * as Minio from 'minio';

interface PositionsPageProps {
  positions: Position[]
  DAOs: string[]
}

const PositionsPage = (props: PositionsPageProps) => {
  const { positions = [], DAOs } = props

  const { dispatch } = useApp()

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


  const endpoint = ''
  const accessKey = ''
  const secretKey = ''
  const useSSL = false; // Change to true if your MinIO server uses SSL

// Initialize MinIO client object
  const minioClient = new Minio.Client({
    endPoint: endpoint,
    port: 80,
    accessKey: accessKey,
    secretKey: secretKey,
    useSSL: useSSL,
  });

// Specify the bucket name and JSON file path
  const bucketName = 'panic-button-app-jsons';
  const jsonFilePath = 'GnosisDAO-ethereum.json';


  try {
    console.log('AAAAA1')
    const buckets = await minioClient.listBuckets()
    console.log('BBBBB1')
    console.log('Success', buckets)
  } catch (err) {
    console.log('CCCCC1', err)
    console.log(err.message)
  }
//   let size = 0
// // Get a full object.
//   minioClient.getObject(bucketName, jsonFilePath, function (e, dataStream) {
//     if (e) {
//       return console.log(e)
//     }
//     dataStream.on('data', function (chunk) {
//       size += chunk.length
//     })
//     dataStream.on('end', function () {
//       console.log('End. Total size = ' + size)
//     })
//     dataStream.on('error', function (e) {
//       console.log(e)
//     })
//   })
//
//
  const user = (session as Session).user
  const roles = user?.['http://localhost:3000/roles']
    ? (user?.['http://localhost:3000/roles'] as unknown as string[])
    : []

  const DAOs = roles

  const dataWarehouse = DataWarehouse.getInstance()
  const positions: Position[] = await dataWarehouse.getPositions(DAOs)

  return { props: { positions, DAOs } }
}
