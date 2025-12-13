import { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { spacing, borderRadius, fontSize, fontWeight } from "../utils/theme";
import { adminAPI } from "../utils/api";

interface Feedback {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  category: string;
  date: string;
}

export function AppFeedbackPanel() {
  const { colors: themeColors } = useTheme();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      setIsLoading(true);
      const result = await adminAPI.getAppFeedback();
      setFeedbacks(result.feedbacks || []);
    } catch (error) {
      console.error("Error loading app feedback:", error);
      setFeedbacks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAverageRating = () => {
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    return (sum / feedbacks.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach((f) => {
      distribution[f.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  const distribution = getRatingDistribution();

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.foreground }]}>App Feedback</Text>
          <Text style={[styles.subtitle, { color: themeColors.mutedForeground }]}>
            {feedbacks.length} total feedback submissions
          </Text>
        </View>

        {/* Summary Stats */}
        <View style={[styles.statsCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⭐</Text>
              <View>
                <Text style={[styles.statValue, { color: themeColors.foreground }]}>
                  {getAverageRating()}
                </Text>
                <Text style={[styles.statLabel, { color: themeColors.mutedForeground }]}>
                  Average Rating
                </Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statIcon}>💬</Text>
              <View>
                <Text style={[styles.statValue, { color: themeColors.foreground }]}>
                  {feedbacks.length}
                </Text>
                <Text style={[styles.statLabel, { color: themeColors.mutedForeground }]}>
                  Total Feedback
                </Text>
              </View>
            </View>
          </View>

          {/* Rating Distribution */}
          <View style={[styles.distributionSection, { borderTopColor: themeColors.border }]}>
            <Text style={[styles.distributionTitle, { color: themeColors.cardForeground }]}>
              Rating Distribution
            </Text>
            {[5, 4, 3, 2, 1].map((rating) => (
              <View key={rating} style={styles.distributionRow}>
                <View style={styles.distributionStars}>
                  <Text style={styles.distributionRating}>{rating}</Text>
                  <Text style={styles.distributionStar}>⭐</Text>
                </View>
                <View style={[styles.distributionBar, { backgroundColor: themeColors.border }]}>
                  <View
                    style={[
                      styles.distributionBarFill,
                      {
                        backgroundColor: themeColors.primary,
                        width: feedbacks.length > 0 
                          ? `${(distribution[rating as keyof typeof distribution] / feedbacks.length) * 100}%` 
                          : "0%",
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.distributionCount, { color: themeColors.mutedForeground }]}>
                  {distribution[rating as keyof typeof distribution]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Feedback List */}
        <View style={[styles.feedbackCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={[styles.feedbackTitle, { color: themeColors.cardForeground }]}>
            All Feedback
          </Text>

          {feedbacks.length === 0 ? (
            <Text style={[styles.emptyText, { color: themeColors.mutedForeground }]}>
              No feedback submitted yet.
            </Text>
          ) : (
            <View style={styles.feedbackList}>
              {feedbacks.map((feedback, index) => (
                <View key={feedback.id}>
                  <View style={styles.feedbackItem}>
                    {/* Header */}
                    <View style={styles.feedbackHeader}>
                      <View style={styles.feedbackHeaderLeft}>
                        <Text style={[styles.feedbackUserName, { color: themeColors.foreground }]}>
                          {feedback.userName}
                        </Text>
                        <Text style={[styles.feedbackDate, { color: themeColors.mutedForeground }]}>
                          {formatDate(feedback.date)}
                        </Text>
                      </View>
                      <View style={styles.feedbackRating}>
                        <Text style={styles.feedbackRatingIcon}>⭐</Text>
                        <Text style={[styles.feedbackRatingValue, { color: themeColors.foreground }]}>
                          {feedback.rating}
                        </Text>
                      </View>
                    </View>

                    {/* Comment */}
                    <Text style={[styles.feedbackComment, { color: themeColors.mutedForeground }]}>
                      {feedback.comment}
                    </Text>

                    {/* Category */}
                    <View style={[styles.feedbackCategory, { borderColor: themeColors.border }]}>
                      <Text style={[styles.feedbackCategoryText, { color: themeColors.foreground }]}>
                        {feedback.category}
                      </Text>
                    </View>
                  </View>

                  {index < feedbacks.length - 1 && (
                    <View style={[styles.feedbackSeparator, { backgroundColor: themeColors.border }]} />
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
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
  },
  subtitle: {
    fontSize: fontSize.base,
  },
  statsCard: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  statsGrid: {
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
    fontSize: fontSize['3xl'],
  },
  statValue: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
  },
  statLabel: {
    fontSize: fontSize.sm,
  },
  distributionSection: {
    borderTopWidth: 1,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  distributionTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  distributionStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 50,
  },
  distributionRating: {
    fontSize: fontSize.sm,
  },
  distributionStar: {
    fontSize: fontSize.sm,
  },
  distributionBar: {
    flex: 1,
    height: 8,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  distributionBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  distributionCount: {
    fontSize: fontSize.sm,
    width: 30,
    textAlign: 'right',
  },
  feedbackCard: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  feedbackTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: spacing['3xl'],
    fontSize: fontSize.base,
  },
  feedbackList: {
    gap: spacing.md,
  },
  feedbackItem: {
    gap: spacing.sm,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  feedbackHeaderLeft: {
    flex: 1,
  },
  feedbackUserName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  feedbackDate: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  feedbackRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  feedbackRatingIcon: {
    fontSize: fontSize.base,
  },
  feedbackRatingValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  feedbackComment: {
    fontSize: fontSize.base,
    lineHeight: 20,
  },
  feedbackCategory: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  feedbackCategoryText: {
    fontSize: fontSize.xs,
    textTransform: 'capitalize',
  },
  feedbackSeparator: {
    height: 1,
    marginVertical: spacing.md,
  },
});
