import { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, Pressable, ScrollView, Image, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import type { FoodItem } from "./ItemCard";
import { uploadImageMobile } from "../utils/api";
import { showToast } from "./Toast";
import { colors, spacing, borderRadius, fontSize, fontWeight } from "../utils/theme";

interface EditItemModalProps {
  visible: boolean;
  onClose: () => void;
  onEditItem: (id: string, updates: Partial<FoodItem>) => void;
  item: FoodItem | null;
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

export function EditItemModal({ visible, onClose, onEditItem, item }: EditItemModalProps) {
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

  // Populate form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description,
        category: item.category,
        location: item.location,
        expiryDate: item.expiryDate,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        contactName: item.contactName,
        contactEmail: item.contactEmail,
        dietaryTags: item.dietaryTags || [],
        pickupInstructions: item.pickupInstructions || "",
      });
      setImagePreview(item.imageUrl);
    }
  }, [item]);

  const handleSubmit = () => {
    if (!item) return;

    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim() || 
        !formData.quantity.trim() || !formData.contactName.trim() || !formData.contactEmail.trim()) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    onEditItem(item.id, formData);
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

  const uploadSelectedImage = async (uri: string) => {
    setIsUploading(true);
    try {
      const fileName = `food-${Date.now()}.jpg`;
      const url = await uploadImageMobile(uri, fileName);
      setFormData({ ...formData, imageUrl: url });
      setImagePreview(url);
      showToast("Image uploaded successfully", "success");
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Failed to upload image", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, imageUrl: "" });
    setImagePreview("");
  };

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
          <ScrollView style={styles.scrollView}>
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Edit Food Item</Text>
                <Pressable onPress={onClose}>
                  <Text style={styles.closeButton}>✕</Text>
                </Pressable>
              </View>

              <Text style={styles.description}>Update the details of your food item</Text>

              {/* Form */}
              <View style={styles.form}>
                {/* Title */}
                <View style={styles.field}>
                  <Text style={styles.label}>Title *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                    placeholder="e.g., Fresh Organic Tomatoes"
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>

                {/* Description */}
                <View style={styles.field}>
                  <Text style={styles.label}>Description *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    placeholder="Describe the food item, its condition, etc."
                    placeholderTextColor={colors.mutedForeground}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Category */}
                <View style={styles.field}>
                  <Text style={styles.label}>Category</Text>
                  <Pressable
                    style={styles.pickerButton}
                    onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                  >
                    <Text style={styles.pickerButtonText}>
                      {CATEGORIES.find(c => c.value === formData.category)?.label || "Select category"}
                    </Text>
                    <Text style={styles.pickerArrow}>▼</Text>
                  </Pressable>
                  
                  {showCategoryPicker && (
                    <View style={styles.pickerOptions}>
                      {CATEGORIES.map((cat) => (
                        <Pressable
                          key={cat.value}
                          style={styles.pickerOption}
                          onPress={() => {
                            setFormData({ ...formData, category: cat.value });
                            setShowCategoryPicker(false);
                          }}
                        >
                          <Text style={styles.pickerOptionText}>{cat.label}</Text>
                          {formData.category === cat.value && (
                            <Text style={styles.pickerCheck}>✓</Text>
                          )}
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                {/* Quantity */}
                <View style={styles.field}>
                  <Text style={styles.label}>Quantity *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.quantity}
                    onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                    placeholder="e.g., 2 kg, 5 items"
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>

                {/* Location */}
                <View style={styles.field}>
                  <Text style={styles.label}>Pickup Location *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.location}
                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                    placeholder="e.g., Downtown Market"
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>

                {/* Expiry Date */}
                <View style={styles.field}>
                  <Text style={styles.label}>Best Before Date *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.expiryDate}
                    onChangeText={(text) => setFormData({ ...formData, expiryDate: text })}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>

                {/* Dietary Tags */}
                <View style={styles.field}>
                  <Text style={styles.label}>Dietary Tags</Text>
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
                        <Text
                          style={[
                            styles.tagButtonText,
                            formData.dietaryTags.includes(tag) && styles.tagButtonTextActive
                          ]}
                        >
                          {tag}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Pickup Instructions */}
                <View style={styles.field}>
                  <Text style={styles.label}>Pickup Instructions</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.pickupInstructions}
                    onChangeText={(text) => setFormData({ ...formData, pickupInstructions: text })}
                    placeholder="Any special instructions for pickup?"
                    placeholderTextColor={colors.mutedForeground}
                    multiline
                    numberOfLines={2}
                  />
                </View>

                {/* Contact Name */}
                <View style={styles.field}>
                  <Text style={styles.label}>Contact Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.contactName}
                    onChangeText={(text) => setFormData({ ...formData, contactName: text })}
                    placeholder="Your name"
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>

                {/* Contact Email */}
                <View style={styles.field}>
                  <Text style={styles.label}>Contact Email *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.contactEmail}
                    onChangeText={(text) => setFormData({ ...formData, contactEmail: text })}
                    placeholder="your@email.com"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Image Upload */}
                <View style={styles.field}>
                  <Text style={styles.label}>Food Image</Text>
                  {imagePreview ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image
                        source={{ uri: imagePreview }}
                        style={styles.imagePreview}
                        resizeMode="cover"
                      />
                      <Pressable
                        style={styles.removeImageButton}
                        onPress={removeImage}
                      >
                        <Text style={styles.removeImageText}>✕</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      style={styles.imagePickerButton}
                      onPress={pickImage}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <ActivityIndicator color={colors.mutedForeground} />
                      ) : (
                        <>
                          <Text style={styles.imagePickerIcon}>📷</Text>
                          <Text style={styles.imagePickerText}>Tap to upload image</Text>
                          <Text style={styles.imagePickerHint}>PNG, JPG, WEBP up to 5MB</Text>
                        </>
                      )}
                    </Pressable>
                  )}
                </View>

                {/* Submit Buttons */}
                <View style={styles.actions}>
                  <Pressable
                    style={styles.cancelButton}
                    onPress={onClose}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.submitButton, isUploading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isUploading}
                  >
                    <Text style={styles.submitButtonText}>Save Changes</Text>
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
    marginBottom: spacing.sm,
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
  description: {
    fontSize: fontSize.base,
    color: colors.mutedForeground,
    marginBottom: spacing['2xl'],
  },
  form: {
    gap: spacing.lg,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.foreground,
  },
  input: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.foreground,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerButton: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerButtonText: {
    fontSize: fontSize.base,
    color: colors.foreground,
  },
  pickerArrow: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
  },
  pickerOptions: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerOptionText: {
    fontSize: fontSize.base,
    color: colors.foreground,
  },
  pickerCheck: {
    fontSize: fontSize.lg,
    color: colors.primary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.secondary,
  },
  tagButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagButtonText: {
    fontSize: fontSize.base,
    color: colors.secondaryForeground,
  },
  tagButtonTextActive: {
    color: colors.primaryForeground,
  },
  imagePreviewContainer: {
    position: 'relative',
    backgroundColor: colors.muted,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    height: 200,
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
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: colors.destructiveForeground,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
  },
  imagePickerButton: {
    backgroundColor: colors.muted,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    padding: spacing['2xl'],
    alignItems: 'center',
    gap: spacing.sm,
  },
  imagePickerIcon: {
    fontSize: 32,
  },
  imagePickerText: {
    fontSize: fontSize.base,
    color: colors.foreground,
  },
  imagePickerHint: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.secondaryForeground,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.primaryForeground,
  },
});
