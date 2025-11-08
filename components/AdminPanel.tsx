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
import { colors, spacing, borderRadius } from '../utils/theme';

interface AdminPanelProps {
  currentUser: User;
}

export function AdminPanel({ currentUser }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

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
      'This action cannot be undone. This will permanently delete:\n\n' +
        '• User account and profile\n' +
        '• All items posted by this user\n' +
        '• All reviews written by this user\n' +
        '• All messages sent/received by this user\n\n' +
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
                `Deleted: ${userName}\n${result.itemsDeleted} items, ${result.reviewsDeleted} reviews, ${result.messagesDeleted} messages removed`,
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Text style={styles.headerIcon}>🛡️</Text>
          <Text style={styles.title}>Admin Panel</Text>
        </View>
        <Text style={styles.subtitle}>User Management</Text>
        <Text style={styles.description}>
          Manage all users in the Food Share system. You can view user details and delete
          accounts.
        </Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statsIcon}>👥</Text>
          <Text style={styles.statsText}>{users.length} total users</Text>
        </View>
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

      {searchQuery.length > 0 && (
        <Text style={styles.searchResults}>
          Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
        </Text>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery ? 'No users found matching your search' : 'No users found'}
          </Text>
        </View>
      ) : (
        <View style={styles.usersList}>
          {filteredUsers.map((user) => {
            const isCurrentUser = user.id === currentUser.id;
            const isDeleting = deletingUserId === user.id;

            return (
              <View
                key={user.id}
                style={[
                  styles.userCard,
                  isCurrentUser && styles.currentUserCard,
                ]}
              >
                <View style={styles.userHeader}>
                  <View style={styles.userNameContainer}>
                    <Text style={styles.userName}>{user.name}</Text>
                    {user.isAdmin && (
                      <View style={styles.adminBadge}>
                        <Text style={styles.adminBadgeText}>🛡️ Admin</Text>
                      </View>
                    )}
                    {isCurrentUser && (
                      <Text style={styles.youBadge}>(You)</Text>
                    )}
                  </View>
                </View>

                <View style={styles.userDetails}>
                  <Text style={styles.userDetailText}>📧 {user.email}</Text>
                  <Text style={styles.userDetailText}>📍 {user.location}</Text>
                  <Text style={styles.userDetailText}>
                    📅 Joined: {new Date(user.joinDate).toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.userStats}>
                  <Text style={styles.userStatText}>
                    🎁 {user.itemsShared} shared
                  </Text>
                  <Text style={styles.userStatText}>
                    📦 {user.itemsClaimed} claimed
                  </Text>
                  <Text style={styles.userStatText}>
                    ⭐ {user.rating.toFixed(1)} ({user.totalReviews} reviews)
                  </Text>
                </View>

                {user.bio && (
                  <Text style={styles.userBio}>&quot;{user.bio}&quot;</Text>
                )}

                {isCurrentUser ? (
                  <View style={styles.cannotDeleteButton}>
                    <Text style={styles.cannotDeleteButtonText}>
                      Cannot Delete Self
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.deleteButton,
                      isDeleting && styles.deleteButtonDisabled,
                    ]}
                    onPress={() => handleDeleteUser(user.id, user.name)}
                    disabled={isDeleting}
                  >
                    <Text style={styles.deleteButtonText}>
                      {isDeleting ? '🗑️ Deleting...' : '🗑️ Delete User'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerIcon: {
    fontSize: 24,
    marginRight: spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statsIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  statsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  searchContainer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  clearButton: {
    position: 'absolute',
    right: spacing.sm,
    top: '50%',
    transform: [{ translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchResults: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    fontSize: 14,
    color: colors.textSecondary,
  },
  loadingContainer: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  usersList: {
    padding: spacing.md,
    gap: spacing.md,
  },
  userCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  currentUserCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  userHeader: {
    marginBottom: spacing.sm,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: spacing.xs,
  },
  adminBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
  },
  adminBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  youBadge: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  userDetails: {
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  userDetailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  userStatText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  userBio: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  deleteButton: {
    backgroundColor: colors.error,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cannotDeleteButton: {
    backgroundColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cannotDeleteButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  errorCard: {
    margin: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
