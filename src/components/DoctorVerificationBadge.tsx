
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDoctorById, getDoctorVerification, requestDoctorVerification } from '@/lib/api';
import { BadgeCheck, Info, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SupabaseDoctor } from '@/types/supabase';

interface DoctorVerificationBadgeProps {
  doctorId: string;
  doctor: SupabaseDoctor;
}

const DoctorVerificationBadge = ({ doctorId, doctor }: DoctorVerificationBadgeProps) => {
  const { user, profile } = useAuth();
  const [isUserTheDoctor, setIsUserTheDoctor] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [hasRequestedVerification, setHasRequestedVerification] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (doctor.created_by_user_id && user) {
        // Check if current user created this doctor profile
        setIsUserTheDoctor(doctor.created_by_user_id === user.id);
        
        // Check verification status
        if (user && doctorId) {
          const verification = await getDoctorVerification(doctorId, user.id);
          setHasRequestedVerification(!!verification);
          setIsVerified(verification?.verified || false);
        }
      }
    };
    
    checkVerificationStatus();
  }, [doctorId, user, doctor]);
  
  const handleVerificationRequest = async () => {
    if (!user) return;
    
    await requestDoctorVerification(doctorId);
    setHasRequestedVerification(true);
    setIsDialogOpen(false);
  };
  
  // If user created this doctor profile, show verified badge
  if (doctor.created_by_user_id && isUserTheDoctor) {
    return (
      <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
        <BadgeCheck size={16} className="mr-1" />
        <span>Doctor-Created Profile</span>
      </div>
    );
  }
  
  // If this doctor profile is verified, show verified badge
  if (isVerified) {
    return (
      <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
        <BadgeCheck size={16} className="mr-1" />
        <span>Verified Doctor</span>
      </div>
    );
  }
  
  // If user is the actual doctor but hasn't claimed the profile
  if (user && profile?.user_type === 'doctor' && !isUserTheDoctor && !hasRequestedVerification) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <button className="flex items-center text-health-600 bg-health-50 px-3 py-1 rounded-full text-sm">
            <User size={16} className="mr-1" />
            <span>Are you this doctor?</span>
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Your Doctor Profile</DialogTitle>
            <DialogDescription>
              Is this your professional profile? You can request verification to claim this profile.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
            <p className="text-sm text-gray-700">
              By verifying this profile, you confirm that you are {doctor.name} and that the information presented is accurate.
            </p>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerificationRequest}
                className="bg-health-600 hover:bg-health-700"
              >
                Request Verification
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  // If verification has been requested
  if (hasRequestedVerification && !isVerified) {
    return (
      <div className="flex items-center text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-sm">
        <Info size={16} className="mr-1" />
        <span>Verification Pending</span>
      </div>
    );
  }
  
  // Default (unverified profile)
  return null;
};

export default DoctorVerificationBadge;
