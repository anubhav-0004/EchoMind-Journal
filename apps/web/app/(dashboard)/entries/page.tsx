"use client";

import { useQuery, gql } from "@apollo/client";
import { useRouter } from "next/navigation";

const GET_ENTRIES = gql`
  query {
    entries(limit: 50) {
      id
      title
      wordCount
      status
      tags
      writtenAt
      moodAnalysis {
        moodScore
        primaryMood
        stressLevel
      }
    }
  }
`;

const MOOD_COLORS: Record<string, string> = {
  calm: "#4a7c6f",
  joyful: "#d4872a",
  anxious: "#c4736a",
  sad: "#7b9bc8",
  hopeful: "#7aab9c",
  neutral: "#8a9aa8",
  content: "#4a7c6f",
  overwhelmed: "#c4736a",
  angry: "#c4736a",
};

const MOOD_EMOJI: Record<string, string> = {
  calm: "🌿",
  joyful: "☀️",
  anxious: "⚡",
  sad: "🌙",
  hopeful: "🌅",
  neutral: "○",
  content: "✦",
  overwhelmed: "🌊",
};

export default function EntriesPage() {
  const router = useRouter();
  const { data, loading, error } = useQuery(GET_ENTRIES);

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
        Loading your entries...
      </div>
    );

  if (error)
    return (
      <div style={{ padding: "40px", color: "#c4736a", fontSize: "14px" }}>
        Error: {error.message}
      </div>
    );

  const entries = data?.entries || [];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
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
            Past Entries
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#fccad5" }}>
            {entries.length} entries written
          </p>
        </div>
        <button
          onClick={() => router.push("/editor")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            background: "#4a7c6f",
            color: "#fff",
            fontSize: "12px",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          + New Entry
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "20px 24px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        }}
      >
        {entries.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#576b7d",
              fontSize: "14px",
              background: "rgba(255, 255, 255, 0.4)",
              border: "2px solid rgba(44,58,68,0.08)",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minHeight: "400px",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>✦</div>
            <p>No entries yet. Start writing your first entry.</p>
            <button
              onClick={() => router.push("/editor")}
              style={{
                marginTop: "16px",
                padding: "10px 20px",
                background: "#4a7c6f",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Write now
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {entries.map((entry: any) => {
              const mood = entry.moodAnalysis?.primaryMood || "neutral";
              const moodColor = MOOD_COLORS[mood] || "#8a9aa8";
              const moodEmoji = MOOD_EMOJI[mood] || "○";
              const date = new Date(entry.writtenAt);

              return (
                <div
                  key={entry.id}
                  onClick={() => router.push(`/entries/${entry.id}`)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 16px",
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                    border: "1px solid rgba(44,58,68,0.08)",
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 2px 12px rgba(44,58,68,0.08)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow = "none")
                  }
                >
                  {/* Mood icon */}
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      background: `${moodColor}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      flexShrink: 0,
                    }}
                  >
                    {moodEmoji}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        color: "#1a2530",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {entry.title}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#8a9aa8",
                        marginTop: "2px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span>{entry.wordCount} words</span>
                      {entry.tags.slice(0, 2).map((tag: string) => (
                        <span
                          key={tag}
                          style={{
                            padding: "1px 7px",
                            borderRadius: "10px",
                            background: "rgba(74,124,111,0.08)",
                            color: "#4a7c6f",
                            fontSize: "10px",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right meta */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "11px", color: "#8a9aa8" }}>
                      {date.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                    {entry.moodAnalysis && (
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: "500",
                          color: moodColor,
                          marginTop: "3px",
                          textTransform: "capitalize",
                        }}
                      >
                        {mood} · {entry.moodAnalysis.moodScore.toFixed(1)}
                      </div>
                    )}
                    {!entry.moodAnalysis && (
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#8a9aa8",
                          marginTop: "3px",
                        }}
                      >
                        analyzing...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
