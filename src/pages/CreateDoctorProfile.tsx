
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getSpecialties, createDoctor, getDoctors, verifyDoctorByCurrentUser } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import Header from '@/components/Header';
import AnimatedTransition from '@/components/AnimatedTransition';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { hospitalPrefixes, HospitalPrefix } from '@/data/hospitalPrefixes';
import { wilayas } from '@/data/wilaya';

const doctorSchema = z.object({
  prefix: z.enum(["Dr", "Pr"]).default("Dr"),
  name: z.string().min(1, { message: 'Name is required' }),
  specialty: z.string().min(1, { message: 'Specialty is required' }),
  subspecialties: z.array(z.string()).optional(),
  hospitalPrefix: z.string().min(1, { message: 'Hospital prefix is required' }),
  hospital: z.string().min(1, { message: 'Hospital is required' }),
  experience: z.coerce.number().min(0, { message: 'Experience must be a positive number' }),
  education: z.array(z.string()).min(1, { message: 'At least one education entry is required' }),
  bio: z.string().min(30, { message: 'Bio must be at least 30 characters' }),
  languages: z.array(z.string()).min(1, { message: 'At least one language is required' }),
  accepting_new_patients: z.boolean().default(true),
  phone: z.string().min(1, { message: 'Phone number is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  address: z.string().min(1, { message: 'Address is required' }),
  city: z.string().min(1, { message: 'City is required' }),
  wilaya: z.string().min(1, { message: 'Wilaya is required' }),
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

const CreateDoctorProfile = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [subspecialties, setSubspecialties] = useState<string[]>(['']);
  const [education, setEducation] = useState<string[]>(['']);
  const [languages, setLanguages] = useState<string[]>(['English']);
  
  const { data: specialties = [] } = useQuery({
    queryKey: ['specialties'],
    queryFn: getSpecialties
  });
  
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (user) {
        try {
          const doctors = await getDoctors();
          const userDoctors = doctors.filter(doctor => doctor.created_by_user_id === user.id);
          setHasExistingProfile(userDoctors.length > 0);
        } catch (error) {
          console.error('Error checking existing profiles:', error);
        } finally {
          setIsCheckingProfile(false);
        }
      } else {
        setIsCheckingProfile(false);
      }
    };
    
    checkExistingProfile();
  }, [user]);
  
  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      prefix: "Dr",
      name: '',
      specialty: '',
      subspecialties: [],
      hospitalPrefix: '',
      hospital: '',
      experience: 0,
      education: [''],
      bio: '',
      languages: ['English'],
      accepting_new_patients: true,
      phone: '',
      email: '',
      address: '',
      city: '',
      wilaya: '',
    }
  });
  
  if (!user || (profile && profile.user_type !== 'doctor')) {
    navigate('/auth');
    return null;
  }
  
  if (isCheckingProfile) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow pt-24 pb-16 px-6">
          <div className="max-w-3xl mx-auto">
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
  
  if (hasExistingProfile) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow pt-24 pb-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-subtle p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Limit Reached</h2>
              <p className="text-gray-600 mb-6">
                You have already created a doctor profile. Each doctor can only create one profile.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => navigate('/profile')}
                  className="bg-health-600 hover:bg-health-700"
                >
                  Go to My Profile
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/doctors')}
                >
                  Browse Doctors
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  const addSubspecialty = () => {
    setSubspecialties([...subspecialties, '']);
  };
  
  const removeSubspecialty = (index: number) => {
    const updated = [...subspecialties];
    updated.splice(index, 1);
    setSubspecialties(updated);
  };
  
  const updateSubspecialty = (index: number, value: string) => {
    const updated = [...subspecialties];
    updated[index] = value;
    setSubspecialties(updated);
    form.setValue('subspecialties', updated.filter(item => item.trim() !== ''));
  };
  
  const addEducation = () => {
    setEducation([...education, '']);
  };
  
  const removeEducation = (index: number) => {
    const updated = [...education];
    updated.splice(index, 1);
    setEducation(updated);
  };
  
  const updateEducation = (index: number, value: string) => {
    const updated = [...education];
    updated[index] = value;
    setEducation(updated);
    form.setValue('education', updated.filter(item => item.trim() !== ''));
  };
  
  const addLanguage = () => {
    setLanguages([...languages, '']);
  };
  
  const removeLanguage = (index: number) => {
    const updated = [...languages];
    updated.splice(index, 1);
    setLanguages(updated);
  };
  
  const updateLanguage = (index: number, value: string) => {
    const updated = [...languages];
    updated[index] = value;
    setLanguages(updated);
    form.setValue('languages', updated.filter(item => item.trim() !== ''));
  };
  
  const onSubmit = async (values: DoctorFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const filteredSubspecialties = subspecialties.filter(item => item.trim() !== '');
      const filteredEducation = education.filter(item => item.trim() !== '');
      const filteredLanguages = languages.filter(item => item.trim() !== '');
      
      // Format the doctor name with prefix
      const formattedName = `${values.prefix}. ${values.name}`;
      
      // Format the hospital name with prefix
      const formattedHospital = `${values.hospitalPrefix} ${values.hospital}`;
      
      const doctorData = {
        name: formattedName,
        specialty: values.specialty,
        subspecialties: filteredSubspecialties.length > 0 ? filteredSubspecialties : null,
        hospital: formattedHospital,
        rating: 0,
        experience: values.experience,
        education: filteredEducation,
        bio: values.bio,
        languages: filteredLanguages,
        accepting_new_patients: values.accepting_new_patients,
        contact: {
          phone: values.phone,
          email: values.email,
          address: values.address,
          city: values.city,
          wilaya: values.wilaya,
        },
        image: '/placeholder.svg',
        created_by_user_id: user.id,
      };
      
      const doctorId = await createDoctor(doctorData);
      
      if (doctorId) {
        await verifyDoctorByCurrentUser(doctorId);
        navigate(`/doctors/${doctorId}`);
      }
    } catch (error) {
      console.error('Error creating doctor profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
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
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Doctor Profile</h1>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="prefix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select title" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Dr">Dr</SelectItem>
                              <SelectItem value="Pr">Pr</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name (without title)</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="specialty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Specialty</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a specialty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <ScrollArea className="h-72">
                                {specialties.map((specialty) => (
                                  <SelectItem key={specialty} value={specialty}>
                                    {specialty}
                                  </SelectItem>
                                ))}
                              </ScrollArea>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="hospitalPrefix"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hospital Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select hospital type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <ScrollArea className="h-72">
                                  {hospitalPrefixes.map(({ prefix, description }) => (
                                    <SelectItem key={prefix} value={prefix}>
                                      <div className="flex flex-col">
                                        <span className="font-medium">{prefix}</span>
                                        <span className="text-sm text-gray-500">{description}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </ScrollArea>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    
                      <FormField
                        control={form.control}
                        name="hospital"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hospital / Practice Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Hospital name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <FormLabel>Subspecialties</FormLabel>
                    <FormDescription>Add any subspecialties or areas of focus</FormDescription>
                    
                    <div className="space-y-2 mt-2">
                      {subspecialties.map((subspecialty, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={subspecialty}
                            onChange={(e) => updateSubspecialty(index, e.target.value)}
                            placeholder="E.g., Pediatric Cardiology"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeSubspecialty(index)}
                            disabled={subspecialties.length === 1 && index === 0}
                          >
                            <Minus size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addSubspecialty}
                      className="mt-2"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Subspecialty
                    </Button>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Education & Qualifications</h2>
                  
                  <div>
                    <FormLabel>Education</FormLabel>
                    <FormDescription>Add your degrees, residencies, and fellowships</FormDescription>
                    
                    <div className="space-y-2 mt-2">
                      {education.map((edu, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={edu}
                            onChange={(e) => updateEducation(index, e.target.value)}
                            placeholder="E.g., Harvard Medical School, MD"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeEducation(index)}
                            disabled={education.length === 1 && index === 0}
                          >
                            <Minus size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addEducation}
                      className="mt-2"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Education
                    </Button>
                  </div>
                  
                  <div>
                    <FormLabel>Languages</FormLabel>
                    <FormDescription>List languages you speak with patients</FormDescription>
                    
                    <div className="space-y-2 mt-2">
                      {languages.map((language, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={language}
                            onChange={(e) => updateLanguage(index, e.target.value)}
                            placeholder="E.g., English"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeLanguage(index)}
                            disabled={languages.length === 1 && index === 0}
                          >
                            <Minus size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addLanguage}
                      className="mt-2"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Language
                    </Button>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Share your background, approach to care, and special interests..."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Write a professional summary that will help patients get to know you.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="doctor@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Medical Plaza, Suite 300" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Boston" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="wilaya"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wilaya</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select wilaya" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <ScrollArea className="h-72">
                                {wilayas.map((wilaya) => (
                                  <SelectItem key={wilaya} value={wilaya}>
                                    {wilaya}
                                  </SelectItem>
                                ))}
                              </ScrollArea>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Practice Status</h2>
                  
                  <FormField
                    control={form.control}
                    name="accepting_new_patients"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Accepting New Patients</FormLabel>
                          <FormDescription>
                            Let patients know if you're currently accepting new patients
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="pt-6 border-t border-gray-100">
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto bg-health-600 hover:bg-health-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateDoctorProfile;
