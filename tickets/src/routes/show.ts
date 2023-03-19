import { NotFoundError } from '@moimio/common'
import express, { Request, Response } from 'express'
import { Ticket } from '../models/tickets'

const router = express.Router()

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const ticket = await Ticket.findById(id)

  if (!ticket) throw new NotFoundError('ticket not found')

  res.status(200).send(ticket)
})

export { router as showTicketRouter }
