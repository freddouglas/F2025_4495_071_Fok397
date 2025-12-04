// import React from 'react';
// import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
// import { useTheme } from '../contexts/ThemeContext';
// import { spacing, borderRadius, fontSize, fontWeight } from '../utils/theme';

// interface BottomNavProps {
//   activeView: 'items' | 'messages' | 'profile' | 'admin';
//   onViewChange: (view: 'items' | 'messages' | 'profile' | 'admin') => void;
//   isAdmin: boolean;
// }

// export function BottomNav({ activeView, onViewChange, isAdmin }: BottomNavProps) {
//   const { colors } = useTheme();

//   const navItems = [
//     { id: 'items' as const, icon: '🏠', label: 'Home' },
//     { id: 'messages' as const, icon: '💬', label: 'Messages' },
//     { id: 'profile' as const, icon: '👤', label: 'Profile' },
//     ...(isAdmin ? [{ id: 'admin' as const, icon: '🛡️', label: 'Admin' }] : []),
//   ];

//   return (
//     <View style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
//       {navItems.map((item) => {
//         const isActive = activeView === item.id;
//         return (
//           <TouchableOpacity
//             key={item.id}
//             style={styles.navItem}
//             onPress={() => onViewChange(item.id)}
//             activeOpacity={0.7}
//           >
//             <View
//               style={[
//                 styles.iconContainer,
//                 isActive && { backgroundColor: colors.primary },
//               ]}
//             >
//               <Text style={[styles.icon, isActive && { transform: [{ scale: 1.1 }] }]}>
//                 {item.icon}
//               </Text>
//             </View>
//             <Text
//               style={[
//                 styles.label,
//                 { color: isActive ? colors.primary : colors.mutedForeground },
//               ]}
//             >
//               {item.label}
//             </Text>
//           </TouchableOpacity>
//         );
//       })}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     borderTopWidth: 1,
//     paddingVertical: spacing.sm,
//     paddingHorizontal: spacing.xs,
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//   },
//   navItem: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: spacing.xs,
//   },
//   iconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: borderRadius.xl,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: spacing.xs,
//   },
//   icon: {
//     fontSize: fontSize.xl,
//   },
//   label: {
//     fontSize: fontSize.xs,
//     fontWeight: fontWeight.medium,
//   },
// });
