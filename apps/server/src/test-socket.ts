// This is just a test file — delete it after testing
import { io } from 'socket.io-client'

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbW96c2E2YXkwMDAwNTRsNHg2bGVxbWw2IiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3Nzg0MjE5MzIsImV4cCI6MTc3OTAyNjczMn0.wcePKTQOcFETUPH6Gj52aueuvPRP-sFmr0JsvMGSQnc'

const socket = io('http://localhost:4000', {
  auth: { token: `Bearer ${TOKEN}` },
})

socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id)

  // Simulate typing
  console.log('Sending test text...')
  socket.emit('entry:typing', 'Today was a really productive day. I woke up early and felt genuinely motivated to work on my project. The code finally clicked after days of struggling with it.')

  // Wait for the insight (should arrive after 2500ms)
  socket.on('entry:insight', (insight) => {
    console.log('✅ Live insight received:')
    console.log(JSON.stringify(insight, null, 2))
    socket.disconnect()
    process.exit(0)
  })
})

socket.on('connect_error', (err) => {
  console.error('❌ Connection failed:', err.message)
  process.exit(1)
})

// Timeout after 15 seconds
setTimeout(() => {
  console.error('❌ Timeout — no insight received after 15 seconds')
  process.exit(1)
}, 15000)