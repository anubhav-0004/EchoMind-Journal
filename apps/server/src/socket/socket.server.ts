import { Server } from 'socket.io'
import type { Server as HttpServer } from 'http'
import { verifyToken } from '../lib/auth'
import { registerInsightHandler } from './insight.handler'

export function initSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.WEB_URL || 'http://localhost:3000',
      credentials: true,
    },
  })

  io.use((socket, next) => {
    const token = (socket.handshake.auth.token as string || '')
      .replace('Bearer ', '')
      .trim()

    if (!token) {
      return next(new Error('Authentication required'))
    }

    try {
      const user = verifyToken(token)
      // Attach user info to the socket object so handlers can access it
      ;(socket as any).userId = user.userId
      ;(socket as any).userEmail = user.email
      next()
    } catch {
      next(new Error('Invalid or expired token'))
    }
  })

  io.on('connection', (socket) => {
    const userId = (socket as any).userId as string
    console.log(`[Socket] User connected: ${userId} (${socket.id})`)

    socket.join(userId)

    registerInsightHandler(socket)

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] User disconnected: ${userId} — ${reason}`)
    })
  })

  return io
}