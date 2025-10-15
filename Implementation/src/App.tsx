import { useState, useMemo, useCallback, useEffect } from "react";
import { Header } from "./components/Header";
import { ItemFilters } from "./components/ItemFilters";
import { ItemCard, type FoodItem } from "./components/ItemCard";
import { AddItemDialog } from "./components/AddItemDialog";
import { ItemDetailDialog } from "./components/ItemDetailDialog";
import { MessageDialog } from "./components/MessageDialog";
import { LoginPage, User } from "./components/LoginPage";
import { ProfilePage } from "./components/ProfilePage";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import { Button } from "./components/ui/button";
import { ArrowLeft } from "lucide-react";
import { itemsAPI, authAPI, getAuthToken } from "./utils/api";

// Mock data
const initialItems: FoodItem[] = [
  {
    id: "1",
    title: "Fresh Organic Vegetables",
    description: "Assortment of fresh organic vegetables from my garden including tomatoes, cucumbers, and bell peppers. All freshly picked this morning!",
    category: "produce",
    location: "Downtown, 5th Avenue",
    expiryDate: "2025-10-06",
    quantity: "3 lbs",
    imageUrl: "https://images.unsplash.com/photo-1579113800032-c38bd7635818?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHZlZ2V0YWJsZXN8ZW58MXx8fHwxNzU5NTYzOTUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    contactName: "Sarah Green",
    contactEmail: "sarah.g@email.com",
    dietaryTags: ["Vegan", "Gluten Free"],
    status: "available",
    pickupInstructions: "Available after 4pm. Ring doorbell at apartment 3B.",
  },
  {
    id: "2",
    title: "Homemade Sourdough Bread",
    description: "Two loaves of freshly baked sourdough bread. Made this morning but I have extra. Perfect for sandwiches or toast!",
    category: "bakery",
    expiryDate: "2025-10-05",
    quantity: "2 loaves",
    location: "Westside, Maple Street",
    imageUrl: "https://images.unsplash.com/photo-1679673987713-54f809ce417d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVhZCUyMGJha2VyeXxlbnwxfHx8fDE3NTk1OTA2Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    contactName: "Michael Baker",
    contactEmail: "m.baker@email.com",
    dietaryTags: ["Vegetarian"],
    status: "available",
    pickupInstructions: "Leave a note if I'm not home, bread will be in cooler by front door.",
  },
  {
    id: "3",
    title: "Mixed Fresh Fruit Bowl",
    description: "Fresh seasonal fruits including apples, oranges, and bananas. Bought too much for the week. All organic and in great condition.",
    category: "produce",
    location: "East Village, Park Avenue",
    expiryDate: "2025-10-07",
    quantity: "4 lbs",
    imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGZydWl0fGVufDF8fHx8MTc1OTU5MzQwN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    contactName: "Emily Chen",
    contactEmail: "emily.c@email.com",
    dietaryTags: ["Vegan", "Gluten Free"],
    status: "available",
  },
  {
    id: "4",
    title: "Vegetarian Lasagna",
    description: "Large tray of homemade vegetarian lasagna. Made too much for dinner. Contains cheese, pasta, and vegetables. Ready to heat and eat!",
    category: "prepared",
    location: "Northside, Oak Street",
    expiryDate: "2025-10-05",
    quantity: "8 servings",
    imageUrl: "https://images.unsplash.com/photo-1625937751876-4515cd8e78bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVwYXJlZCUyMG1lYWx8ZW58MXx8fHwxNzU5NjAwNTQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    contactName: "David Martinez",
    contactEmail: "d.martinez@email.com",
    dietaryTags: ["Vegetarian"],
    status: "reserved",
    pickupInstructions: "Please bring a container. Available between 5-7pm.",
  },
  {
    id: "5",
    title: "Dairy Products - Milk & Yogurt",
    description: "Unopened organic whole milk and Greek yogurt. Going on vacation and won't be able to use before expiry.",
    category: "dairy",
    location: "Central District, Main Street",
    expiryDate: "2025-10-08",
    quantity: "1 gallon milk, 4 yogurt cups",
    imageUrl: "https://images.unsplash.com/photo-1634141510639-d691d86f47be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYWlyeSUyMHByb2R1Y3RzfGVufDF8fHx8MTc1OTU2Mzk1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    contactName: "Lisa Anderson",
    contactEmail: "lisa.a@email.com",
    dietaryTags: ["Vegetarian", "Gluten Free"],
    status: "available",
  },
  {
    id: "6",
    title: "Canned Goods & Pasta",
    description: "Various unopened canned goods (beans, tomatoes, soup) and dry pasta. Clearing out pantry before moving.",
    category: "pantry",
    location: "Southside, Elm Avenue",
    expiryDate: "2026-03-15",
    quantity: "12 cans, 5 pasta boxes",
    imageUrl: "https://images.unsplash.com/photo-1576325782957-363cfe40a6d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYW50cnklMjBmb29kfGVufDF8fHx8MTc1OTYwMDU0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    contactName: "Robert Wilson",
    contactEmail: "r.wilson@email.com",
    dietaryTags: ["Vegan"],
    status: "available",
    pickupInstructions: "Available all day Saturday. Call before coming.",
  },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<"items" | "profile">("items");
  const [items, setItems] = useState<FoodItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [dietary, setDietary] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const result = await authAPI.getSession();
          if (result.user) {
            setUser(result.user);
          }
        } catch (error) {
          console.error("Session check error:", error);
          // Clear invalid token
          localStorage.removeItem("auth_token");
        }
      }
    };
    checkSession();
  }, []);

  // Load items when user logs in
  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user]);

  const loadItems = async () => {
    try {
      setIsLoadingItems(true);
      const result = await itemsAPI.getAll();
      // Filter out any null or invalid items
      const validItems = (result.items || []).filter(
        (item: any) => item && item.id && item.title
      );
      setItems(validItems);
    } catch (error) {
      console.error("Error loading items:", error);
      toast.error("Failed to load food items");
      setItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleLogin = useCallback((loggedInUser: User) => {
    setUser(loggedInUser);
    toast.success(`Welcome back, ${loggedInUser.name}!`);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await authAPI.signout();
      setUser(null);
      setView("items");
      setItems([]);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
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
      toast.success("Food item shared successfully!");
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to share food item");
    }
  }, []);

  const handleClaimItem = useCallback(async (itemId: string) => {
    try {
      if (!user) return;
      
      const result = await itemsAPI.update(itemId, {
        status: "reserved",
        claimedBy: user.id,
      });
      
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? result.item : item
        )
      );
      setDetailDialogOpen(false);
      toast.success("Food reserved successfully!");
      
      // Refresh user profile to update itemsClaimed count
      const session = await authAPI.getSession();
      if (session.user) {
        setUser(session.user);
      }
    } catch (error) {
      console.error("Error claiming item:", error);
      toast.error("Failed to reserve food item");
    }
  }, [user]);

  const handleMessage = useCallback(() => {
    setDetailDialogOpen(false);
    setMessageDialogOpen(true);
  }, []);

  const handleItemClick = useCallback((item: FoodItem) => {
    setSelectedItem(item);
    setDetailDialogOpen(true);
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Safety check for null/undefined items
      if (!item || !item.title) return false;
      
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = category === "all" || item.category === category;
      const matchesDietary =
        dietary === "all" ||
        (item.dietaryTags && item.dietaryTags.some(
          (tag) => tag.toLowerCase().replace(" ", "-") === dietary
        ));
      return matchesSearch && matchesCategory && matchesDietary;
    });
  }, [items, searchQuery, category, dietary]);

  // Show login page if not authenticated
  if (!user) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onAddItem={() => setAddDialogOpen(true)}
        user={user}
        onViewProfile={handleViewProfile}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {view === "profile" ? (
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={handleBackToItems}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Items
            </Button>
            <ProfilePage user={user} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Share surplus food with your community and help reduce waste.
                Browse available items or share your own.
              </p>
            </div>

            <ItemFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              category={category}
              onCategoryChange={setCategory}
              dietary={dietary}
              onDietaryChange={setDietary}
            />

            {isLoadingItems ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">Loading food items...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  No food items found. Try adjusting your filters or be the
                  first to share!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClick={() => handleItemClick(item)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <AddItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAddItem={handleAddItem}
      />

      <ItemDetailDialog
        item={selectedItem}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onClaim={handleClaimItem}
        onMessage={handleMessage}
      />

      <MessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
        itemTitle={selectedItem?.title || ""}
        recipientName={selectedItem?.contactName || ""}
        itemId={selectedItem?.id}
        recipientId={(selectedItem as any)?.userId}
      />

      <Toaster />
    </div>
  );
}
