import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import dotenv from "dotenv";
import { initSocketServer } from "./socket/socket.server";

import { typeDefs } from "./graphql/schema/typeDefs";
import { resolvers } from "./graphql/resolvers";
import { createContext } from "./graphql/context";
import { generateReportPDF } from "./services/pdf.service";
import { prisma } from "./prisma/client";
import { verifyToken } from "./lib/auth";
import { startWeeklyReportJob } from "./services/jobs/weeklyReport.job";

async function main() {
  const app = express();
  const httpServer = http.createServer(app);

  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
  });

  await apollo.start();

  app.use(
    cors({
      origin: process.env.WEB_URL || "http://localhost:3000",
      credentials: true,
    }),
  );

  app.use(express.json());

  app.get("/api/report/:id/pdf", async (req, res) => {
    try {
      const headerToken = (req.headers.authorization || "")
        .replace("Bearer ", "")
        .trim();
      const queryToken = ((req.query.token as string) || "").trim();
      const token = headerToken || queryToken;
      if (!token) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const user = verifyToken(token);

      const report = await prisma.weeklyReport.findFirst({
        where: { id: req.params.id, userId: user.userId },
        include: { user: true },
      });

      if (!report) {
        res.status(404).json({ error: "Report not found" });
        return;
      }

      const pdfBuffer = await generateReportPDF({
        weekStartDate: report.weekStartDate,
        weekEndDate: report.weekEndDate,
        avgMoodScore: report.avgMoodScore,
        avgStressLevel: report.avgStressLevel,
        dominantMoods: report.dominantMoods,
        topThemes: report.topThemes,
        emotionArc: report.emotionArc as number[],
        aiSummary: report.aiSummary,
        userName: report.user.displayName,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="echomind-report-${report.id}.pdf"`,
      );
      res.send(pdfBuffer);
    } catch (err: any) {
      console.error("[PDF] Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/health", (_, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  app.use(
    "/graphql",
    expressMiddleware(apollo, {
      context: createContext,
    }),
  );

  initSocketServer(httpServer);

  const PORT = process.env.PORT || 4000;

  httpServer.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`📊 GraphQL at http://localhost:${PORT}/graphql`);
  });

  startWeeklyReportJob();
}

main().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
