import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LoginPage, User } from "./components/LoginPage";
import { Header } from "./components/Header";
import { ItemFilters } from "./components/ItemFilters";
import { ItemCard, FoodItem } from "./components/ItemCard";
import { ItemDetailModal } from "./components/ItemDetailModal";
import { AddItemModal } from "./components/AddItemModal";
import { ProfilePage } from "./components/ProfilePage";
import { MessageModal } from "./components/MessageModal";
import { itemsAPI, authAPI, getAuthToken } from "./utils/api";
import { showToast } from "./components/Toast";
import { colors, spacing } from "./utils/theme";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<"items" | "profile">("items");
  const [items, setItems] = useState<FoodItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [dietary, setDietary] = useState("all");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Load items when user logs in
  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user]);

  const checkSession = async () => {
    const token = await getAuthToken();
    if (token) {
      try {
        const result = await authAPI.getSession();
        if (result.user) {
          setUser(result.user);
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    }
  };

  const loadItems = async () => {
    try {
      setIsLoadingItems(true);
      const result = await itemsAPI.getAll();
      const validItems = (result.items || []).filter(
        (item: any) => item && item.id && item.title
      );
      setItems(validItems);
    } catch (error) {
      console.error("Error loading items:", error);
      showToast("Failed to load food items", "error");
      setItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  }, []);

  const handleLogin = useCallback((loggedInUser: User) => {
    setUser(loggedInUser);
    showToast(`Welcome back, ${loggedInUser.name}!`, "success");
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await authAPI.signout();
      setUser(null);
      setView("items");
      setItems([]);
      showToast("Logged out successfully", "success");
    } catch (error) {
      console.error("Logout error:", error);
      showToast("Failed to logout", "error");
    }
  }, []);

  const handleViewProfile = useCallback(() => {
    setView("profile");
  }, []);

  const handleBackToItems = useCallback(() => {
    setView("items");
  }, []);

  const handleAddItem = useCallback(async (newItem: Omit<FoodItem, "id">) => {
    try {
      const result = await itemsAPI.create(newItem);
      setItems((prev) => [result.item, ...prev]);
      showToast("Food item shared successfully!", "success");
    } catch (error) {
      console.error("Error adding item:", error);
      showToast("Failed to share food item", "error");
    }
  }, []);

  const handleClaimItem = useCallback(
    async (itemId: string) => {
      try {
        if (!user) return;

        const result = await itemsAPI.update(itemId, {
          status: "reserved",
          claimedBy: user.id,
        });

        setItems((prev) => prev.map((item) => (item.id === itemId ? result.item : item)));
        setDetailModalOpen(false);
        showToast("Food reserved successfully!", "success");

        // Refresh user profile
        const session = await authAPI.getSession();
        if (session.user) {
          setUser(session.user);
        }
      } catch (error) {
        console.error("Error claiming item:", error);
        showToast("Failed to reserve food item", "error");
      }
    },
    [user]
  );

  const handleMessage = useCallback(() => {
    setDetailModalOpen(false);
    setMessageModalOpen(true);
  }, []);

  const handleItemClick = useCallback((item: FoodItem) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  }, []);

  // Filter items
  const filteredItems = items.filter((item) => {
    if (!item || !item.title) return false;

    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "all" || item.category === category;
    const matchesDietary =
      dietary === "all" ||
      (item.dietaryTags &&
        item.dietaryTags.some((tag) => tag.toLowerCase().replace(" ", "-") === dietary));
    return matchesSearch && matchesCategory && matchesDietary;
  });

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        <Header
          user={user}
          onAddItem={() => setAddModalOpen(true)}
          onViewProfile={handleViewProfile}
          onLogout={handleLogout}
        />

        {view === "profile" ? (
          <ProfilePage user={user} onBackToItems={handleBackToItems} />
        ) : (
          <ScrollView
            style={styles.scrollView}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <View style={styles.content}>
              <View style={styles.description}>
                <Text style={styles.descriptionText}>
                  Share surplus food with your community and help reduce waste. Browse available
                  items or share your own.
                </Text>
              </View>

              <ItemFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                category={category}
                onCategoryChange={setCategory}
                dietary={dietary}
                onDietaryChange={setDietary}
              />

              {isLoadingItems ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading food items...</Text>
                </View>
              ) : filteredItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No food items found. Try adjusting your filters or be the first to share!
                  </Text>
                </View>
              ) : (
                <View style={styles.itemsList}>
                  {filteredItems.map((item) => (
                    <ItemCard key={item.id} item={item} onPress={() => handleItemClick(item)} />
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        )}

        <AddItemModal
          visible={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onAddItem={handleAddItem}
        />

        <ItemDetailModal
          visible={detailModalOpen}
          item={selectedItem}
          onClose={() => setDetailModalOpen(false)}
          onClaim={handleClaimItem}
          onMessage={handleMessage}
        />

        <MessageModal
          visible={messageModalOpen}
          onClose={() => setMessageModalOpen(false)}
          itemTitle={selectedItem?.title || ""}
          recipientName={selectedItem?.contactName || ""}
          itemId={selectedItem?.id}
          recipientId={(selectedItem as any)?.userId}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['2xl'],
  },
  description: {
    marginBottom: spacing['2xl'],
  },
  descriptionText: {
    color: colors.mutedForeground,
  },
  loadingContainer: {
    paddingVertical: 64,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.mutedForeground,
    marginTop: spacing.lg,
  },
  emptyContainer: {
    paddingVertical: 64,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.mutedForeground,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  itemsList: {
    gap: spacing.lg,
  },
});
