
import { useState, useEffect } from 'react';
import { getDoctorRatings, getProfileById } from '@/lib/api';
import { DoctorRating, Profile } from '@/types/supabase';
import { Card } from '@/components/ui/card';
import DoctorReviewItem from '@/components/DoctorReviewItem';

interface DoctorReviewsListProps {
  doctorId: string;
  isDoctorOwner: boolean;
}

const DoctorReviewsList = ({ doctorId, isDoctorOwner }: DoctorReviewsListProps) => {
  const [ratings, setRatings] = useState<DoctorRating[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, Profile>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const loadRatings = async () => {
    setIsLoading(true);
    try {
      const doctorRatings = await getDoctorRatings(doctorId);
      setRatings(doctorRatings);
      
      // Fetch profiles for each reviewer
      const profiles: Record<string, Profile> = {};
      for (const rating of doctorRatings) {
        if (!profiles[rating.user_id]) {
          const profile = await getProfileById(rating.user_id);
          if (profile) {
            profiles[rating.user_id] = profile;
          }
        }
      }
      setUserProfiles(profiles);
    } catch (error) {
      console.error("Error loading ratings:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (doctorId) {
      loadRatings();
    }
  }, [doctorId]);
  
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
  
  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="py-4 text-center text-gray-500">Loading reviews...</div>
      ) : ratings.length > 0 ? (
        <div className="space-y-4">
          {ratings.map((rating) => (
            <Card key={rating.id} className="overflow-hidden">
              <DoctorReviewItem
                rating={rating}
                reviewerName={getReviewerName(rating.user_id)}
                isDoctorOwner={isDoctorOwner}
                onResponseSubmitted={loadRatings}
              />
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          No ratings yet. Be the first to rate this doctor!
        </p>
      )}
    </div>
  );
};

export default DoctorReviewsList;
