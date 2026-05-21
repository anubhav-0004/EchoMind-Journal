"use client";

import { useQuery, useMutation, gql } from "@apollo/client";

const GET_REPORTS = gql`
  query {
    weeklyReports(limit: 5) {
      id
      weekStartDate
      weekEndDate
      avgMoodScore
      avgStressLevel
      dominantMoods
      topThemes
      aiSummary
      emotionArc
      generatedAt
    }
  }
`;

const GENERATE_REPORT = gql`
  mutation GenerateWeeklyReport($weekStartDate: String!) {
    generateWeeklyReport(weekStartDate: $weekStartDate) {
      id
      avgMoodScore
      aiSummary
    }
  }
`;

export default function ReportClient() {
  const { data, loading, refetch } = useQuery(GET_REPORTS);
  const [generateReport, { loading: generating }] = useMutation(
    GENERATE_REPORT,
    {
      onCompleted: () => refetch(),
      onError: (err) => alert("Error: " + err.message),
    },
  );

  const reports = data?.weeklyReports || [];

  const handleGenerate = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    generateReport({ variables: { weekStartDate: monday.toISOString() } });
  };

  // ── FIX: takes reportId as parameter, called inside the map
  const handleDownloadPDF = async (reportId: string) => {
    const token = localStorage.getItem("echomind_token");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000"}/api/report/${reportId}/pdf`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!response.ok) {
      alert("Failed to generate PDF");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `echomind-report-${reportId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
        Loading reports...
      </div>
    );

  return (
    <div style={{ height: "100vh", overflow: "auto" }}>
      {/* ── HEADER ── */}
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid rgba(44,58,68,0.1)",
          backgroundImage: "linear-gradient(160deg, #a87976 0%, #e3c3c1 100%)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "400",
              color: "#1a2530",
            }}
          >
            Weekly Reports
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#fccad5" }}>
            Your AI-generated Mental Map
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            background: generating ? "#8a9aa8" : "#4a7c6f",
            color: "#fff",
            fontSize: "12px",
            fontWeight: "500",
            cursor: generating ? "not-allowed" : "pointer",
          }}
        >
          {generating ? "Generating..." : "✦ Generate This Week"}
        </button>
      </div>

      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {reports.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px",
              color: "#576b7d",
              fontSize: "14px",
              background: "rgba(255, 255, 255, 0.3)",
              border: "2px solid rgba(44,58,68,0.18)",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minHeight: "400px",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>📄</div>
            <p>No weekly reports yet.</p>
            <p style={{ fontSize: "14px", marginTop: "8px", color: "#576b7d" }}>
              Write entries throughout the week, then click "Generate This Week"
              to get your Mental Map.
            </p>
          </div>
        ) : (
          reports.map((report: any) => {
            const arc = report.emotionArc as number[];
            const startDate = new Date(report.weekStartDate);
            const endDate = new Date(report.weekEndDate);

            return (
              <div
                key={report.id}
                style={{
                  background: "rgba(255, 255, 255, 0.5)",
                  border: "1px solid rgba(44,58,68,0.08)",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid rgba(44,58,68,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        color: "#1a2530",
                      }}
                    >
                      Week of{" "}
                      {startDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                      })}{" "}
                      –{" "}
                      {endDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#416687",
                        marginTop: "2px",
                      }}
                    >
                      Generated{" "}
                      {new Date(report.generatedAt).toLocaleDateString(
                        "en-IN",
                        { dateStyle: "medium" },
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: "400",
                          color: "#4a7c6f",
                        }}
                      >
                        {report.avgMoodScore.toFixed(1)}
                      </div>
                      <div
                        style={{
                          fontSize: "9px",
                          color: "#416687",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        mood
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: "400",
                          color: "#c4736a",
                        }}
                      >
                        {report.avgStressLevel.toFixed(1)}
                      </div>
                      <div
                        style={{
                          fontSize: "9px",
                          color: "#416687",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        stress
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownloadPDF(report.id)}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "8px",
                        border: "1px solid rgba(44,58,68,0.12)",
                        background: "rgba(39, 76, 110, 0.3)",
                        color: "#304b66",
                        fontSize: "11px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ↓ Download PDF
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  {arc && arc.length > 0 && (
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          textTransform: "uppercase",
                          letterSpacing: "0.8px",
                          color: "#416687",
                          marginBottom: "10px",
                          fontWeight: "500",
                        }}
                      >
                        Mood Arc
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          gap: "6px",
                          height: "60px",
                        }}
                      >
                        {arc.map((score: number, i: number) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "4px",
                              height: "100%",
                              justifyContent: "flex-end",
                            }}
                          >
                            <div
                              style={{
                                width: "100%",
                                height: `${Math.max(score * 6, 4)}px`,
                                background:
                                  score >= 7
                                    ? "#4a7c6f"
                                    : score >= 4
                                      ? "#d4872a"
                                      : "#c4736a",
                                borderRadius: "3px 3px 0 0",
                                opacity: 0.7 + score * 0.03,
                              }}
                            />
                            <div style={{ fontSize: "9px", color: "#416687" }}>
                              {["M", "T", "W", "T", "F", "S", "S"][i]}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        color: "#416687",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      Dominant Moods
                    </div>
                    <div
                      style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}
                    >
                      {report.dominantMoods.map((mood: string) => (
                        <span
                          key={mood}
                          style={{
                            padding: "3px 10px",
                            borderRadius: "20px",
                            background: "rgba(74,124,111,0.08)",
                            border: "1px solid rgba(74,124,111,0.15)",
                            color: "#4a7c6f",
                            fontSize: "12px",
                            textTransform: "capitalize",
                          }}
                        >
                          {mood}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        color: "#416687",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      Top Themes
                    </div>
                    <div
                      style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}
                    >
                      {report.topThemes.map((theme: string) => (
                        <span
                          key={theme}
                          style={{
                            padding: "3px 10px",
                            borderRadius: "20px",
                            border: "1px solid rgba(44,58,68,0.12)",
                            color: "#4a5c68",
                            fontSize: "12px",
                          }}
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      borderLeft: "3px solid #7aab9c",
                      paddingLeft: "14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        color: "#4a7c6f",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      Mental Map
                    </div>
                    <p
                      style={{
                        fontSize: "13px",
                        lineHeight: "1.8",
                        color: "#4a5c68",
                        margin: 0,
                        fontStyle: "italic",
                      }}
                    >
                      {report.aiSummary}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
