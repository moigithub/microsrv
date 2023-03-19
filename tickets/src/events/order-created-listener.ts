import { Subjects, Listener, OrderCreatedEvent, OrderStatus, NotFoundError } from '@moimio/common'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../models/tickets'
import { queueGroupName } from './queue-group-name'
import { TicketUpdatedPublisher } from './ticket-updated-publisher'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated
  queueGroupName: string = queueGroupName

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id)

    if (!ticket) {
      throw new NotFoundError('ticket not found')
    }

    ticket.set({ orderId: data.id })
    await ticket.save()

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version
    })

    msg.ack()
  }
}
