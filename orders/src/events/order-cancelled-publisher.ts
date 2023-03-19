import { Publisher, OrderCancelledEvent, Subjects } from '@moimio/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled
}
