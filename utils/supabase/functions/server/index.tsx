// @ts-nocheck - This file runs in Deno environment on Supabase, not in VSCode
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", logger(console.log));

// Initialize Supabase client
const getSupabaseClient = (accessToken?: string) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = accessToken
    ? Deno.env.get("SUPABASE_ANON_KEY")!
    : Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  });
};

// Storage bucket name
const bucketName = "make-089874b4-food-images";

// Initialize storage bucket
const initStorage = async () => {
  const supabase = getSupabaseClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
  
  if (!bucketExists) {
    await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
    });
    console.log(`Created storage bucket: ${bucketName}`);
  }
};

// Auth helper
const getUserFromToken = async (authHeader: string | null) => {
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  if (!token) return null;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
};

// ==================== AUTH ROUTES ====================

app.post("/make-server-089874b4/auth/signup", async (c) => {
  try {
    const { email, password, name, location } = await c.req.json();

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, location },
      email_confirm: true, // Auto-confirm since email server not configured
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Create user profile in KV store
    const userId = data.user.id;
    
    // Check if user is admin (specific email)
    const ADMIN_EMAIL = "admin@foodshare.com";
    const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    
    const userProfile = {
      id: userId,
      name,
      email,
      location,
      joinDate: new Date().toISOString(),
      bio: "",
      rating: 0,
      totalReviews: 0,
      itemsShared: 0,
      itemsClaimed: 0,
      isAdmin: isAdmin,
    };

    await kv.set(`user:${userId}`, userProfile);

    return c.json({ user: userProfile });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: "Failed to create account" }, 500);
  }
});

app.post("/make-server-089874b4/auth/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`Signin error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    const userId = data.user.id;
    let userProfile = await kv.get(`user:${userId}`);
    
    // Check if user is admin and update if not already set
    const ADMIN_EMAIL = "admin@foodshare.com";
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && !userProfile.isAdmin) {
      userProfile.isAdmin = true;
      await kv.set(`user:${userId}`, userProfile);
    }

    return c.json({
      access_token: data.session.access_token,
      user: userProfile,
    });
  } catch (error) {
    console.log(`Signin error: ${error}`);
    return c.json({ error: "Failed to sign in" }, 500);
  }
});

app.post("/make-server-089874b4/auth/signout", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const token = authHeader?.split(" ")[1];

    if (token) {
      const supabase = getSupabaseClient(token);
      await supabase.auth.signOut();
    }

    return c.json({ success: true });
  } catch (error) {
    console.log(`Signout error: ${error}`);
    return c.json({ error: "Failed to sign out" }, 500);
  }
});

app.get("/make-server-089874b4/auth/session", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUserFromToken(authHeader);

    if (!user) {
      return c.json({ session: null }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    return c.json({ user: userProfile });
  } catch (error) {
    console.log(`Session error: ${error}`);
    return c.json({ error: "Failed to get session" }, 500);
  }
});

// ==================== ITEMS ROUTES ====================

app.get("/make-server-089874b4/items", async (c) => {
  try {
    console.log("📦 GET /items - Fetching all items from KV store...");
    const items = await kv.getByPrefix("item:");
    console.log(`📦 KV Store returned ${items.length} raw items`);
    
    // kv.getByPrefix already returns just the values, so no need to map
    const itemsList = items.filter((item) => item !== null && item !== undefined && item.id);
    
    console.log(`📦 After filtering: ${itemsList.length} valid items`);
    if (itemsList.length > 0) {
      console.log(`📦 Sample items:`, itemsList.slice(0, 3).map((i: any) => ({
        id: i.id,
        title: i.title,
        userId: i.userId
      })));
    }
    
    // Sort by creation date, newest first
    itemsList.sort((a: any, b: any) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    return c.json({ items: itemsList });
  } catch (error) {
    console.log(`❌ Get items error: ${error}`);
    return c.json({ error: "Failed to fetch items" }, 500);
  }
});

app.post("/make-server-089874b4/items", async (c) => {
  try {
    console.log("✨ POST /items - Creating new item...");
    const authHeader = c.req.header("Authorization");
    const user = await getUserFromToken(authHeader);

    if (!user) {
      console.log("❌ Unauthorized - no valid user token");
      return c.json({ error: "Unauthorized" }, 401);
    }

    console.log(`✨ User authenticated: ${user.name} (ID: ${user.id})`);
    const itemData = await c.req.json();
    const itemId = `${Date.now()}_${user.id}`;
    
    const item = {
      ...itemData,
      id: itemId,
      userId: user.id,
      createdAt: new Date().toISOString(),
      status: "available",
    };

    console.log(`✨ Saving item to KV: item:${itemId}`);
    console.log(`✨ Item data:`, { id: item.id, title: item.title, userId: item.userId });
    await kv.set(`item:${itemId}`, item);
    console.log(`✅ Item saved successfully!`);

    // Update user's items shared count
    const userProfile: any = await kv.get(`user:${user.id}`);
    if (userProfile) {
      userProfile.itemsShared = (userProfile.itemsShared || 0) + 1;
      await kv.set(`user:${user.id}`, userProfile);
      console.log(`✅ Updated user profile - items shared: ${userProfile.itemsShared}`);
    }

    return c.json({ item });
  } catch (error) {
    console.log(`❌ Create item error: ${error}`);
    return c.json({ error: "Failed to create item" }, 500);
  }
});

app.patch("/make-server-089874b4/items/:id", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUserFromToken(authHeader);

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const itemId = c.req.param("id");
    const updates = await c.req.json();

    const item: any = await kv.get(`item:${itemId}`);
    if (!item) {
      return c.json({ error: "Item not found" }, 404);
    }

    // Get user profile to check admin status
    const userProfile = await kv.get(`user:${user.id}`);
    const isAdmin = userProfile?.isAdmin || false;
    
    // Check if this is a claim/reserve action
    const isClaimAction = updates.status === "reserved" && updates.claimedBy;
    
    // Check if this is an edit action (owner or admin editing item)
    const isEditAction = !isClaimAction && (item.userId === user.id || isAdmin);

    // ADMIN PRIVILEGE: Admins can edit ANY item regardless of status or ownership
    // OWNER PRIVILEGE: Owners can edit their own items if not reserved
    // CLAIM PRIVILEGE: Anyone can claim (reserve) an available item
    if (!isClaimAction && !isEditAction) {
      return c.json({ error: "You can only edit your own items" }, 403);
    }

    // Prevent editing if item is already reserved (unless it's the claim action itself or admin)
    // ADMIN OVERRIDE: Admins can edit even reserved items
    if (!isClaimAction && item.status === "reserved" && !isAdmin) {
      return c.json({ error: "Cannot edit reserved items" }, 403);
    }

    const updatedItem = { ...item, ...updates };
    await kv.set(`item:${itemId}`, updatedItem);

    // If item was claimed, update claimer's count
    if (isClaimAction && updates.claimedBy === user.id) {
      const userProfile: any = await kv.get(`user:${user.id}`);
      if (userProfile) {
        userProfile.itemsClaimed = (userProfile.itemsClaimed || 0) + 1;
        await kv.set(`user:${user.id}`, userProfile);
      }
    }

    console.log(`✅ Item ${itemId} updated successfully by user ${user.id}`);
    return c.json({ item: updatedItem });
  } catch (error) {
    console.log(`❌ Update item error: ${error}`);
    return c.json({ error: "Failed to update item" }, 500);
  }
});

app.delete("/make-server-089874b4/items/:id", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUserFromToken(authHeader);

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const itemId = c.req.param("id");
    const item: any = await kv.get(`item:${itemId}`);

    if (!item) {
      return c.json({ error: "Item not found" }, 404);
    }

    // Get user profile to check admin status
    const userProfile = await kv.get(`user:${user.id}`);
    const isAdmin = userProfile?.isAdmin || false;

    // ADMIN PRIVILEGE: Admins can delete ANY item regardless of status or ownership
    // OWNER PRIVILEGE: Owners can delete their own items regardless of status
    if (item.userId !== user.id && !isAdmin) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await kv.del(`item:${itemId}`);
    console.log(`🗑️ Item ${itemId} deleted by ${isAdmin ? 'admin' : 'owner'} ${user.id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Delete item error: ${error}`);
    return c.json({ error: "Failed to delete item" }, 500);
  }
});

// ==================== PROFILE ROUTES ====================

app.get("/make-server-089874b4/users", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUserFromToken(authHeader);

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get current user's profile to check admin status
    const currentUserProfile = await kv.get(`user:${user.id}`);
    const isAdmin = currentUserProfile?.isAdmin || false;

    // Only admins can list all users
    if (!isAdmin) {
      return c.json({ error: "Forbidden - Admin access required" }, 403);
    }

    const users = await kv.getByPrefix("user:");
    const usersList = users.filter((u) => u !== null && u !== undefined && u.id);
    
    // Sort by join date, newest first
    usersList.sort((a: any, b: any) => 
      new Date(b.joinDate || 0).getTime() - new Date(a.joinDate || 0).getTime()
    );

    return c.json({ users: usersList });
  } catch (error) {
    console.log(`Get users error: ${error}`);
    return c.json({ error: "Failed to fetch users" }, 500);
  }
});

app.get("/make-server-089874b4/profile/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const userProfile = await kv.get(`user:${userId}`);

    if (!userProfile) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ user: userProfile });
  } catch (error) {
    console.log(`Get profile error: ${error}`);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

app.patch("/make-server-089874b4/profile", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUserFromToken(authHeader);

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const updates = await c.req.json();
    const userProfile: any = await kv.get(`user:${user.id}`);

    if (!userProfile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    const updatedProfile = { ...userProfile, ...updates };
    await kv.set(`user:${user.id}`, updatedProfile);

    return c.json({ user: updatedProfile });
  } catch (error) {
    console.log(`Update profile error: ${error}`);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

app.delete("/make-server-089874b4/users/:userId", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUserFromToken(authHeader);

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get current user's profile to check admin status
    const currentUserProfile = await kv.get(`user:${user.id}`);
    const isAdmin = currentUserProfile?.isAdmin || false;

    // Only admins can delete users
    if (!isAdmin) {
      return c.json({ error: "Forbidden - Admin access required" }, 403);
    }

    const targetUserId = c.req.param("userId");

    // Prevent admin from deleting themselves
    if (targetUserId === user.id) {
      return c.json({ error: "Cannot delete your own account" }, 400);
    }

    // Get target user profile
    const targetUserProfile = await kv.get(`user:${targetUserId}`);
    if (!targetUserProfile) {
      return c.json({ error: "User not found" }, 404);
    }

    // Delete user from Supabase Auth
    const supabase = getSupabaseClient();
    const { error: authError } = await supabase.auth.admin.deleteUser(targetUserId);
    
    if (authError) {
      console.log(`Failed to delete user from auth: ${authError.message}`);
      // Continue anyway to clean up KV store
    }

    // Delete user profile from KV store
    await kv.del(`user:${targetUserId}`);

    // Delete all items owned by this user
    const allItems = await kv.getByPrefix("item:");
    const userItems = allItems.filter((item: any) => item?.userId === targetUserId);
    
    for (const item of userItems) {
      if (item?.id) {
        await kv.del(`item:${item.id}`);
      }
    }

    // Delete all reviews by this user
    const allReviews = await kv.getByPrefix("review:");
    const userReviews = allReviews.filter((review: any) => review?.reviewerId === targetUserId);
    
    for (const review of userReviews) {
      if (review?.id) {
        await kv.del(`review:${review.reviewedUserId}:${review.id}`);
      }
    }

    // Delete all messages involving this user
    const allMessages = await kv.getByPrefix("message:");
    const userMessages = allMessages.filter((msg: any) => 
      msg?.senderId === targetUserId || msg?.receiverId === targetUserId
    );
    
    for (const msg of userMessages) {
      if (msg?.id) {
        await kv.del(`message:${msg.id}`);
      }
    }

    console.log(`🗑️ User ${targetUserId} deleted by admin ${user.id}`);
    console.log(`   - Deleted ${userItems.length} items`);
    console.log(`   - Deleted ${userReviews.length} reviews`);
    console.log(`   - Deleted ${userMessages.length} messages`);

    return c.json({ 
      success: true,
      deletedUser: targetUserProfile.name,
      itemsDeleted: userItems.length,
      reviewsDeleted: userReviews.length,
      messagesDeleted: userMessages.length,
    });
  } catch (error) {
    console.log(`Delete user error: ${error}`);
    return c.json({ error: "Failed to delete user" }, 500);
  }
});

// ==================== REVIEW ROUTES ====================

app.get("/make-server-089874b4/reviews/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const reviews = await kv.getByPrefix(`review:${userId}:`);
    // kv.getByPrefix already returns just the values, no need for .map(review => review.value)
    const reviewsList = reviews.filter((review: any) => review != null && typeof review === 'object');

    // Sort by date, newest first
    reviewsList.sort((a: any, b: any) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return c.json({ reviews: reviewsList });
  } catch (error) {
    console.log(`Get reviews error: ${error}`);
    return c.json({ error: "Failed to fetch reviews" }, 500);
  }
});

app.post("/make-server-089874b4/reviews", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUserFromToken(authHeader);

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const reviewData = await c.req.json();
    const reviewId = `${Date.now()}_${user.id}`;
    
    const review = {
      ...reviewData,
      id: reviewId,
      reviewerId: user.id,
      date: new Date().toISOString(),
    };

    // Store review with recipient's userId as prefix for easy querying
    await kv.set(`review:${reviewData.recipientId}:${reviewId}`, review);

    // Update recipient's rating
    const recipientProfile: any = await kv.get(`user:${reviewData.recipientId}`);
    if (recipientProfile) {
      const totalReviews = (recipientProfile.totalReviews || 0) + 1;
      const currentTotal = (recipientProfile.rating || 0) * (recipientProfile.totalReviews || 0);
      const newRating = (currentTotal + reviewData.rating) / totalReviews;
      
      recipientProfile.rating = newRating;
      recipientProfile.totalReviews = totalReviews;
      await kv.set(`user:${reviewData.recipientId}`, recipientProfile);
    }

    return c.json({ review });
  } catch (error) {
    console.log(`Create review error: ${error}`);
    return c.json({ error: "Failed to create review" }, 500);
  }
});

// ==================== IMAGE UPLOAD ROUTES ====================

app.post("/make-server-089874b4/upload-image", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUserFromToken(authHeader);

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: "Invalid file type. Only images are allowed." }, 400);
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: "File too large. Maximum size is 5MB." }, 400);
    }

    const supabase = getSupabaseClient();
    
    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.log(`Upload error: ${error.message}`);
      return c.json({ error: "Failed to upload image" }, 500);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return c.json({ url: publicUrl });
  } catch (error) {
    console.log(`Upload error: ${error}`);
    return c.json({ error: "Failed to upload image" }, 500);
  }
});

// ==================== MESSAGES ROUTES ====================

app.post("/make-server-089874b4/messages", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUserFromToken(authHeader);

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const messageData = await c.req.json();
    const messageId = `${Date.now()}_${user.id}`;
    
    const message = {
      ...messageData,
      id: messageId,
      senderId: user.id,
      createdAt: new Date().toISOString(),
    };

    // Store message with both sender and recipient prefixes for querying
    await kv.set(`message:${messageData.itemId}:${messageId}`, message);

    return c.json({ message });
  } catch (error) {
    console.log(`Send message error: ${error}`);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

app.get("/make-server-089874b4/messages/:itemId", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUserFromToken(authHeader);

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const itemId = c.req.param("itemId");
    const messages = await kv.getByPrefix(`message:${itemId}:`);
    
    // Filter out null/undefined messages and ensure valid structure
    const messagesList = messages
      .filter((msg: any) => msg != null && typeof msg === 'object' && 'senderId' in msg)
      .map((msg: any) => msg);

    // Sort by date, oldest first
    messagesList.sort((a: any, b: any) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Enrich messages with sender names and read status
    const enrichedMessages = await Promise.all(
      messagesList.map(async (msg: any) => {
        const senderProfile = await kv.get(`user:${msg.senderId}`);
        
        // Determine if message is read
        // A message is read if:
        // 1. Current user is the sender (you've read your own messages)
        // 2. Current user is recipient AND has viewed conversation after message was sent
        let isRead = false;
        if (msg.senderId === user.id) {
          isRead = true; // Your own messages are always "read"
        } else if (msg.recipientId === user.id) {
          // Check if recipient has viewed this conversation
          const viewKey = `view:${user.id}:${itemId}:${msg.senderId}`;
          const lastViewed: any = await kv.get(viewKey);
          if (lastViewed && lastViewed.timestamp) {
            isRead = new Date(msg.createdAt) <= new Date(lastViewed.timestamp);
          }
        }
        
        return {
          ...msg,
          senderName: senderProfile?.name || 'Unknown User',
          timestamp: msg.createdAt,
          read: isRead,
        };
      })
    );

    console.log(`Fetched ${enrichedMessages.length} messages for item ${itemId}`);

    return c.json({ messages: enrichedMessages });
  } catch (error) {
    console.log(`Get messages error: ${error}`);
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
});

// Mark messages as read for a conversation
app.post("/make-server-089874b4/messages/mark-read", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUserFromToken(authHeader);

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { itemId, senderId } = await c.req.json();
    
    if (!itemId || !senderId) {
      return c.json({ error: "itemId and senderId are required" }, 400);
    }

    // Store the timestamp when user viewed this conversation
    const viewKey = `view:${user.id}:${itemId}:${senderId}`;
    await kv.set(viewKey, { 
      timestamp: new Date().toISOString(),
      itemId,
      senderId,
      viewedBy: user.id
    });

    console.log(`✅ Marked conversation as read: ${viewKey}`);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Mark messages as read error: ${error}`);
    return c.json({ error: "Failed to mark messages as read" }, 500);
  }
});

// Get all conversations for current user
app.get("/make-server-089874b4/conversations", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUserFromToken(authHeader);

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get all messages
    const allMessages = await kv.getByPrefix("message:");
    
    // Filter messages involving current user
    const userMessages = allMessages.filter((msg: any) => 
      msg != null && 
      typeof msg === 'object' && 
      (msg.senderId === user.id || msg.recipientId === user.id)
    );

    // Group by conversation (item + other user)
    const conversationsMap = new Map();

    for (const msg of userMessages) {
      const otherUserId = msg.senderId === user.id ? msg.recipientId : msg.senderId;
      const conversationKey = `${msg.itemId}:${otherUserId}`;

      if (!conversationsMap.has(conversationKey)) {
        conversationsMap.set(conversationKey, {
          itemId: msg.itemId,
          otherUserId,
          messages: [],
        });
      }

      conversationsMap.get(conversationKey).messages.push(msg);
    }

    // Convert to array and get additional info
    const conversations = [];
    for (const [key, conv] of conversationsMap) {
      // Get item details
      const item = await kv.get(`item:${conv.itemId}`);
      
      // Get other user details
      const otherUser = await kv.get(`user:${conv.otherUserId}`);

      // Sort messages by date
      conv.messages.sort((a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const lastMessage = conv.messages[conv.messages.length - 1];
      const unreadCount = conv.messages.filter(
        (m: any) => m.recipientId === user.id && !m.read
      ).length;

      conversations.push({
        itemId: conv.itemId,
        itemTitle: item?.title || "Deleted Item",
        itemImage: item?.imageUrl || null,
        otherUserId: conv.otherUserId,
        otherUserName: otherUser?.name || "Unknown User",
        lastMessage: lastMessage.message,
        lastMessageTime: lastMessage.createdAt,
        unreadCount,
        messageCount: conv.messages.length,
      });
    }

    // Sort by last message time, newest first
    conversations.sort((a, b) =>
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );

    console.log(`Fetched ${conversations.length} conversations for user ${user.id}`);

    return c.json({ conversations });
  } catch (error) {
    console.log(`Get conversations error: ${error}`);
    return c.json({ error: "Failed to fetch conversations" }, 500);
  }
});

// Initialize storage on startup
initStorage().catch(err => console.error("Storage initialization error:", err));

Deno.serve(app.fetch);
