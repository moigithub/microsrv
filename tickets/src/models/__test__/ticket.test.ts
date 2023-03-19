import { Ticket } from '../tickets'

it('implment optimistic concurrrency control', async () => {
  // create an instance of ticket
  const ticket = Ticket.build({ title: 'dd', price: 5, userId: '1' })
  // save the ticket to db
  await ticket.save()
  // fetch ticket twice
  const t1 = await Ticket.findById(ticket.id)
  const t2 = await Ticket.findById(ticket.id)
  // make 2 separated changed to the ticket FileWatcherEventKind
  t1!.set({ price: 1 })
  t2!.set({ price: 2 })
  // save the first fetched ticket
  await t1!.save()
  // save the second fetched ticket, expect error

  await expect(t2!.save()).rejects.toThrow()
  return expect(t2!.save()).rejects.toThrow()
})

it('increment version number multiple save', async () => {
  const ticket = Ticket.build({ title: 'dd', price: 5, userId: '1' })

  await ticket.save()
  expect(ticket.version).toEqual(0)
  await ticket.save()
  expect(ticket.version).toEqual(1)
  await ticket.save()
  expect(ticket.version).toEqual(2)
})
