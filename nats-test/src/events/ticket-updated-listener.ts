import { Message } from 'node-nats-streaming'
import { Listener } from './base-listener'
import { Subjects } from './subjects'
import { TicketUpdateEvent } from './ticket-updated-event'

export class TicketUpdatedListener extends Listener<TicketUpdateEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated
  queueGroupName = 'payments-service'

  onMessage(data: TicketUpdateEvent['data'], msg: Message): void {
    console.log('event data', data)

    msg.ack()
  }
}
