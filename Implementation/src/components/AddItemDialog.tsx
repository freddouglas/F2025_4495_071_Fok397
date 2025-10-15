import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import type { FoodItem } from "./ItemCard";
import { uploadImage } from "../utils/api";
import { toast } from "sonner@2.0.3";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (item: Omit<FoodItem, "id">) => void;
}

export function AddItemDialog({ open, onOpenChange, onAddItem }: AddItemDialogProps) {
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  const toggleDietaryTag = (tag: string) => {
    setFormData({
      ...formData,
      dietaryTags: formData.dietaryTags.includes(tag)
        ? formData.dietaryTags.filter(t => t !== tag)
        : [...formData.dietaryTags, tag]
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const url = await uploadImage(file);
      setFormData({ ...formData, imageUrl: url });
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      setImagePreview("");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, imageUrl: "" });
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Food</DialogTitle>
          <DialogDescription>
            Share surplus food with your community and help reduce waste.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Food Item *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Fresh Tomatoes, Homemade Bread"
              className="bg-input-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the food item, condition, ingredients, etc..."
              className="min-h-24 bg-input-background"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category" className="bg-input-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="produce">Produce</SelectItem>
                  <SelectItem value="dairy">Dairy & Eggs</SelectItem>
                  <SelectItem value="bakery">Bakery</SelectItem>
                  <SelectItem value="prepared">Prepared Meals</SelectItem>
                  <SelectItem value="pantry">Pantry Items</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="e.g., 5 lbs, 10 pieces"
                className="bg-input-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Best Before Date *</Label>
            <Input
              id="expiryDate"
              type="date"
              required
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="bg-input-background"
            />
          </div>

          <div className="space-y-2">
            <Label>Dietary Information</Label>
            <div className="flex flex-wrap gap-3">
              {["Vegetarian", "Vegan", "Gluten Free", "Dairy Free"].map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={tag.toLowerCase().replace(" ", "-")}
                    checked={formData.dietaryTags.includes(tag)}
                    onCheckedChange={() => toggleDietaryTag(tag)}
                  />
                  <Label
                    htmlFor={tag.toLowerCase().replace(" ", "-")}
                    className="cursor-pointer"
                  >
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Pickup Location *</Label>
            <Input
              id="location"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., 123 Main St, Apartment 4B"
              className="bg-input-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickupInstructions">Pickup Instructions</Label>
            <Textarea
              id="pickupInstructions"
              value={formData.pickupInstructions}
              onChange={(e) => setFormData({ ...formData, pickupInstructions: e.target.value })}
              placeholder="e.g., Ring doorbell, available after 5pm"
              className="min-h-20 bg-input-background"
            />
          </div>

          <div className="space-y-2">
            <Label>Food Image</Label>
            <div className="space-y-3">
              {imagePreview || formData.imageUrl ? (
                <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
                  <img
                    src={imagePreview || formData.imageUrl}
                    alt="Food preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-48 bg-muted rounded-lg border-2 border-dashed border-border">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No image uploaded</p>
                  </div>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload Image"}
              </Button>
              
              <p className="text-muted-foreground">
                Upload a photo of your food item (max 5MB, JPG/PNG/WebP)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Your Name *</Label>
              <Input
                id="contactName"
                required
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="John Doe"
                className="bg-input-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Your Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                required
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="john@example.com"
                className="bg-input-background"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Share Food</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
