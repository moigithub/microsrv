'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

async function getCurrentUser() {
  let res
  res = await fetch('/api/user/currentuser', {
    cache: 'no-store'
  })

  return res.json()
}

export default function Navbar() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      const { currentUser } = await getCurrentUser()
      console.log('nav', currentUser)
      setUser(currentUser)
    }
    getUser()
  }, [])

  const links = [
    !user && { label: 'Sign up', href: '/auth/signup' },
    !user && { label: 'Sign in', href: '/auth/signin' },
    user && { label: 'New ticket', href: '/tickets/new' },
    user && { label: 'Orders', href: '/orders' },
    user && { label: 'Sign out', href: '/auth/signout' }
  ]
    .filter(active => active)
    .map(link => {
      return (
        <li key={link!.href} className='p-2 text-sky-800 hover:text-blue-600'>
          <Link href={link!.href}>{link!.label}</Link>
        </li>
      )
    })

  return (
    <nav className='flex justify-between items-center bg-grey-100 p-2'>
      <div className='flex justify-between items-center'>
        <Link href='/'>Logo</Link>
      </div>
      <ul className='flex '>{links}</ul>
    </nav>
  )
}
