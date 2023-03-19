import {
  NotFoundError,
  BadRequestError,
  OrderStatus,
  requireAuth,
  validationRequest
} from '@moimio/common'
import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import mongoose from 'mongoose'
import { Ticket } from '../models/tickets'
import { Order } from '../models/orders'
import { OrderCreatedPublisher } from '../events/order-created-publisher'
import { natsWrapper } from '../nats-client'

const router = express.Router()

const EXPIRATION_WINDOW_SECONDS = 60

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('Ticket id invalid')
  ],
  validationRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body
    const ticket = await Ticket.findById(ticketId)
    if (!ticket) throw new NotFoundError('ticket not found')

    /* find order with this ticket
       which the order status isnt cancelled
    */
    const isReserved = await ticket.isReserved()
    if (isReserved) {
      throw new BadRequestError('Ticket not available')
    }

    const expiration = new Date()
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiredAt: expiration,
      ticket
    })
    order.save()

    await new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiredAt: order.expiredAt.toISOString(),
      version: order.version,
      ticket: {
        id: ticket.id,
        price: ticket.price
      }
    })

    res.status(201).send(order)
  }
)

export { router as newOrderRouter }
