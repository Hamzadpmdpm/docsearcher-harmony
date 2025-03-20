
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SupabaseDoctor } from '@/types/supabase';
import DoctorVerificationBadge from './DoctorVerificationBadge';
import { getDoctorRatings, isVerifiedDoctor } from '@/lib/api';

interface DoctorCardProps {
  doctor: SupabaseDoctor;
  index?: number;
}

const DoctorCard = ({ doctor, index = 0 }: DoctorCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [calculatedRating, setCalculatedRating] = useState<number | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  
  useEffect(() => {
    // Fetch and calculate the actual rating from reviews - no auth required
    const fetchRatings = async () => {
      try {
        const ratings = await getDoctorRatings(doctor.id);
        if (ratings && ratings.length > 0) {
          const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
          const avgRating = +(sum / ratings.length).toFixed(1);
          setCalculatedRating(avgRating);
        } else {
          setCalculatedRating(0);
        }
      } catch (error) {
        console.error("Error fetching doctor ratings:", error);
        setCalculatedRating(0);
      }
    };
    
    // Check if the doctor is verified - no auth required
    const checkVerification = async () => {
      try {
        const verified = await isVerifiedDoctor(doctor.id);
        setIsVerified(verified);
      } catch (error) {
        console.error("Error checking doctor verification:", error);
        setIsVerified(false);
      }
    };
    
    fetchRatings();
    checkVerification();
  }, [doctor.id]);
  
  // Format the address in the correct way
  const formatAddress = (contact: any) => {
    if (typeof contact.address === 'string') {
      const parts = contact.address.split('_');
      if (parts.length >= 1) {
        return parts[0];
      }
    }
    return contact.address || '';
  };
  
  return (
    <Link 
      to={`/doctors/${doctor.id}`}
      className={cn(
        "block w-full rounded-xl overflow-hidden bg-white border border-gray-100",
        "transition-all duration-300 ease-in-out",
        isHovered ? "shadow-elevated transform translate-y-[-4px]" : "shadow-subtle"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-health-100 flex-shrink-0">
            <img 
              src={doctor.image} 
              alt={doctor.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-grow">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
              <div className="flex items-center">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="ml-1 text-sm font-medium text-gray-700">
                  {calculatedRating !== null ? calculatedRating : 0}
                </span>
              </div>
            </div>
            
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-health-50 text-health-700">
                {doctor.specialty}
              </span>
              <DoctorVerificationBadge doctorId={doctor.id} doctor={doctor} iconOnly={true} isVerified={isVerified} />
            </div>
            
            <div className="mt-3 flex items-center text-sm text-gray-500">
              <MapPin size={14} className="mr-1 text-gray-400" />
              <span>{doctor.hospital}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 mr-2">
                {doctor.experience} Years Exp.
              </span>
            </div>
            
            <div className="flex items-center">
              {doctor.accepting_new_patients ? (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle size={14} className="mr-1" />
                  <span>Accepting Patients</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-400 text-sm">
                  <XCircle size={14} className="mr-1" />
                  <span>Not Accepting Patients</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DoctorCard;
