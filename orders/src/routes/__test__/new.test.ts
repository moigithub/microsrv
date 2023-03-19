import { OrderStatus } from './../../../../common/src/events/types/order-status'
import { natsWrapper } from './../../nats-client'
import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'

import { signin } from '../../test/setup'
import { Ticket } from '../../models/tickets'
import { Order } from '../../models/orders'

it('return errr if ticket not exist', async () => {
  const ticketId = new mongoose.Types.ObjectId()

  await request(app).post('/api/orders').set('Cookie', signin()).send({ ticketId }).expect(404)
})

it('return error if ticket already reserved', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 22
  })
  await ticket.save()

  const order = Order.build({
    ticket,
    userId: 'aa',
    status: OrderStatus.Created,
    expiredAt: new Date()
  })
  order.save()

  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({ ticketId: ticket.id })
    .expect(400)
})

it('creates a order: reserve a ticket', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 22
  })
  await ticket.save()

  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({ ticketId: ticket.id })
    .expect(201)
})

it('emits order create event', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 22
  })
  await ticket.save()

  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({ ticketId: ticket.id })
    .expect(201)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1)
})
