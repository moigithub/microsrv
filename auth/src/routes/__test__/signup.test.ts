import request from 'supertest'
import { app } from '../../app'

it('return 201 on success signup', () => {
  return request(app)
    .post('/api/user/signup')
    .send({ email: 't@t.com', password: 'password' })
    .expect(201)
})

it('return 400 on invalid email', () => {
  return request(app)
    .post('/api/user/signup')
    .send({ email: 'invalid-mail', password: 'password' })
    .expect(400)
})

it('return 400 on invaid password', () => {
  return request(app).post('/api/user/signup').send({ email: 't@t.com', password: 'p' }).expect(400)
})

it('return 400 on missing email and password ', () => {
  return request(app).post('/api/user/signup').send({}).expect(400)
})

it('disallow duplicate email', async () => {
  await request(app)
    .post('/api/user/signup')
    .send({
      email: 't@t.com',
      password: 'password'
    })
    .expect(201)

  await request(app)
    .post('/api/user/signup')
    .send({
      email: 't@t.com',
      password: 'password'
    })
    .expect(400)
})

it('sets cookie after success signup', async () => {
  const response = await request(app)
    .post('/api/user/signup')
    .send({
      email: 't@t.com',
      password: 'password'
    })
    .expect(201)

  expect(response.get('set-cookie')).toBeDefined()
})
