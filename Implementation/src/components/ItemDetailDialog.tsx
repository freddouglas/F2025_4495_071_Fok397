import { MapPin, Calendar, User, Mail, MessageCircle, CheckCircle, Package2, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { FoodItem } from "./ItemCard";

interface ItemDetailDialogProps {
  item: FoodItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClaim: (itemId: string) => void;
  onMessage: (itemId: string) => void;
}

export function ItemDetailDialog({
  item,
  open,
  onOpenChange,
  onClaim,
  onMessage,
}: ItemDetailDialogProps) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            {item.title}
            {item.status === "reserved" && (
              <Badge variant="secondary">
                <CheckCircle className="h-3 w-3 mr-1" />
                Reserved
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
            <ImageWithFallback
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="mb-2">Description</h4>
              <p className="text-muted-foreground">{item.description}</p>
            </div>

            {item.dietaryTags.length > 0 && (
              <div>
                <h4 className="mb-2">Dietary Information</h4>
                <div className="flex flex-wrap gap-2">
                  {item.dietaryTags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Pickup Location</p>
                  <p>{item.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Best Before</p>
                  <p>{new Date(item.expiryDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Package2 className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p>{item.quantity}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Shared by</p>
                  <p>{item.contactName}</p>
                </div>
              </div>
            </div>

            {item.pickupInstructions && (
              <>
                <Separator />
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pickup Instructions</p>
                    <p>{item.pickupInstructions}</p>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {item.status === "available" && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => onClaim(item.id)}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Reserve This Food
                </Button>
                <Button
                  onClick={() => onMessage(item.id)}
                  variant="outline"
                  className="flex-1"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Donor
                </Button>
              </div>
            )}

            {item.status === "reserved" && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-center text-muted-foreground">
                  This food has been reserved and is no longer available.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
