'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import useRequest from '../../../hooks/use-request'

export default function NewTicket() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')

  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'POST',
    body: { title, price },
    onSuccess: data => {
      console.log(data)
      router.push('/')
    }
  })

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    doRequest()
  }

  const formatPrice = () => {
    const value = parseFloat(price)
    if (Number.isNaN(value)) {
      return
    }
    setPrice(value.toFixed(2))
  }

  return (
    <form onSubmit={onSubmit}>
      <h1 className='mb-6 text-3xl font-bold'>New Ticket</h1>

      <div className='mb-6 group'>
        <label className='block mb-2 text-sm font-medium text-gray-900'>Title</label>
        <input
          type='text'
          className='bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 '
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      <div className='mb-6 group'>
        <label className='block mb-2 text-sm font-medium text-gray-900'>Price</label>
        <input
          type='text'
          className='bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 '
          value={price}
          onChange={e => setPrice(e.target.value)}
          onBlur={formatPrice}
        />
      </div>

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

      <button className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center '>
        Submit
      </button>
    </form>
  )
}
