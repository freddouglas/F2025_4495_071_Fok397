import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from "../utils/theme";

interface ItemFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  dietary: string;
  onDietaryChange: (dietary: string) => void;
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "produce", label: "Produce" },
  { value: "dairy", label: "Dairy & Eggs" },
  { value: "bakery", label: "Bakery" },
  { value: "prepared", label: "Prepared Meals" },
  { value: "pantry", label: "Pantry Items" },
  { value: "other", label: "Other" },
];

const DIETARY_OPTIONS = [
  { value: "all", label: "All Dietary" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten Free" },
  { value: "dairy-free", label: "Dairy Free" },
];

export function ItemFilters({
  searchQuery,
  onSearchChange,
  category,
  onCategoryChange,
  dietary,
  onDietaryChange,
}: ItemFiltersProps) {
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDietaryPicker, setShowDietaryPicker] = useState(false);

  const selectedCategory = CATEGORIES.find(c => c.value === category);
  const selectedDietary = DIETARY_OPTIONS.find(d => d.value === dietary);

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchIcon}>
          <Text style={styles.iconText}>🔍</Text>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search food items..."
          placeholderTextColor={colors.mutedForeground}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </View>

      {/* Filter Dropdowns */}
      <View style={styles.filtersRow}>
        {/* Category Filter */}
        <View style={styles.filterColumn}>
          <Pressable
            style={styles.filterButton}
            onPress={() => {
              setShowCategoryPicker(!showCategoryPicker);
              setShowDietaryPicker(false);
            }}
          >
            <Text style={styles.filterButtonText}>{selectedCategory?.label || "Category"}</Text>
            <Text style={styles.filterButtonArrow}>{showCategoryPicker ? "▲" : "▼"}</Text>
          </Pressable>

          {showCategoryPicker && (
            <View style={styles.dropdown}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.value}
                  style={styles.dropdownItem}
                  onPress={() => {
                    onCategoryChange(cat.value);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      category === cat.value && styles.dropdownItemTextActive
                    ]}
                  >
                    {cat.value === category && "✓ "}
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Dietary Filter */}
        <View style={styles.filterColumn}>
          <Pressable
            style={styles.filterButton}
            onPress={() => {
              setShowDietaryPicker(!showDietaryPicker);
              setShowCategoryPicker(false);
            }}
          >
            <Text style={styles.filterButtonText}>{selectedDietary?.label || "Dietary"}</Text>
            <Text style={styles.filterButtonArrow}>{showDietaryPicker ? "▲" : "▼"}</Text>
          </Pressable>

          {showDietaryPicker && (
            <View style={styles.dropdown}>
              {DIETARY_OPTIONS.map((diet) => (
                <Pressable
                  key={diet.value}
                  style={styles.dropdownItem}
                  onPress={() => {
                    onDietaryChange(diet.value);
                    setShowDietaryPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      dietary === diet.value && styles.dropdownItemTextActive
                    ]}
                  >
                    {diet.value === dietary && "✓ "}
                    {diet.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Overlay to close dropdowns when clicking outside */}
      {(showCategoryPicker || showDietaryPicker) && (
        <Pressable
          style={styles.overlay}
          onPress={() => {
            setShowCategoryPicker(false);
            setShowDietaryPicker(false);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  searchContainer: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 10,
  },
  iconText: {
    color: colors.mutedForeground,
    fontSize: fontSize.base,
  },
  searchInput: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingLeft: 40,
    paddingRight: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.foreground,
    fontSize: fontSize.base,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterColumn: {
    flex: 1,
  },
  filterButton: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterButtonText: {
    color: colors.foreground,
    fontSize: fontSize.base,
  },
  filterButtonArrow: {
    color: colors.mutedForeground,
    fontSize: fontSize.sm,
  },
  dropdown: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
    overflow: 'hidden',
    zIndex: 50,
  },
  dropdownItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemText: {
    color: colors.foreground,
    fontSize: fontSize.base,
  },
  dropdownItemTextActive: {
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: 1000,
    marginTop: 120,
  },
});
