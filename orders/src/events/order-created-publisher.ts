import { Publisher, OrderCreatedEvent, Subjects } from '@moimio/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated
}
