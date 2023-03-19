import jwt from 'jsonwebtoken'

import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongo: MongoMemoryServer

jest.mock('../nats-client.ts')

beforeAll(async () => {
  process.env.JWT_KEY = 'sadfasdf2'
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

  mongo = new MongoMemoryServer()
  await mongo.start()
  const mongoUri = await mongo.getUri()

  await mongoose.connect(mongoUri)
})

beforeEach(async () => {
  jest.clearAllMocks()
  // jest.mocked(natsWrapper.client.publish).mockClear() //clear havebeencalledtimes counter

  const collections = await mongoose.connection.db.collections()

  for (let collection of collections) {
    await collection.deleteMany({})
  }
})

afterAll(async () => {
  await mongo.stop()
  await mongoose.connection.close()
})

export const signin = (id: string = 'id') => {
  const token = jwt.sign(
    {
      id,
      email: 'email@mail.com'
    },
    process.env.JWT_KEY || 'secret'
  )
  const session = JSON.stringify({ jwt: token })

  const base64 = Buffer.from(session).toString('base64')
  return [`express:sess=${base64}`]
}
