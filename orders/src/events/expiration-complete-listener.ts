import { OrderCancelledPublisher } from './order-cancelled-publisher'
import { Listener, ExpirationCompleteEvent, Subjects, OrderStatus } from '@moimio/common'
import { Message } from 'node-nats-streaming'
import { Order } from '../models/orders'
import { queueGroupName } from './queue-group-name'

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete
  queueGroupName: string = queueGroupName

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const order = await Order.findOne({ _id: data.orderId }).populate('ticket')

    if (!order) {
      throw new Error('Order not found')
    }
    // if order is alread paid should not cancel

    if (order.status === OrderStatus.Complete) {
      return msg.ack()
    }

    order.set({ status: OrderStatus.Cancelled })

    await order.save()

    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: { id: order.ticket.id }
    })

    msg.ack()
  }
}
