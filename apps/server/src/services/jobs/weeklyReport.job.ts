import cron from 'node-cron'
import { prisma } from '../../prisma/client'
import { generateWeeklyReport } from '../grok.service'

export function startWeeklyReportJob() {
  cron.schedule('0 8 * * 0', async () => {
    console.log('[Cron] Starting weekly report generation...')

    const users = await prisma.user.findMany({
      where: { notifyWeekly: true },
      select: { id: true, displayName: true, timezone: true },
    })

    console.log(`[Cron] Processing ${users.length} users`)

    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const weekStart = new Date(now)
    weekStart.setDate(diff)
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    for (const user of users) {
      try {
        // Skip if report already exists for this week
        const existing = await prisma.weeklyReport.findFirst({
          where: { userId: user.id, weekStartDate: weekStart },
        })
        if (existing) {
          console.log(`[Cron] Report already exists for user ${user.id} — skipping`)
          continue
        }

        const entries = await prisma.entry.findMany({
          where: {
            userId: user.id,
            status: 'PUBLISHED',
            writtenAt: { gte: weekStart, lte: weekEnd },
          },
          include: { moodAnalysis: true },
          orderBy: { writtenAt: 'asc' },
        })

        if (entries.length === 0) {
          console.log(`[Cron] No entries for user ${user.id} — skipping`)
          continue
        }

        const arc = [0, 1, 2, 3, 4, 5, 6].map(dayOffset => {
          const day = new Date(weekStart)
          day.setDate(day.getDate() + dayOffset)
          const dayEntry = entries.find(e => {
            const d = new Date(e.writtenAt)
            return d.getDate() === day.getDate() && d.getMonth() === day.getMonth()
          })
          return dayEntry?.moodAnalysis?.moodScore ?? 0
        })

        const report = await generateWeeklyReport(
          entries.map(e => ({
            date: e.writtenAt.toISOString().split('T')[0],
            body: e.body,
          }))
        )

        await prisma.weeklyReport.create({
          data: {
            userId: user.id,
            weekStartDate: weekStart,
            weekEndDate: weekEnd,
            avgMoodScore: report.avgMoodScore,
            avgStressLevel: report.avgStressLevel,
            dominantMoods: report.dominantMoods,
            topThemes: report.topThemes,
            emotionArc: arc,
            aiSummary: report.aiSummary,
          },
        })

        console.log(`[Cron] ✅ Report generated for user ${user.id} (${user.displayName})`)

        await new Promise(resolve => setTimeout(resolve, 2000))

      } catch (err) {
        console.error(`[Cron] ❌ Failed for user ${user.id}:`, err)
      }
    }

    console.log('[Cron] Weekly report job complete')
  })

  console.log('[Cron] Weekly report job scheduled — runs every Sunday at 8:00 AM UTC')
}