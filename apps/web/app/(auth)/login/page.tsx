'use client'

import { useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { setToken } from '@/lib/auth'
import Link from 'next/link'

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user { id displayName }
    }
  }
`

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      setToken(data.login.token)
      router.push('/editor')
    },
    onError: (err) => setError(err.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    login({ variables: { email, password } })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#faf8f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        background: '#fff',
        border: '1px solid rgba(44,58,68,0.1)',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 2px 40px rgba(26,37,48,0.06)',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'linear-gradient(135deg, #7aab9c, #d4872a)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', margin: '0 auto 12px',
          }}>✦</div>
          <h1 style={{ fontSize: '24px', fontWeight: '400', color: '#1a2530', margin: 0 }}>
            Welcome back
          </h1>
          <p style={{ color: '#8a9aa8', fontSize: '14px', marginTop: '4px' }}>
            Sign in to EchoMind
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(196,115,106,0.1)',
            border: '1px solid rgba(196,115,106,0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#7a3e38',
            fontSize: '13px',
            marginBottom: '20px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#4a5c68', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              suppressHydrationWarning
              style={{
                width: '100%', padding: '10px 12px',
                border: '1px solid rgba(44,58,68,0.15)',
                borderRadius: '8px', fontSize: '14px',
                outline: 'none', boxSizing: 'border-box',
                background: '#faf8f5', color: '#1a2530',
              }}
              placeholder="you@example.com"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#4a5c68', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              suppressHydrationWarning
              style={{
                width: '100%', padding: '10px 12px',
                border: '1px solid rgba(44,58,68,0.15)',
                borderRadius: '8px', fontSize: '14px',
                outline: 'none', boxSizing: 'border-box',
                background: '#faf8f5', color: '#1a2530',
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '11px',
              background: loading ? '#8a9aa8' : '#4a7c6f',
              color: '#fff', border: 'none',
              borderRadius: '8px', fontSize: '14px',
              fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#8a9aa8' }}>
          Don't have an account?{' '}
          <Link href="/signup" style={{ color: '#4a7c6f', textDecoration: 'none', fontWeight: '500' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}