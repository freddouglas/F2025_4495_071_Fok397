import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
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
import { spacing } from "./utils/theme";

function AppContent() {
  const { colors, isDark } = useTheme();
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
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);

  useEffect(() => {
    checkSession();
  }, []);

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
        console.log("No valid session found, clearing stored token");
        await setAuthToken(null);
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

  const handleReviewSubmitted = useCallback(() => {
    // Trigger a refresh of reviews in ProfilePage
    setReviewRefreshTrigger((prev) => prev + 1);
  }, []);

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

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

        <Header
          user={user}
          onAddItem={() => setAddModalOpen(true)}
          onViewProfile={() => setView("profile")}
          onViewAdmin={() => setView("admin")}
          onLogout={handleLogout}
          currentView={view}
          onBackToHome={() => setView("items")}
        />

        {view === "profile" ? (
          <ProfilePage 
            user={user} 
            onBackToItems={() => setView("items")} 
            reviewRefreshTrigger={reviewRefreshTrigger}
          />
        ) : view === "admin" ? (
          <ScrollView style={{ flex: 1 }}>
            <AdminPanel currentUser={user} />
          </ScrollView>
        ) : view === "messages" ? (
          <MessagesPanel currentUserId={user.id} />
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing['2xl'] }}>
              <View style={{ marginBottom: spacing['2xl'] }}>
                <Text style={{ color: colors.mutedForeground }}>
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
                <View style={{ paddingVertical: 64, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={{ color: colors.mutedForeground, marginTop: spacing.lg }}>
                    Loading food items...
                  </Text>
                </View>
              ) : filteredItems.length === 0 ? (
                <View style={{ paddingVertical: 64, alignItems: 'center', gap: spacing.md }}>
                  <Text style={{ fontSize: 48, marginBottom: spacing.sm }}>🍎</Text>
                  <Text style={{ fontSize: 18, fontWeight: '600', color: colors.foreground, marginBottom: spacing.xs }}>
                    No Items Found
                  </Text>
                  <Text style={{ color: colors.mutedForeground, textAlign: 'center', paddingHorizontal: spacing.lg, lineHeight: 22 }}>
                    {showMyItemsOnly
                      ? "You haven't shared any food items yet.\nTap the + button to share!"
                      : items.length === 0
                      ? "No food items available yet.\nBe the first to share!"
                      : "No items match your filters.\nTry adjusting your search or filters."}
                  </Text>
                  {showMyItemsOnly && (
                    <Text style={{ color: colors.primary, textAlign: 'center', paddingHorizontal: spacing.lg, marginTop: spacing.sm, fontSize: 14 }}>
                      💡 Turn off "My Items Only" to see community items
                    </Text>
                  )}
                </View>
              ) : (
                <View style={{ gap: spacing.lg }}>
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
          user={user!}
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
          onReviewSubmitted={handleReviewSubmitted}
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

        {view === "items" && user && (
          <FloatingMessageNotification currentUserId={user.id} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}