import { OrderCancelledEvent } from '@moimio/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../models/tickets'
import { natsWrapper } from '../../nats-client'
import { OrderCancelledListener } from '../order-cancelled-listener'

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client)
  const ticket = Ticket.build({
    title: 'ticket',
    price: 33,
    userId: new mongoose.Types.ObjectId().toHexString()
  })
  const orderId = new mongoose.Types.ObjectId().toHexString()
  ticket.set({ orderId })
  await ticket.save()

  const data: OrderCancelledEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    ticket: {
      id: ticket.id
    }
  }

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg, ticket, orderId }
}

it('create n save a ticket', async () => {
  const { listener, data, msg, ticket } = await setup()

  await listener.onMessage(data, msg)
  const ticketUpdated = await Ticket.findById(ticket.id)

  expect(ticketUpdated!.orderId).toEqual(undefined)
  expect(msg.ack).toHaveBeenCalled()
})

it('publish ticket update event', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
