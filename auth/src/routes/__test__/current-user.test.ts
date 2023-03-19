import request from 'supertest'
import { app } from '../../app'
import { signin } from '../../test/setup'

it('respond with correct user', async () => {
  const cookie = await signin()
  const response = await request(app)
    .get('/api/user/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200)

  expect(response.body.currentUser).not.toBeNull()
  expect(response.body.currentUser.email).toBe('t@t.com')
})

it('respond with null if not authenticated', async () => {
  const response = await request(app).get('/api/user/currentuser').send().expect(200)

  expect(response.body.currentUser).toBeNull()
})
