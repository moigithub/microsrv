import { natsWrapper } from './../../nats-client'
import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/tickets'
import { signin } from '../../test/setup'

it('has a route handler listening to /api/tickets for post requests', async () => {
  const response = await request(app).post('/api/tickets').send({})

  expect(response.status).not.toEqual(404)
})

it('can only be accessed if user is signed in', async () => {
  await request(app).post('/api/tickets').send({}).expect(401)
})

it('returns a non 401 status code if user is signed in', async () => {
  const cookie = signin()
  const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({})
  expect(response.status).not.toEqual(401)
})

it('returns an error if an invalid title is provided', async () => {
  const cookie = signin()
  const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({
    title: '',
    price: 123
  })
  expect(response.status).toEqual(400)

  await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      price: 123
    })
    .expect(400)
})

it('returns an error if an invalid price is provided', async () => {
  const cookie = signin()
  const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({
    title: 'asdfasdf',
    price: -123
  })
  expect(response.status).toEqual(400)

  await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'asdfasdf'
    })
    .expect(400)
})

it('creates a ticket with valid inputs', async () => {
  const cookie = signin()

  let tickets = await Ticket.find({})
  expect(tickets.length).toEqual(0)

  const ticket = { title: 'title', price: 12 }
  await request(app).post('/api/tickets').set('Cookie', cookie).send(ticket).expect(201)

  tickets = await Ticket.find({})
  expect(tickets.length).toEqual(1)
  expect(tickets[0].title).toEqual(ticket.title)
  expect(tickets[0].price).toEqual(ticket.price)
})

it('creates a ticket send create event', async () => {
  const cookie = signin()

  const ticket = { title: 'title', price: 12 }
  await request(app).post('/api/tickets').set('Cookie', cookie).send(ticket).expect(201)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1)
})
