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
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { tapCashTheme } from "../../src/theme";
import { subscribeToTransactions, type Transaction } from "../../src/lib/firestore";
import { useAuth } from "../../src/auth/AuthContext";

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
      return tapCashTheme.colors.accentViolet;
    case "failed":
      return tapCashTheme.colors.red;
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

  const handleBrowseOffers = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(tabs)/earn");
  };

  if (activities.length === 0) {
    return (
      <ScrollView style={[styles.screen, { paddingTop: insets.top + 12 }]} contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>Activity</Text>
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color={tapCashTheme.colors.muted} />
          <Text style={styles.emptyText}>
            No activity yet. Complete your first offer to see earnings here.
          </Text>
          <TouchableOpacity style={styles.browseBtn} onPress={handleBrowseOffers}>
            <Text style={styles.browseBtnText}>Browse Offers</Text>
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

      {/* Text tabs with a gold underline on the active one -- not a row of
          bordered pill buttons. */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <TouchableOpacity key={tab} onPress={() => handleTabPress(tab)} activeOpacity={0.8} style={styles.tab}>
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
              {isActive && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Ledger rows: status dot + name/meta, right-aligned tabular amount.
          No card box, no left-border accent bar, no colored badge pill. */}
      <View style={styles.list}>
        {activities.map((item, i) => {
          const color = getStatusColor(item.status);
          const isCredit = item.amountCoins.includes("+");
          return (
            <View key={item.id} style={[styles.row, i === activities.length - 1 && styles.rowLast]}>
              <View style={[styles.statusDot, { backgroundColor: color }]} />
              <View style={styles.rowInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemMeta} numberOfLines={1}>
                  {item.status} · {item.provider} · {item.timestamp}
                </Text>
              </View>
              <View style={styles.itemAmountCol}>
                <Text style={[styles.itemAmount, { color: isCredit ? tapCashTheme.colors.accentBright : tapCashTheme.colors.text }]}>
                  {item.amount}
                </Text>
                <Text style={styles.itemAmountCoins}>{item.amountCoins}</Text>
              </View>
            </View>
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
  tabsRow: { flexDirection: "row", gap: tapCashTheme.spacing.lg, marginBottom: tapCashTheme.spacing.sm, borderBottomWidth: 1, borderBottomColor: tapCashTheme.colors.line },
  tab: { paddingBottom: 10, position: "relative" },
  tabText: { color: tapCashTheme.colors.dim, fontSize: tapCashTheme.font.xs, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 },
  tabTextActive: { color: tapCashTheme.colors.text },
  tabUnderline: { position: "absolute", left: 0, right: 0, bottom: -1, height: 2, borderRadius: 1, backgroundColor: tapCashTheme.colors.accent },
  list: {},
  row: { flexDirection: "row", alignItems: "center", gap: tapCashTheme.spacing.sm, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: tapCashTheme.colors.line },
  rowLast: { borderBottomWidth: 0 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  rowInfo: { flex: 1, minWidth: 0 },
  itemName: { color: tapCashTheme.colors.text, fontSize: 15, fontWeight: "700", textTransform: "capitalize" },
  itemMeta: { color: tapCashTheme.colors.dim, fontSize: tapCashTheme.font.xs, marginTop: 2, textTransform: "capitalize" },
  itemAmountCol: { alignItems: "flex-end" },
  itemAmount: { fontSize: 15, fontWeight: "800", fontVariant: ["tabular-nums"] },
  itemAmountCoins: { fontSize: 11, fontWeight: "600", color: tapCashTheme.colors.dim, marginTop: 2, fontVariant: ["tabular-nums"] },
  emptyState: { alignItems: "center", justifyContent: "center", marginTop: tapCashTheme.spacing.xl, paddingHorizontal: tapCashTheme.spacing.md },
  emptyText: { color: tapCashTheme.colors.muted, fontSize: tapCashTheme.font.md, textAlign: "center", marginTop: tapCashTheme.spacing.md, marginBottom: tapCashTheme.spacing.md },
  browseBtn: {
    backgroundColor: tapCashTheme.colors.accent,
    paddingHorizontal: tapCashTheme.spacing.lg,
    paddingVertical: tapCashTheme.spacing.sm,
    borderRadius: tapCashTheme.radius.lg,
    marginTop: tapCashTheme.spacing.sm,
  },
  browseBtnText: {
    color: tapCashTheme.colors.background,
    fontSize: tapCashTheme.font.md,
    fontWeight: "800",
  },
});
