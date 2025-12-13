import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { User as UserType } from "./LoginPage";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
} from "../utils/theme";

interface HeaderProps {
  onAddItem: () => void;
  user: UserType | null;
  onViewProfile: () => void;
  onViewAdmin?: () => void;
  onLogout: () => void;
  currentView?: 'items' | 'profile' | 'admin' | 'messages';
  onBackToHome?: () => void;
}

export function Header({
  onAddItem,
  user,
  onViewProfile,
  onViewAdmin,
  onLogout,
  currentView,
  onBackToHome,
}: HeaderProps) {
  const { colors, toggleTheme, isDark } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.header}>
        {/* Logo and Title OR Back Button */}
        {currentView && currentView !== 'items' && currentView !== 'profile' && onBackToHome ? (
          <Pressable 
            style={styles.backButton} 
            onPress={onBackToHome}
          >
            <Text style={[styles.backArrow, { color: colors.foreground }]}>←</Text>
            <Text style={[styles.backText, { color: colors.foreground }]}>Home</Text>
          </Pressable>
        ) : (
          <View style={styles.logo}>
            <Text style={styles.emoji}>🍽️</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Fooditude</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {/* Dark Mode Toggle */}
          <Pressable
            style={[styles.themeButton, { backgroundColor: colors.secondary }]}
            onPress={toggleTheme}
          >
            <Text style={styles.themeButtonText}>{isDark ? "☀️" : "🌙"}</Text>
          </Pressable>

          {/* Share Food Button */}
          <Pressable
            style={[styles.shareButton, { backgroundColor: colors.primary, ...shadows.sm }]}
            onPress={onAddItem}
          >
            <View style={styles.shareButtonContent}>
              <Text style={[styles.shareButtonText, { color: colors.primaryForeground }]}>+</Text>
              <Text style={[styles.shareButtonText, { color: colors.primaryForeground }]}>Share</Text>
            </View>
          </Pressable>

          {/* User Menu */}
          {user && (
            <View>
              <Pressable
                style={[styles.avatar, { backgroundColor: colors.primary }]}
                onPress={() => setShowMenu(!showMenu)}
              >
                <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>
                  {getInitials(user.name)}
                </Text>
              </Pressable>

              {/* Dropdown Menu */}
              {showMenu && (
                <View style={[
                  styles.dropdown, 
                  { backgroundColor: colors.card, borderColor: colors.border, ...shadows.lg }
                ]}>
                  {/* User Info */}
                  <View style={[styles.dropdownHeader, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.userName, { color: colors.cardForeground }]}>
                      {user.name}
                    </Text>
                    <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>
                      {user.email}
                    </Text>
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
                    <Text style={[styles.menuText, { color: colors.cardForeground }]}>
                      View Profile
                    </Text>
                  </Pressable>

                  {user.isAdmin && onViewAdmin && (
                    <Pressable
                      style={styles.menuItem}
                      onPress={() => {
                        setShowMenu(false);
                        onViewAdmin();
                      }}
                    >
                      <Text style={styles.menuEmoji}>🛡️</Text>
                      <Text style={[styles.menuText, { color: colors.cardForeground }]}>Admin Panel</Text>
                    </Pressable>
                  )}

                  <Pressable
                    style={styles.menuItemLast}
                    onPress={() => {
                      setShowMenu(false);
                      onLogout();
                    }}
                  >
                    <Text style={styles.menuEmoji}>🚪</Text>
                    <Text style={[styles.menuText, { color: colors.cardForeground }]}>Logout</Text>
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
    borderBottomWidth: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  emoji: {
    fontSize: fontSize["2xl"],
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  themeButtonText: {
    fontSize: fontSize.lg,
  },
  shareButton: {
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  shareButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  shareButtonText: {
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
  },
  dropdown: {
    position: "absolute",
    top: 48,
    right: 0,
    width: 224,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    zIndex: 50,
  },
  dropdownHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  userName: {
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: fontSize.xs,
  },
  menuItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  menuItemLast: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  menuEmoji: {
    fontSize: fontSize.base,
  },
  menuText: {
    fontSize: fontSize.sm,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 40,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backArrow: {
    fontSize: fontSize.lg,
  },
  backText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});