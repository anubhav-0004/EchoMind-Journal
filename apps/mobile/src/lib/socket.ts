import { io, Socket } from 'socket.io-client'
import { getToken } from './storage'

let socket: Socket | null = null

export async function connectSocket(): Promise<Socket> {
  if (socket?.connected) return socket

  const token = await getToken()

  socket = io('https://echomind-server.onrender.com', {
    // ↑ Same IP as apollo.ts
    auth: { token: `Bearer ${token}` },
    autoConnect: true,
    transports: ['websocket'],
    // Force WebSocket — mobile networks sometimes block polling
  })

  socket.on('connect', () => console.log('[Socket] Connected'))
  socket.on('connect_error', (err) => console.log('[Socket] Error:', err.message))

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function getSocket(): Socket | null {
  return socket
}