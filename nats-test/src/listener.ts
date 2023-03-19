import nats from 'node-nats-streaming'
import { TicketCreatedListener } from './events/ticket-created-listener'

const stan = nats.connect('ticketing', '123', {
  url: 'http://localhost:4222'
})

stan.on('connect', () => {
  console.log('connected to nats')

  stan.on('close', () => {
    console.log('disconnected from nats')
    process.exit(0)
  })

  new TicketCreatedListener(stan).listen()
})

process.on('SIGINT', () => stan.close())
process.on('SIGTERM', () => stan.close())
