import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useMutation, gql } from "@apollo/client";
import { connectSocket, getSocket } from "../lib/socket";
import { colors, spacing, radius, fontSize } from "../lib/theme";
import { Card } from "../components/Card";
import { Label } from "../components/Label";
import { MoodBar } from "../components/Moodbar";
import { SafeAreaView } from "react-native-safe-area-context";

const CREATE_ENTRY = gql`
  mutation CreateEntry($title: String!, $body: String!, $tags: [String!]) {
    createEntry(title: $title, body: $body, tags: $tags) {
      id
      status
    }
  }
`;

const PUBLISH_ENTRY = gql`
  mutation PublishEntry($id: ID!) {
    publishEntry(id: $id) {
      id
      status
    }
  }
`;

interface LiveInsight {
  moodScore: number;
  emotionBreakdown: Record<string, number>;
  oneLineInsight: string;
  stressSignal: number;
}

const TAGS = ["Gratitude", "Productivity", "Anxiety", "Reflection", "Joy"];
const EMOTION_COLORS: Record<string, string> = {
  joy: "#f5c87a",
  calm: "#7aab9c",
  stress: "#c4736a",
  focus: "#7b9bc8",
  sadness: "#9b8ec4",
};

export function EditorScreen() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [insight, setInsight] = useState<LiveInsight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [published, setPublished] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [createEntry] = useMutation(CREATE_ENTRY, {
    onError: (err: any) => Alert.alert("Error", err.message),
  });
  const [publishEntry, { loading: publishing }] = useMutation(PUBLISH_ENTRY, {
    onError: (err: any) => Alert.alert("Error", err.message),
  });

  useEffect(() => {
    connectSocket().then((socket) => {
      socket.on("entry:insight", (data: LiveInsight | null) => {
        setIsAnalyzing(false);
        if (data) {
          setInsight(data);
          setShowInsights(true);
        }
      });
    });
    return () => {
      getSocket()?.off("entry:insight");
    };
  }, []);

  const handleBodyChange = (text: string) => {
    setBody(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length > 40) {
      setIsAnalyzing(true);
      debounceRef.current = setTimeout(() => {
        getSocket()?.emit("entry:typing", text);
      }, 2500);
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert("Missing content", "Please add a title and some content.");
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
      Alert.alert(
        "✦ Published!",
        "Your entry has been saved. AI analysis will be ready shortly.",
      );
      setTitle("");
      setBody("");
      setTags([]);
      setEntryId(null);
      setInsight(null);
      setShowInsights(false);
      setPublished(false);
    } catch (err) {
      console.error(err);
    }
  };

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Today's Entry</Text>
          <Text style={styles.headerSub}>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
            {isAnalyzing ? " · analyzing..." : ""}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.publishBtn, publishing && styles.publishBtnDisabled]}
          onPress={handlePublish}
          disabled={publishing}
          activeOpacity={0.8}
        >
          {publishing ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.publishBtnText}>Publish</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Title input */}
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="What's on your mind?"
          placeholderTextColor={colors.textMuted}
          multiline
        />

        {/* Body input */}
        <TextInput
          style={styles.bodyInput}
          value={body}
          onChangeText={handleBodyChange}
          placeholder="Start writing... your thoughts are safe here."
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
        />

        {/* Word count */}
        <Text style={styles.wordCount}>{wordCount} words</Text>

        {/* Tags */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagRow}
        >
          {TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              onPress={() =>
                setTags((prev) =>
                  prev.includes(tag)
                    ? prev.filter((t) => t !== tag)
                    : [...prev, tag],
                )
              }
              style={[styles.tag, tags.includes(tag) && styles.tagActive]}
            >
              <Text
                style={[
                  styles.tagText,
                  tags.includes(tag) && styles.tagTextActive,
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Live insights */}
        {showInsights && insight && (
          <View style={styles.insightSection}>
            <Text style={styles.insightHeader}>✦ Live Insights</Text>

            <Card style={styles.insightCard}>
              <Label>Overall Mood</Label>
              <View style={styles.moodScoreRow}>
                <View style={styles.moodTrack}>
                  <View
                    style={[
                      styles.moodFill,
                      {
                        width: `${insight.moodScore * 10}%`,
                        backgroundColor:
                          insight.moodScore >= 7
                            ? colors.sage
                            : insight.moodScore >= 4
                              ? colors.amber
                              : colors.blush,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.moodScore}>
                  {insight.moodScore.toFixed(1)}
                </Text>
              </View>
            </Card>

            <Card style={styles.insightCard}>
              <Label>Emotions</Label>
              {Object.entries(insight.emotionBreakdown).map(
                ([emotion, value]) => (
                  <MoodBar
                    key={emotion}
                    label={emotion}
                    value={value as number}
                    color={EMOTION_COLORS[emotion] || colors.sage}
                  />
                ),
              )}
            </Card>

            <Card style={styles.insightCard}>
              <Label>AI Reflection</Label>
              <Text style={styles.insightText}>"{insight.oneLineInsight}"</Text>
            </Card>

            <Card style={styles.insightCard}>
              <Label>Stress Signal</Label>
              <View style={styles.stressRow}>
                <View
                  style={[
                    styles.stressDot,
                    {
                      backgroundColor:
                        insight.stressSignal > 6
                          ? colors.blush
                          : insight.stressSignal > 3
                            ? colors.amber
                            : colors.sageLight,
                    },
                  ]}
                />
                <Text style={styles.stressText}>
                  {insight.stressSignal > 6
                    ? "High stress detected"
                    : insight.stressSignal > 3
                      ? "Moderate stress"
                      : "Low stress — you seem calm"}
                </Text>
              </View>
            </Card>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: "400",
    color: colors.textPrimary,
  },
  headerSub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  publishBtn: {
    backgroundColor: colors.sage,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  publishBtnDisabled: { backgroundColor: colors.textMuted },
  publishBtnText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  scroll: { flex: 1, padding: spacing.md },
  titleInput: {
    fontSize: fontSize.xxl,
    fontWeight: "300",
    color: colors.textPrimary,
    marginBottom: spacing.md,
    lineHeight: 34,
    backgroundColor: "rgba(41, 74, 65, 0.2)",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderColor: colors.border,
    borderWidth: 1,
  },
  bodyInput: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 26,
    minHeight: 200,
    fontWeight: "300",
    backgroundColor: "rgba(41, 74, 65, 0.2)",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderColor: colors.border,
    borderWidth: 1,
  },
  wordCount: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  tagRow: { marginTop: spacing.md, marginBottom: spacing.md },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  tagActive: { backgroundColor: colors.sage, borderColor: colors.sage },
  tagText: { fontSize: fontSize.xs, color: colors.textMuted },
  tagTextActive: { color: colors.white },
  insightSection: { marginTop: spacing.md },
  insightHeader: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: colors.sageLight,
    marginBottom: spacing.sm,
  },
  insightCard: { marginBottom: spacing.sm },
  moodScoreRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  moodTrack: {
    flex: 1,
    height: 5,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 3,
    overflow: "hidden",
  },
  moodFill: { height: "100%", borderRadius: 3 },
  moodScore: {
    fontSize: fontSize.md,
    fontWeight: "500",
    color: colors.sageLight,
  },
  insightText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: "italic",
    lineHeight: 20,
  },
  stressRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  stressDot: { width: 8, height: 8, borderRadius: 4 },
  stressText: { fontSize: fontSize.sm, color: colors.textSecondary },
});
