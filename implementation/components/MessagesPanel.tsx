import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { User } from './LoginPage';
import { messagesAPI } from '../utils/api';
import { ChatModal } from './ChatModal';
import { colors, spacing, borderRadius } from '../utils/theme';

interface Conversation {
  itemId: string;
  itemTitle: string;
  itemImage: string | null;
  otherUserId: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messageCount: number;
}

interface MessagesPanelProps {
  currentUserId: string;
}

export function MessagesPanel({ currentUserId }: MessagesPanelProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [chatModalVisible, setChatModalVisible] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async (isRefresh = false) => {
    try {
      if (!isRefresh) setIsLoading(true);
      const result = await messagesAPI.getConversations();
      setConversations(result.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchConversations(true);
  };

  const handleOpenChat = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setChatModalVisible(true);
  };

  const handleChatClose = () => {
    setChatModalVisible(false);
    setSelectedConversation(null);
    // Refresh conversations after closing chat
    fetchConversations();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Text style={styles.headerIcon}>💬</Text>
          <Text style={styles.title}>Messages</Text>
        </View>
        <Text style={styles.subtitle}>
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading conversations...</Text>
          </View>
        ) : conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>
              Start a conversation by messaging someone about their food items
            </Text>
          </View>
        ) : (
          <View style={styles.conversationsList}>
            {conversations.map((conversation) => (
              <TouchableOpacity
                key={`${conversation.itemId}-${conversation.otherUserId}`}
                style={styles.conversationCard}
                onPress={() => handleOpenChat(conversation)}
              >
                {/* Avatar */}
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {conversation.otherUserName.charAt(0).toUpperCase()}
                  </Text>
                </View>

                {/* Content */}
                <View style={styles.conversationContent}>
                  <View style={styles.conversationHeader}>
                    <View style={styles.nameContainer}>
                      <Text style={styles.userName}>
                        {conversation.otherUserName}
                      </Text>
                      {conversation.unreadCount > 0 && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>
                            {conversation.unreadCount}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.timeText}>
                      {formatTime(conversation.lastMessageTime)}
                    </Text>
                  </View>

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemIcon}>📦</Text>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {conversation.itemTitle}
                    </Text>
                  </View>

                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {truncateMessage(conversation.lastMessage)}
                  </Text>

                  <Text style={styles.messageCount}>
                    {conversation.messageCount} message
                    {conversation.messageCount !== 1 ? 's' : ''}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Chat Modal */}
      {selectedConversation && (
        <ChatModal
          visible={chatModalVisible}
          onClose={handleChatClose}
          itemId={selectedConversation.itemId}
          itemTitle={selectedConversation.itemTitle}
          currentUserId={currentUserId}
          otherUserId={selectedConversation.otherUserId}
          otherUserName={selectedConversation.otherUserName}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerIcon: {
    fontSize: 24,
    marginRight: spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: spacing.xl * 4,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: spacing.xl * 4,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  conversationsList: {
    padding: spacing.md,
  },
  conversationCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryForeground,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.xs,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: colors.primaryForeground,
    fontSize: 12,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  itemIcon: {
    fontSize: 12,
    marginRight: spacing.xs,
  },
  itemTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  messageCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
