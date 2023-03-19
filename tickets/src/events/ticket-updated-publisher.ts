import { Publisher, TicketUpdatedEvent, Subjects } from '@moimio/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated
}
