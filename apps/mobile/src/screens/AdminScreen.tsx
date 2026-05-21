import { useQuery, gql } from '@apollo/client'
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, radius, fontSize } from '../lib/theme'
import { Card } from '../components/Card'
import { Label } from '../components/Label'

const ADMIN_QUERY = gql`
  query {
    adminStats {
      totalUsers activeThisWeek avgMoodPlatform totalEntries
    }
    adminUsers(limit: 30) {
      id displayName email role createdAt
      entries { id }
    }
  }
`

export function AdminScreen({ navigation }: any) {
  const { data, loading } = useQuery(ADMIN_QUERY, {
    onError: () => navigation.goBack(),
  })

  if (loading) return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.loading}>
        <ActivityIndicator color={colors.sageLight} />
      </View>
    </SafeAreaView>
  )

  const stats = data?.adminStats
  const users = data?.adminUsers || []

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>ADMIN</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Stat cards */}
        {stats && (
          <View style={styles.statsGrid}>
            {[
              { label: 'Total Users', value: stats.totalUsers, color: colors.sageLight },
              { label: 'Active Week', value: stats.activeThisWeek, color: colors.amber },
              { label: 'Avg Mood', value: stats.avgMoodPlatform.toFixed(1), color: '#7b9bc8' },
              { label: 'Entries', value: stats.totalEntries, color: colors.textSecondary },
            ].map(s => (
              <Card key={s.label} style={styles.statCard}>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              </Card>
            ))}
          </View>
        )}

        {/* Users list */}
        <Card style={styles.usersCard}>
          <Label>Users ({users.length})</Label>
          {users.map((user: any, index: number) => (
            <View
              key={user.id}
              style={[
                styles.userRow,
                index < users.length - 1 && styles.userRowBorder,
                user.role === 'ADMIN' && styles.userRowAdmin,
              ]}
            >
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {user.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <View style={styles.userNameRow}>
                  <Text style={styles.userName}>{user.displayName}</Text>
                  {user.role === 'ADMIN' && (
                    <Text style={styles.adminStar}>★</Text>
                  )}
                </View>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
              <View style={styles.userMeta}>
                <Text style={[
                  styles.userRole,
                  { color: user.role === 'ADMIN' ? colors.sageLight : colors.textMuted },
                ]}>
                  {user.role}
                </Text>
                <Text style={styles.userEntries}>
                  {user.entries?.length || 0} entries
                </Text>
              </View>
            </View>
          ))}
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgCard,
    gap: spacing.sm,
  },
  backBtn: { paddingHorizontal: 12, paddingVertical: 4, borderColor: 'rgba(255,255,255,0.27)', borderRadius: radius.sm, borderWidth: 1 },
  backText: { color: colors.sageLight, fontSize: fontSize.md },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '400',
    color: colors.textPrimary,
  },
  adminBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: 'rgba(196,115,106,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(196,115,106,0.3)',
  },
  adminBadgeText: {
    fontSize: fontSize.xs,
    color: colors.blush,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  scroll: { padding: spacing.md },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statCard: {
    width: '47%',
    paddingVertical: spacing.md,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  statValue: {
    fontSize: fontSize.xxxl,
    fontWeight: '300',
  },
  usersCard: { marginBottom: spacing.sm },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  userRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userRowAdmin: {
    backgroundColor: 'rgba(74,124,111,0.05)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
  },
  userAvatar: {
    width: 34, height: 34,
    borderRadius: 17,
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userAvatarText: {
    fontSize: fontSize.md,
    color: colors.white,
    fontWeight: '500',
  },
  userInfo: { flex: 1, minWidth: 0 },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  adminStar: {
    fontSize: fontSize.xs,
    color: colors.sageLight,
  },
  userEmail: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  userMeta: { alignItems: 'flex-end', flexShrink: 0 },
  userRole: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  userEntries: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
})