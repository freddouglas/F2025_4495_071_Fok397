import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { messagesAPI, itemsAPI } from '../utils/api';
import { ChatModal } from './ChatModal';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../utils/theme';

interface ItemConversation {
  itemId: string;
  itemTitle: string;
  itemStatus: string;
  conversations: {
    userId: string;
    userName: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
  }[];
}

interface FloatingMessageNotificationProps {
  currentUserId: string;
}

export function FloatingMessageNotification({ currentUserId }: FloatingMessageNotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [itemConversations, setItemConversations] = useState<ItemConversation[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [selectedChat, setSelectedChat] = useState<{
    itemId: string;
    itemTitle: string;
    otherUserId: string;
    otherUserName: string;
  } | null>(null);

  useEffect(() => {
    fetchDonorMessages();
    // Poll every 30 seconds for new messages
    const interval = setInterval(fetchDonorMessages, 30000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  const fetchDonorMessages = async () => {
    try {
      // Get all items owned by current user
      const { items } = await itemsAPI.getAll();
      const myItems = items.filter((item: any) => item.userId === currentUserId);

      if (myItems.length === 0) {
        setItemConversations([]);
        setTotalUnread(0);
        return;
      }

      // Fetch messages for each item
      const itemConvs: ItemConversation[] = [];
      let unreadTotal = 0;

      for (const item of myItems) {
        try {
          const { messages } = await messagesAPI.getByItem(item.id);
          
          if (!messages || messages.length === 0) continue;

          // Group messages by sender (other user)
          const conversationMap = new Map<string, {
            userId: string;
            userName: string;
            lastMessage: string;
            lastMessageTime: string;
            unreadCount: number;
          }>();

          messages.forEach((msg: any) => {
            // Only include messages FROM others (not messages I sent)
            if (msg.senderId !== currentUserId && msg.senderId && msg.senderName) {
              const existing = conversationMap.get(msg.senderId);
              
              if (!existing || new Date(msg.timestamp) > new Date(existing.lastMessageTime)) {
                conversationMap.set(msg.senderId, {
                  userId: msg.senderId,
                  userName: msg.senderName || 'Unknown User',
                  lastMessage: msg.message || '',
                  lastMessageTime: msg.timestamp,
                  unreadCount: (existing?.unreadCount || 0) + (!msg.read ? 1 : 0),
                });
              } else if (!msg.read) {
                existing.unreadCount++;
              }
            }
          });

          const conversations = Array.from(conversationMap.values());
          const itemUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

          if (conversations.length > 0) {
            itemConvs.push({
              itemId: item.id,
              itemTitle: item.title,
              itemStatus: item.status,
              conversations,
            });
            unreadTotal += itemUnread;
          }
        } catch (error) {
          console.error(`Error fetching messages for item ${item.id}:`, error);
        }
      }

      setItemConversations(itemConvs);
      setTotalUnread(unreadTotal);
    } catch (error) {
      console.error('Error fetching donor messages:', error);
    }
  };

  const handleOpenChat = async (itemId: string, itemTitle: string, otherUserId: string, otherUserName: string) => {
    setSelectedChat({
      itemId,
      itemTitle,
      otherUserId,
      otherUserName,
    });
    setIsOpen(false);
    
    // Mark conversation as read when opened
    try {
      await messagesAPI.markAsRead(itemId, otherUserId);
      // Refresh messages to update unread counts
      fetchDonorMessages();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Floating Button - Always visible */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonIcon}>💬</Text>
        {totalUnread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {totalUnread > 9 ? '9+' : totalUnread}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Message Panel Modal */}
      <Modal
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Text style={styles.headerIcon}>💬</Text>
              <Text style={styles.title}>Inquiries on Your Items</Text>
            </View>
            <Pressable onPress={() => setIsOpen(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollView}>
            <View style={styles.content}>
              {itemConversations.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>💬</Text>
                  <Text style={styles.emptyText}>
                    No inquiries yet on your items
                  </Text>
                </View>
              ) : (
                itemConversations.map((itemConv) => (
                  <View key={itemConv.itemId} style={styles.itemSection}>
                    {/* Item Header */}
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemHeaderIcon}>📦</Text>
                      <View style={styles.itemHeaderContent}>
                        <Text style={styles.itemTitle} numberOfLines={1}>
                          {itemConv.itemTitle}
                        </Text>
                        <Text style={styles.itemSubtitle}>
                          {itemConv.itemStatus === 'available' ? 'Available' : 'Reserved'} • {itemConv.conversations.length} inquir{itemConv.conversations.length === 1 ? 'y' : 'ies'}
                        </Text>
                      </View>
                    </View>

                    {/* Conversations for this item */}
                    {itemConv.conversations.filter(conv => conv && conv.userId && conv.userName).map((conv) => (
                      <TouchableOpacity
                        key={`${itemConv.itemId}-${conv.userId}`}
                        style={styles.conversationCard}
                        onPress={() => handleOpenChat(itemConv.itemId, itemConv.itemTitle, conv.userId, conv.userName)}
                      >
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {(conv.userName || 'U').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.conversationContent}>
                          <View style={styles.conversationHeader}>
                            <Text style={styles.userName}>{conv.userName || 'Unknown User'}</Text>
                            {conv.unreadCount > 0 && (
                              <View style={styles.unreadBadge}>
                                <Text style={styles.unreadBadgeText}>
                                  {conv.unreadCount}
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.lastMessage} numberOfLines={1}>
                            {conv.lastMessage || 'No message'}
                          </Text>
                          <Text style={styles.timeText}>
                            {formatTime(conv.lastMessageTime)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Chat Modal */}
      {selectedChat && (
        <ChatModal
          visible={!!selectedChat}
          onClose={() => {
            setSelectedChat(null);
            // Refresh messages after closing
            fetchDonorMessages();
          }}
          itemId={selectedChat.itemId}
          itemTitle={selectedChat.itemTitle}
          currentUserId={currentUserId}
          otherUserId={selectedChat.otherUserId}
          otherUserName={selectedChat.otherUserName}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  buttonIcon: {
    fontSize: 28,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.destructive,
    borderRadius: borderRadius.full,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeText: {
    color: colors.destructiveForeground,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    fontSize: fontSize['2xl'],
    marginRight: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.foreground,
  },
  closeButton: {
    fontSize: fontSize['2xl'],
    color: colors.mutedForeground,
    paddingHorizontal: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  emptyContainer: {
    paddingVertical: spacing.xl * 4,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  itemSection: {
    marginBottom: spacing.xl,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.muted,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemHeaderIcon: {
    fontSize: fontSize.lg,
    marginRight: spacing.sm,
  },
  itemHeaderContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.foreground,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: fontSize.xs,
    color: colors.mutedForeground,
  },
  conversationCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primaryForeground,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.foreground,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: colors.primaryForeground,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  lastMessage: {
    fontSize: fontSize.xs,
    color: colors.mutedForeground,
    marginBottom: spacing.xs,
  },
  timeText: {
    fontSize: fontSize.xs,
    color: colors.mutedForeground,
  },
});
