import { Publisher, ExpirationCompleteEvent, Subjects } from '@moimio/common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete
}
