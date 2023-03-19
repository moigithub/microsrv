'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import useRequest from '../../../hooks/use-request'

export default function SignOut() {
  const router = useRouter()

  const { doRequest } = useRequest({
    url: '/api/user/signout',
    method: 'POST',
    body: {},
    onSuccess: () => {
      router.push('/')
    }
  })

  useEffect(() => {
    doRequest()
  }, [])

  return null
}
