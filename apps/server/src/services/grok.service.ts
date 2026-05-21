import "dotenv/config";

export interface EntryAnalysis {
  moodScore: number;
  sentimentPolarity: string;
  sentimentScore: number;
  primaryMood: string;
  emotionBreakdown: {
    joy: number;
    calm: number;
    stress: number;
    focus: number;
    sadness: number;
  };
  stressLevel: number;
  keywords: string[];
  aiSummary: string;
}

export interface LiveInsight {
  moodScore: number;
  emotionBreakdown: {
    joy: number;
    calm: number;
    stress: number;
    focus: number;
  };
  oneLineInsight: string; // Max 12 words
  stressSignal: number;
}

async function callGrok(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
  expectJson: boolean = true,
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set in .env");

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",

        max_tokens: expectJson ? 800 : 1200,
        temperature: 0.3,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as any;
  return data.choices[0].message.content as string;
}

// HELPER: SAFE JSON PARSE

function parseJsonResponse<T>(raw: string): T {
  // Remove markdown code fences if present
  const cleaned = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    console.error("[Grok] Failed to parse JSON response:", raw);
    throw new Error("Grok returned malformed JSON");
  }
}

// ─── 1. LIVE INSIGHT (called while user is typing, after 2500ms pause) ────────

export async function analyzeLiveEntry(
  partialText: string,
): Promise<LiveInsight> {
  if (partialText.trim().length < 30) {
    return {
      moodScore: 5,
      emotionBreakdown: { joy: 0.5, calm: 0.5, stress: 0.2, focus: 0.5 },
      oneLineInsight: "Keep writing...",
      stressSignal: 2,
    };
  }

  const systemPrompt = `You are analyzing a journal entry in progress.
Return ONLY a valid JSON object — no explanation, no markdown, no extra text.
The JSON must match this exact shape:
{
  "moodScore": <number 0-10>,
  "emotionBreakdown": {
    "joy": <number 0-1>,
    "calm": <number 0-1>,
    "stress": <number 0-1>,
    "focus": <number 0-1>
  },
  "oneLineInsight": "<max 12 words observing the emotional tone>",
  "stressSignal": <number 0-10>
}
Be quick and concise. This is a live analysis.`;

  const raw = await callGrok(
    [{ role: "user", content: partialText.slice(0, 500) }],
    systemPrompt,
    true,
  );

  return parseJsonResponse<LiveInsight>(raw);
}

// 2. FULL ENTRY ANALYSIS

export async function analyzeFullEntry(body: string): Promise<EntryAnalysis> {
  const systemPrompt = `You are an empathetic AI assistant analyzing a private journal entry.
Your job is to understand the emotional content and provide structured insight.
Return ONLY a valid JSON object — no explanation, no markdown, no extra text.
The JSON must match this exact shape:
{
  "moodScore": <number 0-10, overall emotional wellbeing>,
  "sentimentPolarity": <"POSITIVE" or "NEGATIVE" or "NEUTRAL">,
  "sentimentScore": <number 0-1, your confidence in the polarity>,
  "primaryMood": <single word: "calm" or "anxious" or "joyful" or "sad" or "angry" or "content" or "overwhelmed" or "hopeful" or "grieving" or "neutral">,
  "emotionBreakdown": {
    "joy": <number 0-1>,
    "calm": <number 0-1>,
    "stress": <number 0-1>,
    "focus": <number 0-1>,
    "sadness": <number 0-1>
  },
  "stressLevel": <number 0-10>,
  "keywords": [<5 to 8 meaningful words or short phrases from the entry>],
  "aiSummary": "<a warm, second-person paragraph of 150-200 words that reflects the emotional content back to the writer with care and insight — never clinical, never preachy>"
}
Analyze the full entry carefully before responding.`;

  const raw = await callGrok(
    [{ role: "user", content: body }],
    systemPrompt,
    true,
  );

  return parseJsonResponse<EntryAnalysis>(raw);
}

// 3. WEEKLY REPORT

export async function generateWeeklyReport(
  entries: Array<{ date: string; body: string }>,
): Promise<{
  dominantMoods: string[];
  topThemes: string[];
  avgMoodScore: number;
  avgStressLevel: number;
  aiSummary: string;
}> {
  if (entries.length === 0) {
    throw new Error("No entries to generate report from");
  }

  const entryBlock = entries
    .map((e) => `[${e.date}]\n${e.body}`)
    .join("\n\n---\n\n");

  const systemPrompt = `You are reading a full week of someone's private journal entries.
Write their weekly "Mental Map" — a personal emotional insight report.
Return ONLY a valid JSON object — no explanation, no markdown, no extra text.
The JSON must match this exact shape:
{
  "dominantMoods": [<3 to 4 single-word moods that dominated this week>],
  "topThemes": [<3 to 5 short phrases describing recurring themes>],
  "avgMoodScore": <number 0-10, the average mood across the week>,
  "avgStressLevel": <number 0-10, the average stress level>,
  "aiSummary": "<a thoughtful 250-300 word narrative that: (1) names the emotional arc of the week, (2) identifies a pattern the writer may not have noticed, (3) ends with one gentle forward-looking sentence. Warm tone, second person, never clinical>"
}
Read all entries carefully before responding.`;

  const raw = await callGrok(
    [{ role: "user", content: entryBlock }],
    systemPrompt,
    true,
  );

  return parseJsonResponse(raw);
}

// 4. CHAT WITH DIARY

export async function chatWithDiary(
  userMessage: string,
  history: Array<{ role: string; content: string }>,
  relevantEntries: Array<{ date: string; body: string }>,
): Promise<string> {
  // Build the context block from relevant entries
  const entryContext =
    relevantEntries.length > 0
      ? relevantEntries
          .map((e) => `[Entry from ${e.date}]: ${e.body.slice(0, 300)}`)
          .join("\n\n")
      : "No specific entries found for this query.";

  const systemPrompt = `You are EchoMind, an AI that has read all of this person's journal entries.
You speak with warmth, specificity, and genuine care.
Always ground your answers in what they actually wrote — reference specific dates or phrases when relevant.
Never make up entries or events that aren't in the context below.
If you don't have enough context to answer well, say so honestly and gently.

Here are the relevant journal entries for this conversation:
${entryContext}`;

  const raw = await callGrok(
    [
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: userMessage },
    ],
    systemPrompt,
    false, // expectJson = false, we want plain text response
  );

  return raw;
}
