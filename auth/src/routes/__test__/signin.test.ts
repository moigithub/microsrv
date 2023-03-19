import request from 'supertest'
import { app } from '../../app'

it('return 400 on invalid email', () => {
  return request(app)
    .post('/api/user/signin')
    .send({ email: 't@t.com', password: 'password' })
    .expect(400)
})

it('return 200 on valid credentials', async () => {
  await request(app)
    .post('/api/user/signup')
    .send({ email: 't@t.com', password: 'password' })
    .expect(201)

  await request(app)
    .post('/api/user/signin')
    .send({ email: 't@t.com', password: 'password' })
    .expect(200)
})

it('set cookie on valid signin', async () => {
  await request(app)
    .post('/api/user/signup')
    .send({ email: 't@t.com', password: 'password' })
    .expect(201)

  const response = await request(app)
    .post('/api/user/signin')
    .send({ email: 't@t.com', password: 'password' })
    .expect(200)

  expect(response.get('set-cookie')).toBeDefined()
})
