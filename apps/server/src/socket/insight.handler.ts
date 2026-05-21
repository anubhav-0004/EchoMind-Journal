import type { Socket } from 'socket.io'
import { analyzeLiveEntry } from '../services/grok.service'


const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>()

// Minimum text length before we bother calling the AI
const MIN_TEXT_LENGTH = 40
// debounce time in ms - how long to wait after the user stops typing before analyzing
const DEBOUNCE_MS = 5500

export function registerInsightHandler(socket: Socket) {
  const userId = (socket as any).userId as string

  socket.on('entry:typing', (text: string) => {

    const existing = debounceTimers.get(socket.id)
    if (existing) clearTimeout(existing)

    if (!text || text.trim().length < MIN_TEXT_LENGTH) {
      socket.emit('entry:insight', null)
      return
    }


    const timer = setTimeout(async () => {
      try {
        console.log(`[Socket] Analyzing entry for user ${userId} (${text.length} chars)`)
        const insight = await analyzeLiveEntry(text)
        socket.emit('entry:insight', insight)
        console.log(`[Socket] Insight sent to user ${userId}`)
      } catch (err) {
        console.error(`[Socket] Insight failed for user ${userId}:`, err)
      }
    }, DEBOUNCE_MS)

    debounceTimers.set(socket.id, timer)
  })

  socket.on('disconnect', () => {
    const timer = debounceTimers.get(socket.id)
    if (timer) {
      clearTimeout(timer)
      debounceTimers.delete(socket.id)
    }
  })
}