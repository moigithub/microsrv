import nats from 'node-nats-streaming'
import { TicketCreatedPublisher } from './events/ticket-created-publisher'

const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222'
})

stan.on('connect', async () => {
  console.log('connected to nats')

  const data = {
    id: '123',
    title: 'asdfsa',
    price: 123,
    userId: '123'
  }

  await new TicketCreatedPublisher(stan).publish(data)
})
