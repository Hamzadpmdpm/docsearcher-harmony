
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDoctorById, updateDoctor, getDoctorVerification } from '@/lib/api';
import { SupabaseDoctor } from '@/types/supabase';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Header from '@/components/Header';
import AnimatedTransition from '@/components/AnimatedTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

const doctorFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  specialty: z.string().min(1, "Specialty is required"),
  subspecialties: z.string().optional(),
  hospital: z.string().min(1, "Hospital is required"),
  experience: z.number().min(0, "Experience must be a positive number"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  languages: z.string().min(1, "Languages are required"),
  education: z.string().min(1, "Education is required"),
  accepting_new_patients: z.boolean().default(true),
  image: z.string().default('/placeholder.svg'),
  contactPhone: z.string().min(1, "Phone number is required"),
  contactEmail: z.string().email("Invalid email address"),
  contactAddress: z.string().min(1, "Address is required"),
  contactCity: z.string().optional(),
  contactWilaya: z.string().optional(),
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;

const EditDoctorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [doctor, setDoctor] = useState<SupabaseDoctor | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      accepting_new_patients: true,
    }
  });

  useEffect(() => {
    const checkPermissions = async () => {
      if (!user || !id) {
        navigate('/profile');
        return;
      }

      try {
        // First, fetch the doctor profile
        const doctorData = await getDoctorById(id);
        if (!doctorData) {
          toast.error('Doctor profile not found');
          navigate('/profile');
          return;
        }

        setDoctor(doctorData);

        // Check if user created this doctor profile
        const isCreator = doctorData.created_by_user_id === user.id;
        
        // Check if user has verified/claimed this profile
        const verification = await getDoctorVerification(id, user.id);
        const isClaimer = verification?.verified || false;
        
        // User has permission if they created or claimed the profile
        const userHasPermission = isCreator || isClaimer;
        setHasPermission(userHasPermission);

        if (!userHasPermission) {
          toast.error('You do not have permission to edit this profile');
          navigate('/profile');
          return;
        }

        // Populate form with existing data
        setValue('name', doctorData.name);
        setValue('specialty', doctorData.specialty);
        setValue('subspecialties', doctorData.subspecialties?.join(', ') || '');
        setValue('hospital', doctorData.hospital);
        setValue('experience', doctorData.experience);
        setValue('bio', doctorData.bio);
        setValue('languages', doctorData.languages.join(', '));
        setValue('education', doctorData.education.join('\n'));
        setValue('accepting_new_patients', doctorData.accepting_new_patients);
        setValue('image', doctorData.image);
        setValue('contactPhone', doctorData.contact.phone);
        setValue('contactEmail', doctorData.contact.email);
        setValue('contactAddress', doctorData.contact.address);
        setValue('contactCity', doctorData.contact.city || '');
        setValue('contactWilaya', doctorData.contact.wilaya || '');

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading doctor profile:', error);
        toast.error('Error loading doctor profile');
        navigate('/profile');
      }
    };

    checkPermissions();
  }, [id, user, navigate, setValue]);

  const onSubmit = async (data: DoctorFormValues) => {
    if (!id) return;

    try {
      const updatedDoctor: Partial<SupabaseDoctor> = {
        name: data.name,
        specialty: data.specialty,
        subspecialties: data.subspecialties ? data.subspecialties.split(',').map(s => s.trim()) : [],
        hospital: data.hospital,
        experience: data.experience,
        bio: data.bio,
        languages: data.languages.split(',').map(l => l.trim()),
        education: data.education.split('\n').map(e => e.trim()).filter(e => e),
        accepting_new_patients: data.accepting_new_patients,
        image: data.image,
        contact: {
          phone: data.contactPhone,
          email: data.contactEmail,
          address: data.contactAddress,
          city: data.contactCity,
          wilaya: data.contactWilaya,
        }
      };

      const success = await updateDoctor(id, updatedDoctor);
      if (success) {
        toast.success('Doctor profile updated successfully');
        navigate(`/doctors/${id}`);
      }
    } catch (error) {
      console.error('Error updating doctor profile:', error);
      toast.error('Failed to update doctor profile');
    }
  };

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

  if (!hasPermission || !doctor) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow pt-24 pb-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-subtle p-8 text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Permission Denied</h2>
              <p className="text-gray-600 mb-4">You do not have permission to edit this doctor profile.</p>
              <Button onClick={() => navigate('/profile')} className="bg-health-600 hover:bg-health-700">
                Return to Profile
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
          <AnimatedTransition animation="fade" className="mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-health-600 transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              <span>Back</span>
            </button>
          </AnimatedTransition>
          
          <div className="bg-white rounded-2xl shadow-subtle p-8">
            <h1 className="text-2xl font-semibold mb-6">Edit Doctor Profile</h1>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Doctor Name</Label>
                    <Input 
                      id="name" 
                      {...register('name')} 
                      placeholder="Dr. Full Name" 
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="specialty">Specialty</Label>
                    <Input 
                      id="specialty" 
                      {...register('specialty')} 
                      placeholder="e.g. Cardiology" 
                    />
                    {errors.specialty && <p className="text-red-500 text-sm mt-1">{errors.specialty.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="subspecialties">Subspecialties (comma separated)</Label>
                    <Input 
                      id="subspecialties" 
                      {...register('subspecialties')} 
                      placeholder="e.g. Interventional Cardiology, Heart Failure" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="hospital">Hospital/Clinic</Label>
                    <Input 
                      id="hospital" 
                      {...register('hospital')} 
                      placeholder="Hospital or Clinic Name" 
                    />
                    {errors.hospital && <p className="text-red-500 text-sm mt-1">{errors.hospital.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input 
                      id="experience" 
                      type="number" 
                      {...register('experience', { valueAsNumber: true })} 
                      min="0" 
                    />
                    {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="languages">Languages (comma separated)</Label>
                    <Input 
                      id="languages" 
                      {...register('languages')} 
                      placeholder="e.g. English, Arabic, French" 
                    />
                    {errors.languages && <p className="text-red-500 text-sm mt-1">{errors.languages.message}</p>}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contactPhone">Phone</Label>
                    <Input 
                      id="contactPhone" 
                      {...register('contactPhone')} 
                      placeholder="Phone Number" 
                    />
                    {errors.contactPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPhone.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input 
                      id="contactEmail" 
                      type="email" 
                      {...register('contactEmail')} 
                      placeholder="Email Address" 
                    />
                    {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="contactAddress">Address</Label>
                    <Input 
                      id="contactAddress" 
                      {...register('contactAddress')} 
                      placeholder="Street Address" 
                    />
                    {errors.contactAddress && <p className="text-red-500 text-sm mt-1">{errors.contactAddress.message}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactCity">City</Label>
                      <Input 
                        id="contactCity" 
                        {...register('contactCity')} 
                        placeholder="City" 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="contactWilaya">Wilaya/State</Label>
                      <Input 
                        id="contactWilaya" 
                        {...register('contactWilaya')} 
                        placeholder="Wilaya/State" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="image">Profile Image URL</Label>
                    <Input 
                      id="image" 
                      {...register('image')} 
                      placeholder="Image URL" 
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="accepting_new_patients"
                      {...register('accepting_new_patients')}
                      className="h-4 w-4 text-health-600 border-gray-300 rounded focus:ring-health-500"
                    />
                    <Label htmlFor="accepting_new_patients">Currently accepting new patients</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bio">Bio/About</Label>
                  <Textarea 
                    id="bio" 
                    {...register('bio')} 
                    placeholder="Write a professional bio..." 
                    rows={5}
                  />
                  {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>}
                </div>
                
                <div>
                  <Label htmlFor="education">Education (one per line)</Label>
                  <Textarea 
                    id="education" 
                    {...register('education')} 
                    placeholder="MD, University Name, Year
Residency, Hospital Name, Specialty, Year" 
                    rows={5}
                  />
                  {errors.education && <p className="text-red-500 text-sm mt-1">{errors.education.message}</p>}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-health-600 hover:bg-health-700"
                >
                  <Save className="mr-2" size={16} />
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditDoctorProfile;
