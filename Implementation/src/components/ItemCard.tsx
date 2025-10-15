import { useMemo } from "react";
import { MapPin, Calendar, Package2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

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
  onClick: () => void;
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

export function ItemCard({ item, onClick }: ItemCardProps) {
  const expiryText = useMemo(() => formatExpiryDate(item.expiryDate), [item.expiryDate]);
  const isUrgent = useMemo(() => 
    expiryText.includes("today") || expiryText.includes("tomorrow") || expiryText.includes("days left"),
    [expiryText]
  );

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
      onClick={onClick}
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-muted">
        <ImageWithFallback
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        {isUrgent && item.status === "available" && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            {expiryText}
          </Badge>
        )}
        {item.status === "reserved" && (
          <Badge variant="secondary" className="absolute top-2 right-2">
            Reserved
          </Badge>
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        <h3>{item.title}</h3>
        <p className="text-muted-foreground line-clamp-2">{item.description}</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {item.dietaryTags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{item.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Package2 className="h-3 w-3" />
            <span>{item.quantity}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{expiryText}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
