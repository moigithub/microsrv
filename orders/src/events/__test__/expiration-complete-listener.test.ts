import { OrderStatus } from './../../../../common/src/events/types/order-status'
import { ExpirationCompleteEvent } from '@moimio/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Order } from '../../models/orders'
import { Ticket } from '../../models/tickets'
import { natsWrapper } from '../../nats-client'
import { ExpirationCompleteListener } from '../expiration-complete-listener'

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client)

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'adf',
    price: 12
  })
  await ticket.save()

  const order = Order.build({
    userId: 'asdf',
    status: OrderStatus.Created,
    expiredAt: new Date(),
    ticket
  })
  await order.save()

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
  }

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, order, data, msg }
}

it('find n cancel an order', async () => {
  const { listener, order, data, msg } = await setup()

  await listener.onMessage(data, msg)
  const orderUpdated = await Order.findById(order.id)

  expect(orderUpdated!.status).toEqual(OrderStatus.Cancelled)
})

it('emit cancel order event & acks the msg', async () => {
  const { listener, order, data, msg } = await setup()

  // call onMessage function with data obj+msg
  await listener.onMessage(data, msg)

  const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

  expect(eventData.id).toEqual(order.id)
  expect(natsWrapper.client.publish).toHaveBeenCalled()

  expect(msg.ack).toHaveBeenCalled()
})
