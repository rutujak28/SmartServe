import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, CheckCircle } from 'lucide-react';

export default function Feedback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || 'unknown';
  
  const [overallRating, setOverallRating] = useState(0);
  const [foodQualityRating, setFoodQualityRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const StarRating = ({ rating, onRatingChange }: { rating: number; onRatingChange: (rating: number) => void }) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= rating
                  ? 'fill-primary text-primary'
                  : 'fill-muted text-muted-foreground'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submit - would send to backend in production
    console.log({ orderId, overallRating, foodQualityRating, serviceRating, feedbackText });
    setSubmitted(true);
    setTimeout(() => navigate('/orders'), 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-12 pb-8">
            <CheckCircle className="w-20 h-20 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground">
              Your feedback helps us improve our service
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Rate Your Experience</CardTitle>
          <CardDescription>Order #{orderId}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">Overall Rating</label>
              <StarRating rating={overallRating} onRatingChange={setOverallRating} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Food Quality</label>
              <StarRating rating={foodQualityRating} onRatingChange={setFoodQualityRating} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Service</label>
              <StarRating rating={serviceRating} onRatingChange={setServiceRating} />
            </div>

            <div>
              <label htmlFor="feedback" className="block text-sm font-medium mb-2">
                Additional Comments
              </label>
              <Textarea
                id="feedback"
                placeholder="Tell us more about your experience..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/orders')}
                className="flex-1"
              >
                Skip
              </Button>
              <Button
                type="submit"
                disabled={overallRating === 0}
                className="flex-1"
              >
                Submit Feedback
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
