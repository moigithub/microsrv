import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validationRequest
} from '@moimio/common'
import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { TicketUpdatedPublisher } from '../events/ticket-updated-publisher'
import { Ticket } from '../models/tickets'
import { natsWrapper } from '../nats-client'

const router = express.Router()

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('invalid Title'),
    body('price').isFloat({ gt: 0 }).withMessage('invalid price')
  ],
  validationRequest,

  async (req: Request, res: Response) => {
    const { id } = req.params
    const ticket = await Ticket.findById(id)

    if (!ticket) {
      throw new NotFoundError('ticket not found')
    }

    if (ticket.orderId) {
      throw new BadRequestError('ticket not available')
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError('unauthorized')
    }

    const { title, price } = req.body

    // ticket.title = title
    // ticket.price = price
    ticket.set({
      title,
      price
    })
    await ticket.save()

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version
    })

    res.status(200).send(ticket)
  }
)

export { router as updateTicketRouter }
