import { useQuery, useApolloClient, gql } from "@apollo/client";
import * as Updates from "expo-updates";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { removeToken } from "../lib/storage";
import { colors, spacing, radius, fontSize } from "../lib/theme";
import { Card } from "../components/Card";
import { CommonActions } from "@react-navigation/native";

const ME_QUERY = gql`
  query {
    me {
      id
      displayName
      email
      role
      createdAt
      entries {
        id
      }
    }
  }
`;

export function ProfileScreen({ navigation }: any) {
  const client = useApolloClient();
  const { data, loading } = useQuery(ME_QUERY);
  const user = data?.me;
  const isAdmin = user?.role === "ADMIN";

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await removeToken();
          await client.clearStore();
          // navigation.dispatch(
          //   CommonActions.reset({
          //     index: 0,
          //     routes: [{ name: "Login" }],
          //   }),
          // );
          await Updates.reloadAsync();
        },
      },
    ]);
  };

  const handleDownloadPDF = async (reportId: string) => {
    // Open PDF in browser since we can't download directly in Expo Go
    const url = `http://192.168.31.4:4000/api/report/${reportId}/pdf`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Cannot open PDF");
    }
  };

  if (loading)
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* User info card */}
        <Card style={styles.card}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.displayName}>{user?.displayName}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              {isAdmin && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>★ ADMIN</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.entries?.length || 0}</Text>
              <Text style={styles.statLabel}>Entries</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {user?.createdAt
                  ? Math.floor(
                      (Date.now() - new Date(user.createdAt).getTime()) /
                        (1000 * 60 * 60 * 24),
                    )
                  : 0}
              </Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
          </View>
        </Card>

        {/* Admin Panel button — only for ADMIN role */}
        {isAdmin && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Admin</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("AdminPanel")}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuItemIcon}>🛡️</Text>
                <Text style={styles.menuItemText}>Admin Dashboard</Text>
              </View>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Settings */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>App</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Report")}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>📄</Text>
              <Text style={styles.menuItemText}>Weekly Reports & PDF</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Sign out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>EchoMind v1.0.0</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.md },
  loadingText: { color: colors.textMuted, textAlign: "center", marginTop: 40 },
  header: {
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: "400",
    color: colors.textPrimary,
  },
  card: { marginBottom: spacing.sm },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.sage,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: fontSize.xxl,
    color: colors.white,
    fontWeight: "300",
  },
  userInfo: { flex: 1 },
  displayName: {
    fontSize: fontSize.lg,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  email: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  adminBadge: {
    marginTop: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: "rgba(74,124,111,0.15)",
    borderWidth: 1,
    borderColor: "rgba(74,124,111,0.3)",
  },
  adminBadgeText: {
    fontSize: fontSize.xs,
    color: colors.sageLight,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: "300",
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: "500",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  menuItemIcon: { fontSize: 18 },
  menuItemText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  menuItemArrow: {
    fontSize: fontSize.xl,
    color: colors.textMuted,
  },
  signOutBtn: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(196,115,106,0.3)",
    backgroundColor: "rgba(196,115,106,0.08)",
    alignItems: "center",
  },
  signOutText: {
    color: colors.blush,
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  version: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: spacing.lg,
  },
});
