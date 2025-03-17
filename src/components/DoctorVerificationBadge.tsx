
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDoctorVerification, verifyDoctorByCurrentUser } from '@/lib/api';
import { BadgeCheck, Info, User, Shield, ShieldQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SupabaseDoctor } from '@/types/supabase';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface DoctorVerificationBadgeProps {
  doctorId: string;
  doctor: SupabaseDoctor;
}

const DoctorVerificationBadge = ({ doctorId, doctor }: DoctorVerificationBadgeProps) => {
  const { user, profile } = useAuth();
  const [isUserTheDoctor, setIsUserTheDoctor] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  
  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (doctor.created_by_user_id && user) {
        // Check if current user created this doctor profile
        setIsUserTheDoctor(doctor.created_by_user_id === user.id);
      }
      
      // Check verification status
      if (doctorId) {
        try {
          // First check if the doctor has any verification from any user
          const response = await fetch(`/api/doctors/${doctorId}/verifications`);
          const data = await response.json();
          const hasAnyVerification = data.some((v: any) => v.verified);
          setIsVerified(hasAnyVerification);
          
          // If logged in, also check this specific user's verification
          if (user) {
            const userVerification = await getDoctorVerification(doctorId, user.id);
            setIsUserTheDoctor(userVerification?.verified || false);
          }
        } catch (error) {
          console.error('Error checking verification status:', error);
          // Default to checking user-specific verification as fallback
          if (user) {
            const verification = await getDoctorVerification(doctorId, user.id);
            setIsVerified(verification?.verified || false);
          }
        }
      }
    };
    
    checkVerificationStatus();
  }, [doctorId, user, doctor]);
  
  const handleClaimProfile = async () => {
    if (!user) return;
    
    try {
      const result = await verifyDoctorByCurrentUser(doctorId);
      if (result) {
        setIsVerified(true);
        toast.success("Profile successfully claimed");
        setIsClaimDialogOpen(false);
      } else {
        toast.error("Failed to claim profile");
      }
    } catch (error) {
      console.error("Error claiming profile:", error);
      toast.error("Failed to claim profile");
    }
  };
  
  // If doctor profile is verified or created by a doctor, show verified badge to all users
  if (isVerified || (doctor.created_by_user_id && isUserTheDoctor)) {
    return (
      <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
        <BadgeCheck size={16} className="mr-1" />
        <span>Verified Doctor</span>
      </div>
    );
  }
  
  // If user is the actual doctor but hasn't claimed the profile
  if (user && profile?.user_type === 'doctor' && !isUserTheDoctor && !isVerified) {
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
            <DialogTitle>Claim Your Doctor Profile</DialogTitle>
            <DialogDescription>
              Is this your professional profile? You can claim this profile to verify your identity.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
            <p className="text-sm text-gray-700">
              By claiming this profile, you confirm that you are {doctor.name} and that the information presented is accurate.
            </p>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleClaimProfile}
                className="bg-health-600 hover:bg-health-700"
              >
                Claim Profile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Default (unverified profile) - Add the claim profile button for doctors who are not logged in
  return (
    <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm hover:bg-amber-100 transition-colors">
          <ShieldQuestion size={16} className="mr-1" />
          <span>Unverified Profile</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you Dr. {doctor.name}?</DialogTitle>
          <DialogDescription>
            This profile was created by the community. If this is your profile, you can claim it and verify your information.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-4">
          <p className="text-sm text-gray-700">
            By claiming this profile, you'll be able to:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>Update your professional information</li>
            <li>Respond to reviews</li>
            <li>Get a verified badge</li>
            <li>Manage your appointment availability</li>
          </ul>
          
          <div className="flex flex-col space-y-3 mt-4">
            {user ? (
              <>
                {profile?.user_type === 'doctor' ? (
                  <Button
                    onClick={handleClaimProfile}
                    className="bg-health-600 hover:bg-health-700"
                  >
                    <Shield className="mr-2" size={16} />
                    Claim this profile
                  </Button>
                ) : (
                  <p className="text-sm text-amber-600">
                    Your account is registered as a patient. Only doctor accounts can claim profiles.
                  </p>
                )}
              </>
            ) : (
              <>
                <Link to="/auth?type=signin&redirect=doctors" className="w-full">
                  <Button className="w-full bg-health-600 hover:bg-health-700">
                    <User className="mr-2" size={16} />
                    Sign in as a doctor
                  </Button>
                </Link>
                <Link to="/auth?type=signup&userType=doctor&redirect=doctors" className="w-full">
                  <Button variant="outline" className="w-full">
                    <Shield className="mr-2" size={16} />
                    Sign up as a doctor
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorVerificationBadge;
