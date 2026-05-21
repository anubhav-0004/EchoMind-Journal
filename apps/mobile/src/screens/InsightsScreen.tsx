import { useQuery, gql } from "@apollo/client";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import {
  VictoryLine,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
  VictoryBar,
} from "victory-native";
import { colors, spacing, radius, fontSize } from "../lib/theme";
import { Card } from "../components/Card";
import { Label } from "../components/Label";
import { SafeAreaView } from "react-native-safe-area-context";

const GET_ENTRIES = gql`
  query {
    entries(limit: 30) {
      id
      writtenAt
      moodAnalysis {
        moodScore
        stressLevel
        primaryMood
        keywords
      }
    }
  }
`;

const { width } = Dimensions.get("window");

export function InsightsScreen() {
  const { data, loading } = useQuery(GET_ENTRIES);

  const entries = (data?.entries || [])
    .filter((e: any) => e.moodAnalysis)
    .slice(0, 14)
    .reverse();

  const chartData = entries.map((e: any, i: number) => ({
    x: i + 1,
    y: e.moodAnalysis.moodScore,
  }));

  const stressData = entries.map((e: any, i: number) => ({
    x: i + 1,
    y: e.moodAnalysis.stressLevel,
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

  const moodCounts: Record<string, number> = {};
  entries.forEach((e: any) => {
    const m = e.moodAnalysis.primaryMood;
    moodCounts[m] = (moodCounts[m] || 0) + 1;
  });
  const moodDistData = Object.entries(moodCounts).map(([mood, count], i) => ({
    x: i + 1,
    y: count,
    label: mood,
  }));

  const allKeywords: Record<string, number> = {};
  entries.forEach((e: any) => {
    e.moodAnalysis.keywords?.forEach((k: string) => {
      allKeywords[k] = (allKeywords[k] || 0) + 1;
    });
  });
  const topKeywords = Object.entries(allKeywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (loading)
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading insights...</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      <SafeAreaView style={styles.header}>
        <Text style={styles.headerTitle}>Mood Trends</Text>
        <Text style={styles.headerSub}>Last {entries.length} entries</Text>
      </SafeAreaView>

      <View style={styles.content}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Label>Avg Mood</Label>
            <Text style={[styles.statValue, { color: colors.sageLight }]}>
              {avgMood}
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Label>Avg Stress</Label>
            <Text style={[styles.statValue, { color: colors.blush }]}>
              {avgStress}
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Label>Entries</Label>
            <Text style={[styles.statValue, { color: colors.textSecondary }]}>
              {entries.length}
            </Text>
          </Card>
        </View>

        {/* Mood line chart */}
        {chartData.length > 1 && (
          <Card>
            <Label>Mood Over Time</Label>
            <VictoryChart
              width={width - spacing.md * 3}
              height={180}
              theme={VictoryTheme.material}
              padding={{ top: 10, bottom: 30, left: 30, right: 10 }}
            >
              <VictoryAxis
                style={{
                  axis: { stroke: colors.border },
                  tickLabels: { fill: colors.textMuted, fontSize: 10 },
                  grid: { stroke: 'rgba(255,255,255,0.14)', strokeDasharray: '' },
                }}
              />
              <VictoryAxis
                dependentAxis
                domain={[0, 10]}
                style={{
                  axis: { stroke: colors.border },
                  tickLabels: { fill: colors.textMuted, fontSize: 10 },
                  grid: { stroke: 'rgba(255,255,255,0.14)', strokeDasharray: '' },
                }}
              />
              <VictoryLine
                data={chartData}
                style={{ data: { stroke: colors.sageLight, strokeWidth: 2 } }}
              />
              <VictoryLine
                data={stressData}
                style={{
                  data: {
                    stroke: colors.blush,
                    strokeWidth: 1.5,
                    strokeDasharray: "6,3",
                  },
                }}
              />
            </VictoryChart>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: colors.sageLight },
                  ]}
                />
                <Text style={styles.legendText}>Mood</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: colors.blush }]}
                />
                <Text style={styles.legendText}>Stress</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Keywords */}
        {topKeywords.length > 0 && (
          <Card style={{ marginTop: spacing.sm }}>
            <Label>Recurring Themes</Label>
            <View style={styles.keywords}>
              {topKeywords.map(([keyword, count]) => (
                <View key={keyword} style={styles.keyword}>
                  <Text style={styles.keywordText}>
                    {keyword}
                    {count > 1 ? ` ×${count}` : ""}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {entries.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Write and publish entries to see trends here.
            </Text>
          </View>
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
  loadingText: { color: colors.textMuted, fontSize: fontSize.md },
  header: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: "400",
    color: colors.textPrimary,
  },
  headerSub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  content: { padding: spacing.sm, gap: spacing.sm },
  statsRow: { flexDirection: "row", gap: spacing.sm },
  statCard: { flex: 1 },
  statValue: { fontSize: fontSize.xxxl, fontWeight: "300" },
  legend: { flexDirection: "row", gap: spacing.md, marginTop: 4 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: fontSize.xs, color: colors.textMuted },
  keywords: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  keyword: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: "rgba(74,124,111,0.08)",
    borderWidth: 1,
    borderColor: "rgba(74,124,111,0.15)",
  },
  keywordText: { fontSize: fontSize.xs, color: colors.sageLight },
  empty: { alignItems: "center", padding: spacing.xl },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: "center",
  },
});
