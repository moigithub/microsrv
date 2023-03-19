import { TicketCreatedEvent } from '@moimio/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../models/tickets'
import { natsWrapper } from '../../nats-client'
import { TicketCreatedListener } from '../ticket-created-listener'

const setup = () => {
  const listener = new TicketCreatedListener(natsWrapper.client)
  const data: TicketCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 12,
    title: 'adf',
    userId: new mongoose.Types.ObjectId().toHexString()
  }

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg }
}

it('create n save a ticket', async () => {
  const { listener, data, msg } = setup()

  // call onMessage function with data obj+msg
  await listener.onMessage(data, msg)
  // write assertion for ticket create
  const ticket = await Ticket.findById(data.id)
  expect(ticket).toBeDefined()
  expect(ticket!.title).toEqual(data.title)
  expect(ticket!.price).toEqual(data.price)
})

it('acks the msg', async () => {
  const { listener, data, msg } = setup()

  // call onMessage function with data obj+msg
  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})
