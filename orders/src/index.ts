import mongoose from 'mongoose'
import { app } from './app'
import { ExpirationCompleteListener } from './events/expiration-complete-listener'
import { PaymentCreatedListener } from './events/payment-created-listener'
import { TicketCreatedListener } from './events/ticket-created-listener'
import { TicketUpdatedListener } from './events/ticket-update-listener'
import { natsWrapper } from './nats-client'

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('env: JWT_KEY not defined')
  }
  if (!process.env.MONGO_URI) {
    throw new Error('env: MONGO_URI not defined')
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('env: NATS_CLUSTER_ID not defined')
  }
  if (!process.env.NATS_URL) {
    throw new Error('env: NATS_URL not defined')
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('env: NATS_CLIENT_ID not defined')
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    )

    natsWrapper.client.on('close', () => {
      console.log('disconnected from nats')
      process.exit()
    })
    process.on('SIGINT', () => natsWrapper.client.close())
    process.on('SIGTERM', () => natsWrapper.client.close())

    new TicketCreatedListener(natsWrapper.client).listen()
    new TicketUpdatedListener(natsWrapper.client).listen()
    new ExpirationCompleteListener(natsWrapper.client).listen()
    new PaymentCreatedListener(natsWrapper.client).listen()

    await mongoose.connect(process.env.MONGO_URI)
  } catch (err) {
    console.error(err)
  }

  app.listen(3000, () => {
    console.log('listening on port 3000')
  })
}

start()
