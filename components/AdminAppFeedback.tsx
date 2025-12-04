import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { adminAPI } from '../utils/api';
import { showToast } from './Toast';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../utils/theme';

interface AdminAppFeedbackProps {
  isRefreshing?: boolean;
}

export function AdminAppFeedback({ isRefreshing }: AdminAppFeedbackProps) {
  const { colors } = useTheme();
  const [feedback, setFeedback] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadFeedback();
  }, []);

  useEffect(() => {
    if (isRefreshing) {
      loadFeedback();
    }
  }, [isRefreshing]);

  const loadFeedback = async () => {
    try {
      setIsLoading(true);
      const result = await adminAPI.getAppFeedback();
      setFeedback(result.feedback || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading app feedback:', error);
      showToast('Failed to load app feedback', 'error');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeedback();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    loadingText: {
      marginTop: spacing.md,
      fontSize: fontSize.sm,
      color: colors.mutedForeground,
    },
    emptyText: {
      textAlign: 'center',
      fontSize: fontSize.sm,
      color: colors.mutedForeground,
      paddingVertical: spacing.xl,
    },
    updateInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    updateText: {
      fontSize: fontSize.sm,
      color: colors.mutedForeground,
    },
    refreshButton: {
      padding: spacing.sm,
    },
    refreshIcon: {
      fontSize: fontSize.lg,
    },
    summaryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: spacing.md,
    },
    summaryCard: {
      width: '48%',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      margin: '1%',
    },
    summaryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    summaryTitle: {
      fontSize: fontSize.sm,
      color: colors.mutedForeground,
      flex: 1,
    },
    summaryIcon: {
      fontSize: fontSize.lg,
    },
    summaryValue: {
      fontSize: fontSize['2xl'],
      fontWeight: fontWeight.bold,
      color: colors.foreground,
    },
    summarySubtext: {
      fontSize: fontSize.xs,
      color: colors.mutedForeground,
      marginTop: spacing.xs,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    ratingOutOf: {
      fontSize: fontSize.sm,
      color: colors.mutedForeground,
      marginLeft: spacing.xs,
    },
    starsRow: {
      flexDirection: 'row',
      marginTop: spacing.xs,
    },
    starIcon: {
      fontSize: fontSize.sm,
      marginRight: 2,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.lg,
    },
    cardTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.medium,
      color: colors.foreground,
      marginBottom: spacing.xs,
    },
    cardDescription: {
      fontSize: fontSize.sm,
      color: colors.mutedForeground,
      marginBottom: spacing.lg,
    },
    distributionContainer: {
      marginTop: spacing.md,
    },
    distributionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    ratingLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      width: 50,
    },
    ratingText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: colors.foreground,
    },
    starSmall: {
      fontSize: fontSize.sm,
      marginLeft: spacing.xs,
    },
    barContainer: {
      flex: 1,
      height: 16,
      backgroundColor: colors.muted,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
      marginHorizontal: spacing.md,
    },
    bar: {
      height: '100%',
      backgroundColor: '#fbbf24',
    },
    countText: {
      fontSize: fontSize.sm,
      color: colors.mutedForeground,
      width: 40,
      textAlign: 'right',
    },
    feedbackList: {
      marginTop: spacing.md,
    },
    feedbackItem: {
      marginBottom: spacing.lg,
      paddingBottom: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    feedbackHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.xs,
    },
    feedbackLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      flexWrap: 'wrap',
    },
    feedbackUserName: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: colors.foreground,
      marginRight: spacing.sm,
    },
    starsRowSmall: {
      flexDirection: 'row',
      marginRight: spacing.sm,
    },
    starIconSmall: {
      fontSize: 12,
    },
    categoryBadge: {
      backgroundColor: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.md,
    },
    categoryText: {
      fontSize: fontSize.xs,
      color: colors.foreground,
    },
    feedbackDate: {
      fontSize: fontSize.xs,
      color: colors.mutedForeground,
    },
    feedbackEmail: {
      fontSize: fontSize.xs,
      color: colors.mutedForeground,
      marginBottom: spacing.sm,
    },
    feedbackComment: {
      fontSize: fontSize.sm,
      color: colors.mutedForeground,
    },
  });

  if (isLoading && feedback.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading app feedback...</Text>
      </View>
    );
  }

  const avgRating = feedback.length > 0
    ? feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length
    : 0;

  const ratingCounts = {
    5: feedback.filter(f => f.rating === 5).length,
    4: feedback.filter(f => f.rating === 4).length,
    3: feedback.filter(f => f.rating === 3).length,
    2: feedback.filter(f => f.rating === 2).length,
    1: feedback.filter(f => f.rating === 1).length,
  };

  const satisfactionRate = feedback.length > 0
    ? Math.round((feedback.filter(f => f.rating >= 4).length / feedback.length) * 100)
    : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      {/* Last Update Info */}
      <View style={styles.updateInfo}>
        <Text style={styles.updateText}>
          Last updated: {lastUpdate.toLocaleTimeString()}
        </Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Total Feedback</Text>
            <Text style={styles.summaryIcon}>❤️</Text>
          </View>
          <Text style={styles.summaryValue}>{feedback.length}</Text>
          <Text style={styles.summarySubtext}>User submissions</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Average Rating</Text>
            <Text style={styles.summaryIcon}>⭐</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Text style={styles.summaryValue}>{avgRating.toFixed(2)}</Text>
            <Text style={styles.ratingOutOf}>/ 5.0</Text>
          </View>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Text key={star} style={styles.starIcon}>
                {star <= Math.round(avgRating) ? '⭐' : '☆'}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Satisfaction Rate</Text>
            <Text style={styles.summaryIcon}>📈</Text>
          </View>
          <Text style={styles.summaryValue}>{satisfactionRate}%</Text>
          <Text style={styles.summarySubtext}>4-5 star ratings</Text>
        </View>
      </View>

      {/* Rating Distribution */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rating Distribution</Text>
        <Text style={styles.cardDescription}>Breakdown of all app ratings</Text>
        <View style={styles.distributionContainer}>
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingCounts[rating as keyof typeof ratingCounts];
            const percentage = feedback.length > 0 ? (count / feedback.length) * 100 : 0;

            return (
              <View key={rating} style={styles.distributionRow}>
                <View style={styles.ratingLabel}>
                  <Text style={styles.ratingText}>{rating}</Text>
                  <Text style={styles.starSmall}>⭐</Text>
                </View>
                <View style={styles.barContainer}>
                  <View style={[styles.bar, { width: `${percentage}%` }]} />
                </View>
                <Text style={styles.countText}>{count}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* All Feedback */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>All Feedback</Text>
        <Text style={styles.cardDescription}>
          {feedback.length} total submissions from users
        </Text>

        {feedback.length === 0 ? (
          <Text style={styles.emptyText}>No feedback submitted yet</Text>
        ) : (
          <View style={styles.feedbackList}>
            {feedback.map((item: any) => (
              <View key={item.id} style={styles.feedbackItem}>
                <View style={styles.feedbackHeader}>
                  <View style={styles.feedbackLeft}>
                    <Text style={styles.feedbackUserName}>{item.userName}</Text>
                    <View style={styles.starsRowSmall}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Text key={star} style={styles.starIconSmall}>
                          {star <= item.rating ? '⭐' : '☆'}
                        </Text>
                      ))}
                    </View>
                    {item.category && (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.feedbackDate}>{formatDate(item.date)}</Text>
                </View>
                <Text style={styles.feedbackEmail}>{item.userEmail}</Text>
                <Text style={styles.feedbackComment}>{item.comment}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}