import { Response } from 'express'
import { OrderStatus } from '@moimio/common'
import { natsWrapper } from './../../nats-client'
import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'

import { signin } from '../../test/setup'
import { Ticket } from '../../models/tickets'
import { Order } from '../../models/orders'

it('return error if order not found', async () => {
  const orderId = new mongoose.Types.ObjectId()

  const response = await request(app)
    .delete(`/api/orders/${orderId}`)
    .set('Cookie', signin('user2'))
    .send()

  expect(response.statusCode).toEqual(404)
})

it('return error if order dont belong to user', async () => {
  const ticket1 = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 22
  })
  await ticket1.save()

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', signin('user1'))
    .send({ ticketId: ticket1.id })
    .expect(201)

  const response = await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', signin('user2'))
    .send()

  expect(response.statusCode).toEqual(401)
})

it('return order with status canncelled', async () => {
  const ticket1 = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 22
  })
  await ticket1.save()

  const { body: order1 } = await request(app)
    .post('/api/orders')
    .set('Cookie', signin('user2'))
    .send({ ticketId: ticket1.id })
    .expect(201)

  //delete user order
  await request(app)
    .delete(`/api/orders/${order1.id}`)
    .set('Cookie', signin('user2'))
    .send()
    .expect(204)

  //check if order have been cancelled
  const { body: cancelledOrder } = await request(app)
    .get(`/api/orders/${order1.id}`)
    .set('Cookie', signin('user2'))
    .send()
    .expect(200)

  expect(cancelledOrder.id).toEqual(order1.id)
  expect(cancelledOrder.status).toEqual(OrderStatus.Cancelled)
})

it('emits order cancelled event', async () => {
  const ticket1 = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 22
  })
  await ticket1.save()

  const { body: order1 } = await request(app)
    .post('/api/orders')
    .set('Cookie', signin('user2'))
    .send({ ticketId: ticket1.id })
    .expect(201)

  //delete user order
  await request(app)
    .delete(`/api/orders/${order1.id}`)
    .set('Cookie', signin('user2'))
    .send()
    .expect(204)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2) //create +cancel
})
