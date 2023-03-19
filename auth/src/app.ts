import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'

import { errorHandler, NotFoundError } from '@moimio/common'
import { signinRouter } from './routes/signin'
import { currentuserRouter } from './routes/current-user'
import { signoutRouter } from './routes/signout'
import { signupRouter } from './routes/signup'

const app = express()
app.set('trust proxy', true)
app.use(json())
app.use(
  cookieSession({
    name: 'express:sess',
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
  })
)
app.use(signinRouter)
app.use(signupRouter)
app.use(signoutRouter)
app.use(currentuserRouter)

app.all('*', (req, res) => {
  throw new NotFoundError('not found')
})

app.use(errorHandler)

export { app }
