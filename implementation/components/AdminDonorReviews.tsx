import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { adminAPI } from '../utils/api';
import { showToast } from './Toast';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../utils/theme';

interface DonorStat {
  userId: string;
  userName: string;
  userEmail: string;
  totalReviews: number;
  averageRating: number;
  itemsShared: number;
  recentTrend: 'up' | 'down' | 'stable';
  detailedRatings: {
    [key: string]: {
      total: number;
      count: number;
      average: number;
    };
  };
}

interface DonorReview {
  id: string;
  donorId: string;
  donorName: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
  itemTitle: string;
  ratings?: {
    quality?: number;
    communication?: number;
    punctuality?: number;
    accuracy?: number;
  };
}

export function AdminDonorReviews({ isRefreshing }: { isRefreshing?: boolean }) {
  const { colors, isDark } = useTheme();
  const [donorStats, setDonorStats] = useState<DonorStat[]>([]);
  const [reviews, setReviews] = useState<DonorReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<DonorReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [filterRating, setFilterRating] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');

  useEffect(() => {
    loadDonorReviews();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reviews, searchQuery, selectedDonorId, sortBy, filterRating]);

  const loadDonorReviews = async () => {
    try {
      setIsLoading(true);
      const result = await adminAPI.getAllDonorReviews();
      setDonorStats(result.donorStats || []);
      setReviews(result.reviews || []);
      setFilteredReviews(result.reviews || []);
    } catch (error) {
      console.error('Error loading donor reviews:', error);
      showToast('Failed to load donor reviews', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reviews];

    // Filter by selected donor
    if (selectedDonorId) {
      filtered = filtered.filter(r => r.donorId === selectedDonorId);
    }

    // Filter by rating
    if (filterRating !== 'all') {
      const rating = parseInt(filterRating);
      filtered = filtered.filter(r => Math.floor(r.rating) === rating);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.donorName.toLowerCase().includes(query) ||
          r.reviewerName.toLowerCase().includes(query) ||
          r.comment.toLowerCase().includes(query) ||
          r.itemTitle.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    setFilteredReviews(filtered);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '⭐'.repeat(fullStars);
    if (hasHalfStar) stars += '½';
    return stars || '☆';
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.card,
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    headerIcon: {
      fontSize: 28,
      marginRight: spacing.sm,
    },
    title: {
      fontSize: fontSize['2xl'],
      fontWeight: fontWeight.bold as any,
      color: colors.foreground,
    },
    description: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    statsOverview: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: colors.card,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold as any,
      color: colors.foreground,
      marginBottom: spacing.xs,
    },
    statLabel: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    section: {
      padding: spacing.lg,
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold as any,
      color: colors.foreground,
      marginBottom: spacing.md,
    },
    donorStatsContainer: {
      marginBottom: spacing.lg,
    },
    donorCard: {
      backgroundColor: colors.card,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    donorCardSelected: {
      borderColor: colors.primary,
      borderWidth: 2,
      backgroundColor: isDark ? colors.secondary : colors.accent,
    },
    donorHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    donorInfo: {
      flex: 1,
    },
    donorName: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold as any,
      color: colors.foreground,
      marginBottom: spacing.xs,
    },
    donorEmail: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    donorTrend: {
      fontSize: 24,
    },
    donorStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    donorStatItem: {
      alignItems: 'center',
    },
    donorStatValue: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold as any,
      color: colors.foreground,
    },
    donorStatLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    filterSection: {
      marginBottom: spacing.lg,
    },
    filterRow: {
      flexDirection: 'row',
      marginBottom: spacing.sm,
    },
    filterButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      backgroundColor: colors.secondary,
      marginHorizontal: spacing.xs,
      alignItems: 'center',
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
    },
    filterButtonText: {
      fontSize: fontSize.sm,
      color: colors.foreground,
    },
    filterButtonTextActive: {
      color: colors.primaryForeground,
      fontWeight: fontWeight.semibold as any,
    },
    searchContainer: {
      position: 'relative',
      marginBottom: spacing.md,
    },
    searchInput: {
      backgroundColor: colors.inputBackground,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: fontSize.base,
      color: colors.foreground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    clearButton: {
      position: 'absolute',
      right: spacing.md,
      top: '50%',
      transform: [{ translateY: -12 }],
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    clearButtonText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    reviewsContainer: {
      marginBottom: spacing.xl,
    },
    reviewCard: {
      backgroundColor: colors.card,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    reviewerInfo: {
      flex: 1,
    },
    reviewerName: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold as any,
      color: colors.foreground,
    },
    reviewDonorName: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    reviewRating: {
      fontSize: fontSize.lg,
    },
    reviewContent: {
      marginBottom: spacing.sm,
    },
    reviewComment: {
      fontSize: fontSize.sm,
      color: colors.foreground,
      lineHeight: 20,
    },
    reviewFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    reviewItemTitle: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    reviewDate: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    detailedRatings: {
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    detailedRatingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: spacing.xs,
    },
    detailedRatingLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    detailedRatingValue: {
      fontSize: fontSize.xs,
      color: colors.foreground,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    loadingText: {
      fontSize: fontSize.base,
      color: colors.textSecondary,
      marginTop: spacing.md,
    },
    emptyContainer: {
      padding: spacing.xl,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: fontSize.base,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    clearFilterButton: {
      backgroundColor: colors.destructive,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    clearFilterButtonText: {
      color: colors.destructiveForeground,
      fontWeight: fontWeight.semibold as any,
      fontSize: fontSize.sm,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading donor reviews...</Text>
      </View>
    );
  }

  const totalDonors = donorStats.length;
  const avgRating =
    donorStats.length > 0
      ? donorStats.reduce((sum, d) => sum + d.averageRating, 0) / donorStats.length
      : 0;
  const totalReviews = reviews.length;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Text style={styles.headerIcon}>⭐</Text>
          <Text style={styles.title}>Donor Reviews</Text>
        </View>
        <Text style={styles.description}>
          Track and manage donor performance and feedback
        </Text>
      </View>

      {/* Overview Stats */}
      <View style={styles.statsOverview}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalDonors}</Text>
          <Text style={styles.statLabel}>Donors</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{avgRating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalReviews}</Text>
          <Text style={styles.statLabel}>Total Reviews</Text>
        </View>
      </View>

      {/* Donor Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Donor Performance ({donorStats.length})
        </Text>
        <View style={styles.donorStatsContainer}>
          {donorStats
            .sort((a, b) => b.averageRating - a.averageRating)
            .map(donor => (
              <TouchableOpacity
                key={donor.userId}
                style={[
                  styles.donorCard,
                  selectedDonorId === donor.userId && styles.donorCardSelected,
                ]}
                onPress={() =>
                  setSelectedDonorId(
                    selectedDonorId === donor.userId ? null : donor.userId
                  )
                }
              >
                <View style={styles.donorHeader}>
                  <View style={styles.donorInfo}>
                    <Text style={styles.donorName}>{donor.userName}</Text>
                    <Text style={styles.donorEmail}>{donor.userEmail}</Text>
                  </View>
                  <Text style={styles.donorTrend}>
                    {getTrendIcon(donor.recentTrend)}
                  </Text>
                </View>
                <View style={styles.donorStats}>
                  <View style={styles.donorStatItem}>
                    <Text style={styles.donorStatValue}>
                      {donor.averageRating.toFixed(1)} {getStarRating(donor.averageRating)}
                    </Text>
                    <Text style={styles.donorStatLabel}>Rating</Text>
                  </View>
                  <View style={styles.donorStatItem}>
                    <Text style={styles.donorStatValue}>{donor.totalReviews}</Text>
                    <Text style={styles.donorStatLabel}>Reviews</Text>
                  </View>
                  <View style={styles.donorStatItem}>
                    <Text style={styles.donorStatValue}>{donor.itemsShared}</Text>
                    <Text style={styles.donorStatLabel}>Items Shared</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
        </View>
      </View>

      {/* Reviews Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Reviews ({filteredReviews.length})</Text>

        {/* Filters */}
        <View style={styles.filterSection}>
          {/* Search */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search reviews..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Sort and Rating Filter */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                sortBy === 'date' && styles.filterButtonActive,
              ]}
              onPress={() => setSortBy('date')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  sortBy === 'date' && styles.filterButtonTextActive,
                ]}
              >
                By Date
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                sortBy === 'rating' && styles.filterButtonActive,
              ]}
              onPress={() => setSortBy('rating')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  sortBy === 'rating' && styles.filterButtonTextActive,
                ]}
              >
                By Rating
              </Text>
            </TouchableOpacity>
          </View>

          {/* Rating Filter */}
          <View style={styles.filterRow}>
            {(['all', '5', '4', '3', '2', '1'] as const).map(rating => (
              <TouchableOpacity
                key={rating}
                style={[
                  styles.filterButton,
                  filterRating === rating && styles.filterButtonActive,
                ]}
                onPress={() => setFilterRating(rating)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filterRating === rating && styles.filterButtonTextActive,
                  ]}
                >
                  {rating === 'all' ? 'All' : `${rating}⭐`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Clear Filter Button */}
          {(selectedDonorId || filterRating !== 'all' || searchQuery) && (
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={() => {
                setSelectedDonorId(null);
                setFilterRating('all');
                setSearchQuery('');
              }}
            >
              <Text style={styles.clearFilterButtonText}>Clear All Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsContainer}>
          {filteredReviews.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery || selectedDonorId || filterRating !== 'all'
                  ? 'No reviews match your filters'
                  : 'No donor reviews yet'}
              </Text>
            </View>
          ) : (
            filteredReviews.map(review => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>
                      By: {review.reviewerName}
                    </Text>
                    <Text style={styles.reviewDonorName}>
                      For: {review.donorName}
                    </Text>
                  </View>
                  <Text style={styles.reviewRating}>
                    {getStarRating(review.rating)}
                  </Text>
                </View>

                <View style={styles.reviewContent}>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>

                {/* Detailed Ratings */}
                {review.ratings && (
                  <View style={styles.detailedRatings}>
                    {Object.entries(review.ratings).map(([key, value]) => (
                      <View key={key} style={styles.detailedRatingRow}>
                        <Text style={styles.detailedRatingLabel}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}:
                        </Text>
                        <Text style={styles.detailedRatingValue}>
                          {value}/5 {getStarRating(value)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.reviewFooter}>
                  <Text style={styles.reviewItemTitle}>
                    Item: {review.itemTitle}
                  </Text>
                  <Text style={styles.reviewDate}>
                    {new Date(review.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}
