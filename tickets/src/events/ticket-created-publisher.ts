import { Publisher, TicketCreatedEvent, Subjects } from '@moimio/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated
}
