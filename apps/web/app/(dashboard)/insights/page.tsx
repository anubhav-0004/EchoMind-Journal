"use client";

import { useQuery, gql } from "@apollo/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const GET_ENTRIES = gql`
  query {
    entries(limit: 30) {
      id
      title
      writtenAt
      moodAnalysis {
        moodScore
        primaryMood
        stressLevel
        emotionBreakdown
        keywords
      }
    }
  }
`;

export default function InsightsPage() {
  const { data, loading } = useQuery(GET_ENTRIES);

  if (loading)
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: "#8a9aa8",
          fontSize: "14px",
        }}
      >
        Loading insights...
      </div>
    );

  const entries = (data?.entries || [])
    .filter((e: any) => e.moodAnalysis)
    .slice(0, 14)
    .reverse();

  const chartData = entries.map((e: any) => ({
    date: new Date(e.writtenAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    mood: e.moodAnalysis.moodScore,
    stress: e.moodAnalysis.stressLevel,
  }));

  const moodCounts: Record<string, number> = {};
  entries.forEach((e: any) => {
    const m = e.moodAnalysis.primaryMood;
    moodCounts[m] = (moodCounts[m] || 0) + 1;
  });
  const moodDistData = Object.entries(moodCounts).map(([mood, count]) => ({
    mood,
    count,
  }));

  const avgMood = entries.length
    ? (
        entries.reduce((s: number, e: any) => s + e.moodAnalysis.moodScore, 0) /
        entries.length
      ).toFixed(1)
    : "—";
  const avgStress = entries.length
    ? (
        entries.reduce(
          (s: number, e: any) => s + e.moodAnalysis.stressLevel,
          0,
        ) / entries.length
      ).toFixed(1)
    : "—";

  const allKeywords: Record<string, number> = {};
  entries.forEach((e: any) => {
    e.moodAnalysis.keywords?.forEach((k: string) => {
      allKeywords[k] = (allKeywords[k] || 0) + 1;
    });
  });
  const topKeywords = Object.entries(allKeywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  const statCardStyle = {
    background: "rgba(255, 255, 255, 0.35)",
    border: "2px solid rgba(44,58,68,0.28)",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center" as const,
    minHeight: "200px",
    justifyContent: "center" as const,
    padding: "16px 20px",
    fontWeight: "500",
  };

  return (
    <div style={{ height: "100vh", overflow: "auto" }}>
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid rgba(44,58,68,0.1)",
          backgroundImage: "linear-gradient(160deg, #a87976 0%, #e3c3c1 100%)",
          backdropFilter: "blur(10px)",
        }}
        className="max-sm:px-2! max-sm:py-3! max-sm:gap-1!"
      >
        <h2
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "400",
            color: "#1a2530",
          }}
        >
          Mood Trends
        </h2>
        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#fccad5" }}>
          Last {entries.length} entries analysed
        </p>
      </div>

      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
        className="max-sm:px-2! max-sm:py-3! max-sm:gap-1! max-sm:flex-col!"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "12px",
          }}
          className="max-sm:grid-cols-2!"
        >
          <div style={statCardStyle} className="max-sm:min-h-20!">
            <div
              style={{
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: "#4d708f",
                marginBottom: "4px",
              }}
              className="max-sm:text-xs! max-sm:text-nowrap!"
            >
              Avg Mood
            </div>
            <div
              style={{ fontSize: "28px", fontWeight: "300", color: "#1a2530" }}
            >
              {avgMood}
            </div>
            <div
              style={{ fontSize: "13px", color: "#4a7c6f", marginTop: "2px" }}
            >
              out of 10
            </div>
          </div>
          <div style={statCardStyle} className="max-sm:min-h-20!">
            <div
              style={{
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: "#4d708f",
                marginBottom: "4px",
              }}
              className="max-sm:text-xs! max-sm:text-nowrap!"
            >
              Avg Stress
            </div>
            <div
              style={{ fontSize: "28px", fontWeight: "300", color: "#1a2530" }}
            >
              {avgStress}
            </div>
            <div
              style={{ fontSize: "13px", color: "#c4736a", marginTop: "2px" }}
            >
              out of 10
            </div>
          </div>
          <div style={statCardStyle}  className="max-sm:col-span-2! max-sm:order-3! max-sm:min-h-25!">
            <div
              style={{
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: "#4d708f",
                marginBottom: "4px",
              }}
            >
              Entries
            </div>
            <div
              style={{ fontSize: "28px", fontWeight: "300", color: "#1a2530" }}
            >
              {entries.length}
            </div>
            <div
              style={{ fontSize: "13px", color: "#4d708f", marginTop: "2px" }}
            >
              analysed
            </div>
          </div>
        </div>

        {chartData.length > 0 && (
          <div style={statCardStyle} className="max-sm:px-1! max-sm:py-2!">
            <div
              style={{
                fontSize: "13px",
                fontWeight: "500",
                color: "#1a2530",
                marginBottom: "16px",
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 40px",
                width: "100%",
                background: "rgba(255,255,255,0.25)",
                borderRadius: "8px",
              }}
              className="max-sm:px-2! max-sm:gap-1! max-sm:flex-col! max-sm:text-center! max-sm:mb-2!"
            >
              <div>Mood & Stress Over Time</div>
              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  fontSize: "12px",
                  color: "#416687",
                  marginTop: "4px",
                }}
                className="max-sm:text-center! max-sm:justify-center!"
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#4a7c6f",
                      display: "inline-block",
                    }}
                  />
                  Mood
                </span>
                <span
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#c4736a",
                      display: "inline-block",
                    }}
                  />
                  Stress
                </span>
              </div>
            </div>
            <ResponsiveContainer
              width="100%"
              height={180}
              style={{
                background: "rgba(184, 106, 99, 0.15)",
                padding: "12px 0",
                borderRadius: "8px",
              }}
              className="max-sm:h-50! max-sm:px-1! max-sm:overflow-x-scroll! max-sm:w-full!"
            >
              <LineChart data={chartData} className="max-sm:p-0! max-sm:mx-0!">
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#374c70" }}
                  axisLine={true}
                  tickLine={true}
                  />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fontSize: 10, fill: "#374c70" }}
                  axisLine={true}
                  tickLine={true}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(50, 69, 97,0.2)",
                    border: "1px solid rgba(44,58,68,0.1)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#2a856d"
                  strokeWidth={2}
                  dot={{ fill: "#2a856d", r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="stress"
                  stroke="#c4736a"
                  strokeWidth={2}
                  dot={{ fill: "#c4736a", r: 3 }}
                  strokeDasharray="4 3"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* bar chart */}
        {moodDistData.length > 0 && (
          <div style={statCardStyle}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#1a2530",
                marginBottom: "16px",
              }}
              className="max-sm:px-2! max-sm:gap-2! max-sm:flex-col! max-sm:text-center! max-sm:mb-4!"
            >
              Mood Distribution
            </div>
            <ResponsiveContainer
              width="100%"
              height={140}
              style={{
                background: "rgba(74,124,111,0.15)",
                padding: "12px 0",
                borderRadius: "8px",
              }}
            >
              <BarChart data={moodDistData}>
                <XAxis
                  dataKey="mood"
                  tick={{ fontSize: 10, fill: "#374c70" }}
                  axisLine={true}
                  tickLine={true}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "rgba(50, 69, 97,0.2)",
                    border: "1px solid rgba(44,58,68,0.1)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#4a7c6f"
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {topKeywords.length > 0 && (
          <div style={statCardStyle} className="max-sm:px-1! max-sm:py-2!">
            <div
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#1a2530",
                marginBottom: "12px",
              }}
              className="max-sm:px-2! max-sm:gap-2! max-sm:flex-col! max-sm:text-center! max-sm:mb-4!"
            >
              Recurring Themes
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }} className="max-sm:justify-center-safe!">
              {topKeywords.map(([keyword, count]) => (
                <span
                  key={keyword}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    background: `rgba(74,124,111,${0.06 + count * 0.04})`,
                    border: "1px solid rgba(74,124,111,0.15)",
                    color: "#4a7c6f",
                    fontSize: "12px",
                  }}
                  className="max-sm:px-2! max-sm:py-1! max-sm:text-xs!"
                >
                  {keyword}
                  {count > 1 && (
                    <span
                      style={{
                        marginLeft: "4px",
                        opacity: 0.6,
                        fontSize: "10px",
                      }}
                    >
                      ×{count}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {entries.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px",
              color: "#8a9aa8",
              background: "rgba(255, 255, 255, 0.4)",
              border: "2px solid rgba(44,58,68,0.08)",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minHeight: "280px",
              justifyContent: "center",
              fontSize: "14px",
            }}
          >
            Write and publish some entries to see your mood trends here.
          </div>
        )}
      </div>
    </div>
  );
}
