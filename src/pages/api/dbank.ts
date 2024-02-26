import { withApiAuthRequired } from '@auth0/nextjs-auth0'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession, Session } from '@auth0/nextjs-auth0'
import { dBankPromise } from 'src/utils/dbank'
import { daoWallets } from 'src/config/constants'

type Status = {
  data?: Maybe<any>
  error?: Maybe<string>
}

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Status>
) {
  // Should be a get request
  if (req.method !== 'GET') {
    res.status(405).json({ data: { status: false, error: new Error('Method not allowed') } })
    return
  }

  const session = await getSession(req as any, res as any)

  // Validate session here
  if (!session) {
    res.status(401).json({ data: { status: false, error: new Error('Unauthorized') } })
    return
  }

  // Get User role, if not found, return an error
  const user = (session as Session).user
  const roles = user?.['http://localhost:3000/roles']
    ? (user?.['http://localhost:3000/roles'] as unknown as string[])
    : ['']

  const dao = roles[0]

  if (!dao) {
    res.status(401).json({ data: { status: false, error: new Error('Unauthorized') } })
    return
  }

  const wallets = roles.flatMap((dao) => daoWallets(dao))

  try {
    const parameters = ['--wallets', wallets.join(',')]
    const { data, error } = await dBankPromise(parameters)

    if (error) {
      return res.status(500).json({ error })
    }

    return res.status(200).json({ data })
  } catch (error) {
    console.error('ERROR Reject: ', error)
  }

  return res.status(500).json({ error: 'Internal Server Error' })
})
