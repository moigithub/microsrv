import request from 'supertest'
import { app } from '../../app'

it('clear cookie after signout', async () => {
  await request(app)
    .post('/api/user/signup')
    .send({ email: 't@t.com', password: 'password' })
    .expect(201)

  await request(app)
    .post('/api/user/signin')
    .send({ email: 't@t.com', password: 'password' })
    .expect(200)

  const response = await request(app).post('/api/user/signout').send({}).expect(200)

  expect(response.get('set-cookie')[0]).toEqual(
    'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  )
})
