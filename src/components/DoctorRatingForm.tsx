
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRating, rateDoctor, getProfileById } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DoctorRatingFormProps {
  doctorId: string;
  onRatingSubmitted?: () => void;
}

const DoctorRatingForm = ({ doctorId, onRatingSubmitted }: DoctorRatingFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userHasRated, setUserHasRated] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    const getUserExistingRating = async () => {
      if (user && doctorId) {
        const existingRating = await getUserRating(doctorId, user.id);
        if (existingRating) {
          setRating(existingRating.rating);
          setComment(existingRating.comment || '');
          setUserHasRated(true);
        }
      }
    };
    
    getUserExistingRating();
  }, [user, doctorId]);
  
  const handleRatingSubmit = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      const success = await rateDoctor(doctorId, user.id, rating, comment);
      if (success) {
        setUserHasRated(true);
        setIsDialogOpen(false);
        if (onRatingSubmitted) {
          onRatingSubmitted();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStar = (position: number) => {
    const isActive = position <= (hoveredRating || rating);
    
    return (
      <StarIcon
        key={position}
        size={28}
        className={`cursor-pointer transition-colors ${
          isActive ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
        }`}
        onMouseEnter={() => setHoveredRating(position)}
        onMouseLeave={() => setHoveredRating(0)}
        onClick={() => setRating(position)}
      />
    );
  };
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={userHasRated ? "outline" : "default"}
          className={userHasRated ? "border-gray-200" : "bg-health-600 hover:bg-health-700"}
        >
          <StarIcon size={16} className={`mr-2 ${userHasRated ? 'text-yellow-500 fill-yellow-500' : ''}`} />
          {userHasRated ? 'Edit Your Rating' : 'Rate This Doctor'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{userHasRated ? 'Update Your Rating' : 'Rate This Doctor'}</DialogTitle>
          <DialogDescription>
            Share your experience with this doctor to help other patients.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex flex-col items-center">
            <p className="text-gray-700 mb-2">How would you rate your experience?</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((pos) => renderStar(pos))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add a comment (optional)
            </label>
            <Textarea
              placeholder="Share details about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRatingSubmit}
              disabled={rating === 0 || isSubmitting}
              className="bg-health-600 hover:bg-health-700"
            >
              {isSubmitting 
                ? 'Submitting...' 
                : userHasRated 
                  ? 'Update Rating' 
                  : 'Submit Rating'
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorRatingForm;
