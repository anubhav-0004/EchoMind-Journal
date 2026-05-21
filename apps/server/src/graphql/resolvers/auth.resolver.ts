import { prisma } from '../../prisma/client'
import { hashPassword, comparePassword, createToken } from '../../lib/auth'
import type { Context } from '../context'

export const authResolvers = {
  Mutation: {
    signup: async (_: unknown, args: { email: string; password: string; displayName: string }) => {
      const existing = await prisma.user.findUnique({ where: { email: args.email } })
      if (existing) throw new Error('Email already in use')

      const passwordHash = await hashPassword(args.password)

      const user = await prisma.user.create({
        data: {
          email: args.email,
          passwordHash,
          displayName: args.displayName,
        },
      })

      const token = createToken({ userId: user.id, email: user.email, role: user.role })
      return { token, user }
    },

    login: async (_: unknown, args: { email: string; password: string }) => {
      const user = await prisma.user.findUnique({ where: { email: args.email } })
      if (!user) throw new Error('Invalid email or password')

      const valid = await comparePassword(args.password, user.passwordHash)
      if (!valid) throw new Error('Invalid email or password')

      const token = createToken({ userId: user.id, email: user.email, role: user.role })
      return { token, user }
    },
  },

  // Field resolver — runs when client requests currentStreak on a User object
  User: {
    currentStreak: async (parent: { id: string }) => {
      const entries = await prisma.entry.findMany({
        where: { userId: parent.id, status: 'PUBLISHED' },
        select: { writtenAt: true },
        orderBy: { writtenAt: 'desc' },
      })

      if (entries.length === 0) return 0

      let streak = 0
      let checkDate = new Date()
      checkDate.setHours(0, 0, 0, 0)

      for (const entry of entries) {
        const entryDate = new Date(entry.writtenAt)
        entryDate.setHours(0, 0, 0, 0)
        const diffDays = Math.round(
          (checkDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (diffDays === 0 || diffDays === streak) {
          streak++
          checkDate = entryDate
        } else {
          break
        }
      }

      return streak
    },

    // These tell Prisma how to resolve nested fields on User
    entries: async (parent: { id: string }, args: { limit?: number; offset?: number }) => {
      return prisma.entry.findMany({
        where: { userId: parent.id, status: 'PUBLISHED' },
        orderBy: { writtenAt: 'desc' },
        take: args.limit ?? 20,
        skip: args.offset ?? 0,
        include: { moodAnalysis: true },
      })
    },

    weeklyReports: async (parent: { id: string }, args: { limit?: number }) => {
      return prisma.weeklyReport.findMany({
        where: { userId: parent.id },
        orderBy: { weekStartDate: 'desc' },
        take: args.limit ?? 10,
      })
    },
  },
}