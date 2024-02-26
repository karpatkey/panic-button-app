import * as Minio from 'minio'

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT ?? ''
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY ?? ''
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY ?? ''
const MINIO_BUCKET = process.env.MINIO_BUCKET ?? ''

function streamBucketToString<T>(stream: Minio.BucketStream<T>): Promise<T[]> {
  const chunks = [] as T[]
  return new Promise<T[]>((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(chunk))
    stream.on('error', (err) => reject(err))
    stream.on('end', () => resolve(chunks))
  })
}

interface File {
  dao: string
  blockchain: string
  general_parameters: any
  positions: any
}

const DAO_NAME_MAPPER = {
  GnosisDAO: 'Gnosis DAO',
  GnosisLTD: 'Gnosis LTD',
  karpatkey: 'karpatkey DAO',
  BalancerDAO: 'Balancer DAO',
  ENSDAO: 'ENS DAO',
  CoWDAO: 'CoW DAO',
  GnosisGuild: 'Gnosis Guild'
} as any

export async function getDaosConfigs(daos: string[]) {
  const label = 'Fetch json configs'
  console.time(label)
  const configs = await fetchJsons()
  console.timeEnd(label)

  if (!configs) {
    return []
  }

  return configs
    .map((f) => ({
      ...f,
      dao: DAO_NAME_MAPPER[f.dao] || f.dao,
      blockchain: f.blockchain.toLowerCase()
    }))
    .filter((f) => {
      return daos.includes(f.dao)
    })
}

async function fetchJsons(): Promise<File[]> {
  const minioClient = new Minio.Client({
    endPoint: MINIO_ENDPOINT,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
    useSSL: true
  })

  const objectsStream = minioClient.listObjects(MINIO_BUCKET)

  const objects = await streamBucketToString(objectsStream)
  const res = objects.map(async (object) => {
    const stream = await minioClient.getObject(MINIO_BUCKET, object.name ?? '')

    const pro = new Promise((resolve) => {
      let data = ''
      stream.on('data', function (chunk) {
        data += chunk
      })
      stream.on('end', function () {
        resolve(data)
      })
      stream.on('error', function (err) {
        console.log(err)
      })
    })

    return pro.then((str: any) => JSON.parse(str))
  })

  return await Promise.all(res)
}
