import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface ItemFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  dietary: string;
  onDietaryChange: (dietary: string) => void;
}

export function ItemFilters({
  searchQuery,
  onSearchChange,
  category,
  onCategoryChange,
  dietary,
  onDietaryChange,
}: ItemFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search food items..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-input-background"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full sm:w-[180px] bg-input-background">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="produce">Produce</SelectItem>
            <SelectItem value="dairy">Dairy & Eggs</SelectItem>
            <SelectItem value="bakery">Bakery</SelectItem>
            <SelectItem value="prepared">Prepared Meals</SelectItem>
            <SelectItem value="pantry">Pantry Items</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dietary} onValueChange={onDietaryChange}>
          <SelectTrigger className="w-full sm:w-[180px] bg-input-background">
            <SelectValue placeholder="Dietary" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dietary</SelectItem>
            <SelectItem value="vegetarian">Vegetarian</SelectItem>
            <SelectItem value="vegan">Vegan</SelectItem>
            <SelectItem value="gluten-free">Gluten Free</SelectItem>
            <SelectItem value="dairy-free">Dairy Free</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
