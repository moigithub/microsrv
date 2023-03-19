import { Subjects, Listener, NotFoundError, OrderCancelledEvent, OrderStatus } from '@moimio/common'
import { Message } from 'node-nats-streaming'
import { Order } from '../models/orders'

import { queueGroupName } from './queue-group-name'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled
  queueGroupName: string = queueGroupName

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findById(data.id)

    if (!order) {
      throw new NotFoundError('order not found')
    }

    order.set({ status: OrderStatus.Cancelled })
    await order.save()

    msg.ack()
  }
}
