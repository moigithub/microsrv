import { OrderStatus } from '@moimio/common'
import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { Order } from '../../models/orders'
import { Payment } from '../../models/payment'
import { natsWrapper } from '../../nats-client'
import { stripe } from '../../stripe'
import { signin } from '../../test/setup'
jest.mock('../../stripe.ts')

it('returns 404 when purchase unexistent order', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', signin())
    .send({ token: 'asf', orderId: new mongoose.Types.ObjectId().toHexString() })
    .expect(404)
})

it('returns 401 when purchase order dont belongin to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: 'user1',
    version: 0,
    price: 123,
    status: OrderStatus.Created
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin('another_user'))
    .send({ token: 'asf', orderId: order.id })
    .expect(401)
})

it('returns 400 when purchase cancelled order', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: 'userX',
    version: 0,
    price: 123,
    status: OrderStatus.Cancelled
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin('userX'))
    .send({ token: 'asf', orderId: order.id })
    .expect(400)
})

it('return 201 with valid input', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: 'userX',
    version: 0,
    price: 123,
    status: OrderStatus.Created
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin('userX'))
    .send({ token: 'tok_visa', orderId: order.id })
    .expect(201)

  //with mocked stripe
  expect(stripe.charges.create).toHaveBeenCalled()
  expect(stripe.charges.create).toHaveBeenCalledWith(
    expect.objectContaining({
      currency: 'usd',
      amount: order.price * 100,
      source: 'tok_visa'
    })
  )

  const payment = Payment.findOne({ orderId: order.id })
  expect(payment).not.toBeNull()

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
