"use client";

import { useQuery, useMutation, gql } from "@apollo/client";
import { useRouter, useParams } from "next/navigation";

const GET_ENTRY = gql`
  query GetEntry($id: ID!) {
    entry(id: $id) {
      id
      title
      body
      wordCount
      status
      tags
      writtenAt
      publishedAt
      moodAnalysis {
        moodScore
        primaryMood
        stressLevel
        sentimentPolarity
        emotionBreakdown
        keywords
        aiSummary
        processedAt
      }
    }
  }
`;

const DELETE_ENTRY = gql`
  mutation DeleteEntry($id: ID!) {
    deleteEntry(id: $id)
  }
`;

const MOOD_COLORS: Record<string, string> = {
  calm: "#1e6b57",
  joyful: "#e88b1a",
  anxious: "#f04a37",
  sad: "#3e84e6",
  hopeful: "#79f2cd",
  neutral: "#8a9aa8",
  content: "#1e6b57",
  overwhelmed: "#f04a37",
  angry: "#f04a37",
};

export default function EntryDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data, loading, error } = useQuery(GET_ENTRY, {
    variables: { id },
    skip: !id,
  });

  const [deleteEntry, { loading: deleting }] = useMutation(DELETE_ENTRY, {
    refetchQueries: ["Entries"],
    awaitRefetchQueries: true,

    onCompleted: () => {
      router.push("/entries");
      router.refresh();
    },

    onError: (err) => {
      alert(err.message);
    },
  });

  if (loading)
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#8a9aa8",
          fontSize: "14px",
        }}
      >
        Loading entry...
      </div>
    );

  if (error || !data?.entry)
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
        }}
      >
        <div style={{ fontSize: "32px" }}>📭</div>
        <p style={{ color: "#8a9aa8", fontSize: "14px" }}>Entry not found</p>
        <button
          onClick={() => router.push("/entries")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            background: "#4a7c6f",
            color: "#fff",
            border: "none",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          ← Back to Entries
        </button>
      </div>
    );

  const entry = data.entry;
  const mood = entry.moodAnalysis?.primaryMood || "neutral";
  const moodColor = MOOD_COLORS[mood] || "#8a9aa8";
  const writtenDate = new Date(entry.writtenAt).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 24px",
          borderBottom: "1px solid rgba(44,58,68,0.25)",
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        className="max-sm:px-1.5! max-sm:py-3! max-sm:gap-2! max-sm:place-items-center!"
      >
        <button
          onClick={() => router.push("/entries")}
          style={{
            padding: "8px 18px",
            borderRadius: "8px",
            border: "1px solid rgba(44,58,68,0.12)",
            background: "rgba(255,255,255,0.4)",
            color: "#4a5c68",
            fontSize: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          className="max-sm:px-3.5! max-sm:py-2! max-sm:text-xs! max-sm:text-nowrap! max-sm:hidden!"
        >
          ← Back
        </button>
        <div style={{ fontSize: "14px", color: "#2a4b69", fontWeight: "500" }} className="max-sm:text-xs!">
          {writtenDate}
        </div>
        <button
          onClick={async () => {
            const confirmDelete = window.confirm(
              "Are you sure you want to delete this entry?",
            );

            if (!confirmDelete) return;

            await deleteEntry({
              variables: { id },
            });
          }}
          disabled={deleting}
          style={{
            padding: "8px 18px",
            borderRadius: "8px",
            border: "1px solid rgba(240,74,55,0.18)",
            background: "rgba(240,74,55,0.08)",
            color: "#f04a37",
            fontSize: "12px",
            cursor: "pointer",
            marginRight: "16px",
            marginLeft: "auto",
          }}
          className="max-sm:px-3.5! max-sm:py-2! max-sm:mr-2.5! max-sm:border-2!"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
        <div
          style={{
            padding: "6px 16px",
            borderRadius: "20px",
            background: `${moodColor}45`,
            color: moodColor,
            fontSize: "11px",
            fontWeight: "500",
            textTransform: "capitalize",
          }}
        >
          {mood}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          display: "grid",
          gridTemplateColumns: "1fr 450px",
        }}
        className="max-sm:grid-cols-1!"
      >
        <div
          style={{
            padding: "32px 36px",
            overflow: "auto",
            borderRight: "1px solid rgba(44,58,68,0.28)",
            backgroundColor: "rgba(255,255,255,0.15)",
          }}
          className="max-sm:px-1! max-sm:py-2! max-sm:h-72!"
        >
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "400",
              color: "#1a2530",
              marginBottom: "12px",
              fontFamily: "Georgia, serif",
              letterSpacing: "-0.3px",
              lineHeight: "1.3",
              backgroundColor: "rgba(255,255,255,0.3)",
              padding: "12px 20px",
              borderRadius: "12px",
              border: "1px solid rgba(44,58,68,0.1)",
            }}
            className="max-sm:text-2xl! max-sm:px-3! max-sm:py-2! max-sm:mb-1.5!"
          >
            {entry.title}
          </h1>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "24px",
              paddingBottom: "20px",
              borderBottom: "1px solid rgba(44,58,68,0.06)",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "12px",
              padding: "10px 20px",
              width: "fit-content",
            }}
            className="max-sm:px-3! max-sm:py-2! max-sm:gap-1! max-sm:mb-2! max-sm:ml-auto! max-sm:border-red-200! max-sm:bg-red-50!"
          >
            <span style={{ fontSize: "11px", color: "#30495e" }}>
              {entry.wordCount} words
            </span>
            {entry.tags.map((tag: string) => (
              <span
                key={tag}
                style={{
                  fontSize: "10px",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  background: "rgba(74,124,111,0.18)",
                  color: "#4a7c6f",
                  border: "1px solid rgba(74,124,111,0.15)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <p
            style={{
              fontSize: "14px",
              lineHeight: "1.8",
              color: "#2c3a44",
              fontWeight: "400",
              whiteSpace: "pre-wrap",
              fontFamily: "system-ui, sans-serif",
              background: "rgba(255,255,255,0.2)",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid rgba(44,58,68,0.08)",
              minHeight: "200px",
            }}
            className="max-sm:px-3! max-sm:py-2! max-sm:text-sm! max-sm:line-height-1.4! max-sm:leading-4.5!"
          >
            {entry.body}
          </p>
        </div>

        <div
          style={{
            overflow: "auto",
            padding: "20px 16px",
            background: "rgba(255,255,255,0.2)",
          }}
          className="max-sm:px-1! max-sm:py-2! max-sm:border-t-2! max-sm:border-gray-400!"
        >
          {!entry.moodAnalysis ? (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: "#8a9aa8",
                fontSize: "13px",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>⟳</div>
              AI analysis in progress...
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                paddingTop: "8px",
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.4)",
                  borderRadius: "10px",
                  border: "1px solid rgba(44,58,68,0.28)",
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: "9px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "#6a8aa6",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Mood Score
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: "5px",
                      background: "rgba(44,58,68,0.08)",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${entry.moodAnalysis.moodScore * 10}%`,
                        background: moodColor,
                        borderRadius: "3px",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: moodColor,
                    }}
                  >
                    {entry.moodAnalysis.moodScore.toFixed(1)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.4)",
                  borderRadius: "10px",
                  border: "1px solid rgba(44,58,68,0.28)",
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: "9px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "#6a8aa6",
                    marginBottom: "10px",
                    fontWeight: "500",
                  }}
                >
                  Emotions
                </div>
                {Object.entries(
                  entry.moodAnalysis.emotionBreakdown as Record<string, number>,
                ).map(([emotion, value]) => {
                  const colors: Record<string, string> = {
                    joy: "#f5c87a",
                    calm: "#7aab9c",
                    stress: "#c4736a",
                    focus: "#7b9bc8",
                    sadness: "#9b8ec4",
                  };
                  return (
                    <div
                      key={emotion}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#6a8aa6",
                          width: "44px",
                          textTransform: "capitalize",
                        }}
                      >
                        {emotion}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: "4px",
                          background: "rgba(44,58,68,0.28)",
                          borderRadius: "2px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${(value as number) * 100}%`,
                            background: colors[emotion] || "#6a8aa6",
                            borderRadius: "2px",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#6a8aa6",
                          width: "28px",
                          textAlign: "right",
                        }}
                      >
                        {Math.round((value as number) * 100)}%
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Stress level */}
              <div
                style={{
                  background: "rgba(255,255,255,0.4)",
                  borderRadius: "10px",
                  border: "1px solid rgba(44,58,68,0.28)",
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: "9px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "#6a8aa6",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Stress Level
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background:
                        entry.moodAnalysis.stressLevel > 6
                          ? "#c4736a"
                          : entry.moodAnalysis.stressLevel > 3
                            ? "#d4872a"
                            : "#7aab9c",
                    }}
                  />
                  <span style={{ fontSize: "12px", color: "#4a5c68" }}>
                    {entry.moodAnalysis.stressLevel.toFixed(1)} / 10
                  </span>
                </div>
              </div>

              {/* Keywords */}
              {entry.moodAnalysis.keywords.length > 0 && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.4)",
                    borderRadius: "10px",
                    border: "1px solid rgba(44,58,68,0.28)",
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "9px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      color: "#6a8aa6",
                      marginBottom: "8px",
                      fontWeight: "500",
                    }}
                  >
                    Keywords
                  </div>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}
                  >
                    {entry.moodAnalysis.keywords.map((kw: string) => (
                      <span
                        key={kw}
                        style={{
                          padding: "2px 8px",
                          borderRadius: "10px",
                          background: "rgba(74,124,111,0.08)",
                          border: "1px solid rgba(74,124,111,0.15)",
                          color: "#4a7c6f",
                          fontSize: "11px",
                        }}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div
                style={{
                  background: "rgba(255,255,255,0.4)",
                  borderRadius: "10px",
                  border: "1px solid rgba(44,58,68,0.28)",
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: "9px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "#6a8aa6",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  AI Reflection
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    lineHeight: "1.7",
                    color: "#4a5c68",
                    margin: 0,
                    fontStyle: "italic",
                  }}
                >
                  {entry.moodAnalysis.aiSummary}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
