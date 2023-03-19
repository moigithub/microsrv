import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'
import { currentUser, errorHandler, NotFoundError } from '@moimio/common'
import { createTicketRouter } from './routes/new'
import { showTicketRouter } from './routes/show'
import { indexTicketRouter } from './routes'
import { updateTicketRouter } from './routes/update'

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

app.use(currentUser)
// app.use((req, res, next) => {
//   console.log('1env>>', process.env.JWT_KEY)
//   console.log('1session jwt >>', req.session)
//   console.log('1user >>', req.currentUser)
//   next()
// })
app.use(createTicketRouter)
app.use(showTicketRouter)
app.use(indexTicketRouter)
app.use(updateTicketRouter)

app.all('*', (req, res) => {
  throw new NotFoundError('not found')
})

app.use(errorHandler)

export { app }
