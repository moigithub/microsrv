import { headers } from 'next/headers'
import Link from 'next/link'

interface Ticket {
  id: string
  title: string
  price: string
}

async function getCurrentUser() {
  const headersList = headers()

  const res = await fetch(
    'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/user/currentuser',
    {
      headers: headersList
    }
  )

  return res.json()
}

async function getTickets() {
  const headersList = headers()
  const res = await fetch(
    'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/tickets',
    // '/api/tickets',
    {
      headers: headersList
    }
  )

  return res.json()
}

export default async function Home() {
  const { currentUser } = await getCurrentUser()
  const data = await getTickets()
  console.log('home', data)
  const ticketList = data.map((ticket: Ticket) => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href={`/tickets/${ticket.id}`}>View</Link>
        </td>
      </tr>
    )
  })

  return (
    <div>
      <h1>Tickets</h1>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  )
}
