import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Mail, Phone, ArrowLeft, CheckCircle, Languages, GraduationCap, Clock } from 'lucide-react';
import Header from '@/components/Header';
import AnimatedTransition from '@/components/AnimatedTransition';
import DoctorRatingForm from '@/components/DoctorRatingForm';
import DoctorVerificationBadge from '@/components/DoctorVerificationBadge';
import { cn } from '@/lib/utils';
import { getDoctorById, getDoctorRatings } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { DoctorRating } from '@/types/supabase';
import { Avatar } from '@/components/ui/avatar';
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const DoctorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ratings, setRatings] = useState<DoctorRating[]>([]);
  
  const { data: doctor, isLoading, error, refetch } = useQuery({
    queryKey: ['doctor', id],
    queryFn: () => getDoctorById(id || ''),
    enabled: !!id,
  });
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchRatings = async () => {
      if (id) {
        const doctorRatings = await getDoctorRatings(id);
        setRatings(doctorRatings);
      }
    };
    
    fetchRatings();
  }, [id]);

  const handleCallNow = () => {
    if (doctor?.contact?.phone) {
      window.location.href = `tel:${doctor.contact.phone}`;
      toast.success(`Calling ${doctor.name}...`);
    } else {
      toast.error("Phone number not available");
    }
  };

  const handleRatingSubmitted = () => {
    refetch();
    
    if (id) {
      getDoctorRatings(id).then(ratings => setRatings(ratings));
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow pt-24 pb-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-subtle p-8 flex items-center justify-center">
              <div className="animate-pulse text-center">
                <div className="h-8 w-48 bg-gray-200 rounded mb-4 mx-auto"></div>
                <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  if (error || !doctor) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow pt-24 pb-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-subtle p-8 text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Doctor Not Found</h2>
              <p className="text-gray-600 mb-4">The doctor you're looking for doesn't exist or has been removed.</p>
              <button 
                onClick={() => navigate('/doctors')}
                className="inline-flex items-center text-health-600 hover:text-health-700"
              >
                <ArrowLeft size={16} className="mr-2" />
                <span>Return to Doctor Directory</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatedTransition animation="fade" className="mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-health-600 transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              <span>Back to Directory</span>
            </button>
          </AnimatedTransition>
          
          <div className="bg-white rounded-2xl shadow-subtle overflow-hidden">
            <div className="bg-health-600 py-12 px-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-health-700 to-health-500 opacity-80"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                <AnimatedTransition animation="scale" className="w-24 h-24 rounded-full overflow-hidden bg-white flex-shrink-0 border-4 border-white shadow-elevated">
                  <img 
                    src={doctor.image} 
                    alt={doctor.name} 
                    className="w-full h-full object-cover"
                  />
                </AnimatedTransition>
                
                <div className="flex-grow text-white">
                  <AnimatedTransition animation="slide-up" delay={100}>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold">{doctor.name}</h1>
                      <div className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                        <Star size={16} className="text-yellow-300 fill-yellow-300 mr-1" />
                        <span className="font-medium">{doctor.rating}</span>
                      </div>
                      {id && doctor && (
                        <DoctorVerificationBadge doctorId={id} doctor={doctor} />
                      )}
                    </div>
                  </AnimatedTransition>
                  
                  <AnimatedTransition animation="slide-up" delay={200} className="mb-4">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="bg-white/10 px-3 py-1 rounded-full text-sm">
                        {doctor.specialty}
                      </span>
                      {doctor.subspecialties?.map((sub, index) => (
                        <span key={index} className="bg-white/10 px-3 py-1 rounded-full text-sm">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </AnimatedTransition>
                  
                  <AnimatedTransition animation="slide-up" delay={300}>
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-2 text-health-200" />
                      <span className="text-health-100">{doctor.hospital}</span>
                    </div>
                  </AnimatedTransition>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <AnimatedTransition animation="fade" delay={400} className="mb-8">
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <h2 className="text-xl font-semibold mb-4">About</h2>
                      <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
                    </div>
                  </AnimatedTransition>
                  
                  <AnimatedTransition animation="fade" delay={500} className="mb-8">
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <h2 className="text-xl font-semibold mb-4">Education</h2>
                      <ul className="space-y-3">
                        {doctor.education.map((edu, index) => (
                          <li key={index} className="flex items-start">
                            <GraduationCap size={18} className="text-health-600 mt-1 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{edu}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AnimatedTransition>
                  
                  <AnimatedTransition animation="fade" delay={600} className="mb-8">
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Patient Ratings & Reviews</h2>
                        {id && (
                          <DoctorRatingForm doctorId={id} onRatingSubmitted={handleRatingSubmitted} />
                        )}
                      </div>
                      
                      {ratings.length > 0 ? (
                        <div className="space-y-6">
                          {ratings.map((rating) => (
                            <div key={rating.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                              <div className="flex items-start gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback className="bg-health-100 text-health-600">
                                    {rating.user_id.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center mb-2">
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
                                    <p className="text-gray-700 text-sm">{rating.comment}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No ratings yet. Be the first to rate this doctor!
                        </p>
                      )}
                    </div>
                  </AnimatedTransition>
                </div>
                
                <div>
                  <AnimatedTransition animation="scale" delay={450} className="mb-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-subtle">
                      <h2 className="text-lg font-medium mb-4">Contact Information</h2>
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <Phone size={18} className="text-health-600 mt-1 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{doctor.contact.phone}</span>
                        </li>
                        <li className="flex items-start">
                          <Mail size={18} className="text-health-600 mt-1 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{doctor.contact.email}</span>
                        </li>
                        <li className="flex items-start">
                          <MapPin size={18} className="text-health-600 mt-1 mr-3 flex-shrink-0" />
                          <div>
                            <span className="text-gray-700 block">{doctor.contact.address}</span>
                            {(doctor.contact.city || doctor.contact.wilaya) && (
                              <span className="text-gray-700">
                                {doctor.contact.city}{doctor.contact.city && doctor.contact.wilaya ? ', ' : ''}
                                {doctor.contact.wilaya}
                              </span>
                            )}
                          </div>
                        </li>
                      </ul>
                    </div>
                  </AnimatedTransition>
                  
                  <AnimatedTransition animation="scale" delay={550} className="mb-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-subtle">
                      <h2 className="text-lg font-medium mb-4">Additional Information</h2>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <Clock size={18} className="text-health-600 mt-1 mr-3 flex-shrink-0" />
                          <div>
                            <span className="font-medium text-gray-900 block mb-1">Experience</span>
                            <span className="text-gray-700">{doctor.experience} years</span>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <Languages size={18} className="text-health-600 mt-1 mr-3 flex-shrink-0" />
                          <div>
                            <span className="font-medium text-gray-900 block mb-1">Languages</span>
                            <div className="flex flex-wrap gap-2">
                              {doctor.languages.map((lang, index) => (
                                <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-700">
                                  {lang}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <CheckCircle size={18} className={cn(
                            "mt-1 mr-3 flex-shrink-0",
                            doctor.accepting_new_patients ? "text-green-600" : "text-gray-400"
                          )} />
                          <div>
                            <span className="font-medium text-gray-900 block mb-1">Accepting New Patients</span>
                            <span className={cn(
                              doctor.accepting_new_patients ? "text-green-600" : "text-gray-500"
                            )}>
                              {doctor.accepting_new_patients ? "Yes" : "Not at this time"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AnimatedTransition>
                  
                  <AnimatedTransition animation="scale" delay={650}>
                    <button 
                      onClick={handleCallNow}
                      className="w-full py-3 px-4 bg-health-600 text-white rounded-xl font-medium hover:bg-health-700 transition-colors flex items-center justify-center shadow-subtle"
                    >
                      <Phone size={18} className="mr-2" />
                      Call Now
                    </button>
                  </AnimatedTransition>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-8 px-6 bg-gray-50 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} HealthCare Directory. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default DoctorProfile;
