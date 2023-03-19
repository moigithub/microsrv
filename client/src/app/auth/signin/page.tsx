'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import useRequest from '../../../hooks/use-request'

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { doRequest, errors } = useRequest({
    url: '/api/user/signin',
    method: 'POST',
    body: { email, password },
    onSuccess: () => {
      router.push('/')
    }
  })

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    doRequest()
  }

  return (
    <form onSubmit={onSubmit}>
      <h1 className='mb-6 text-3xl font-bold'>Sign In</h1>

      <div className='mb-6 group'>
        <label className='block mb-2 text-sm font-medium text-gray-900'>Email Address</label>
        <input
          type='text'
          className='bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 '
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>

      <div className='mb-6 group'>
        <label className='block mb-2 text-sm font-medium text-gray-900'>Password</label>
        <input
          type='password'
          className='bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 '
          value={password}
          onChange={e => setPassword(e.target.value)}
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
        Sign in
      </button>
    </form>
  )
}
