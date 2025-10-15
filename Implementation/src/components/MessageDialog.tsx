import { useState } from "react";
import { Send } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { toast } from "sonner@2.0.3";
import { messagesAPI } from "../utils/api";

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemTitle: string;
  recipientName: string;
  itemId?: string;
  recipientId?: string;
}

export function MessageDialog({
  open,
  onOpenChange,
  itemTitle,
  recipientName,
  itemId,
  recipientId,
}: MessageDialogProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (!itemId || !recipientId) {
      toast.error("Invalid message recipient");
      return;
    }

    try {
      setIsSending(true);
      await messagesAPI.send({
        itemId,
        recipientId,
        message: message.trim(),
      });
      
      toast.success("Message sent successfully!");
      setMessage("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
          <DialogDescription>
            Send a message to {recipientName} about "{itemTitle}"
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'm interested in this item..."
              className="min-h-32 bg-input-background"
              disabled={isSending}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2" disabled={isSending}>
              <Send className="h-4 w-4" />
              {isSending ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
