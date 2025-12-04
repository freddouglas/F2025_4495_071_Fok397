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
  isMyItem: boolean; // true = I'm the donor, false = I'm the claimer
  otherUserId: string; // The other person in this conversation
  otherUserName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
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
      const { items } = await itemsAPI.getAll();
      
      console.log(`🔍 FloatingMessageNotification - Fetching all conversations for user: ${currentUserId}`);
      
      const allConversations: ItemConversation[] = [];
      let unreadTotal = 0;
      
      // Build a user name lookup from all users we've seen in messages
      const userNameLookup = new Map<string, string>();

      // Process all items to find conversations
      for (const item of items) {
        try {
          const { messages } = await messagesAPI.getByItem(item.id);
          
          if (!messages || messages.length === 0) continue;

          const isMyItem = item.userId === currentUserId;
          
          // First pass: build user name lookup from all messages
          messages.forEach((msg: any) => {
            if (msg.senderId && msg.senderName) {
              userNameLookup.set(msg.senderId, msg.senderName);
            }
          });
          
          // Group messages by the "other person" in the conversation
          const conversationMap = new Map<string, {
            lastMessage: string;
            lastMessageTime: string;
            unreadCount: number;
            otherUserName: string;
          }>();

          messages.forEach((msg: any) => {
            // Determine who the "other person" is
            let otherUserId: string | null = null;
            let otherUserName: string | null = null;
            
            if (isMyItem) {
              // I'm the donor - the "other" is anyone who messaged me
              if (msg.senderId !== currentUserId) {
                otherUserId = msg.senderId;
                otherUserName = msg.senderName;
              }
            } else {
              // I'm the claimer - check if I'm involved in this conversation
              const isMyMessage = msg.senderId === currentUserId || msg.recipientId === currentUserId;
              
              if (isMyMessage) {
                // The "other" is the donor (item owner)
                otherUserId = item.userId;
                // Try to get donor's name from lookup
                otherUserName = userNameLookup.get(item.userId) || item.userName || 'Donor';
              }
            }

            if (!otherUserId) return;

            const existing = conversationMap.get(otherUserId);
            
            // Count unread messages (only messages FROM the other person that are unread)
            const isUnread = msg.senderId === otherUserId && !msg.read;
            
            if (!existing) {
              conversationMap.set(otherUserId, {
                lastMessage: msg.message || '',
                lastMessageTime: msg.timestamp || msg.createdAt,
                unreadCount: isUnread ? 1 : 0,
                otherUserName: otherUserName || 'Unknown User',
              });
            } else {
              // Update if this message is newer
              const msgTime = new Date(msg.timestamp || msg.createdAt);
              const existingTime = new Date(existing.lastMessageTime);
              
              if (msgTime > existingTime) {
                existing.lastMessage = msg.message || '';
                existing.lastMessageTime = msg.timestamp || msg.createdAt;
              }
              
              if (isUnread) {
                existing.unreadCount++;
              }
              
              // Update name if we have a better one
              if (otherUserName && otherUserName !== 'Unknown User' && otherUserName !== 'Donor') {
                existing.otherUserName = otherUserName;
              }
            }
          });

          // Add each conversation as a separate entry
          conversationMap.forEach((conv, otherUserId) => {
            allConversations.push({
              itemId: item.id,
              itemTitle: item.title,
              itemStatus: item.status,
              isMyItem,
              otherUserId,
              otherUserName: conv.otherUserName,
              lastMessage: conv.lastMessage,
              lastMessageTime: conv.lastMessageTime,
              unreadCount: conv.unreadCount,
            });
            unreadTotal += conv.unreadCount;
          });
        } catch (error) {
          console.error(`Error fetching messages for item ${item.id}:`, error);
        }
      }

      // Sort by most recent message first
      allConversations.sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      console.log(`📊 Total conversations: ${allConversations.length}, Total unread: ${unreadTotal}`);

      setItemConversations(allConversations);
      setTotalUnread(unreadTotal);
    } catch (error) {
      console.error('Error fetching messages:', error);
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
              <Text style={styles.title}>Messages</Text>
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
                    No messages yet
                  </Text>
                </View>
              ) : (
                itemConversations.map((conv) => (
                  <TouchableOpacity
                    key={`${conv.itemId}-${conv.otherUserId}`}
                    style={styles.conversationCard}
                    onPress={() => handleOpenChat(conv.itemId, conv.itemTitle, conv.otherUserId, conv.otherUserName)}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {(conv.otherUserName || 'U').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.conversationContent}>
                      <View style={styles.conversationHeader}>
                        <Text style={styles.userName}>{conv.otherUserName || 'Unknown User'}</Text>
                        {conv.unreadCount > 0 && (
                          <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>
                              {conv.unreadCount}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemInfoIcon}>📦</Text>
                        <Text style={styles.itemInfoText} numberOfLines={1}>
                          {conv.itemTitle}
                        </Text>
                        {!conv.isMyItem && (
                          <View style={styles.inquiringBadge}>
                            <Text style={styles.inquiringBadgeText}>Inquiring</Text>
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
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  itemInfoIcon: {
    fontSize: fontSize.lg,
    marginRight: spacing.sm,
  },
  itemInfoText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.foreground,
    marginBottom: 2,
    flex: 1,
  },
  inquiringBadge: {
    backgroundColor: colors.orange,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  inquiringBadgeText: {
    color: '#ffffff',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
});