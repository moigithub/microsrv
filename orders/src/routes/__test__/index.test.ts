import { Response } from 'express'
import { OrderStatus } from '@moimio/common'
import { natsWrapper } from './../../nats-client'
import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'

import { signin } from '../../test/setup'
import { Ticket } from '../../models/tickets'
import { Order } from '../../models/orders'

it('return orders', async () => {
  const ticket1 = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 22
  })
  await ticket1.save()
  const ticket2 = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 22
  })
  await ticket2.save()
  const ticket3 = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 22
  })
  await ticket3.save()
  console.log('index test ticket creation', ticket1.version)

  await request(app)
    .post('/api/orders')
    .set('Cookie', signin('user1'))
    .send({ ticketId: ticket1.id })
    .expect(201)

  const { body: order1 } = await request(app)
    .post('/api/orders')
    .set('Cookie', signin('user2'))
    .send({ ticketId: ticket2.id })
    .expect(201)
  const { body: order2 } = await request(app)
    .post('/api/orders')
    .set('Cookie', signin('user2'))
    .send({ ticketId: ticket3.id })
    .expect(201)

  const response = await request(app).get('/api/orders').set('Cookie', signin('user2')).send()

  expect(response.statusCode).toEqual(200)
  expect(response.body.length).toEqual(2)

  expect(response.body[0].id).toEqual(order1.id)
  expect(response.body[1].id).toEqual(order2.id)
  expect(response.body[0].ticket.id).toEqual(ticket2.id)
  expect(response.body[1].ticket.id).toEqual(ticket3.id)
})
