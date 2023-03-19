import request from 'supertest'

import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { app } from '../app'

let mongo: MongoMemoryServer
beforeAll(async () => {
  mongo = new MongoMemoryServer()
  await mongo.start()
  const mongoUri = await mongo.getUri()

  await mongoose.connect(mongoUri)
})

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections()

  for (let collection of collections) {
    await collection.deleteMany({})
  }
})

afterAll(async () => {
  await mongo.stop()
  await mongoose.connection.close()
})

export const signin = async () => {
  const email = 't@t.com'
  const password = 'password'
  const response = await request(app).post('/api/user/signup').send({ email, password }).expect(201)

  const cookie = response.get('Set-Cookie')

  return cookie
}
