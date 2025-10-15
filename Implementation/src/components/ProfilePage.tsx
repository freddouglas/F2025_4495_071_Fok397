import { useState, useEffect } from "react";
import { User } from "./LoginPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Star, MapPin, Calendar, Package, ShoppingBag } from "lucide-react";
import { reviewsAPI } from "../utils/api";

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
  itemTitle: string;
  type: "received" | "given";
}

interface ProfilePageProps {
  user: User;
}

export function ProfilePage({ user }: ProfilePageProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setIsLoadingReviews(true);
        const result = await reviewsAPI.getByUser(user.id);
        setReviews(result.reviews || []);
      } catch (error) {
        console.error("Error loading reviews:", error);
        setReviews([]);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    loadReviews();
  }, [user.id]);
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle>{user.name}</CardTitle>
              <CardDescription className="flex flex-col gap-1 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {user.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Member since {formatDate(user.joinDate)}
                </span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 stroke-yellow-400" />
              <span className="mr-1">{user.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">
                ({user.totalReviews} reviews)
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {user.bio && (
            <>
              <p className="text-muted-foreground">{user.bio}</p>
              <Separator className="my-4" />
            </>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-muted-foreground" />
              <div>
                <div>{user.itemsShared}</div>
                <div className="text-muted-foreground">Items Shared</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-muted-foreground" />
              <div>
                <div>{user.itemsClaimed}</div>
                <div className="text-muted-foreground">Items Claimed</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reviews & Ratings</CardTitle>
          <CardDescription>
            {user.totalReviews} total reviews from the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingReviews ? (
            <p className="text-center text-muted-foreground py-8">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No reviews yet. Start sharing food to build your reputation!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
              <div key={review.id} className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{review.reviewerName}</span>
                      <Badge variant="outline" className="text-xs">
                        {review.type === "received" ? "As Donor" : "As Recipient"}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground mt-1">
                      {review.itemTitle}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
                    <span>{review.rating}</span>
                  </div>
                </div>
                <p className="text-muted-foreground">{review.comment}</p>
                <div className="text-muted-foreground">{formatDate(review.date)}</div>
                {review.id !== reviews[reviews.length - 1].id && (
                  <Separator className="mt-4" />
                )}
              </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
