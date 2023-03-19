import request from 'supertest'
import { app } from '../../app'
import { signin } from '../../test/setup'

function createTicket() {
  const cookie = signin()
  return request(app).post('/api/tickets').set('Cookie', cookie).send({ title: 'title', price: 12 })
}

it('returns tickets', async () => {
  await createTicket()
  await createTicket()
  await createTicket()

  const response = await request(app).get(`/api/tickets`).send()
  expect(response.body.length).toEqual(3)
  expect(response.status).toBe(200)
})
