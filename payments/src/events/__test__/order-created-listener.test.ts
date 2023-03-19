import { OrderCreatedEvent, OrderStatus } from '@moimio/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Order } from '../../models/orders'
import { natsWrapper } from '../../nats-client'
import { OrderCreatedListener } from '../order-created-listener'

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client)

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiredAt: 'asdf',
    ticket: {
      id: 'fdasf',
      price: 123
    }
  }

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg }
}

it('create n save a order for payment', async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)
  const order = await Order.findById(data.id)

  expect(order!.price).toEqual(data.ticket.price)
})

it('acks the msg', async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})
