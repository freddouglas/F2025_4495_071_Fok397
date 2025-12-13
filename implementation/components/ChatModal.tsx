import { useState, useEffect, useRef } from "react";
import { Modal, View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { messagesAPI } from "../utils/api";
import { showToast } from "./Toast";
import { colors, spacing, borderRadius, fontSize, fontWeight } from "../utils/theme";

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  message: string;
  createdAt: string;
  itemId: string;
}

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
  itemId: string;
  itemTitle: string;
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
}

export function ChatModal({
  visible,
  onClose,
  itemId,
  itemTitle,
  currentUserId,
  otherUserId,
  otherUserName,
}: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const result = await messagesAPI.getByItem(itemId);
      // Filter out null/undefined messages and ensure valid structure
      const validMessages = (result.messages || []).filter(
        (msg): msg is Message => msg != null && typeof msg === 'object' && 'senderId' in msg
      );
      setMessages(validMessages);
      setIsLoading(false);
      
      // Scroll to bottom on new messages
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setIsLoading(false);
    }
  };

  // Poll for new messages every 3 seconds when modal is open
  useEffect(() => {
    if (visible) {
      fetchMessages();
      
      // Set up polling
      pollIntervalRef.current = setInterval(fetchMessages, 3000);
      
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [visible, itemId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setIsSending(true);
      await messagesAPI.send({
        itemId,
        recipientId: otherUserId,
        message: newMessage.trim(),
      });
      
      setNewMessage("");
      // Immediately fetch to show the new message
      await fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      showToast("Failed to send message", "error");
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(otherUserName)}</Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>{otherUserName}</Text>
                <Text style={styles.headerSubtitle}>About: {itemTitle}</Text>
              </View>
            </View>
            <Pressable onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </Pressable>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading messages...</Text>
              </View>
            ) : messages.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No messages yet.</Text>
                <Text style={styles.emptySubtext}>Start the conversation!</Text>
              </View>
            ) : (
              messages.filter(msg => msg && msg.senderId).map((msg) => {
                const isOwnMessage = msg.senderId === currentUserId;
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageWrapper,
                      isOwnMessage ? styles.messageWrapperOwn : styles.messageWrapperOther
                    ]}
                  >
                    {!isOwnMessage && (
                      <View style={styles.messageAvatar}>
                        <Text style={styles.messageAvatarText}>
                          {getInitials(otherUserName)}
                        </Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.messageBubble,
                        isOwnMessage ? styles.messageBubbleOwn : styles.messageBubbleOther
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isOwnMessage ? styles.messageTextOwn : styles.messageTextOther
                        ]}
                      >
                        {msg.message}
                      </Text>
                      <Text
                        style={[
                          styles.messageTime,
                          isOwnMessage ? styles.messageTimeOwn : styles.messageTimeOther
                        ]}
                      >
                        {formatTime(msg.createdAt)}
                      </Text>
                    </View>
                    {isOwnMessage && (
                      <View style={styles.messageAvatar}>
                        <Text style={styles.messageAvatarText}>You</Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              maxLength={500}
              editable={!isSending}
            />
            <Pressable
              style={[
                styles.sendButton,
                (!newMessage.trim() || isSending) && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color={colors.primaryForeground} />
              ) : (
                <Text style={styles.sendButtonText}>➤</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primaryForeground,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.foreground,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  closeButton: {
    fontSize: fontSize['2xl'],
    color: colors.mutedForeground,
    paddingLeft: spacing.md,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.base,
    color: colors.mutedForeground,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.mutedForeground,
  },
  emptySubtext: {
    fontSize: fontSize.base,
    color: colors.mutedForeground,
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    maxWidth: '85%',
  },
  messageWrapperOwn: {
    alignSelf: 'flex-end',
  },
  messageWrapperOther: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageAvatarText: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    fontWeight: fontWeight.medium,
  },
  messageBubble: {
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxWidth: '100%',
  },
  messageBubbleOwn: {
    backgroundColor: colors.primary,
  },
  messageBubbleOther: {
    backgroundColor: colors.muted,
  },
  messageText: {
    fontSize: fontSize.base,
  },
  messageTextOwn: {
    color: colors.primaryForeground,
  },
  messageTextOther: {
    color: colors.foreground,
  },
  messageTime: {
    fontSize: fontSize.xs,
    marginTop: 4,
  },
  messageTimeOwn: {
    color: colors.primaryForeground,
    opacity: 0.7,
  },
  messageTimeOther: {
    color: colors.mutedForeground,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.base,
    color: colors.foreground,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: colors.primaryForeground,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.medium,
  },
});
