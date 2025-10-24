import { View, Text, Pressable, StyleSheet } from "react-native";
import { User as UserType } from "./LoginPage";
import { useState } from "react";
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from "../utils/theme";

interface HeaderProps {
  onAddItem: () => void;
  user: UserType | null;
  onViewProfile: () => void;
  onLogout: () => void;
}

export function Header({ onAddItem, user, onViewProfile, onLogout }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Logo and Title */}
        <View style={styles.logo}>
          <Text style={styles.emoji}>🍽️</Text>
          <Text style={styles.title}>Fooditude</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {/* Share Food Button */}
          <Pressable
            style={styles.shareButton}
            onPress={onAddItem}
          >
            <View style={styles.shareButtonContent}>
              <Text style={styles.shareButtonText}>+</Text>
              <Text style={styles.shareButtonText}>Share</Text>
            </View>
          </Pressable>

          {/* User Menu */}
          {user && (
            <View>
              <Pressable
                style={styles.avatar}
                onPress={() => setShowMenu(!showMenu)}
              >
                <Text style={styles.avatarText}>
                  {getInitials(user.name)}
                </Text>
              </Pressable>

              {/* Dropdown Menu */}
              {showMenu && (
                <View style={styles.dropdown}>
                  {/* User Info */}
                  <View style={styles.dropdownHeader}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>

                  {/* Menu Items */}
                  <Pressable
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      onViewProfile();
                    }}
                  >
                    <Text style={styles.menuEmoji}>👤</Text>
                    <Text style={styles.menuText}>View Profile</Text>
                  </Pressable>

                  <Pressable
                    style={styles.menuItemLast}
                    onPress={() => {
                      setShowMenu(false);
                      onLogout();
                    }}
                  >
                    <Text style={styles.menuEmoji}>🚪</Text>
                    <Text style={styles.menuText}>Logout</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Overlay to close menu when clicking outside */}
      {showMenu && (
        <Pressable
          style={styles.overlay}
          onPress={() => setShowMenu(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emoji: {
    fontSize: fontSize['2xl'],
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.medium,
    color: colors.foreground,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  shareButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  shareButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  shareButtonText: {
    color: colors.primaryForeground,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primaryForeground,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
  },
  dropdown: {
    position: 'absolute',
    top: 48,
    right: 0,
    width: 224,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
    overflow: 'hidden',
    zIndex: 50,
  },
  dropdownHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userName: {
    fontWeight: fontWeight.medium,
    color: colors.cardForeground,
    fontSize: fontSize.base,
  },
  userEmail: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  menuItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuItemLast: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuEmoji: {
    fontSize: fontSize.lg,
  },
  menuText: {
    color: colors.foreground,
    fontSize: fontSize.base,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: 1000,
    marginTop: 56,
  },
});
