import { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from "../utils/theme";
import { reviewsAPI } from "../utils/api";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  donorId: string;
  donorName: string;
  itemTitle: string;
  onReviewSubmitted?: () => void;
}

export function ReviewModal({
  isOpen,
  onClose,
  itemId,
  donorId,
  donorName,
  itemTitle,
  onReviewSubmitted,
}: ReviewModalProps) {
  const { colors: themeColors } = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setComment("");
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      await reviewsAPI.create({
        revieweeId: donorId,
        rating,
        comment: comment.trim(),
        itemId,
      });

      // Reset form
      setRating(0);
      setComment("");
      
      // Notify parent
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={[styles.container, { backgroundColor: themeColors.card }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
              <Text style={[styles.title, { color: themeColors.cardForeground }]}>
                Review Donor
              </Text>
              <Pressable onPress={handleClose} disabled={isSubmitting}>
                <Text style={[styles.closeButton, { color: themeColors.mutedForeground }]}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.content}>
              {/* Item Info */}
              <View style={styles.itemInfo}>
                <Text style={[styles.itemTitle, { color: themeColors.cardForeground }]}>
                  {itemTitle}
                </Text>
                <Text style={[styles.donorName, { color: themeColors.mutedForeground }]}>
                  from {donorName}
                </Text>
              </View>

              {/* Rating */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: themeColors.cardForeground }]}>
                  Rating <Text style={{ color: themeColors.destructive }}>*</Text>
                </Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable
                      key={star}
                      onPress={() => setRating(star)}
                      disabled={isSubmitting}
                      style={styles.starButton}
                    >
                      <Text style={[styles.star, { color: star <= rating ? "#FFD700" : themeColors.muted }]}>
                        ★
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={[styles.ratingText, { color: themeColors.mutedForeground }]}>
                  {rating === 0 ? "Tap to rate" : 
                   rating === 1 ? "Poor" :
                   rating === 2 ? "Fair" :
                   rating === 3 ? "Good" :
                   rating === 4 ? "Very Good" : "Excellent"}
                </Text>
              </View>

              {/* Comment */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: themeColors.cardForeground }]}>
                  Comment (Optional)
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.foreground,
                    },
                  ]}
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Share your experience with this donor..."
                  placeholderTextColor={themeColors.mutedForeground}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isSubmitting}
                />
              </View>

              {/* Guideline */}
              <View style={[styles.guideline, { backgroundColor: themeColors.muted + "40", borderLeftColor: themeColors.primary }]}>
                <Text style={[styles.guidelineText, { color: themeColors.mutedForeground }]}>
                  💡 Honest reviews help maintain a trustworthy community. Please be respectful and constructive.
                </Text>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: themeColors.border }]}>
              <TouchableOpacity
                style={[
                  styles.footerButton,
                  { borderColor: themeColors.border, backgroundColor: themeColors.background },
                ]}
                onPress={handleClose}
                disabled={isSubmitting}
              >
                <Text style={[styles.footerButtonText, { color: themeColors.foreground }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <View style={{ width: spacing.md }} />
              <TouchableOpacity
                style={[
                  styles.footerButton,
                  {
                    backgroundColor: themeColors.primary,
                    opacity: rating === 0 || isSubmitting ? 0.5 : 1,
                  },
                ]}
                onPress={handleSubmit}
                disabled={rating === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={themeColors.primaryForeground} />
                ) : (
                  <Text style={[styles.footerButtonText, { color: themeColors.primaryForeground }]}>
                    Submit Review
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    height: "85%",
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    ...shadows.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  closeButton: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.normal,
    paddingHorizontal: spacing.sm,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  itemInfo: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
  },
  itemTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  donorName: {
    fontSize: fontSize.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  starsContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  starButton: {
    padding: spacing.xs,
  },
  star: {
    fontSize: 32,
  },
  ratingText: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 100,
    fontSize: fontSize.base,
  },
  guideline: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    marginTop: spacing.md,
  },
  guidelineText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    padding: spacing.lg,
    borderTopWidth: 1,
    gap: spacing.md,
  },
  footerButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    borderWidth: 1,
    borderColor: "transparent",
  },
  footerButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
