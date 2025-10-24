import { useMemo } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { colors, spacing, borderRadius, fontSize, fontWeight } from "../utils/theme";

export interface FoodItem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  expiryDate: string;
  quantity: string;
  imageUrl: string;
  contactName: string;
  contactEmail: string;
  dietaryTags: string[];
  status: "available" | "reserved";
  pickupInstructions?: string;
}

interface ItemCardProps {
  item: FoodItem;
  onPress: () => void;
}

function formatExpiryDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Expires today";
    if (diffDays === 1) return "Expires tomorrow";
    if (diffDays <= 3) return `${diffDays} days left`;
    return date.toLocaleDateString();
  } catch {
    return "Date unavailable";
  }
}

export function ItemCard({ item, onPress }: ItemCardProps) {
  const expiryText = useMemo(() => formatExpiryDate(item.expiryDate), [item.expiryDate]);
  const isUrgent = useMemo(() => 
    expiryText.includes("today") || expiryText.includes("tomorrow") || expiryText.includes("days left"),
    [expiryText]
  );

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
    >
      {/* Image with badges */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Urgent expiry badge */}
        {isUrgent && item.status === "available" && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentBadgeText}>
              {expiryText}
            </Text>
          </View>
        )}
        
        {/* Reserved badge */}
        {item.status === "reserved" && (
          <View style={styles.reservedBadge}>
            <Text style={styles.reservedBadgeText}>
              Reserved
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Dietary tags */}
        <View style={styles.tagsContainer}>
          {item.dietaryTags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Details */}
        <View style={styles.details}>
          {/* Location */}
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailText}>{item.location}</Text>
          </View>

          {/* Quantity */}
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📦</Text>
            <Text style={styles.detailText}>{item.quantity}</Text>
          </View>

          {/* Expiry date */}
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>{expiryText}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: colors.muted,
    aspectRatio: 4/3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  urgentBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.destructive,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  urgentBadgeText: {
    color: colors.destructiveForeground,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  reservedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  reservedBadgeText: {
    color: colors.secondaryForeground,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.cardForeground,
  },
  description: {
    fontSize: fontSize.base,
    color: colors.mutedForeground,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  tag: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: fontSize.xs,
    color: colors.foreground,
  },
  details: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailIcon: {
    fontSize: fontSize.sm,
  },
  detailText: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
  },
});
