import { Modal, View, Text, Image, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { FoodItem } from "./ItemCard";
import { colors, spacing, borderRadius, fontSize, fontWeight } from "../utils/theme";

interface ItemDetailModalProps {
  item: FoodItem | null;
  visible: boolean;
  onClose: () => void;
  onClaim: (itemId: string) => void;
  onMessage: (itemId: string) => void;
}

export function ItemDetailModal({
  item,
  visible,
  onClose,
  onClaim,
  onMessage,
}: ItemDetailModalProps) {
  if (!item) return null;

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>
                  {item.title}
                </Text>
                {item.status === "reserved" && (
                  <View style={styles.reservedBadge}>
                    <Text style={styles.reservedEmoji}>✓</Text>
                    <Text style={styles.reservedText}>Reserved</Text>
                  </View>
                )}
              </View>
              <Pressable onPress={onClose}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>

            {/* Image */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>

            {/* Content */}
            <View style={styles.sections}>
              {/* Description */}
              <View>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.sectionText}>{item.description}</Text>
              </View>

              {/* Dietary Tags */}
              {item.dietaryTags.length > 0 && (
                <View>
                  <Text style={styles.sectionTitle}>Dietary Information</Text>
                  <View style={styles.tagsContainer}>
                    {item.dietaryTags.map((tag) => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Separator */}
              <View style={styles.separator} />

              {/* Details Grid */}
              <View style={styles.details}>
                {/* Location */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📍</Text>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Pickup Location</Text>
                    <Text style={styles.detailValue}>{item.location}</Text>
                  </View>
                </View>

                {/* Expiry Date */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📅</Text>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Best Before</Text>
                    <Text style={styles.detailValue}>
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                {/* Quantity */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📦</Text>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Quantity</Text>
                    <Text style={styles.detailValue}>{item.quantity}</Text>
                  </View>
                </View>

                {/* Contact */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>👤</Text>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Shared by</Text>
                    <Text style={styles.detailValue}>{item.contactName}</Text>
                  </View>
                </View>
              </View>

              {/* Pickup Instructions */}
              {item.pickupInstructions && (
                <>
                  <View style={styles.separator} />
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>🕐</Text>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Pickup Instructions</Text>
                      <Text style={styles.detailValue}>{item.pickupInstructions}</Text>
                    </View>
                  </View>
                </>
              )}

              {/* Separator */}
              <View style={styles.separator} />

              {/* Actions */}
              {item.status === "available" && (
                <View style={styles.actions}>
                  <Pressable
                    style={styles.primaryButton}
                    onPress={() => onClaim(item.id)}
                  >
                    <View style={styles.buttonContent}>
                      <Text style={styles.buttonEmoji}>✓</Text>
                      <Text style={styles.primaryButtonText}>Reserve This Food</Text>
                    </View>
                  </Pressable>

                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => onMessage(item.id)}
                  >
                    <View style={styles.buttonContent}>
                      <Text style={styles.buttonEmoji}>💬</Text>
                      <Text style={styles.secondaryButtonText}>Contact Donor</Text>
                    </View>
                  </Pressable>
                </View>
              )}

              {item.status === "reserved" && (
                <View style={styles.reservedNotice}>
                  <Text style={styles.reservedNoticeText}>
                    This food has been reserved and is no longer available.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerContent: {
    flex: 1,
    paddingRight: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.medium,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  reservedBadge: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reservedEmoji: {
    fontSize: fontSize.lg,
  },
  reservedText: {
    color: colors.secondaryForeground,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
  },
  closeButton: {
    fontSize: fontSize['2xl'],
    color: colors.mutedForeground,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: colors.muted,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing['2xl'],
    aspectRatio: 16/9,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  sections: {
    gap: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  sectionText: {
    fontSize: fontSize.base,
    color: colors.mutedForeground,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  tagText: {
    color: colors.foreground,
    fontSize: fontSize.base,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  details: {
    gap: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  detailIcon: {
    fontSize: fontSize.xl,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
  },
  detailValue: {
    fontSize: fontSize.base,
    color: colors.foreground,
    marginTop: 4,
  },
  actions: {
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  buttonEmoji: {
    fontSize: fontSize.lg,
  },
  primaryButtonText: {
    color: colors.primaryForeground,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
  },
  secondaryButtonText: {
    color: colors.secondaryForeground,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
  },
  reservedNotice: {
    backgroundColor: colors.muted,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  reservedNoticeText: {
    textAlign: 'center',
    color: colors.mutedForeground,
    fontSize: fontSize.base,
  },
});
