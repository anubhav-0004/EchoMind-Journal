"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, gql } from "@apollo/client";
import { connectSocket, disconnectSocket } from "@/lib/socket";

const CREATE_ENTRY = gql`
  mutation CreateEntry($title: String!, $body: String!, $tags: [String!]) {
    createEntry(title: $title, body: $body, tags: $tags) {
      id
      title
      status
    }
  }
`;

const PUBLISH_ENTRY = gql`
  mutation PublishEntry($id: ID!) {
    publishEntry(id: $id) {
      id
      status
      publishedAt
    }
  }
`;

interface LiveInsight {
  moodScore: number;
  emotionBreakdown: {
    joy: number;
    calm: number;
    stress: number;
    focus: number;
  };
  oneLineInsight: string;
  stressSignal: number;
}

const MOOD_TAGS = [
  "Gratitude",
  "Productivity",
  "Anxiety",
  "Reflection",
  "Joy",
  "Stress",
  "Growth",
];

export default function EditorPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [insight, setInsight] = useState<LiveInsight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [published, setPublished] = useState(false);
  const socketRef = useRef<any>(null);

  const [createEntry] = useMutation(CREATE_ENTRY, {
    onError: (err) => {
      console.error("createEntry error:", err);
      alert("Failed to create entry: " + err.message);
    },
  });

  const [publishEntry, { loading: publishing }] = useMutation(PUBLISH_ENTRY, {
    onError: (err) => {
      console.error("publishEntry error:", err);
      alert("Failed to publish: " + err.message);
    },
  });

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    socket.on("entry:insight", (data: LiveInsight | null) => {
      setIsAnalyzing(false);
      if (data) setInsight(data);
    });

    return () => {
      socket.off("entry:insight");
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (!title && !body) return;
    const interval = setInterval(handleSaveDraft, 4000);
    return () => clearInterval(interval);
  }, [title, body]);

  const handleBodyChange = useCallback((text: string) => {
    setBody(text);
    setSaved(false);

    if (socketRef.current?.connected) {
      setIsAnalyzing(true);
      socketRef.current.emit("entry:typing", text);
    }
  }, []);

  const handleSaveDraft = async () => {
    if (!title.trim() || !body.trim()) return;
    try {
      if (!entryId) {
        const { data } = await createEntry({
          variables: { title, body, tags },
        });
        setEntryId(data.createEntry.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 5500);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !body.trim()) {
      alert("Please add a title and some content before publishing.");
      return;
    }

    try {
      let id = entryId;

      if (!id) {
        const { data } = await createEntry({
          variables: { title, body, tags },
        });
        id = data.createEntry.id;
        setEntryId(id);
      }

      await publishEntry({ variables: { id } });
      setPublished(true);

      setTimeout(() => {
        setTitle("");
        setBody("");
        setTags([]);
        setEntryId(null);
        setInsight(null);
        setPublished(false);
      }, 2000);
    } catch (err: any) {
      console.error("Publish failed:", err);
      alert("Failed to publish: " + err.message);
    }
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const getMoodColor = (score: number) => {
    if (score >= 7) return "#4a7c6f";
    if (score >= 4) return "#d4872a";
    return "#c4736a";
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 280px",
        height: "100vh",
      }}
    >
      <div
        style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(44,58,68,0.2)",
            // background: "rgba(44, 58, 68, 0.1)",
            backgroundImage:
              "linear-gradient(160deg, #a87976 0%, #c2acab 100%)",
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
              Today's Entry
            </h2>
            <p
              style={{ margin: "2px 0 0", fontSize: "12px", color: "#314452" }}
            >
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
              {isAnalyzing && " · AI analyzing..."}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleSaveDraft}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(44,58,68,0.55)",
                background: "transparent",
                fontSize: "12px",
                color: saved ? "#4a7c6f" : "#4a5c68",
                cursor: "pointer",
              }}
            >
              {saved ? "✓ Saved" : "Save Draft"}
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing || published}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: published
                  ? "#4a7c6f"
                  : publishing
                    ? "#8a9aa8"
                    : "#4a7c6f",
                color: "#fff",
                fontSize: "12px",
                fontWeight: "500",
                cursor: publishing || published ? "not-allowed" : "pointer",
              }}
            >
              {published
                ? "✓ Published!"
                : publishing
                  ? "Publishing..."
                  : "Publish Entry"}
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "24px",
            // background: "linear-gradient(160deg, #ffffff 0%, #f0f7f5 100%)",
          }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's on your mind today?"
            style={{
              width: "100%",
              fontSize: "26px",
              fontWeight: "400",
              padding: "8px",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              outline: "none",
              color: "#1a2530",
              marginBottom: "16px",
              fontFamily: "Georgia, serif",
            }}
          />

          <textarea
            value={body}
            onChange={(e) => handleBodyChange(e.target.value)}
            placeholder="Start writing... your thoughts are safe here."
            style={{
              width: "100%",
              minHeight: "300px",
              fontSize: "15px",
              lineHeight: "1.8",
              padding: "8px",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              outline: "none",
              color: "#122736",
              resize: "none",
              fontFamily: "system-ui, sans-serif",
              fontWeight: "300",
            }}
          />

          <div
            style={{
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(44,58,68,0.18)",
            }}
          >
            {MOOD_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  border: "1px solid",
                  borderColor: tags.includes(tag)
                    ? "#4a7c6f"
                    : "rgba(44,58,68,0.15)",
                  background: tags.includes(tag)
                    ? "#4a7c6f"
                    : "rgba(255, 255, 255, 0.3)",
                  color: tags.includes(tag) ? "#fff" : "#1b5423",
                  cursor: "pointer",
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          <div
            style={{ marginTop: "12px", fontSize: "11px", color: "#2c3a44" }}
          >
            {body.trim().split(/\s+/).filter(Boolean).length} words
          </div>
        </div>
      </div>

      <div
        className="bg-animated"
        style={{
          borderLeft: "2px solid rgba(44,58,68,0.1)",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Right Sidebar */}
        <div
          style={{
            padding: "26px 12px 16px",
            borderBottom: "1px solid rgba(44,58,68,0.18)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              fontWeight: "500",
              letterSpacing: "0.6px",
              textTransform: "uppercase",
              color: "#2c3a44",
            }}
          >
            Live Insights
          </span>
          {isAnalyzing && (
            <span
              style={{ marginLeft: "auto", fontSize: "10px", color: "#4a7c6f" }}
            >
              analyzing...
            </span>
          )}
          {!isAnalyzing && insight && (
            <div
              style={{
                marginLeft: "auto",
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#7aab9c",
              }}
            />
          )}
        </div>

        {!insight && !isAnalyzing && (
          <div style={{ padding: "24px 18px", textAlign: "center" }}>
            <p
              style={{ fontSize: "12px", color: "#2c3a44", lineHeight: "1.6" }}
            >
              Start writing and EchoMind will analyze your mood in real-time
              after a short pause.
            </p>
          </div>
        )}

        {isAnalyzing && (
          <div style={{ padding: "16px 14px" }}>
            <div
              style={{
                padding: "12px 14px",
                background: "rgba(74,124,111,0.05)",
                border: "1px solid rgba(74,124,111,0.12)",
                borderRadius: "10px",
                fontSize: "12px",
                color: "#4a7c6f",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>⟳</span> Reading your entry...
            </div>
          </div>
        )}

        {insight && !isAnalyzing && (
          <div
            style={{
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {/* Mood Score */}
            <div
              style={{
                background: "#fff",
                border: "1px solid rgba(44,58,68,0.08)",
                borderRadius: "10px",
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#8a9aa8",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Overall Mood
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "4px",
                }}
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
                      width: `${insight.moodScore * 10}%`,
                      background: getMoodColor(insight.moodScore),
                      borderRadius: "3px",
                      transition: "width 0.5s",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                    color: getMoodColor(insight.moodScore),
                  }}
                >
                  {insight.moodScore.toFixed(1)}
                </span>
              </div>
              <div style={{ fontSize: "10px", color: "#8a9aa8" }}>
                {insight.moodScore >= 7
                  ? "Positive"
                  : insight.moodScore >= 4
                    ? "Neutral"
                    : "Low"}{" "}
                energy detected
              </div>
            </div>

            {/* Emotion Breakdown */}
            <div
              style={{
                background: "#fff",
                border: "1px solid rgba(44,58,68,0.08)",
                borderRadius: "10px",
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#8a9aa8",
                  marginBottom: "10px",
                  fontWeight: "500",
                }}
              >
                Emotions
              </div>
              {Object.entries(insight.emotionBreakdown).map(
                ([emotion, value]) => {
                  const colors: Record<string, string> = {
                    joy: "#f5c87a",
                    calm: "#7aab9c",
                    stress: "#c4736a",
                    focus: "#7b9bc8",
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
                          color: "#8a9aa8",
                          width: "40px",
                          textTransform: "capitalize",
                        }}
                      >
                        {emotion}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: "4px",
                          background: "rgba(44,58,68,0.08)",
                          borderRadius: "2px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${value * 100}%`,
                            background: colors[emotion] || "#8a9aa8",
                            borderRadius: "2px",
                            transition: "width 0.5s",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#8a9aa8",
                          width: "28px",
                          textAlign: "right",
                        }}
                      >
                        {Math.round(value * 100)}%
                      </span>
                    </div>
                  );
                },
              )}
            </div>

            {/* AI Insight */}
            <div
              style={{
                background: "#fff",
                border: "1px solid rgba(44,58,68,0.08)",
                borderRadius: "10px",
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#8a9aa8",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                AI Reflection
              </div>
              <p
                style={{
                  fontSize: "12px",
                  lineHeight: "1.6",
                  color: "#4a5c68",
                  fontStyle: "italic",
                  margin: 0,
                }}
              >
                "{insight.oneLineInsight}"
              </p>
            </div>

            {/* Stress Signal */}
            <div
              style={{
                background: "#fff",
                border: "1px solid rgba(44,58,68,0.08)",
                borderRadius: "10px",
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#8a9aa8",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Stress Signal
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
                      insight.stressSignal > 6
                        ? "#c4736a"
                        : insight.stressSignal > 3
                          ? "#d4872a"
                          : "#7aab9c",
                  }}
                />
                <span style={{ fontSize: "12px", color: "#4a5c68" }}>
                  {insight.stressSignal > 6
                    ? "High stress detected"
                    : insight.stressSignal > 3
                      ? "Moderate stress"
                      : "Low stress — you seem calm"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
