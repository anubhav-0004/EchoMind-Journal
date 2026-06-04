"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, gql } from "@apollo/client";

const CHAT_MUTATION = gql`
  mutation ChatWithDiary($message: String!, $history: [ChatHistoryInput!]!) {
    chatWithDiary(message: $message, history: $history) {
      role
      content
    }
  }
`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "When do I seem most stressed?",
  "What makes me happy according to my entries?",
  "What themes come up most in my writing?",
  "How has my mood changed recently?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I've read all your journal entries. Ask me anything — patterns in your mood, what you were feeling on a specific day, recurring themes, or anything you've written about.",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const [chatWithDiary, { loading }] = useMutation(CHAT_MUTATION);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    try {
      const { data } = await chatWithDiary({
        variables: {
          message: text,
          // Send conversation history excluding the initial greeting
          history: newMessages.slice(1).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.chatWithDiary.content,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble processing that. Please try again.",
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid rgba(44,58,68,0.1)",
          background: "rgba(44, 58, 68, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundImage: "linear-gradient(160deg, #a87976 0%, #e3c3c1 100%)",
          backdropFilter: "blur(10px)",
          }}
          className="max-sm:px-1.5! max-sm::py-1!"
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "400",
              color: "#1a2530",
            }}
            className="max-sm:text-base! max-sm:tracking-tight"
          >
            Chat with your Diary
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#fccad5" }} className="max-sm:text-[10px]!">
            Ask anything about your journal entries
          </p>
        </div>
        <span
          style={{
            fontSize: "11px",
            padding: "4px 10px",
            background: "rgba(74,124,111,0.88)",
            border: "1px solid rgba(74,124,111,0.15)",
            borderRadius: "20px",
            color: "rgba(255, 255, 255, 0.9)",
          }}
          className="max-sm:flex! max-sm:items-center! max-sm:text-xs! max-sm:px-1! max-sm:justify-center! max-sm:text-center!"
        >
          ✦ AI powered
        </span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }} className="max-sm:px-1.5! max-sm:py-1!">
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  padding: "12px 16px",
                  borderRadius:
                    msg.role === "user"
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                  background: msg.role === "user" ? "#4a7c6f" : "#fff",
                  color: msg.role === "user" ? "#fff" : "#1a2530",
                  border:
                    msg.role === "assistant"
                      ? "1px solid rgba(44,58,68,0.08)"
                      : "none",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  boxShadow: "0 1px 4px rgba(44,58,68,0.06)",
                }}
                className="max-sm:px-2! max-sm:py-2! max-sm:text-xs!"
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "12px 16px",
                  background: "#fff",
                  border: "1px solid rgba(44,58,68,0.08)",
                  borderRadius: "16px 16px 16px 4px",
                  fontSize: "14px",
                  color: "#8a9aa8",
                }}
                className="max-sm:px-2! max-sm:py-2! max-sm:text-xs!"
              >
                EchoMind is thinking...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {messages.length === 1 && (
        <div style={{ padding: "0 24px 12px" }} className="max-sm:px-1.5! max-sm:py-1!">
          <div
            style={{
              maxWidth: "700px",
              margin: "0 auto",
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
            }}
            className="max-sm:justify-center-safe!"
          >
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  border: "1px solid rgba(44,58,68,0.12)",
                  background: "#fff",
                  color: "#4a5c68",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
                className="max-sm:px-2! max-sm:py-1! max-sm:text-xs! max-sm:text-center! max-sm:justify-center! max-sm:items-center!"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div
        style={{
          padding: "14px 24px",
          borderTop: "1px solid rgba(44,58,68,0.18)",
          // background: '#fff',
        }}
        className="max-sm:px-1.5! max-sm:py-1.5!"
      >
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            display: "flex",
            gap: "8px",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your journal entries... (Enter to send)"
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px 14px",
              border: "1px solid rgba(44,58,68,0.15)",
              borderRadius: "10px",
              fontSize: "14px",
              outline: "none",
              background: "#faf8f5",
              color: "#1a2530",
            }}
            className="max-sm:px-2! max-sm:py-1.5! max-sm:text-xs!"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              background: loading || !input.trim() ? "#8a9aa8" : "#4a7c6f",
              color: "#fff",
              border: "none",
              fontSize: "13px",
              fontWeight: "500",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
