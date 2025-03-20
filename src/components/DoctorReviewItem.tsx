
import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { DoctorRating } from '@/types/supabase';
import { respondToRating } from '@/lib/api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface DoctorReviewItemProps {
  rating: DoctorRating;
  reviewerName: string;
  isDoctorOwner: boolean;
  onResponseSubmitted: () => void;
}

const DoctorReviewItem = ({ 
  rating, 
  reviewerName, 
  isDoctorOwner, 
  onResponseSubmitted 
}: DoctorReviewItemProps) => {
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [submittingResponse, setSubmittingResponse] = useState(false);
  
  const handleRespondToReview = async () => {
    if (!responseText.trim()) return;
    
    setSubmittingResponse(true);
    try {
      const success = await respondToRating(rating.id, responseText);
      if (success) {
        setResponseDialogOpen(false);
        setResponseText("");
        onResponseSubmitted();
        toast.success("Response submitted successfully");
      }
    } catch (error) {
      toast.error("Failed to submit response");
    } finally {
      setSubmittingResponse(false);
    }
  };
  
  return (
    <div className="p-4 border border-gray-100 rounded-lg bg-white">
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-health-100 text-health-600">
            {reviewerName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="font-medium text-gray-800 mr-2">
              {reviewerName}
            </span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i}
                  size={14}
                  className={i < rating.rating 
                    ? "text-yellow-500 fill-yellow-500" 
                    : "text-gray-300"
                  }
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-2">
              {new Date(rating.created_at).toLocaleDateString()}
            </span>
          </div>
          
          {rating.comment && (
            <p className="text-gray-700 text-sm mb-3">{rating.comment}</p>
          )}
          
          {/* Doctor's response */}
          {rating.doctor_response && (
            <div className="bg-blue-50 p-3 rounded-md mt-2 text-sm">
              <div className="flex items-center mb-1">
                <Avatar className="w-6 h-6 mr-2">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                    DR
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-blue-700">Doctor's Response</span>
              </div>
              <p className="text-gray-700">{rating.doctor_response}</p>
            </div>
          )}
          
          {/* Response button for doctor */}
          {isDoctorOwner && !rating.doctor_response && (
            <Dialog open={responseDialogOpen} 
              onOpenChange={(open) => {
                setResponseDialogOpen(open);
                if (!open) setResponseText("");
              }}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-health-600 mt-1 text-xs">
                  <MessageSquare size={14} className="mr-1" />
                  Respond to review
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Respond to Patient Review</DialogTitle>
                  <DialogDescription>
                    Your response will be visible to all users viewing this review.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="flex mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          className={i < rating.rating 
                            ? "text-yellow-500 fill-yellow-500" 
                            : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-700">{rating.comment}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Response
                    </label>
                    <Textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Write your response to this review..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setResponseDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleRespondToReview}
                      disabled={!responseText.trim() || submittingResponse}
                      className="bg-health-600 hover:bg-health-700"
                    >
                      {submittingResponse ? 'Submitting...' : 'Submit Response'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorReviewItem;
