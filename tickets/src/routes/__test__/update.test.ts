import { natsWrapper } from './../../nats-client'
import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/tickets'
import { signin } from '../../test/setup'

it('return 404 if id dont exist', async () => {
  const cookie = signin()
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', cookie)
    .send({ title: 'title', price: 12 })
    .expect(404)
})

it('return 401 if user not auth', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app).put(`/api/tickets/${id}`).send({ title: 'title', price: 12 }).expect(401)
})

it('return 401 if user does not own of the ticket', async () => {
  const ticket = await request(app)
    .post('/api/tickets')
    .set('Cookie', signin('user000'))
    .send({ title: 'title', price: 12 })

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', signin('user123'))
    .send({ title: 'title', price: 12 })
    .expect(401)
})

it('return 400 if user provide invalid title or price', async () => {
  const userId = 'user000'
  const ticket = await request(app)
    .post('/api/tickets')
    .set('Cookie', signin(userId))
    .send({ title: 'title', price: 12 })

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', signin(userId))
    .send({ price: -12 })
    .expect(400)

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', signin(userId))
    .send({ title: 'title' })
    .expect(400)

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', signin(userId))
    .send({})
    .expect(400)
})

it('update ticket if valid input', async () => {
  const userId = 'user000'
  const ticket = await request(app)
    .post('/api/tickets')
    .set('Cookie', signin(userId))
    .send({ title: 'title', price: 12 })

  const updatedTicket = await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', signin(userId))
    .send({ title: 'new title', price: 20 })
    .expect(200)

  expect(updatedTicket.body.title).toBe('new title')
  expect(updatedTicket.body.price).toEqual(20)
})

it('update a ticket send update event', async () => {
  const userId = 'user000'
  const ticket = await request(app)
    .post('/api/tickets')
    .set('Cookie', signin(userId))
    .send({ title: 'title', price: 12 })

  const updatedTicket = await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', signin(userId))
    .send({ title: 'new title', price: 20 })
    .expect(200)

  expect(updatedTicket.body.title).toBe('new title')
  expect(updatedTicket.body.price).toEqual(20)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2) // post + put
})

it('reject update if ticket is reserved', async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString()
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signin('user000'))
    .send({ title: 'title', price: 12 })
  const ticket = await Ticket.findById(response.body.id)
  ticket!.set({ orderId })
  await ticket!.save()

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', signin('user000'))
    .send({ title: 'title', price: 22 })
    .expect(400)
})
