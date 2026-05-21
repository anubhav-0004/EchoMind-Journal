import { useQuery, useMutation, gql } from "@apollo/client";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { colors, spacing, radius, fontSize } from "../lib/theme";
import { Card } from "../components/Card";
import { Label } from "../components/Label";
import { SafeAreaView } from "react-native-safe-area-context";
import { Linking } from "react-native";
import { getToken } from "../lib/storage";

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
    }
  }
`;

export function ReportScreen() {
  const { data, loading, refetch } = useQuery(GET_REPORTS);
  const [generate, { loading: generating }] = useMutation(GENERATE_REPORT, {
    onCompleted: () => refetch(),
    onError: (err: any) => Alert.alert("Error", err.message),
  });

  const reports = data?.weeklyReports || [];

  const handleGenerate = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    generate({ variables: { weekStartDate: monday.toISOString() } });
  };

const handleDownloadPDF = async (reportId: string) => {
  const token = await getToken()
  const url = `http://192.168.31.4:4000/api/report/${reportId}/pdf?token=${token}`

  Alert.alert(
    'Download PDF',
    'This will open the PDF report in your browser.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open PDF',
        onPress: () => Linking.openURL(url),
      },
    ]
  )
}

  if (loading)
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.sageLight} />
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      <SafeAreaView style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Weekly Reports</Text>
          <Text style={styles.headerSub}>Your AI Mental Map</Text>
        </View>
        <TouchableOpacity
          style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={generating}
          activeOpacity={0.8}
        >
          {generating ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.generateBtnText}>✦ Generate</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.content}>
        {reports.length === 0 ? (
          <Card>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyText}>No reports yet.</Text>
            <Text style={styles.emptySubText}>
              Write entries this week, then tap "Generate" for your Mental Map.
            </Text>
          </Card>
        ) : (
          reports.map((report: any) => {
            const arc = report.emotionArc as number[];
            const days = ["M", "T", "W", "T", "F", "S", "S"];
            const maxArc = Math.max(...arc, 1);

            return (
              <Card key={report.id} style={styles.reportCard}>
                {/* Report header */}
                <View style={styles.reportHeader}>
                  <View>
                    <Text style={styles.reportDate}>
                      {new Date(report.weekStartDate).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short" },
                      )}
                      {" – "}
                      {new Date(report.weekEndDate).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short", year: "2-digit" },
                      )}
                    </Text>
                    <Text style={styles.reportGenDate}>
                      Generated{" "}
                      {new Date(report.generatedAt).toLocaleDateString(
                        "en-IN",
                        { dateStyle: "medium" },
                      )}
                    </Text>
                  </View>
                  <View style={styles.scores}>
                    <View style={styles.scoreItem}>
                      <Text
                        style={[styles.scoreValue, { color: colors.sageLight }]}
                      >
                        {report.avgMoodScore.toFixed(1)}
                      </Text>
                      <Text style={styles.scoreLabel}>mood</Text>
                    </View>
                    <View style={styles.scoreItem}>
                      <Text
                        style={[styles.scoreValue, { color: colors.blush }]}
                      >
                        {report.avgStressLevel.toFixed(1)}
                      </Text>
                      <Text style={styles.scoreLabel}>stress</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.pdfBtn}
                    onPress={() => handleDownloadPDF(report.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.pdfBtnText}>↓ PDF</Text>
                  </TouchableOpacity>
                </View>

                {/* Arc bars */}
                {arc.length > 0 && (
                  <View style={styles.arcSection}>
                    <Label>Mood Arc</Label>
                    <View style={styles.arcBars}>
                      {arc.map((score, i) => (
                        <View key={i} style={styles.arcBarCol}>
                          <View style={styles.arcBarTrack}>
                            <View
                              style={[
                                styles.arcBarFill,
                                {
                                  height: `${(score / maxArc) * 100}%`,
                                  backgroundColor:
                                    score >= 7
                                      ? colors.sage
                                      : score >= 4
                                        ? colors.amber
                                        : colors.blush,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.arcDay}>{days[i]}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Dominant moods */}
                <View style={styles.section}>
                  <Label>Dominant Moods</Label>
                  <View style={styles.tags}>
                    {report.dominantMoods.map((mood: string) => (
                      <View key={mood} style={styles.moodTag}>
                        <Text style={styles.moodTagText}>{mood}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Top themes */}
                <View style={styles.section}>
                  <Label>Top Themes</Label>
                  <View style={styles.tags}>
                    {report.topThemes.map((theme: string) => (
                      <View key={theme} style={styles.themeTag}>
                        <Text style={styles.themeTagText}>{theme}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* AI Summary */}
                <View style={styles.summarySection}>
                  <Label>Mental Map</Label>
                  <Text style={styles.summaryText}>{report.aiSummary}</Text>
                </View>
              </Card>
            );
          })
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
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: "400",
    color: colors.textPrimary,
  },
  headerSub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  generateBtn: {
    backgroundColor: colors.sage,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  generateBtnDisabled: { backgroundColor: colors.textMuted },
  generateBtnText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  content: { padding: spacing.sm, gap: spacing.sm },
  emptyIcon: { fontSize: 32, textAlign: "center", marginBottom: 8 },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 4,
  },
  reportCard: { marginBottom: spacing.sm },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  pdfBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.27)',
    marginTop: 4,
  },
  pdfBtnText: {
    fontSize: fontSize.xs,
    color: 'white',
    width: 40,
    textAlign: "center",
  },
  reportDate: {
    fontSize: fontSize.md,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  reportGenDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  scores: { flexDirection: "row", gap: spacing.md },
  scoreItem: { alignItems: "center" },
  scoreValue: { fontSize: fontSize.xl, fontWeight: "300" },
  scoreLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  arcSection: { marginBottom: spacing.md },
  arcBars: { flexDirection: "row", gap: 6, height: 60, alignItems: "flex-end" },
  arcBarCol: { flex: 1, alignItems: "center", height: "100%" },
  arcBarTrack: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 3,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  arcBarFill: { width: "100%", borderRadius: 3 },
  arcDay: { fontSize: 8, color: colors.textMuted, marginTop: 3 },
  section: { marginBottom: spacing.md },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  moodTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: "rgba(74,124,111,0.1)",
    borderWidth: 1,
    borderColor: "rgba(74,124,111,0.2)",
  },
  moodTagText: {
    fontSize: fontSize.xs,
    color: colors.sageLight,
    textTransform: "capitalize",
  },
  themeTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  themeTagText: { fontSize: fontSize.xs, color: colors.textSecondary },
  summarySection: {
    borderLeftWidth: 3,
    borderLeftColor: colors.sageLight,
    paddingLeft: spacing.sm,
  },
  summaryText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    fontStyle: "italic",
  },
});
