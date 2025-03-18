import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDoctorById, updateDoctor, getDoctorVerification, getSpecialties, uploadDoctorImage } from '@/lib/api';
import { SupabaseDoctor } from '@/types/supabase';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import AnimatedTransition from '@/components/AnimatedTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, X, Check, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { wilayas } from '@/data/wilaya';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const doctorFormSchema = z.object({
  prefix: z.enum(["Dr", "Pr"]),
  name: z.string().min(1, "Name is required"),
  gender: z.enum(["Male", "Female"]),
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
  const [specialtyOpen, setSpecialtyOpen] = useState(false);
  const [wilayaOpen, setWilayaOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const { data: specialties = [] } = useQuery({
    queryKey: ['specialties'],
    queryFn: getSpecialties,
    staleTime: 1000 * 60 * 60,
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      prefix: "Dr",
      gender: "Male",
      accepting_new_patients: true,
    }
  });

  const watchedPrefix = watch('prefix');
  const watchedGender = watch('gender');
  const watchedSpecialty = watch('specialty');
  const watchedWilaya = watch('contactWilaya');

  useEffect(() => {
    const checkPermissions = async () => {
      if (!user || !id) {
        navigate('/profile');
        return;
      }

      try {
        const doctorData = await getDoctorById(id);
        if (!doctorData) {
          toast.error('Doctor profile not found');
          navigate('/profile');
          return;
        }

        setDoctor(doctorData);

        const isCreator = doctorData.created_by_user_id === user.id;
        
        const verification = await getDoctorVerification(id, user.id);
        const isClaimer = verification?.verified || false;
        
        const userHasPermission = isCreator || isClaimer;
        setHasPermission(userHasPermission);

        if (!userHasPermission) {
          toast.error('You do not have permission to edit this profile');
          navigate('/profile');
          return;
        }

        let prefix = "Dr";
        let name = doctorData.name;
        if (doctorData.name.startsWith("Dr. ")) {
          prefix = "Dr";
          name = doctorData.name.substring(4);
        } else if (doctorData.name.startsWith("Pr. ")) {
          prefix = "Pr";
          name = doctorData.name.substring(4);
        }
        
        setValue('prefix', prefix as "Dr" | "Pr");
        setValue('gender', "Male");
        
        setValue('name', name);
        setValue('specialty', doctorData.specialty);
        setValue('subspecialties', doctorData.subspecialties?.join(', ') || '');
        setValue('hospital', doctorData.hospital);
        setValue('experience', doctorData.experience);
        setValue('bio', doctorData.bio);
        setValue('languages', doctorData.languages.join(', '));
        setValue('education', doctorData.education.join('\n'));
        setValue('accepting_new_patients', doctorData.accepting_new_patients);
        setValue('image', doctorData.image);
        setImagePreview(doctorData.image);
        setValue('contactPhone', doctorData.contact.phone);
        setValue('contactEmail', doctorData.contact.email);
        
        if (typeof doctorData.contact.address === 'string') {
          const addressParts = doctorData.contact.address.split('_');
          
          if (addressParts.length >= 1) {
            setValue('contactAddress', addressParts[0]);
          }
          
          if (addressParts.length >= 2) {
            setValue('contactCity', addressParts[1]);
          }
          
          if (addressParts.length >= 3) {
            setValue('contactWilaya', addressParts[2]);
          }
        } else {
          setValue('contactAddress', '');
          setValue('contactCity', '');
          setValue('contactWilaya', '');
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading doctor profile:', error);
        toast.error('Error loading doctor profile');
        navigate('/profile');
      }
    };

    checkPermissions();
  }, [id, user, navigate, setValue, specialties]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
      
      toast.loading('Uploading image...');
      
      const imageUrl = await uploadDoctorImage(file);
      
      if (imageUrl) {
        setImagePreview(imageUrl);
        setValue('image', imageUrl);
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
      }
    }
  };

  const onSubmit = async (data: DoctorFormValues) => {
    if (!id) return;

    try {
      const formattedName = `${data.prefix}. ${data.name}`;
      
      const formattedAddress = [
        data.contactAddress,
        data.contactCity,
        data.contactWilaya
      ].filter(Boolean).join('_');
      
      const updatedDoctor: Partial<SupabaseDoctor> = {
        name: formattedName,
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
          address: formattedAddress,
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
                    <Label htmlFor="prefix">Doctor Title</Label>
                    <Select 
                      onValueChange={(value) => setValue('prefix', value as "Dr" | "Pr")}
                      value={watchedPrefix}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select title" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dr">Dr</SelectItem>
                        <SelectItem value="Pr">Pr</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select 
                      onValueChange={(value) => setValue('gender', value as "Male" | "Female")}
                      value={watchedGender}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="name">Doctor Name (without title)</Label>
                    <Input 
                      id="name" 
                      {...register('name')} 
                      placeholder="Full Name" 
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="specialty">Specialty</Label>
                    <Popover open={specialtyOpen} onOpenChange={setSpecialtyOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={specialtyOpen}
                          className="w-full justify-between font-normal"
                          type="button"
                        >
                          {watchedSpecialty
                            ? specialties.find((specialty) => specialty === watchedSpecialty)
                            : "Select specialty..."}
                          <X
                            className={cn(
                              "ml-2 h-4 w-4 shrink-0 opacity-50",
                              !watchedSpecialty && "hidden"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              setValue('specialty', '');
                            }}
                          />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search specialty..." />
                          <CommandEmpty>No specialty found.</CommandEmpty>
                          <CommandGroup>
                            <ScrollArea className="h-72">
                              {specialties.map((specialty) => (
                                <CommandItem
                                  key={specialty}
                                  value={specialty}
                                  onSelect={() => {
                                    setValue('specialty', specialty);
                                    setSpecialtyOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      watchedSpecialty === specialty
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {specialty}
                                </CommandItem>
                              ))}
                            </ScrollArea>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
                  
                  <div>
                    <Label htmlFor="contactCity">City</Label>
                    <Input 
                      id="contactCity" 
                      {...register('contactCity')} 
                      placeholder="City" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="wilaya">Wilaya</Label>
                    <Popover open={wilayaOpen} onOpenChange={setWilayaOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={wilayaOpen}
                          className="w-full justify-between font-normal"
                          type="button"
                        >
                          {watchedWilaya
                            ? wilayas.find((wilaya) => wilaya === watchedWilaya)
                            : "Select wilaya..."}
                          <X
                            className={cn(
                              "ml-2 h-4 w-4 shrink-0 opacity-50",
                              !watchedWilaya && "hidden"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              setValue('contactWilaya', '');
                            }}
                          />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search wilaya..." />
                          <CommandEmpty>No wilaya found.</CommandEmpty>
                          <CommandGroup>
                            <ScrollArea className="h-72">
                              {wilayas.map((wilaya) => (
                                <CommandItem
                                  key={wilaya}
                                  value={wilaya}
                                  onSelect={() => {
                                    setValue('contactWilaya', wilaya);
                                    setWilayaOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      watchedWilaya === wilaya
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {wilaya}
                                </CommandItem>
                              ))}
                            </ScrollArea>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label htmlFor="image">Profile Image</Label>
                    <div className="mt-1 flex items-center space-x-4">
                      <div className="w-24 h-24 border rounded-full overflow-hidden bg-gray-50">
                        {imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt="Profile preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <Upload size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Label 
                          htmlFor="image-upload" 
                          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none cursor-pointer"
                        >
                          <Upload size={16} className="mr-2" />
                          Upload Image
                        </Label>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageChange}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          JPG, PNG or GIF, Max 2MB
                        </p>
                      </div>
                    </div>
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
