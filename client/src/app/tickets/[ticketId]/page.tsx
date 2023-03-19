'use client'

import useRequest from '@/hooks/use-request'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

async function getTicketDetails(id: string) {
  // const headersList = headers()
  const res = await fetch(
    // `http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/tickets/${id}`,
    `/api/tickets/${id}`
    // {
    //   headers: headersList
    // }
  )

  return res.json()
}

interface Ticket {
  title: string
  price: string
}

export default function TicketShow({ params }: { params: { ticketId: string } }) {
  const [data, setData] = useState<Ticket>()
  const router = useRouter()
  const { ticketId } = params

  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'POST',
    body: { ticketId },
    onSuccess: data => {
      console.log('data purchase', data)
      router.push(`/orders/${data.id}`)
    }
  })

  useEffect(() => {
    const getData = async () => {
      const data = await getTicketDetails(ticketId)
      setData(data)
    }
    getData()
  }, [])

  if (!data) {
    return <div>...Loading</div>
  }

  return (
    <div>
      <h1>Ticket details</h1>
      <h2>{data.title}</h2>
      <h4>Price: {data.price}</h4>
      <button
        className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center '
        onClick={() => doRequest()}
      >
        Purchase
      </button>

      {errors.length > 0 && (
        <div className='bg-red-200 text-red-600 block mb-5 p-4'>
          <h4 className='text-lg font-bold '>Ooops..</h4>
          <ul className='my-0 ml-3 pl-4 list-disc'>
            {errors.map((error: any) => {
              return (
                <li key={error.message} className='text-sm'>
                  {error.message}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
