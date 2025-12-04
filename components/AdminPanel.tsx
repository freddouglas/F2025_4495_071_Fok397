import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { User } from './LoginPage';
import { adminAPI } from '../utils/api';
import { showToast } from './Toast';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminAppFeedback } from './AdminAppFeedback';
import { AdminDonorReviews } from './AdminDonorReviews';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../utils/theme';

interface AdminPanelProps {
  currentUser: User;
}

type TabType = 'users' | 'analytics' | 'feedback' | 'donor-reviews';

export function AdminPanel({ currentUser }: AdminPanelProps) {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadUsers();

    // Auto-refresh every 30 seconds when on analytics tab
    const interval = setInterval(() => {
      if (activeTab === 'analytics') {
        refreshAnalytics();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.location.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const refreshAnalytics = async () => {
    setIsRefreshing(true);
    // The AdminAnalytics component will handle its own refresh
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const result = await adminAPI.getAllUsers();
      setUsers(result.users || []);
      setFilteredUsers(result.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    Alert.alert(
      `Delete User: ${userName}?`,
      'This action cannot be undone. This will permanently delete:\\n\\n' +
        '• User account and profile\\n' +
        '• All items posted by this user\\n' +
        '• All reviews written by this user\\n' +
        '• All messages sent/received by this user\\n\\n' +
        'Are you absolutely sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingUserId(userId);
              const result = await adminAPI.deleteUser(userId);

              showToast(
                `Deleted: ${userName}\\n${result.itemsDeleted} items, ${result.reviewsDeleted} reviews, ${result.messagesDeleted} messages removed`,
                'success'
              );

              // Remove user from list
              setUsers((prev) => prev.filter((u) => u.id !== userId));
            } catch (error) {
              console.error('Error deleting user:', error);
              showToast(
                `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'error'
              );
            } finally {
              setDeletingUserId(null);
            }
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: spacing.lg,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    headerIcon: {
      fontSize: fontSize['2xl'],
      marginRight: spacing.sm,
    },
    title: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.medium as any,
      color: colors.foreground,
    },
    description: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    errorCard: {
      margin: spacing.lg,
      padding: spacing.xl,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    errorTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.medium as any,
      color: colors.foreground,
      marginBottom: spacing.sm,
    },
    errorText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    tabsContainer: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: colors.primary,
    },
    tabIcon: {
      fontSize: fontSize.sm,
      marginRight: spacing.xs,
    },
    tabText: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      fontWeight: fontWeight.medium as any,
    },
    activeTabText: {
      color: colors.foreground,
    },
    scrollView: {
      flex: 1,
    },
    statsCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      margin: spacing.lg,
    },
    statsIcon: {
      fontSize: fontSize.lg,
      marginRight: spacing.sm,
    },
    statsText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    searchContainer: {
      position: 'relative',
      marginHorizontal: spacing.lg,
      marginBottom: spacing.lg,
    },
    searchInput: {
      backgroundColor: colors.inputBackground,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      paddingRight: spacing.xl * 2,
      fontSize: fontSize.sm,
      color: colors.foreground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    clearButton: {
      position: 'absolute',
      right: spacing.md,
      top: '50%',
      transform: [{ translateY: -12 }],
      padding: spacing.xs,
    },
    clearButtonText: {
      fontSize: fontSize.lg,
      color: colors.textSecondary,
    },
    loadingContainer: {
      padding: spacing.xl * 2,
      alignItems: 'center',
    },
    loadingText: {
      marginTop: spacing.md,
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    emptyContainer: {
      padding: spacing.xl * 2,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    userList: {
      padding: spacing.lg,
    },
    userCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    userInfo: {
      marginBottom: spacing.md,
    },
    userHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    userName: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium as any,
      color: colors.foreground,
      marginRight: spacing.sm,
    },
    adminBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.md,
    },
    adminBadgeText: {
      fontSize: fontSize.xs,
      color: colors.primaryForeground,
      fontWeight: fontWeight.bold as any,
    },
    userEmail: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    userLocation: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    userDate: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    deleteButton: {
      backgroundColor: colors.destructive,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      alignItems: 'center',
    },
    deleteButtonDisabled: {
      opacity: 0.5,
    },
    deleteButtonText: {
      fontSize: fontSize.sm,
      color: colors.destructiveForeground,
      fontWeight: fontWeight.medium as any,
    },
  });

  if (!currentUser.isAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>
            You don't have permission to view this page.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Text style={styles.headerIcon}>🛡️</Text>
          <Text style={styles.title}>Admin Panel</Text>
        </View>
        <Text style={styles.description}>
          Manage users, view analytics, and monitor Food Share activity
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={styles.tabIcon}>👥</Text>
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            User Management
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={styles.tabIcon}>📊</Text>
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
            Review Analytics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'feedback' && styles.activeTab]}
          onPress={() => setActiveTab('feedback')}
        >
          <Text style={styles.tabIcon}>💬</Text>
          <Text style={[styles.tabText, activeTab === 'feedback' && styles.activeTabText]}>
            App Feedback
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'donor-reviews' && styles.activeTab]}
          onPress={() => setActiveTab('donor-reviews')}
        >
          <Text style={styles.tabIcon}>🌟</Text>
          <Text style={[styles.tabText, activeTab === 'donor-reviews' && styles.activeTabText]}>
            Donor Reviews
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'users' && (
        <ScrollView style={styles.scrollView}>
          {/* Stats */}
          <View style={styles.statsCard}>
            <Text style={styles.statsIcon}>👥</Text>
            <Text style={styles.statsText}>{users.length} total users</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, email, or location..."
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

          {/* User List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading users...</Text>
            </View>
          ) : filteredUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No users found matching your search' : 'No users yet'}
              </Text>
            </View>
          ) : (
            <View style={styles.userList}>
              {filteredUsers.map((user) => (
                <View key={user.id} style={styles.userCard}>
                  <View style={styles.userInfo}>
                    <View style={styles.userHeader}>
                      <Text style={styles.userName}>{user.name}</Text>
                      {user.isAdmin && (
                        <View style={styles.adminBadge}>
                          <Text style={styles.adminBadgeText}>Admin</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <Text style={styles.userLocation}>📍 {user.location}</Text>
                    <Text style={styles.userDate}>
                      Joined {new Date(user.joinDate).toLocaleDateString()}
                    </Text>
                  </View>

                  {!user.isAdmin && (
                    <TouchableOpacity
                      style={[
                        styles.deleteButton,
                        deletingUserId === user.id && styles.deleteButtonDisabled,
                      ]}
                      onPress={() => handleDeleteUser(user.id, user.name)}
                      disabled={deletingUserId === user.id}
                    >
                      {deletingUserId === user.id ? (
                        <ActivityIndicator size="small" color={colors.destructiveForeground} />
                      ) : (
                        <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {activeTab === 'analytics' && (
        <AdminAnalytics isRefreshing={isRefreshing} />
      )}

      {activeTab === 'feedback' && (
        <AdminAppFeedback isRefreshing={isRefreshing} />
      )}

      {activeTab === 'donor-reviews' && (
        <AdminDonorReviews isRefreshing={isRefreshing} />
      )}
    </View>
  );
}