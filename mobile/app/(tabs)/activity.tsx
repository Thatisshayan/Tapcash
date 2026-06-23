import { useState, useCallback, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { tapCashTheme } from "../../src/theme";
import { GlassCard } from "../../src/components/GlassCard";
import { subscribeToTransactions, type Transaction } from "../../src/lib/firestore";
import { useAuth } from "../../src/auth/AuthContext";
import { useRouter } from "expo-router";

const TABS = ["Today", "Week", "All Time"];

type ActivityStatus = "paid" | "pending" | "failed";

interface ActivityItem {
  id: string;
  name: string;
  status: ActivityStatus;
  amount: string;
  amountCoins: string;
  timestamp: string;
  provider: string;
}

function getStatusColor(status: ActivityStatus) {
  switch (status) {
    case "paid":
      return tapCashTheme.colors.accent;
    case "pending":
      return tapCashTheme.colors.muted;
    case "failed":
      return "#ff3b30";
  }
}

function formatTimestamp(createdAt: Date | null): string {
  if (!createdAt) return "";
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  return createdAt.toLocaleDateString();
}

function txToActivityItem(tx: Transaction): ActivityItem {
  const cad = (Math.abs(tx.amountCoins) / 1000).toFixed(2);
  const sign = tx.amountCoins >= 0 ? "+" : "-";
  return {
    id: tx.id,
    name: tx.type || "Transaction",
    status: tx.status === "approved" ? "paid" : tx.status === "pending" ? "pending" : "failed",
    amount: `${sign}${cad} CAD`,
    amountCoins: `${sign}${tx.amountCoins} coins`,
    timestamp: formatTimestamp(tx.createdAt),
    provider: tx.source || "TapCash",
  };
}

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Today");
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToTransactions(user.uid, (txs) => {
      setActivities(txs.map(txToActivityItem));
    });

    return unsubscribe;
  }, [user?.uid]);

  const onRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleTabPress = (tab: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  if (activities.length === 0) {
    return (
      <ScrollView style={[styles.screen, { paddingTop: insets.top + 12 }]} contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>Activity</Text>
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color={tapCashTheme.colors.muted} />
          <Text style={styles.emptyText}>
            No activity yet. Complete your first offer to start earning.
          </Text>
          <TouchableOpacity style={styles.emptyCta} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push("/(tabs)/earn"); }} activeOpacity={0.8}>
            <Text style={styles.emptyCtaText}>Browse Offers</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top + 12 }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tapCashTheme.colors.accent} />
      }
    >
      <Text style={styles.headerTitle}>Activity</Text>

      {/* Date filter tabs */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => handleTabPress(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Timeline */}
      <View style={styles.list}>
        {activities.map((item) => {
          const color = getStatusColor(item.status);
          const isCredit = item.amountCoins.includes("+");
          return (
            <GlassCard key={item.id} style={[styles.itemCard, { borderLeftWidth: 3, borderLeftColor: color }]}>
              <View style={styles.itemRow}>
                <View style={[styles.statusDot, { backgroundColor: color }]} />
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.itemAmountCol}>
                  <Text style={[styles.itemAmount, { color }]}>{item.amount}</Text>
                  <Text style={[styles.itemAmountCoins, { color: isCredit ? tapCashTheme.colors.green : tapCashTheme.colors.gold }]}>{item.amountCoins}</Text>
                </View>
              </View>
              <View style={styles.itemMetaRow}>
                <View style={[styles.statusBadge, { backgroundColor: color + "20" }]}>
                  <Text style={[styles.statusBadgeText, { color }]}>{item.status.toUpperCase()}</Text>
                </View>
                <Text style={styles.itemTimestamp}>{item.timestamp}</Text>
              </View>
              <Text style={styles.itemProvider}>{item.provider}</Text>
            </GlassCard>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tapCashTheme.colors.background },
  content: { paddingHorizontal: tapCashTheme.spacing.md, paddingBottom: tapCashTheme.spacing.xl, gap: tapCashTheme.spacing.md },
  headerTitle: { color: tapCashTheme.colors.text, fontSize: tapCashTheme.font.xl, fontWeight: "900" },
  tabsRow: { flexDirection: "row", gap: tapCashTheme.spacing.sm, marginBottom: tapCashTheme.spacing.sm },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: tapCashTheme.radius.full, backgroundColor: tapCashTheme.colors.surface, borderWidth: 1, borderColor: tapCashTheme.colors.border },
  tabActive: { backgroundColor: tapCashTheme.colors.accent, borderColor: tapCashTheme.colors.accent },
  tabText: { color: tapCashTheme.colors.muted, fontSize: tapCashTheme.font.sm, fontWeight: "700" },
  tabTextActive: { color: tapCashTheme.colors.background },
  list: { gap: tapCashTheme.spacing.md },
  itemCard: { padding: tapCashTheme.spacing.md, borderLeftWidth: 3 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: tapCashTheme.spacing.sm, marginBottom: tapCashTheme.spacing.xs },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  itemName: { flex: 1, color: tapCashTheme.colors.text, fontSize: 15, fontWeight: "600" },
  itemAmountCol: { alignItems: "flex-end" },
  itemAmount: { fontSize: 14, fontWeight: "900" },
  itemAmountCoins: { fontSize: 11, fontWeight: "700" },
  itemMetaRow: { flexDirection: "row", alignItems: "center", gap: tapCashTheme.spacing.sm, marginBottom: tapCashTheme.spacing.xs },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: tapCashTheme.radius.xs },
  statusBadgeText: { fontSize: tapCashTheme.font.xs, fontWeight: "800", textTransform: "uppercase" },
  itemTimestamp: { color: tapCashTheme.colors.muted, fontSize: tapCashTheme.font.xs },
  itemProvider: { color: tapCashTheme.colors.muted, fontSize: 12 },
  emptyState: { alignItems: "center", justifyContent: "center", marginTop: tapCashTheme.spacing.xl },
  emptyText: { color: tapCashTheme.colors.muted, fontSize: tapCashTheme.font.md, textAlign: "center", marginTop: tapCashTheme.spacing.md, maxWidth: 260 },
  emptyCta: { marginTop: tapCashTheme.spacing.md, paddingHorizontal: 20, paddingVertical: 12, borderRadius: tapCashTheme.radius.full, backgroundColor: tapCashTheme.colors.accent },
  emptyCtaText: { color: tapCashTheme.colors.background, fontSize: tapCashTheme.font.md, fontWeight: "800" },
});
