import { requireAuth, validationRequest } from '@moimio/common'
import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { TicketCreatedPublisher } from '../events/ticket-created-publisher'
import { Ticket } from '../models/tickets'
import { natsWrapper } from '../nats-client'

const router = express.Router()

router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('invalid Title'),
    body('price').isFloat({ gt: 0 }).withMessage('invalid price')
  ],
  validationRequest,

  async (req: Request, res: Response) => {
    const { title, price } = req.body

    const ticket = Ticket.build({ title, price, userId: req.currentUser!.id })
    await ticket.save()

    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version
    })
    res.status(201).send(ticket)
  }
)

export { router as createTicketRouter }
