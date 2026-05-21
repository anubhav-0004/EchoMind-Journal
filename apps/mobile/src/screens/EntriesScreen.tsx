import { useQuery, gql } from '@apollo/client'
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, RefreshControl,
} from 'react-native'
import { colors, spacing, radius, fontSize } from '../lib/theme'
import { SafeAreaView } from 'react-native-safe-area-context'

const GET_ENTRIES = gql`
  query {
    entries(limit: 50) {
      id title wordCount tags writtenAt
      moodAnalysis { moodScore primaryMood }
    }
  }
`

const MOOD_COLORS: Record<string, string> = {
  calm: '#4a7c6f', joyful: '#d4872a', anxious: '#c4736a',
  sad: '#7b9bc8', hopeful: '#7aab9c', neutral: '#8a9aa8',
}

const MOOD_EMOJI: Record<string, string> = {
  calm: '🌿', joyful: '☀️', anxious: '⚡', sad: '🌙',
  hopeful: '🌅', neutral: '○',
}

export function EntriesScreen({ navigation }: any) {
  const { data, loading, refetch } = useQuery(GET_ENTRIES)
  const entries = data?.entries || []

  const renderEntry = ({ item }: any) => {
    const mood = item.moodAnalysis?.primaryMood || 'neutral'
    const moodColor = MOOD_COLORS[mood] || colors.textMuted
    const emoji = MOOD_EMOJI[mood] || '○'

    return (
      <TouchableOpacity
        style={styles.entryCard}
        onPress={() => navigation.navigate('EntryDetail', { id: item.id })}
        activeOpacity={0.7}
      >
        <View style={[styles.entryIcon, { backgroundColor: `${moodColor}20` }]}>
          <Text style={styles.entryEmoji}>{emoji}</Text>
        </View>
        <View style={styles.entryBody}>
          <Text style={styles.entryTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.entrySub}>
            {item.wordCount} words · {new Date(item.writtenAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </Text>
        </View>
        <View style={styles.entryRight}>
          {item.moodAnalysis ? (
            <>
              <Text style={[styles.entryMood, { color: moodColor }]}>
                {item.moodAnalysis.moodScore.toFixed(1)}
              </Text>
              <Text style={[styles.entryMoodLabel, { color: moodColor }]}>
                {mood}
              </Text>
            </>
          ) : (
            <Text style={styles.entryPending}>...</Text>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Past Entries</Text>
        <Text style={styles.headerSub}>{entries.length} entries</Text>
      </View>

      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            tintColor={colors.sageLight}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>✦</Text>
              <Text style={styles.emptyText}>No entries yet.</Text>
              <Text style={styles.emptySubText}>Start writing your first entry.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    padding: spacing.md, paddingTop: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  headerTitle: { fontSize: fontSize.lg, fontWeight: '400', color: colors.textPrimary },
  headerSub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  list: { padding: spacing.md, gap: 8 },
  entryCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  entryIcon: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  entryEmoji: { fontSize: 18 },
  entryBody: { flex: 1 },
  entryTitle: { fontSize: fontSize.md, fontWeight: '500', color: colors.textPrimary },
  entrySub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2.5 },
  entryRight: { alignItems: 'flex-end' },
  entryMood: { fontSize: fontSize.md, fontWeight: '500' },
  entryMoodLabel: { fontSize: fontSize.xs, textTransform: 'capitalize', marginTop: 2 },
  entryPending: { fontSize: fontSize.xs, color: colors.textMuted },
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyIcon: { fontSize: 32, color: colors.textMuted },
  emptyText: { fontSize: fontSize.md, color: colors.textSecondary },
  emptySubText: { fontSize: fontSize.sm, color: colors.textMuted },
})