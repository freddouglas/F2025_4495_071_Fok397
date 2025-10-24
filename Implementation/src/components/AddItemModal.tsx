import { useState } from "react";
import { Modal, View, Text, TextInput, Pressable, ScrollView, Image, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import type { FoodItem } from "./ItemCard";
import { uploadImageMobile } from "../utils/api";
import { showToast } from "./Toast";
import { colors, spacing, borderRadius, fontSize, fontWeight } from "../utils/theme";

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAddItem: (item: Omit<FoodItem, "id">) => void;
}

const CATEGORIES = [
  { value: "produce", label: "Produce" },
  { value: "dairy", label: "Dairy & Eggs" },
  { value: "bakery", label: "Bakery" },
  { value: "prepared", label: "Prepared Meals" },
  { value: "pantry", label: "Pantry Items" },
  { value: "other", label: "Other" },
];

const DIETARY_TAGS = ["Vegetarian", "Vegan", "Gluten Free", "Dairy Free"];

export function AddItemModal({ visible, onClose, onAddItem }: AddItemModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other",
    location: "",
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    quantity: "",
    imageUrl: "",
    contactName: "",
    contactEmail: "",
    dietaryTags: [] as string[],
    pickupInstructions: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim() || 
        !formData.quantity.trim() || !formData.contactName.trim() || !formData.contactEmail.trim()) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    onAddItem({
      ...formData,
      status: "available",
    });

    // Reset form
    setFormData({
      title: "",
      description: "",
      category: "other",
      location: "",
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      quantity: "",
      imageUrl: "",
      contactName: "",
      contactEmail: "",
      dietaryTags: [],
      pickupInstructions: "",
    });
    setImagePreview("");
    onClose();
  };

  const toggleDietaryTag = (tag: string) => {
    setFormData({
      ...formData,
      dietaryTags: formData.dietaryTags.includes(tag)
        ? formData.dietaryTags.filter(t => t !== tag)
        : [...formData.dietaryTags, tag]
    });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showToast("Permission needed to access photos", "error");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      await uploadSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showToast("Permission needed to access camera", "error");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      await uploadSelectedImage(result.assets[0].uri);
    }
  };

  const uploadSelectedImage = async (uri: string) => {
    try {
      setIsUploading(true);
      setImagePreview(uri);
      
      const fileName = `food-${Date.now()}.jpg`;
      const url = await uploadImageMobile(uri, fileName);
      
      setFormData({ ...formData, imageUrl: url });
      showToast("Image uploaded successfully!", "success");
    } catch (error) {
      console.error("Error uploading image:", error);
      showToast("Failed to upload image", "error");
      setImagePreview("");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, imageUrl: "" });
    setImagePreview("");
  };

  const selectedCategory = CATEGORIES.find(c => c.value === formData.category);

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Share Food</Text>
                <Pressable onPress={onClose}>
                  <Text style={styles.closeButton}>✕</Text>
                </Pressable>
              </View>

              <Text style={styles.subtitle}>
                Share surplus food with your community and help reduce waste.
              </Text>

              <View style={styles.form}>
                {/* Title */}
                <View style={styles.field}>
                  <Text style={styles.label}>Food Item *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Fresh Tomatoes, Homemade Bread"
                    placeholderTextColor={colors.mutedForeground}
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                  />
                </View>

                {/* Description */}
                <View style={styles.field}>
                  <Text style={styles.label}>Description *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe the food item, condition, ingredients, etc..."
                    placeholderTextColor={colors.mutedForeground}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                  />
                </View>

                {/* Category and Quantity */}
                <View style={styles.row}>
                  <View style={[styles.field, styles.flex]}>
                    <Text style={styles.label}>Category *</Text>
                    <Pressable
                      style={styles.picker}
                      onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                    >
                      <Text style={styles.pickerText}>{selectedCategory?.label}</Text>
                      <Text style={styles.pickerArrow}>{showCategoryPicker ? "▲" : "▼"}</Text>
                    </Pressable>

                    {showCategoryPicker && (
                      <View style={styles.dropdown}>
                        {CATEGORIES.map((cat) => (
                          <Pressable
                            key={cat.value}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setFormData({ ...formData, category: cat.value });
                              setShowCategoryPicker(false);
                            }}
                          >
                            <Text style={[
                              styles.dropdownItemText,
                              formData.category === cat.value && styles.dropdownItemTextActive
                            ]}>
                              {cat.value === formData.category && "✓ "}{cat.label}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>

                  <View style={[styles.field, styles.flex]}>
                    <Text style={styles.label}>Quantity *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 5 lbs"
                      placeholderTextColor={colors.mutedForeground}
                      value={formData.quantity}
                      onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                    />
                  </View>
                </View>

                {/* Expiry Date */}
                <View style={styles.field}>
                  <Text style={styles.label}>Best Before Date *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.mutedForeground}
                    value={formData.expiryDate}
                    onChangeText={(text) => setFormData({ ...formData, expiryDate: text })}
                  />
                </View>

                {/* Dietary Tags */}
                <View style={styles.field}>
                  <Text style={styles.label}>Dietary Information</Text>
                  <View style={styles.tagsContainer}>
                    {DIETARY_TAGS.map((tag) => (
                      <Pressable
                        key={tag}
                        style={[
                          styles.tagButton,
                          formData.dietaryTags.includes(tag) && styles.tagButtonActive
                        ]}
                        onPress={() => toggleDietaryTag(tag)}
                      >
                        <Text style={[
                          styles.tagButtonText,
                          formData.dietaryTags.includes(tag) && styles.tagButtonTextActive
                        ]}>
                          {formData.dietaryTags.includes(tag) && "✓ "}{tag}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Location */}
                <View style={styles.field}>
                  <Text style={styles.label}>Pickup Location *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 123 Main St, Apartment 4B"
                    placeholderTextColor={colors.mutedForeground}
                    value={formData.location}
                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                  />
                </View>

                {/* Pickup Instructions */}
                <View style={styles.field}>
                  <Text style={styles.label}>Pickup Instructions</Text>
                  <TextInput
                    style={[styles.input, styles.textAreaSmall]}
                    placeholder="e.g., Ring doorbell, available after 5pm"
                    placeholderTextColor={colors.mutedForeground}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    value={formData.pickupInstructions}
                    onChangeText={(text) => setFormData({ ...formData, pickupInstructions: text })}
                  />
                </View>

                {/* Image Upload */}
                <View style={styles.field}>
                  <Text style={styles.label}>Food Image</Text>
                  
                  {(imagePreview || formData.imageUrl) ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image
                        source={{ uri: imagePreview || formData.imageUrl }}
                        style={styles.imagePreview}
                        resizeMode="cover"
                      />
                      <Pressable
                        style={styles.removeImageButton}
                        onPress={handleRemoveImage}
                      >
                        <Text style={styles.removeImageText}>✕</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Text style={styles.imagePlaceholderEmoji}>🖼️</Text>
                      <Text style={styles.imagePlaceholderText}>No image uploaded</Text>
                    </View>
                  )}

                  <View style={styles.imageButtonsRow}>
                    <Pressable
                      style={styles.imageButton}
                      onPress={takePhoto}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <ActivityIndicator color={colors.primary} />
                      ) : (
                        <View style={styles.imageButtonContent}>
                          <Text style={styles.imageButtonEmoji}>📷</Text>
                          <Text style={styles.imageButtonText}>Camera</Text>
                        </View>
                      )}
                    </Pressable>

                    <Pressable
                      style={styles.imageButton}
                      onPress={pickImage}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <ActivityIndicator color={colors.primary} />
                      ) : (
                        <View style={styles.imageButtonContent}>
                          <Text style={styles.imageButtonEmoji}>🖼️</Text>
                          <Text style={styles.imageButtonText}>Gallery</Text>
                        </View>
                      )}
                    </Pressable>
                  </View>

                  <Text style={styles.helperText}>
                    Upload a photo of your food item (max 5MB)
                  </Text>
                </View>

                {/* Contact Info */}
                <View style={styles.row}>
                  <View style={[styles.field, styles.flex]}>
                    <Text style={styles.label}>Your Name *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="John Doe"
                      placeholderTextColor={colors.mutedForeground}
                      value={formData.contactName}
                      onChangeText={(text) => setFormData({ ...formData, contactName: text })}
                    />
                  </View>

                  <View style={[styles.field, styles.flex]}>
                    <Text style={styles.label}>Your Email *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="john@example.com"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={formData.contactEmail}
                      onChangeText={(text) => setFormData({ ...formData, contactEmail: text })}
                    />
                  </View>
                </View>

                {/* Submit Buttons */}
                <View style={styles.submitRow}>
                  <Pressable
                    style={styles.cancelButton}
                    onPress={onClose}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    style={styles.submitButton}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.submitButtonText}>Share Food</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.medium,
    color: colors.foreground,
  },
  closeButton: {
    fontSize: fontSize['2xl'],
    color: colors.mutedForeground,
  },
  subtitle: {
    color: colors.mutedForeground,
    marginBottom: spacing['2xl'],
    fontSize: fontSize.base,
  },
  form: {
    gap: spacing.lg,
  },
  field: {
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  label: {
    fontWeight: fontWeight.medium,
    color: colors.foreground,
    fontSize: fontSize.base,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.foreground,
    fontSize: fontSize.base,
  },
  textArea: {
    minHeight: 96,
    paddingTop: spacing.md,
  },
  textAreaSmall: {
    minHeight: 72,
    paddingTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  picker: {
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
  pickerText: {
    color: colors.foreground,
    fontSize: fontSize.base,
  },
  pickerArrow: {
    color: colors.mutedForeground,
    fontSize: fontSize.sm,
  },
  dropdown: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    marginTop: 4,
    overflow: 'hidden',
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tagButton: {
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    backgroundColor: colors.inputBackground,
    borderColor: colors.border,
  },
  tagButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagButtonText: {
    color: colors.foreground,
    fontSize: fontSize.base,
  },
  tagButtonTextActive: {
    color: colors.primaryForeground,
    fontWeight: fontWeight.medium,
  },
  imagePreviewContainer: {
    position: 'relative',
    backgroundColor: colors.muted,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    height: 192,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.destructive,
    borderRadius: borderRadius.full,
    padding: spacing.sm,
  },
  removeImageText: {
    color: colors.destructiveForeground,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
  },
  imagePlaceholder: {
    backgroundColor: colors.muted,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    height: 192,
  },
  imagePlaceholderEmoji: {
    fontSize: fontSize['4xl'],
    marginBottom: spacing.sm,
  },
  imagePlaceholderText: {
    color: colors.mutedForeground,
    fontSize: fontSize.base,
  },
  imageButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButton: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  imageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  imageButtonEmoji: {
    fontSize: fontSize.lg,
  },
  imageButtonText: {
    color: colors.foreground,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
  },
  helperText: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
  },
  submitRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  cancelButtonText: {
    color: colors.secondaryForeground,
    textAlign: 'center',
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  submitButtonText: {
    color: colors.primaryForeground,
    textAlign: 'center',
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
  },
});
