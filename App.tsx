import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LoginPage, User } from "./components/LoginPage";
import { Header } from "./components/Header";
import { ItemFilters } from "./components/ItemFilters";
import { ItemCard, FoodItem } from "./components/ItemCard";
import { ItemDetailModal } from "./components/ItemDetailModal";
import { AddItemModal } from "./components/AddItemModal";
import { EditItemModal } from "./components/EditItemModal";
import { ChatModal } from "./components/ChatModal";
import { ProfilePage } from "./components/ProfilePage";
import { AdminPanel } from "./components/AdminPanel";
import { MessagesPanel } from "./components/MessagesPanel";
import { FloatingMessageNotification } from "./components/FloatingMessageNotification";
import { MessageModal } from "./components/MessageModal";
import { itemsAPI, authAPI, getAuthToken, setAuthToken } from "./utils/api";
import { showToast } from "./components/Toast";
import { colors, spacing, borderRadius } from "./utils/theme";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<"items" | "profile" | "admin" | "messages">("items");
  const [items, setItems] = useState<FoodItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [dietary, setDietary] = useState("all");
  const [showMyItemsOnly, setShowMyItemsOnly] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);

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
        // If session check fails (401 = expired/invalid token), silently clear it
        // This is expected behavior when the app starts with an old token
        console.log("No valid session found, clearing stored token");
        // Clear the invalid token locally (don't make API call)
        await setAuthToken(null);
      }
    }
  };

  const loadItems = async () => {
    try {
      setIsLoadingItems(true);
      console.log("📦 Loading all food items from server...");
      const result = await itemsAPI.getAll();
      console.log(`📦 Received ${result.items?.length || 0} items from server`);
      
      const validItems = (result.items || []).filter(
        (item: any) => item && item.id && item.title
      );
      console.log(`📦 Valid items after filtering: ${validItems.length}`);
      console.log("📦 Items:", validItems.map((i: any) => ({ id: i.id, title: i.title, userId: i.userId })));
      
      setItems(validItems);
    } catch (error) {
      console.error("❌ Error loading items:", error);
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
    console.log(`👤 User logged in: ${loggedInUser.name} (ID: ${loggedInUser.id})`);
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

  const handleViewAdmin = useCallback(() => {
    setView("admin");
  }, []);

  const handleBackToItems = useCallback(() => {
    setView("items");
  }, []);

  const handleViewMessages = useCallback(() => {
    setView("messages");
  }, []);

  const handleAddItem = useCallback(async (newItem: Omit<FoodItem, "id" | "userId">) => {
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
    setChatModalOpen(true);
  }, []);

  const handleItemClick = useCallback((item: FoodItem) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  }, []);

  const handleEditItem = useCallback((item: FoodItem) => {
    setEditingItem(item);
    setEditModalOpen(true);
  }, []);

  const handleSaveEdit = useCallback(async (id: string, updates: Partial<FoodItem>) => {
    try {
      const result = await itemsAPI.update(id, updates);
      setItems((prev) => prev.map((item) => (item.id === id ? result.item : item)));
      setEditModalOpen(false);
      showToast("Item updated successfully!", "success");
    } catch (error) {
      console.error("Error updating item:", error);
      showToast("Failed to update item", "error");
    }
  }, []);

  const handleDeleteItem = useCallback(async (itemId: string) => {
    try {
      await itemsAPI.delete(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      showToast("Item deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting item:", error);
      showToast("Failed to delete item", "error");
    }
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
    const matchesOwner = !showMyItemsOnly || (item.userId === user?.id);
    return matchesSearch && matchesCategory && matchesDietary && matchesOwner;
  });

  // Log filter results for debugging
  console.log(`🔍 Filtering: ${items.length} total items → ${filteredItems.length} after filters`);
  console.log(`🔍 Filters: MyItemsOnly=${showMyItemsOnly}, Category=${category}, Dietary=${dietary}, Search="${searchQuery}"`);

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
          onViewAdmin={handleViewAdmin}
          onLogout={handleLogout}
        />

        {view === "profile" ? (
          <ProfilePage user={user} onBackToItems={handleBackToItems} />
        ) : view === "admin" ? (
          <ScrollView style={styles.scrollView}>
            <AdminPanel currentUser={user} />
          </ScrollView>
        ) : view === "messages" ? (
          <MessagesPanel currentUserId={user.id} />
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
                showMyItemsOnly={showMyItemsOnly}
                onShowMyItemsOnlyChange={setShowMyItemsOnly}
              />

              {isLoadingItems ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading food items...</Text>
                </View>
              ) : filteredItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>🍎</Text>
                  <Text style={styles.emptyTitle}>No Items Found</Text>
                  <Text style={styles.emptyText}>
                    {showMyItemsOnly
                      ? "You haven't shared any food items yet.\nTap the + button to share!"
                      : items.length === 0
                      ? "No food items available yet.\nBe the first to share!"
                      : "No items match your filters.\nTry adjusting your search or filters."}
                  </Text>
                  {showMyItemsOnly && (
                    <Text style={styles.emptyHint}>
                      💡 Turn off "My Items Only" to see community items
                    </Text>
                  )}
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

        <EditItemModal
          visible={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onEditItem={handleSaveEdit}
          item={editingItem}
        />

        <ItemDetailModal
          visible={detailModalOpen}
          item={selectedItem}
          onClose={() => setDetailModalOpen(false)}
          onClaim={handleClaimItem}
          onMessage={handleMessage}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          currentUserId={user?.id}
          isAdmin={user?.isAdmin || false}
        />

        <MessageModal
          visible={messageModalOpen}
          onClose={() => setMessageModalOpen(false)}
          itemTitle={selectedItem?.title || ""}
          recipientName={selectedItem?.contactName || ""}
          itemId={selectedItem?.id}
          recipientId={(selectedItem as any)?.userId}
        />

        <ChatModal
          visible={chatModalOpen}
          onClose={() => setChatModalOpen(false)}
          itemId={selectedItem?.id || ""}
          itemTitle={selectedItem?.title || ""}
          currentUserId={user?.id || ""}
          otherUserId={(selectedItem as any)?.userId || ""}
          otherUserName={selectedItem?.contactName || ""}
        />

        {/* Floating Message Notification - Only show on items view */}
        {view === "items" && user && (
          <FloatingMessageNotification currentUserId={user.id} />
        )}
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
    gap: spacing.md,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as any,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  emptyText: {
    color: colors.mutedForeground,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    lineHeight: 22,
  },
  emptyHint: {
    color: colors.primary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    fontSize: 14,
  },
  itemsList: {
    gap: spacing.lg,
  },
});
