// import React from 'react';
// import { View, Pressable, Text, StyleSheet } from 'react-native';
// import { useTheme } from '../contexts/ThemeContext';
// import { spacing, borderRadius, fontSize, shadows } from '../utils/theme';

// interface FloatingActionButtonsProps {
//   onMessagesPress: () => void;
//   onProfilePress: () => void;
//   currentView: 'items' | 'profile' | 'admin' | 'messages';
//   messageCount?: number;
// }

// export function FloatingActionButtons({
//   onMessagesPress,
//   onProfilePress,
//   currentView,
//   messageCount = 0,
// }: FloatingActionButtonsProps) {
//   const { colors } = useTheme();

//   // Don't show buttons if we're already on those screens
//   if (currentView === 'messages' || currentView === 'profile') {
//     return null;
//   }

//   return (
//     <View style={styles.container}>
//       {/* Messages Button */}
//       <Pressable
//         style={[
//           styles.button,
//           { backgroundColor: colors.card, borderColor: colors.border, ...shadows.lg },
//         ]}
//         onPress={onMessagesPress}
//         activeOpacity={0.8}
//       >
//         <Text style={styles.icon}>💬</Text>
//         {messageCount > 0 && (
//           <View style={[styles.badge, { backgroundColor: colors.destructive }]}>
//             <Text style={[styles.badgeText, { color: colors.destructiveForeground }]}>
//               {messageCount > 9 ? '9+' : messageCount}
//             </Text>
//           </View>
//         )}
//       </Pressable>

//       {/* Profile Button */}
//       <Pressable
//         style={[
//           styles.button,
//           { backgroundColor: colors.card, borderColor: colors.border, ...shadows.lg },
//         ]}
//         onPress={onProfilePress}
//         activeOpacity={0.8}
//       >
//         <Text style={styles.icon}>👤</Text>
//       </Pressable>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     position: 'absolute',
//     bottom: spacing['3xl'],
//     right: spacing.lg,
//     gap: spacing.md,
//     zIndex: 100,
//   },
//   button: {
//     width: 56,
//     height: 56,
//     borderRadius: borderRadius.full,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 1,
//   },
//   icon: {
//     fontSize: fontSize['2xl'],
//   },
//   badge: {
//     position: 'absolute',
//     top: -4,
//     right: -4,
//     minWidth: 20,
//     height: 20,
//     borderRadius: borderRadius.full,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: spacing.xs,
//   },
//   badgeText: {
//     fontSize: fontSize.xs,
//     fontWeight: '700',
//   },
// });
