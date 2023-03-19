import { TicketUpdatedEvent } from '@moimio/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../models/tickets'
import { natsWrapper } from '../../nats-client'
import { TicketUpdatedListener } from '../ticket-update-listener'

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client)

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'adf',
    price: 12
  })
  await ticket.save()

  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    title: 'new title',
    price: 123,
    userId: 'userid',
    version: ticket.version + 1
  }

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg }
}

it('find n update a ticket', async () => {
  const { listener, data, msg } = await setup()

  // call onMessage function with data obj+msg
  await listener.onMessage(data, msg)
  // write assertion for ticket create
  const ticketUpdated = await Ticket.findById(data.id)

  expect(ticketUpdated).toBeDefined()
  expect(ticketUpdated!.title).toEqual(data.title)
  expect(ticketUpdated!.price).toEqual(data.price)
  expect(ticketUpdated!.version).toEqual(data.version)
})

it('acks the msg', async () => {
  const { listener, data, msg } = await setup()

  // call onMessage function with data obj+msg
  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})

it('not call ack if version is not in correct sequence', async () => {
  const { listener, data, msg } = await setup()

  // call onMessage function with data obj+msg
  data.version = 110
  await expect(listener.onMessage(data, msg)).rejects.toThrow()

  expect(msg.ack).not.toHaveBeenCalled()
})
