import Queue from 'bull'
import { ExpirationCompletePublisher } from '../events/order-created-publisher'
import { natsWrapper } from '../nats-client'

interface Payload {
  orderId: string
}

const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST
  }
})

expirationQueue.process(async job => {
  console.log('publish expiration:complete event for orderid', job.data)

  new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: job.data.orderId
  })
})

export { expirationQueue }
