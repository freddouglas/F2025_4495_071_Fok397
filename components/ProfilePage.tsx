import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { User } from "./LoginPage";
import { reviewsAPI } from "../utils/api";
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
}

export function ProfilePage({ user, onBackToItems }: ProfilePageProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

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
  }, [user.id]);

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Back Button */}
        <Pressable
          style={styles.backButton}
          onPress={onBackToItems}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Back to Items</Text>
        </Pressable>

        {/* Profile Card */}
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.profileHeader}>
            {/* Avatar */}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(user.name)}
              </Text>
            </View>

            {/* Info */}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user.name}
              </Text>
              <View style={styles.profileDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📍</Text>
                  <Text style={styles.detailText}>{user.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📅</Text>
                  <Text style={styles.detailText}>
                    Member since {formatDate(user.joinDate)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Rating */}
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={styles.ratingValue}>{user.rating.toFixed(1)}</Text>
            </View>
          </View>

          <Text style={styles.reviewCount}>
            ({user.totalReviews} reviews)
          </Text>

          {/* Bio */}
          {user.bio && (
            <>
              <Text style={styles.bio}>{user.bio}</Text>
              <View style={styles.separator} />
            </>
          )}

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>📦</Text>
              <View>
                <Text style={styles.statValue}>{user.itemsShared}</Text>
                <Text style={styles.statLabel}>Items Shared</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🛍️</Text>
              <View>
                <Text style={styles.statValue}>{user.itemsClaimed}</Text>
                <Text style={styles.statLabel}>Items Claimed</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Reviews Card */}
        <View style={styles.card}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.reviewsTitle}>Reviews & Ratings</Text>
            <Text style={styles.reviewsSubtitle}>
              {user.totalReviews} total reviews from the community
            </Text>
          </View>

          {isLoadingReviews ? (
            <Text style={styles.centerText}>Loading reviews...</Text>
          ) : reviews.length === 0 ? (
            <Text style={styles.centerText}>
              No reviews yet. Start sharing food to build your reputation!
            </Text>
          ) : (
            <View style={styles.reviewsList}>
              {reviews.map((review, index) => (
                <View key={review.id}>
                  <View style={styles.review}>
                    {/* Review Header */}
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewHeaderLeft}>
                        <View style={styles.reviewHeaderTop}>
                          <Text style={styles.reviewerName}>
                            {review.reviewerName}
                          </Text>
                          <View style={styles.reviewType}>
                            <Text style={styles.reviewTypeText}>
                              {review.type === "received" ? "As Donor" : "As Recipient"}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.reviewItemTitle}>
                          {review.itemTitle}
                        </Text>
                      </View>

                      {/* Rating */}
                      <View style={styles.reviewRating}>
                        <Text style={styles.reviewRatingIcon}>⭐</Text>
                        <Text style={styles.reviewRatingValue}>{review.rating}</Text>
                      </View>
                    </View>

                    {/* Comment */}
                    <Text style={styles.reviewComment}>{review.comment}</Text>

                    {/* Date */}
                    <Text style={styles.reviewDate}>{formatDate(review.date)}</Text>
                  </View>

                  {/* Separator */}
                  {index < reviews.length - 1 && (
                    <View style={styles.reviewSeparator} />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing['2xl'],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backArrow: {
    fontSize: fontSize['2xl'],
  },
  backText: {
    color: colors.foreground,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primaryForeground,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.medium,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.medium,
    color: colors.cardForeground,
    marginBottom: spacing.sm,
  },
  profileDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailIcon: {
    fontSize: fontSize.base,
  },
  detailText: {
    color: colors.mutedForeground,
    fontSize: fontSize.base,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: colors.mutedForeground,
    marginBottom: spacing.lg,
  },
  bio: {
    fontSize: fontSize.base,
    color: colors.mutedForeground,
    marginBottom: spacing.lg,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statIcon: {
    fontSize: fontSize['2xl'],
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.medium,
    color: colors.foreground,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
  },
  reviewsHeader: {
    marginBottom: spacing.lg,
  },
  reviewsTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.medium,
    color: colors.cardForeground,
  },
  reviewsSubtitle: {
    color: colors.mutedForeground,
    marginTop: 4,
    fontSize: fontSize.base,
  },
  centerText: {
    textAlign: 'center',
    color: colors.mutedForeground,
    paddingVertical: spacing['3xl'],
    fontSize: fontSize.base,
  },
  reviewsList: {
    gap: spacing.lg,
  },
  review: {
    gap: spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  reviewHeaderLeft: {
    flex: 1,
  },
  reviewHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  reviewerName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.foreground,
  },
  reviewType: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  reviewTypeText: {
    fontSize: fontSize.xs,
    color: colors.foreground,
  },
  reviewItemTitle: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: colors.mutedForeground,
  },
  reviewDate: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
  },
  reviewSeparator: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.lg,
  },
});
