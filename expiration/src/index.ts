import { OrderCreatedListener } from './events/order-created-listener'
import { natsWrapper } from './nats-client'

const start = async () => {
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
      process.exit(0)
    })
    process.on('SIGINT', () => natsWrapper.client.close())
    process.on('SIGTERM', () => natsWrapper.client.close())

    new OrderCreatedListener(natsWrapper.client).listen()
  } catch (err) {
    console.error(err)
  }
}

start()
