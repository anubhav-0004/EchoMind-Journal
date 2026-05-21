import { prisma } from "../../prisma/client";
import { requireAdmin, requireAuth } from "../context";
import type { Context } from "../context";
import { analyzeFullEntry, chatWithDiary } from "../../services/grok.service";

async function processEntryAfterPublish(entryId: string, body: string) {
  console.log(`[AI] Processing entry ${entryId}...`);
  try {
    const analysis = await analyzeFullEntry(body);

    await prisma.moodAnalysis.create({
      data: {
        entryId,
        moodScore: analysis.moodScore,
        sentimentPolarity: analysis.sentimentPolarity,
        sentimentScore: analysis.sentimentScore,
        primaryMood: analysis.primaryMood,
        emotionBreakdown: analysis.emotionBreakdown,
        stressLevel: analysis.stressLevel,
        keywords: analysis.keywords,
        aiSummary: analysis.aiSummary,
      },
    });
    console.log(`[AI] Entry ${entryId} processed successfully`);
  } catch (err) {
    console.error(`[AI] Failed to process entry ${entryId}:`, err);
  }
}

export const entryResolvers = {
  Query: {
    entry: async (_: unknown, args: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      return prisma.entry.findFirst({
        where: { id: args.id, userId: ctx.user!.userId },
        include: { moodAnalysis: true },
      });
    },

    entries: async (
      _: unknown,
      args: { limit?: number; offset?: number; from?: Date; to?: Date },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      return prisma.entry.findMany({
        where: {
          userId: ctx.user!.userId,
          status: "PUBLISHED",
          writtenAt: { gte: args.from, lte: args.to },
        },
        include: { moodAnalysis: true },
        orderBy: { writtenAt: "desc" },
        take: args.limit ?? 20,
        skip: args.offset ?? 0,
      });
    },

    weeklyReports: async (
      _: unknown,
      args: { limit?: number },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      return prisma.weeklyReport.findMany({
        where: { userId: ctx.user!.userId },
        orderBy: { weekStartDate: "desc" },
        take: args.limit ?? 10,
      });
    },

    weeklyReport: async (
      _: unknown,
      args: { weekStartDate: Date },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      return prisma.weeklyReport.findFirst({
        where: { userId: ctx.user!.userId, weekStartDate: args.weekStartDate },
      });
    },

    me: async (_: unknown, __: unknown, ctx: Context) => {
      requireAuth(ctx);
      return prisma.user.findUniqueOrThrow({ where: { id: ctx.user!.userId } });
    },

    adminStats: async (_: unknown, __: unknown, ctx: Context) => {
      requireAdmin(ctx);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const [totalUsers, totalEntries, recentEntries] = await Promise.all([
        prisma.user.count(),
        prisma.entry.count({ where: { status: "PUBLISHED" } }),
        prisma.entry.findMany({
          where: { writtenAt: { gte: oneWeekAgo }, status: "PUBLISHED" },
          include: { moodAnalysis: true },
        }),
      ]);
      const scores = recentEntries
        .map((e) => e.moodAnalysis?.moodScore)
        .filter((s): s is number => s !== undefined);
      const avgMood = scores.length
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;
      const activeUsers = new Set(recentEntries.map((e) => e.userId)).size;
      return {
        totalUsers,
        activeThisWeek: activeUsers,
        avgMoodPlatform: Math.round(avgMood * 10) / 10,
        totalEntries,
      };
    },

    adminUsers: async (
      _: unknown,
      args: { limit?: number; offset?: number },
      ctx: Context,
    ) => {
      requireAdmin(ctx);
      return prisma.user.findMany({
        take: args.limit ?? 50,
        skip: args.offset ?? 0,
        orderBy: { createdAt: "desc" },
        include: { entries: { select: { id: true } } },
      });
    },
  },

  Mutation: {
    createEntry: async (
      _: unknown,
      args: { title: string; body: string; tags?: string[] },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      const wordCount = args.body.trim().split(/\s+/).filter(Boolean).length;
      return prisma.entry.create({
        data: {
          userId: ctx.user!.userId,
          title: args.title,
          body: args.body,
          wordCount,
          tags: args.tags ?? [],
          status: "DRAFT",
        },
      });
    },

    updateEntry: async (
      _: unknown,
      args: { id: string; title?: string; body?: string; tags?: string[] },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      const entry = await prisma.entry.findFirst({
        where: { id: args.id, userId: ctx.user!.userId },
      });
      if (!entry) throw new Error("Entry not found or access denied");
      if (entry.status === "PUBLISHED")
        throw new Error("Cannot edit a published entry");

      const data: any = {};
      if (args.title !== undefined) data.title = args.title;
      if (args.body !== undefined) {
        data.body = args.body;
        data.wordCount = args.body.trim().split(/\s+/).filter(Boolean).length;
      }
      if (args.tags !== undefined) data.tags = args.tags;

      return prisma.entry.update({ where: { id: args.id }, data });
    },

    publishEntry: async (_: unknown, args: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      const entry = await prisma.entry.findFirst({
        where: { id: args.id, userId: ctx.user!.userId },
      });
      if (!entry) throw new Error("Entry not found or access denied");
      if (entry.status === "PUBLISHED") throw new Error("Already published");

      const published = await prisma.entry.update({
        where: { id: args.id },
        data: { status: "PUBLISHED", publishedAt: new Date() },
      });

      processEntryAfterPublish(published.id, published.body).catch(
        console.error,
      );

      return published;
    },

    deleteEntry: async (_: unknown, args: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      const entry = await prisma.entry.findFirst({
        where: { id: args.id, userId: ctx.user!.userId },
      });
      if (!entry) throw new Error("Entry not found or access denied");
      await prisma.entry.delete({ where: { id: args.id } });
      return true;
    },

    updateProfile: async (_: unknown, args: any, ctx: Context) => {
      requireAuth(ctx);
      const data: any = {};
      if (args.displayName !== undefined) data.displayName = args.displayName;
      if (args.notifyDaily !== undefined) data.notifyDaily = args.notifyDaily;
      if (args.notifyWeekly !== undefined)
        data.notifyWeekly = args.notifyWeekly;
      if (args.fcmToken !== undefined) data.fcmToken = args.fcmToken;
      if (args.timezone !== undefined) data.timezone = args.timezone;
      return prisma.user.update({ where: { id: ctx.user!.userId }, data });
    },

    chatWithDiary: async (
      _: unknown,
      args: {
        message: string;
        history: Array<{ role: string; content: string }>;
      },
      ctx: Context,
    ) => {
      requireAuth(ctx);

      const words = args.message.split(" ").filter((w) => w.length > 4);

      const relevantEntries = await prisma.entry.findMany({
        where: {
          userId: ctx.user!.userId,
          status: "PUBLISHED",
          OR:
            words.length > 0
              ? words.map((w) => ({
                  body: { contains: w, mode: "insensitive" as const },
                }))
              : [{ userId: ctx.user!.userId }],
        },
        orderBy: { writtenAt: "desc" },
        take: 10,
      });

      const response = await chatWithDiary(
        args.message,
        args.history,
        relevantEntries.map((e) => ({
          date: e.writtenAt.toISOString().split("T")[0],
          body: e.body,
        })),
      );

      return { role: "assistant", content: response };
    },

    generateWeeklyReport: async (
      _: unknown,
      args: { weekStartDate: string },
      ctx: Context,
    ) => {
      requireAuth(ctx);

      const weekStart = new Date(args.weekStartDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const existing = await prisma.weeklyReport.findFirst({
        where: { userId: ctx.user!.userId, weekStartDate: weekStart },
      });
      if (existing) return existing;

      const entries = await prisma.entry.findMany({
        where: {
          userId: ctx.user!.userId,
          status: "PUBLISHED",
          writtenAt: { gte: weekStart, lte: weekEnd },
        },
        include: { moodAnalysis: true },
        orderBy: { writtenAt: "asc" },
      });

      if (entries.length === 0) {
        throw new Error(
          "No entries found for this week. Write some entries first.",
        );
      }

      const arc = [0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
        const day = new Date(weekStart);
        day.setDate(day.getDate() + dayOffset);
        const dayEntry = entries.find((e) => {
          const d = new Date(e.writtenAt);
          return (
            d.getDate() === day.getDate() && d.getMonth() === day.getMonth()
          );
        });
        return dayEntry?.moodAnalysis?.moodScore ?? 0;
      });

      const { generateWeeklyReport } =
        await import("../../services/grok.service");
      const report = await generateWeeklyReport(
        entries.map((e) => ({
          date: e.writtenAt.toISOString().split("T")[0],
          body: e.body,
        })),
      );

      return prisma.weeklyReport.create({
        data: {
          userId: ctx.user!.userId,
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
          avgMoodScore: report.avgMoodScore,
          avgStressLevel: report.avgStressLevel,
          dominantMoods: report.dominantMoods,
          topThemes: report.topThemes,
          emotionArc: arc,
          aiSummary: report.aiSummary,
        },
      });
    },
  },
};
