import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'EchoMind',
    template: '%s · EchoMind',
  },
  description: 'AI-powered journaling that understands your emotions',
  keywords: ['journaling', 'mental health', 'AI', 'mood tracking', 'diary'],
  authors: [{ name: 'Anubhav Mishra' }],
  openGraph: {
    title: 'EchoMind',
    description: 'AI-powered journaling that understands your emotions',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}