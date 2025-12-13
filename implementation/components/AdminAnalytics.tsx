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

interface AdminAnalyticsProps {
  isRefreshing?: boolean;
}

export function AdminAnalytics({ isRefreshing }: AdminAnalyticsProps) {
  const { colors } = useTheme();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (isRefreshing) {
      loadAnalytics();
    }
  }, [isRefreshing]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const result = await adminAPI.getReviewAnalytics();
      setAnalytics(result);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading analytics:', error);
      showToast('Failed to load analytics', 'error');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
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
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    cardHeaderIcon: {
      fontSize: fontSize.lg,
      marginRight: spacing.sm,
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
    topUsersList: {
      marginTop: spacing.md,
    },
    topUserRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    topUserLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    rankBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    rankText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
      color: colors.primaryForeground,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: colors.foreground,
      marginBottom: 2,
    },
    userRating: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    userRatingIcon: {
      fontSize: fontSize.sm,
      marginRight: spacing.xs,
    },
    userRatingText: {
      fontSize: fontSize.sm,
      color: colors.mutedForeground,
    },
    medalBadge: {
      backgroundColor: colors.secondary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
    },
    goldBadge: {
      backgroundColor: colors.primary,
    },
    medalText: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      color: colors.foreground,
    },
    reviewsList: {
      marginTop: spacing.md,
    },
    reviewItem: {
      marginBottom: spacing.lg,
      paddingBottom: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    reviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.xs,
    },
    reviewLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    reviewerName: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: colors.foreground,
      marginRight: spacing.sm,
    },
    reviewRating: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    reviewRatingIcon: {
      fontSize: fontSize.sm,
      marginRight: 2,
    },
    reviewRatingText: {
      fontSize: fontSize.sm,
      color: colors.foreground,
    },
    reviewDate: {
      fontSize: fontSize.xs,
      color: colors.mutedForeground,
    },
    reviewItemTitle: {
      fontSize: fontSize.xs,
      color: colors.mutedForeground,
      marginBottom: spacing.sm,
    },
    reviewComment: {
      fontSize: fontSize.sm,
      color: colors.mutedForeground,
    },
  });

  if (isLoading && !analytics) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>No analytics data available</Text>
      </View>
    );
  }

  // Prepare rating distribution data
  const ratingDistribution = Object.entries(analytics.ratingDistribution || {}).reverse();

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
            <Text style={styles.summaryTitle}>Total Reviews</Text>
            <Text style={styles.summaryIcon}>💬</Text>
          </View>
          <Text style={styles.summaryValue}>{analytics.totalReviews}</Text>
          <Text style={styles.summarySubtext}>Community feedback</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Average Rating</Text>
            <Text style={styles.summaryIcon}>⭐</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Text style={styles.summaryValue}>{analytics.avgRating.toFixed(2)}</Text>
            <Text style={styles.ratingOutOf}>/ 5.0</Text>
          </View>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Text key={star} style={styles.starIcon}>
                {star <= Math.round(analytics.avgRating) ? '⭐' : '☆'}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Top Users</Text>
            <Text style={styles.summaryIcon}>👥</Text>
          </View>
          <Text style={styles.summaryValue}>{analytics.topRatedUsers?.length || 0}</Text>
          <Text style={styles.summarySubtext}>Users with reviews</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Recent Activity</Text>
            <Text style={styles.summaryIcon}>📈</Text>
          </View>
          <Text style={styles.summaryValue}>
            {Object.keys(analytics.reviewsByDay || {}).length}
          </Text>
          <Text style={styles.summarySubtext}>Days with reviews</Text>
        </View>
      </View>

      {/* Rating Distribution */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rating Distribution</Text>
        <Text style={styles.cardDescription}>Breakdown of all ratings in the system</Text>
        <View style={styles.distributionContainer}>
          {ratingDistribution.map(([rating, count]) => {
            const total = analytics.totalReviews;
            const percentage = total > 0 ? ((count as number) / total) * 100 : 0;
            
            return (
              <View key={rating} style={styles.distributionRow}>
                <View style={styles.ratingLabel}>
                  <Text style={styles.ratingText}>{rating}</Text>
                  <Text style={styles.starSmall}>⭐</Text>
                </View>
                <View style={styles.barContainer}>
                  <View style={[styles.bar, { width: `${percentage}%` }]} />
                </View>
                <Text style={styles.countText}>{count as number}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Top Rated Users */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderIcon}>🏆</Text>
          <Text style={styles.cardTitle}>Top Rated Users</Text>
        </View>
        <Text style={styles.cardDescription}>Users with the highest average ratings</Text>
        
        {analytics.topRatedUsers && analytics.topRatedUsers.length > 0 ? (
          <View style={styles.topUsersList}>
            {analytics.topRatedUsers.map((user: any, index: number) => (
              <View key={user.id} style={styles.topUserRow}>
                <View style={styles.topUserLeft}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <View style={styles.userRating}>
                      <Text style={styles.userRatingIcon}>⭐</Text>
                      <Text style={styles.userRatingText}>
                        {user.rating.toFixed(2)} ({user.totalReviews} reviews)
                      </Text>
                    </View>
                  </View>
                </View>
                {index < 3 && (
                  <View style={[styles.medalBadge, index === 0 && styles.goldBadge]}>
                    <Text style={styles.medalText}>
                      {index === 0 ? '🥇 Gold' : index === 1 ? '🥈 Silver' : '🥉 Bronze'}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No users with reviews yet</Text>
        )}
      </View>

      {/* Recent Reviews */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Reviews</Text>
        <Text style={styles.cardDescription}>Latest reviews submitted by users</Text>
        
        {analytics.recentReviews && analytics.recentReviews.length > 0 ? (
          <View style={styles.reviewsList}>
            {analytics.recentReviews.map((review: any) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewLeft}>
                    <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                    <View style={styles.reviewRating}>
                      <Text style={styles.reviewRatingIcon}>⭐</Text>
                      <Text style={styles.reviewRatingText}>{review.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>{formatDate(review.date)}</Text>
                </View>
                <Text style={styles.reviewItemTitle}>{review.itemTitle}</Text>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No reviews submitted yet</Text>
        )}
      </View>
    </ScrollView>
  );
}