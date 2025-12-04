import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { User } from "./LoginPage";
import { reviewsAPI, appFeedbackAPI } from "../utils/api";
import { useTheme } from "../contexts/ThemeContext";
import { colors, spacing, borderRadius, fontSize, fontWeight } from "../utils/theme";

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
  itemTitle: string;
  type: "received" | "given";
}

interface ProfilePageProps {
  user: User;
  onBackToItems: () => void;
  reviewRefreshTrigger?: number;
}

export function ProfilePage({ user, onBackToItems, reviewRefreshTrigger }: ProfilePageProps) {
  const { colors: themeColors } = useTheme();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  
  // App Feedback state
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState("general");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setIsLoadingReviews(true);
        const result = await reviewsAPI.getByUser(user.id);
        setReviews(result.reviews || []);
      } catch (error) {
        console.error("Error loading reviews:", error);
        setReviews([]);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    loadReviews();
  }, [user.id, reviewRefreshTrigger]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleFeedbackSubmit = async () => {
    if (feedbackRating === 0) {
      Alert.alert("Error", "Please select a rating");
      return;
    }

    if (!feedbackComment.trim()) {
      Alert.alert("Error", "Please provide feedback comments");
      return;
    }

    try {
      setIsSubmittingFeedback(true);
      await appFeedbackAPI.create({
        rating: feedbackRating,
        comment: feedbackComment.trim(),
        category: feedbackCategory,
      });

      Alert.alert("Success", "Thank you for your feedback!");
      setFeedbackRating(0);
      setFeedbackComment("");
      setFeedbackCategory("general");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Alert.alert("Error", "Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.content}>
        {/* Back Button */}
        <Pressable style={styles.backButton} onPress={onBackToItems}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={[styles.backText, { color: themeColors.foreground }]}>Back to Items</Text>
        </Pressable>

        {/* Profile Card */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: themeColors.primary }]}>
              <Text style={[styles.avatarText, { color: themeColors.primaryForeground }]}>
                {getInitials(user.name)}
              </Text>
            </View>

            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: themeColors.cardForeground }]}>
                {user.name}
              </Text>
              <View style={styles.profileDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📍</Text>
                  <Text style={[styles.detailText, { color: themeColors.mutedForeground }]}>{user.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📅</Text>
                  <Text style={[styles.detailText, { color: themeColors.mutedForeground }]}>
                    Member since {formatDate(user.joinDate)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.ratingBadge}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={[styles.ratingValue, { color: themeColors.foreground }]}>{user.rating.toFixed(1)}</Text>
            </View>
          </View>

          <Text style={[styles.reviewCount, { color: themeColors.mutedForeground }]}>
            ({user.totalReviews} reviews)
          </Text>

          {user.bio && (
            <>
              <Text style={[styles.bio, { color: themeColors.mutedForeground }]}>{user.bio}</Text>
              <View style={[styles.separator, { backgroundColor: themeColors.border }]} />
            </>
          )}

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>📦</Text>
              <View>
                <Text style={[styles.statValue, { color: themeColors.foreground }]}>{user.itemsShared}</Text>
                <Text style={[styles.statLabel, { color: themeColors.mutedForeground }]}>Items Shared</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🛍️</Text>
              <View>
                <Text style={[styles.statValue, { color: themeColors.foreground }]}>{user.itemsClaimed}</Text>
                <Text style={[styles.statLabel, { color: themeColors.mutedForeground }]}>Items Claimed</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Reviews Received Card */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.reviewsHeader}>
            <Text style={[styles.reviewsTitle, { color: themeColors.cardForeground }]}>Reviews & Ratings</Text>
            <Text style={[styles.reviewsSubtitle, { color: themeColors.mutedForeground }]}>
              {user.totalReviews} total reviews from the community
            </Text>
          </View>

          {isLoadingReviews ? (
            <ActivityIndicator size="large" color={themeColors.mutedForeground} />
          ) : reviews.length === 0 ? (
            <Text style={[styles.centerText, { color: themeColors.mutedForeground }]}>
              No reviews yet. Start sharing food to build your reputation!
            </Text>
          ) : (
            <View style={styles.reviewsList}>
              {reviews.map((review, index) => (
                <View key={review.id}>
                  <View style={styles.review}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewHeaderLeft}>
                        <View style={styles.reviewHeaderTop}>
                          <Text style={[styles.reviewerName, { color: themeColors.foreground }]}>
                            {review.reviewerName}
                          </Text>
                          <View style={[styles.reviewType, { borderColor: themeColors.border }]}>
                            <Text style={[styles.reviewTypeText, { color: themeColors.foreground }]}>
                              {review.type === "received" ? "As Donor" : "As Recipient"}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.reviewItemTitle, { color: themeColors.mutedForeground }]}>
                          {review.itemTitle}
                        </Text>
                      </View>

                      <View style={styles.reviewRating}>
                        <Text style={styles.reviewRatingIcon}>⭐</Text>
                        <Text style={[styles.reviewRatingValue, { color: themeColors.foreground }]}>{review.rating}</Text>
                      </View>
                    </View>

                    <Text style={[styles.reviewComment, { color: themeColors.mutedForeground }]}>{review.comment}</Text>
                    <Text style={[styles.reviewDate, { color: themeColors.mutedForeground }]}>{formatDate(review.date)}</Text>
                  </View>

                  {index < reviews.length - 1 && (
                    <View style={[styles.reviewSeparator, { backgroundColor: themeColors.border }]} />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* App Feedback Card */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.reviewsHeader}>
            <Text style={[styles.reviewsTitle, { color: themeColors.cardForeground }]}>App Feedback</Text>
            <Text style={[styles.reviewsSubtitle, { color: themeColors.mutedForeground }]}>
              Help us improve Food Share
            </Text>
          </View>

          {/* Star Rating */}
          <View style={styles.feedbackSection}>
            <Text style={[styles.feedbackLabel, { color: themeColors.mutedForeground }]}>
              Rate your experience *
            </Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => setFeedbackRating(star)} disabled={isSubmittingFeedback}>
                  <Text style={styles.star}>{star <= feedbackRating ? "⭐" : "☆"}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Category Selection */}
          {/* Removed category tabs - defaulting to general */}

          {/* Comment */}
          <View style={styles.feedbackSection}>
            <Text style={[styles.feedbackLabel, { color: themeColors.mutedForeground }]}>
              Your Feedback *
            </Text>
            <TextInput
              style={[
                styles.feedbackTextArea,
                {
                  backgroundColor: themeColors.background,
                  borderColor: themeColors.border,
                  color: themeColors.foreground,
                },
              ]}
              value={feedbackComment}
              onChangeText={setFeedbackComment}
              placeholder="Share your thoughts, suggestions, or report issues..."
              placeholderTextColor={themeColors.mutedForeground}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!isSubmittingFeedback}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitFeedbackButton,
              {
                backgroundColor: themeColors.primary,
                opacity: feedbackRating === 0 || !feedbackComment.trim() || isSubmittingFeedback ? 0.5 : 1,
              },
            ]}
            onPress={handleFeedbackSubmit}
            disabled={feedbackRating === 0 || !feedbackComment.trim() || isSubmittingFeedback}
          >
            {isSubmittingFeedback ? (
              <ActivityIndicator color={themeColors.primaryForeground} />
            ) : (
              <Text style={[styles.submitFeedbackButtonText, { color: themeColors.primaryForeground }]}>
                Submit Feedback
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing["2xl"],
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backArrow: {
    fontSize: fontSize["2xl"],
  },
  backText: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
  },
  card: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  profileHeader: {
    flexDirection: "row",
    gap: spacing.lg,
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.medium,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },
  profileDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailIcon: {
    fontSize: fontSize.base,
  },
  detailText: {
    fontSize: fontSize.base,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingIcon: {
    fontSize: fontSize.xl,
  },
  ratingValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
  },
  reviewCount: {
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
  },
  bio: {
    fontSize: fontSize.base,
    marginBottom: spacing.lg,
  },
  separator: {
    height: 1,
    marginBottom: spacing.lg,
  },
  stats: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statIcon: {
    fontSize: fontSize["2xl"],
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.medium,
  },
  statLabel: {
    fontSize: fontSize.sm,
  },
  reviewsHeader: {
    marginBottom: spacing.lg,
  },
  reviewsTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.medium,
  },
  reviewsSubtitle: {
    marginTop: 4,
    fontSize: fontSize.base,
  },
  centerText: {
    textAlign: "center",
    paddingVertical: spacing["3xl"],
    fontSize: fontSize.base,
  },
  reviewsList: {
    gap: spacing.lg,
  },
  claimedItem: {
    gap: spacing.sm,
  },
  claimedItemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  claimedItemTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  claimedItemDonor: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  reviewedBadge: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  reviewedBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  review: {
    gap: spacing.sm,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  reviewHeaderLeft: {
    flex: 1,
  },
  reviewHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  reviewerName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  reviewType: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  reviewTypeText: {
    fontSize: fontSize.xs,
  },
  reviewItemTitle: {
    fontSize: fontSize.sm,
    marginTop: 4,
  },
  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reviewRatingIcon: {
    fontSize: fontSize.base,
  },
  reviewRatingValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  reviewComment: {
    fontSize: fontSize.base,
  },
  reviewDate: {
    fontSize: fontSize.sm,
  },
  reviewSeparator: {
    height: 1,
    marginTop: spacing.lg,
  },
  feedbackSection: {
    marginBottom: spacing.lg,
  },
  feedbackLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },
  stars: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  star: {
    fontSize: fontSize["3xl"],
  },
  categoryButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  categoryButton: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  categoryButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  feedbackTextArea: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.base,
    minHeight: 100,
  },
  leaveReviewButton: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  leaveReviewButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  submitFeedbackButton: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  submitFeedbackButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
});