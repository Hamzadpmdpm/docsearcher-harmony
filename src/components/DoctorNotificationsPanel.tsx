
import { useState, useEffect } from 'react';
import { getUnreadRatingsForDoctor, getProfileById } from '@/lib/api';
import { DoctorRating, Profile } from '@/types/supabase';
import { Bell } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import DoctorReviewItem from '@/components/DoctorReviewItem';

interface DoctorNotificationsPanelProps {
  doctorId: string;
  isDoctorOwner: boolean;
}

const DoctorNotificationsPanel = ({ doctorId, isDoctorOwner }: DoctorNotificationsPanelProps) => {
  const [unreadRatings, setUnreadRatings] = useState<DoctorRating[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, Profile>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const loadUnreadRatings = async () => {
    if (!doctorId || !isDoctorOwner) return;
    
    setIsLoading(true);
    try {
      const ratings = await getUnreadRatingsForDoctor(doctorId);
      setUnreadRatings(ratings);
      
      // Fetch profiles for each reviewer
      const profiles: Record<string, Profile> = {};
      for (const rating of ratings) {
        if (!profiles[rating.user_id]) {
          const profile = await getProfileById(rating.user_id);
          if (profile) {
            profiles[rating.user_id] = profile;
          }
        }
      }
      setUserProfiles(profiles);
    } catch (error) {
      console.error("Error loading unread ratings:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (doctorId && isDoctorOwner) {
      loadUnreadRatings();
      
      // Set up interval to check for new reviews every minute
      const interval = setInterval(loadUnreadRatings, 60000);
      return () => clearInterval(interval);
    }
  }, [doctorId, isDoctorOwner]);
  
  const getReviewerName = (userId: string): string => {
    const profile = userProfiles[userId];
    if (profile) {
      if (profile.first_name && profile.last_name) {
        return `${profile.first_name} ${profile.last_name}`;
      } else if (profile.first_name) {
        return profile.first_name;
      }
    }
    return "Anonymous";
  };
  
  const handleResponseSubmitted = () => {
    loadUnreadRatings();
  };
  
  if (!isDoctorOwner) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="relative"
          onClick={() => loadUnreadRatings()}
        >
          <Bell size={18} />
          {unreadRatings.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
              {unreadRatings.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Patient Reviews</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-4 text-center text-gray-500">Loading reviews...</div>
          ) : unreadRatings.length > 0 ? (
            <div className="space-y-4">
              {unreadRatings.map((rating) => (
                <div key={rating.id} className="border rounded-lg overflow-hidden">
                  <DoctorReviewItem
                    rating={rating}
                    reviewerName={getReviewerName(rating.user_id)}
                    isDoctorOwner={true}
                    onResponseSubmitted={handleResponseSubmitted}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No new reviews to respond to.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorNotificationsPanel;
