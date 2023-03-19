import {
  requireAuth,
  validationRequest,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
  BadRequestError
} from '@moimio/common'
import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { PaymentCreatedPublisher } from '../events/payment-created-publisher'
import { Order } from '../models/orders'
import { Payment } from '../models/payment'
import { natsWrapper } from '../nats-client'
import { stripe } from '../stripe'

const router = express.Router()

router.post(
  '/api/payments',
  requireAuth,
  [body('token').not().isEmpty(), body('orderId').not().isEmpty()],
  validationRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body
    const order = await Order.findById(orderId)
    if (!order) {
      throw new NotFoundError('order not found')
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError('not authorized')
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('order has been cancelled')
    }

    if (order.status === OrderStatus.Complete) {
      throw new BadRequestError('order not available')
    }

    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token
    })

    const payment = Payment.build({
      orderId: orderId,
      stripeId: charge.id
    })
    await payment.save()

    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId
    })

    res.status(201).send({ success: true, charge })
  }
)

export { router as createChargeRouter }
