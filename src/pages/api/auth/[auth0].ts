import { handleAuth, handleLogin } from '@auth0/nextjs-auth0'
import { NextApiRequest, NextApiResponse } from 'next'

export default handleAuth({
  login: handleLogin({
    authorizationParams: {
      prompt: 'login'
    },
    returnTo: '/'
  }),
  signup: handleLogin({
    authorizationParams: {
      prompt: 'login',
      screen_hint: 'login'
    },
    returnTo: '/'
  }),
  onError(req: NextApiRequest, res: NextApiResponse) {
    // Add your own custom error handling
    res.redirect(307, '/401')
  }
})
