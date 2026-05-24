import { useQuery, useMutation, gql } from "@apollo/client";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { colors, spacing, radius, fontSize } from "../lib/theme";
import { Card } from "../components/Card";
import { Label } from "../components/Label";
import { MoodBar } from "../components/Moodbar";
import { SafeAreaView } from "react-native-safe-area-context";

const GET_ENTRY = gql`
  query GetEntry($id: ID!) {
    entry(id: $id) {
      id
      title
      body
      wordCount
      tags
      writtenAt
      moodAnalysis {
        moodScore
        primaryMood
        stressLevel
        emotionBreakdown
        keywords
        aiSummary
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
  calm: "#4a7c6f",
  joyful: "#d4872a",
  anxious: "#c4736a",
  sad: "#7b9bc8",
  hopeful: "#7aab9c",
  neutral: "#8a9aa8",
};

const EMOTION_COLORS: Record<string, string> = {
  joy: "#f5c87a",
  calm: "#7aab9c",
  stress: "#c4736a",
  focus: "#7b9bc8",
  sadness: "#9b8ec4",
};

export function EntryDetailScreen({ route, navigation }: any) {
  const { id } = route.params;

  const { data, loading } = useQuery(GET_ENTRY, { variables: { id } });

  const [deleteEntry, { loading: deleting }] = useMutation(DELETE_ENTRY, {
    refetchQueries: ["Entries"],
    awaitRefetchQueries: true,

    onCompleted: () => {
      navigation.goBack();
    },

    onError: (err) => {
      Alert.alert("Delete failed", err.message);
    },
  });

  const handleDelete = () => {
    Alert.alert("Delete Entry", "Are you sure you want to delete this entry?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteEntry({
            variables: { id },
          });
        },
      },
    ]);
  };

  if (loading)
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.sageLight} />
      </View>
    );

  const entry = data?.entry;
  if (!entry)
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>Entry not found</Text>
      </View>
    );

  const mood = entry.moodAnalysis?.primaryMood || "neutral";
  const moodColor = MOOD_COLORS[mood] || colors.textMuted;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDelete}
          style={styles.deleteBtn}
          disabled={deleting}
        >
          <Text style={styles.deleteText}>{deleting ? "..." : "Delete"}</Text>
        </TouchableOpacity>
        <View style={[styles.moodBadge, { backgroundColor: `${moodColor}20` }]}>
          <Text style={[styles.moodBadgeText, { color: moodColor }]}>
            {mood}
          </Text>
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>{entry.title}</Text>
        <Text style={styles.date}>
          {new Date(entry.writtenAt).toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>

        {/* Tags */}
        {entry.tags.length > 0 && (
          <View style={styles.tagRow}>
            {entry.tags.map((tag: string) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Body */}
        <Text style={styles.body}>{entry.body}</Text>

        {/* AI Analysis */}
        {entry.moodAnalysis ? (
          <View style={styles.analysis}>
            <Text style={styles.analysisHeader}>✦ AI Analysis</Text>

            <Card style={styles.card}>
              <Label>Mood Score</Label>
              <View style={styles.moodScoreRow}>
                <View style={styles.moodTrack}>
                  <View
                    style={[
                      styles.moodFill,
                      {
                        width: `${entry.moodAnalysis.moodScore * 10}%`,
                        backgroundColor: moodColor,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.moodScore, { color: moodColor }]}>
                  {entry.moodAnalysis.moodScore.toFixed(1)}
                </Text>
              </View>
            </Card>

            <Card style={styles.card}>
              <Label>Emotions</Label>
              {Object.entries(
                entry.moodAnalysis.emotionBreakdown as Record<string, number>,
              ).map(([emotion, value]) => (
                <MoodBar
                  key={emotion}
                  label={emotion}
                  value={value as number}
                  color={EMOTION_COLORS[emotion] || colors.sage}
                />
              ))}
            </Card>

            <Card style={styles.card}>
              <Label>Keywords</Label>
              <View style={styles.keywords}>
                {entry.moodAnalysis.keywords.map((kw: string) => (
                  <View key={kw} style={styles.keyword}>
                    <Text style={styles.keywordText}>{kw}</Text>
                  </View>
                ))}
              </View>
            </Card>

            <Card style={styles.card}>
              <Label>AI Reflection</Label>
              <Text style={styles.aiSummary}>
                {entry.moodAnalysis.aiSummary}
              </Text>
            </Card>
          </View>
        ) : (
          <Card style={styles.card}>
            <Text style={styles.pendingText}>⟳ AI analysis in progress...</Text>
          </Card>
        )}

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  errorText: { color: colors.textMuted, fontSize: fontSize.md },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderColor: "rgba(255,255,255,0.27)",
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft: 'auto',
    marginRight: spacing.md,
    borderColor: "rgba(255,80,80,0.35)",
    borderRadius: radius.sm,
    borderWidth: 1,
    backgroundColor: "rgba(255,80,80,0.08)",
  },
  backText: { color: colors.sageLight, fontSize: fontSize.md },
  deleteText: {
    color: "#ff6b6b",
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  moodBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  moodBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  content: { padding: spacing.md },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "300",
    color: colors.textPrimary,
    marginTop: spacing.sm,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  date: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 3 },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: spacing.sm,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: "rgba(74,124,111,0.1)",
    borderWidth: 1,
    borderColor: "rgba(74,124,111,0.2)",
  },
  tagText: { fontSize: fontSize.xs, color: colors.sageLight },
  body: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
    fontWeight: "300",
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  analysis: { marginTop: spacing.sm },
  analysisHeader: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: colors.sageLight,
    marginBottom: spacing.sm,
  },
  card: { marginBottom: spacing.sm },
  moodScoreRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  moodTrack: {
    flex: 1,
    height: 5,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 3,
    overflow: "hidden",
  },
  moodFill: { height: "100%", borderRadius: 3 },
  moodScore: { fontSize: fontSize.md, fontWeight: "500" },
  keywords: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  keyword: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: "rgba(74,124,111,0.08)",
    borderWidth: 1,
    borderColor: "rgba(74,124,111,0.15)",
  },
  keywordText: { fontSize: fontSize.xs, color: colors.sageLight },
  aiSummary: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    fontStyle: "italic",
  },
  pendingText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: "center",
  },
});
