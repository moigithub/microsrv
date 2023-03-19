import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { signin } from '../../test/setup'

it('returns 404 is ticket not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()

  const response = await request(app).get(`/api/tickets/${id}`).send()
  expect(response.status).toBe(404)
})

it('returns ticket if found', async () => {
  const cookie = signin()
  const ticket = { title: 'title', price: 12 }
  const response = await request(app).post('/api/tickets').set('Cookie', cookie).send(ticket)
  const ticketFound = await request(app).get(`/api/tickets/${response.body.id}`).send().expect(200)
  expect(ticketFound.body.title).toEqual(ticket.title)
  expect(ticketFound.body.price).toEqual(ticket.price)
})
