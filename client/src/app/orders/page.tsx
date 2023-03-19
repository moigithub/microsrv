import { headers } from 'next/headers'
import Link from 'next/link'

interface Order {
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

async function getOrders() {
  const headersList = headers()
  const res = await fetch(
    'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/orders',
    {
      headers: headersList
    }
  )

  return res.json()
}

export default async function Orders() {
  const { currentUser } = await getCurrentUser()
  const data = await getOrders()
  console.log('orders', data)
  const orderList = data.map((order: any) => {
    return (
      <tr key={order.id}>
        <td>{order.ticket.title}</td>
        <td>{order.ticket.price}</td>
        <td>{order.status}</td>
        <td>
          <Link href={`/orders/${order.id}`}>View</Link>
        </td>
      </tr>
    )
  })

  return (
    <div>
      <h1>Orders</h1>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{orderList}</tbody>
      </table>
    </div>
  )
}
