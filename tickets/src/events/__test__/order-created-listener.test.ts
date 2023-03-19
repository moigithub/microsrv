import { OrderCreatedEvent, OrderStatus } from '@moimio/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../models/tickets'
import { natsWrapper } from '../../nats-client'
import { OrderCreatedListener } from '../order-created-listener'

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client)
  const ticket = Ticket.build({
    title: 'ticket',
    price: 33,
    userId: new mongoose.Types.ObjectId().toHexString()
  })
  await ticket.save()

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiredAt: 'asdf',
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  }

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg, ticket }
}

it('create n save a ticket', async () => {
  const { listener, data, msg, ticket } = await setup()

  await listener.onMessage(data, msg)
  const ticketUpdated = await Ticket.findById(ticket.id)

  expect(ticketUpdated!.orderId).toEqual(data.id)
})

it('acks the msg', async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})

it('publish ticket update event', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
