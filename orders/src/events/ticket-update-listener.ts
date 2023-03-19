import { Listener, Subjects, TicketUpdatedEvent } from '@moimio/common'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../models/tickets'
import { queueGroupName } from './queue-group-name'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated
  queueGroupName: string = queueGroupName

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findOne({ _id: data.id, version: data.version - 1 })

    if (!ticket) {
      throw new Error('Ticket not found')
    }

    const { title, price } = data
    ticket.set({ title, price })

    // data.version es la nueva version
    console.log('ticket update listener version', data.version)
    // const { title, price, version } = data
    // ticket.set({ title, price, version })
    await ticket.save()

    msg.ack()
  }
}
