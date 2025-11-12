import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

export const FeedbackModal = ({ isOpen, onClose, orderId }: FeedbackModalProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to submit feedback');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('feedback').insert({
        order_id: orderId,
        user_id: user.id,
        rating,
        review_text: feedback || null,
        food_rating: rating,
        service_rating: rating,
      });

      if (error) throw error;

      toast.success('Thank you! Your feedback has been sent to the admin dashboard.');
      setRating(0);
      setFeedback('');
      onClose();
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">How was your experience?</DialogTitle>
          <DialogDescription className="text-center">
            We'd love to hear your feedback
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    "w-10 h-10 transition-colors",
                    (hoveredRating >= star || rating >= star)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  )}
                />
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Comments (Optional)</label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us more about your experience..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-primary/30 hover:bg-primary/10"
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="flex-1 bg-accent hover:bg-accent/90 text-white font-semibold shadow-lg"
            >
              {isSubmitting ? 'Sending to Admin...' : 'Submit to Admin'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
