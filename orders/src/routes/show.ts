import { NotAuthorizedError, NotFoundError } from '@moimio/common'
import express, { Request, Response } from 'express'
import { Order } from '../models/orders'

const router = express.Router()

router.get('/api/orders/:orderId', async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.orderId).populate('ticket')

  if (!order) {
    throw new NotFoundError('order not found')
  }
  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError('order not found')
  }

  res.send(order)
})

export { router as showOrderRouter }
