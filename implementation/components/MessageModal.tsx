import { useState } from "react";
import { Modal, View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { messagesAPI } from "../utils/api";
import { showToast } from "./Toast";
import { colors, spacing, borderRadius, fontSize, fontWeight } from "../utils/theme";

interface MessageModalProps {
  visible: boolean;
  onClose: () => void;
  itemTitle: string;
  recipientName: string;
  itemId?: string;
  recipientId?: string;
}

export function MessageModal({
  visible,
  onClose,
  itemTitle,
  recipientName,
  itemId,
  recipientId,
}: MessageModalProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      showToast("Please enter a message", "error");
      return;
    }

    if (!itemId || !recipientId) {
      showToast("Invalid message recipient", "error");
      return;
    }

    try {
      setIsSending(true);
      await messagesAPI.send({
        itemId,
        recipientId,
        message: message.trim(),
      });
      
      showToast("Message sent successfully!", "success");
      setMessage("");
      onClose();
    } catch (error) {
      console.error("Error sending message:", error);
      showToast("Failed to send message", "error");
    } finally {
      setIsSending(false);
    }
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
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Send Message</Text>
              <Pressable onPress={onClose}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>

            <Text style={styles.subtitle}>
              Send a message to {recipientName} about "{itemTitle}"
            </Text>

            {/* Message Input */}
            <View style={styles.field}>
              <Text style={styles.label}>Message *</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Hi, I'm interested in this item..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                value={message}
                onChangeText={setMessage}
                editable={!isSending}
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonsRow}>
              <Pressable
                style={styles.cancelButton}
                onPress={onClose}
                disabled={isSending}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.submitButton, isSending && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSending}
              >
                {isSending ? (
                  <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                  <View style={styles.submitButtonContent}>
                    <Text style={styles.submitButtonEmoji}>📤</Text>
                    <Text style={styles.submitButtonText}>Send Message</Text>
                  </View>
                )}
              </Pressable>
            </View>
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
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.medium,
    color: colors.foreground,
  },
  closeButton: {
    fontSize: fontSize['2xl'],
    color: colors.mutedForeground,
  },
  subtitle: {
    color: colors.mutedForeground,
    marginBottom: spacing['2xl'],
    fontSize: fontSize.base,
  },
  field: {
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  label: {
    fontWeight: fontWeight.medium,
    color: colors.foreground,
    fontSize: fontSize.base,
  },
  textArea: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.foreground,
    fontSize: fontSize.base,
    minHeight: 128,
    paddingTop: spacing.md,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  cancelButtonText: {
    color: colors.secondaryForeground,
    textAlign: 'center',
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  submitButtonEmoji: {
    fontSize: fontSize.lg,
  },
  submitButtonText: {
    color: colors.primaryForeground,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
  },
});
