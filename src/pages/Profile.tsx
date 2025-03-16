
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDoctors, getProfileById } from '@/lib/api';
import { SupabaseDoctor } from '@/types/supabase';
import Header from '@/components/Header';
import AnimatedTransition from '@/components/AnimatedTransition';
import DoctorCard from '@/components/DoctorCard';
import { Button } from '@/components/ui/button';
import { User, UserCog, Heart, StarIcon, LogOut, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Profile = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [doctorProfiles, setDoctorProfiles] = useState<SupabaseDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user && !profile && !isLoading) {
      navigate('/auth');
    }
  }, [user, profile, isLoading, navigate]);

  useEffect(() => {
    const fetchDoctorProfiles = async () => {
      if (user && profile?.user_type === 'doctor') {
        try {
          const doctors = await getDoctors();
          const userDoctors = doctors.filter(doctor => doctor.created_by_user_id === user.id);
          setDoctorProfiles(userDoctors);
        } catch (error) {
          console.error('Error fetching doctor profiles:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchDoctorProfiles();
  }, [user, profile]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="h-8 w-48 bg-gray-200 rounded mb-4 mx-auto"></div>
            <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow pt-24 pb-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-subtle p-8 text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
              <Button onClick={() => navigate('/auth')} className="bg-health-600 hover:bg-health-700">
                Go to Login
              </Button>
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
          <AnimatedTransition animation="fade">
            <div className="bg-white rounded-2xl shadow-subtle p-8">
              <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-health-100 flex items-center justify-center text-health-600">
                    <User size={32} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                      {profile.first_name} {profile.last_name}
                    </h1>
                    <p className="text-gray-600 capitalize">
                      {profile.user_type}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/profile/edit')}
                    className="flex items-center gap-2"
                  >
                    <UserCog size={16} />
                    Edit Profile
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={signOut}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </Button>
                </div>
              </div>
              
              {profile.user_type === 'doctor' && (
                <AnimatedTransition animation="slide-up" className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <UserCog className="mr-2" size={18} />
                    Your Doctor Profiles
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {doctorProfiles.length > 0 ? (
                      doctorProfiles.map((doctor, index) => (
                        <DoctorCard key={doctor.id} doctor={doctor} index={index} />
                      ))
                    ) : (
                      <div className="col-span-full">
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center">
                          <p className="text-gray-600 mb-4">You haven't created any doctor profiles yet.</p>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="bg-health-600 hover:bg-health-700">
                                <Plus size={16} className="mr-2" />
                                Create Doctor Profile
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Create Doctor Profile</DialogTitle>
                                <DialogDescription>
                                  To create a doctor profile, you'll need to provide professional details.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <Button 
                                  className="w-full bg-health-600 hover:bg-health-700"
                                  onClick={() => navigate('/doctors/create')}
                                >
                                  Continue to Doctor Profile Creation
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    )}
                    
                    {doctorProfiles.length > 0 && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="col-span-full bg-health-600 hover:bg-health-700 mt-4">
                            <Plus size={16} className="mr-2" />
                            Create Another Doctor Profile
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create Doctor Profile</DialogTitle>
                            <DialogDescription>
                              To create a doctor profile, you'll need to provide professional details.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Button 
                              className="w-full bg-health-600 hover:bg-health-700"
                              onClick={() => navigate('/doctors/create')}
                            >
                              Continue to Doctor Profile Creation
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </AnimatedTransition>
              )}
              
              {profile.user_type === 'patient' && (
                <>
                  <AnimatedTransition animation="slide-up" className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Heart className="mr-2" size={18} />
                      Saved Doctors
                    </h2>
                    
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center">
                      <p className="text-gray-600">Saved doctors feature coming soon!</p>
                    </div>
                  </AnimatedTransition>
                  
                  <AnimatedTransition animation="slide-up">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <StarIcon className="mr-2" size={18} />
                      Your Ratings
                    </h2>
                    
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center">
                      <p className="text-gray-600">Rating history coming soon!</p>
                    </div>
                  </AnimatedTransition>
                </>
              )}
            </div>
          </AnimatedTransition>
        </div>
      </main>
    </div>
  );
};

export default Profile;
