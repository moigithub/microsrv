'use client'
import useRequest from '@/hooks/use-request'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import StripeCheckout from 'react-stripe-checkout'

async function getOrderDetails(id: string) {
  const res = await fetch(`/api/orders/${id}`)

  return res.json()
}

async function getCurrentUser() {
  let res
  res = await fetch('/api/user/currentuser', {
    cache: 'no-store'
  })

  return res.json()
}

interface Order {
  id: string
  status: string
  userId: string
  expiredAt: string
  ticket: {
    id: string
    title: string
    price: number
  }
}

export default function OrderShow({ params }: { params: { orderId: string } }) {
  const [data, setData] = useState<Order>()
  const [timer, setTimer] = useState<number>(0)
  const [user, setUser] = useState<{ email?: string | undefined }>()

  const router = useRouter()
  const { orderId } = params

  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'POST',
    body: { /*token: 'tok_visa',*/ orderId },
    onSuccess: data => {
      console.log('data purchase', data)
      router.push('/orders')
    }
  })

  useEffect(() => {
    let timerHandler: any = null
    const getData = async () => {
      const data = await getOrderDetails(orderId)

      const setTimeLeft = () => {
        const msLeft = new Date(data.expiredAt).getTime() - new Date().getTime()
        if (msLeft <= 0) {
          clearInterval(timerHandler)
        } else {
          setTimer(Math.round(msLeft / 1000))
        }
      }

      if (timerHandler) {
        clearInterval(timerHandler)
      }
      timerHandler = setInterval(setTimeLeft, 1000)
      setData(data)
    }
    getData()

    const getUser = async () => {
      const { currentUser } = await getCurrentUser()
      console.log('nav', currentUser)
      setUser(currentUser)
    }
    getUser()

    return () => {
      if (timerHandler) {
        clearInterval(timerHandler)
      }
    }
  }, [])

  if (!data) {
    return <div>...Loading</div>
  }

  return (
    <div>
      <h1>Order details</h1>
      <h4>Order: {data.id}</h4>
      <h4>{data.ticket.title}</h4>
      <h4>Pay: {data.ticket.price}</h4>
      {timer > 0 ? (
        <>
          <p>Expiration: {timer} seconds until order expires</p>

          <StripeCheckout
            token={({ id }) => {
              console.log('token', id)
              doRequest({ token: id })
            }}
            amount={data.ticket.price * 100}
            email={user?.email}
            stripeKey='pk_test_51LcywbDDAATQ2nEbmwbHEdpGPTGOrVUjWjFCnD4zw99JTVAvsgnYwl4HPRR2MDmaM1sXcCMx5vljCIWWiqTiFPLJ00CtN8dnh4'
          />
        </>
      ) : (
        <p>Order expired</p>
      )}

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
