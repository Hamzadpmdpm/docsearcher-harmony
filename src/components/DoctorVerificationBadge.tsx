
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDoctorVerification, verifyDoctorByCurrentUser, isVerifiedDoctor } from '@/lib/api';
import { BadgeCheck, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SupabaseDoctor } from '@/types/supabase';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface DoctorVerificationBadgeProps {
  doctorId: string;
  doctor: SupabaseDoctor;
  iconOnly?: boolean;
  isVerified?: boolean;
}

const DoctorVerificationBadge = ({ doctorId, doctor, iconOnly = false, isVerified: passedIsVerified }: DoctorVerificationBadgeProps) => {
  const { user, profile } = useAuth();
  const [isUserTheDoctor, setIsUserTheDoctor] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  
  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (passedIsVerified !== undefined) {
        setIsVerified(passedIsVerified);
      } else {
        const hasVerification = await isVerifiedDoctor(doctorId);
        setIsVerified(hasVerification);
      }
      
      if (user && doctor.created_by_user_id) {
        setIsUserTheDoctor(doctor.created_by_user_id === user.id);
        
        if (!isUserTheDoctor) {
          const verification = await getDoctorVerification(doctorId, user.id);
          setIsUserTheDoctor(verification?.verified || false);
        }
      }
    };
    
    checkVerificationStatus();
  }, [doctorId, user, doctor, passedIsVerified, isUserTheDoctor]);
  
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
  
  // Always show verified status to all users without login requirement
  if (isVerified) {
    if (iconOnly) {
      return (
        <div className="text-blue-600" title="Verified Doctor">
          <BadgeCheck size={16} className="fill-blue-100" />
        </div>
      );
    }
    
    return (
      <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-600 border-blue-200">
        <BadgeCheck size={14} className="fill-blue-100" />
        <span className="text-xs">Verified</span>
      </Badge>
    );
  }
  
  // If user is logged in and is a doctor, but not the owner and profile is not verified
  if (user && profile?.user_type === 'doctor' && !isUserTheDoctor && !isVerified) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <button className="text-gray-400" title="Claim this profile">
            {iconOnly ? (
              <BadgeCheck size={16} className="fill-gray-100" />
            ) : (
              <Badge variant="outline" className="flex items-center gap-1 bg-gray-50 text-gray-500 border-gray-200 cursor-pointer">
                <BadgeCheck size={14} className="fill-gray-100" />
                <span className="text-xs">Claim Profile</span>
              </Badge>
            )}
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
  
  // Default unverified badge for all users
  return (
    <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
      <DialogTrigger asChild>
        <button className="text-gray-400" title="Unverified Doctor">
          {iconOnly ? (
            <BadgeCheck size={16} className="fill-gray-100" />
          ) : (
            <Badge variant="outline" className="flex items-center gap-1 bg-gray-50 text-gray-500 border-gray-200 cursor-pointer">
              <BadgeCheck size={14} className="fill-gray-100" />
              <span className="text-xs">Unverified</span>
            </Badge>
          )}
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
