import type { Metadata } from 'next'
import EntryDetailClient from './EntryDetailClient'

export const metadata: Metadata = { title: 'Entry' }

export default function EntryDetailPage() {
  return <EntryDetailClient />
}