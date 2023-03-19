import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'
import { currentUser, errorHandler, NotFoundError } from '@moimio/common'
import { newOrderRouter } from './routes/new'
import { indexOrderRouter } from './routes'
import { showOrderRouter } from './routes/show'
import { deleteOrderRouter } from './routes/delete'

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
app.use(deleteOrderRouter)
app.use(showOrderRouter)
app.use(indexOrderRouter)
app.use(newOrderRouter)

app.all('*', (req, res) => {
  throw new NotFoundError('not found')
})

app.use(errorHandler)

export { app }
