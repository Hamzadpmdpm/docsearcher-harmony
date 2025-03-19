import { supabase } from '@/integrations/supabase/client';
import { DoctorRating, DoctorVerification, Profile, SupabaseDoctor } from '@/types/supabase';
import { toast } from 'sonner';

export async function getDoctors(options: {
  specialty?: string | null;
  searchQuery?: string;
  city?: string;
  state?: string;
  wilaya?: string | null;
} = {}): Promise<SupabaseDoctor[]> {
  try {
    let query = supabase
      .from('doctors')
      .select('*');
    
    if (options.specialty) {
      query = query.eq('specialty', options.specialty);
    }
    
    if (options.searchQuery) {
      const searchTerm = options.searchQuery.toLowerCase();
      query = query.or(
        `name.ilike.%${searchTerm}%,specialty.ilike.%${searchTerm}%,hospital.ilike.%${searchTerm}%`
      );
    }
    
    if (options.city && options.city.trim() !== '') {
      query = query.ilike('contact->>city', `%${options.city}%`);
    }
    
    if (options.state && options.state.trim() !== '') {
      query = query.ilike('contact->>state', `%${options.state}%`);
    }
    
    if (options.wilaya && options.wilaya.trim() !== '') {
      query = query.ilike('contact->>wilaya', `%${options.wilaya}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
      return [];
    }
    
    return data as SupabaseDoctor[];
  } catch (error) {
    console.error('Error in getDoctors:', error);
    toast.error('Failed to load doctors');
    return [];
  }
}

export async function getSpecialties(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('specialties')
      .select('*');
    
    if (error) {
      console.error('Error fetching specialties:', error);
      return [];
    }
    
    return data.map(item => item.specialty);
  } catch (error) {
    console.error('Error in getSpecialties:', error);
    return [];
  }
}

export async function getDoctorById(id: string): Promise<SupabaseDoctor | null> {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching doctor:', error);
      toast.error('Failed to load doctor details');
      return null;
    }
    
    if (data && data.contact) {
      const contactData = data.contact as Record<string, any>;
      if (contactData.address && typeof contactData.address === 'string') {
        const addressParts = contactData.address.split('_');
        if (addressParts.length >= 2) {
          contactData.address = addressParts[0] || '';
          if (!contactData.city && addressParts.length >= 2) {
            contactData.city = addressParts[1] || '';
          }
          if (!contactData.wilaya && addressParts.length >= 3) {
            contactData.wilaya = addressParts[2] || '';
          }
        }
      }
    }
    
    const ratings = await getDoctorRatings(id);
    if (ratings && ratings.length > 0) {
      const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
      const avgRating = +(sum / ratings.length).toFixed(1); // Round to 1 decimal place
      data.rating = avgRating;
      
      await supabase
        .from('doctors')
        .update({ rating: avgRating })
        .eq('id', id);
    }
    
    return data as SupabaseDoctor;
  } catch (error) {
    console.error('Error in getDoctorById:', error);
    toast.error('Failed to load doctor details');
    return null;
  }
}

export async function getDoctorVerification(doctorId: string, userId: string): Promise<DoctorVerification | null> {
  try {
    const { data, error } = await supabase
      .from('doctor_verifications')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching doctor verification:', error);
      return null;
    }
    
    return data as DoctorVerification;
  } catch (error) {
    console.error('Error in getDoctorVerification:', error);
    return null;
  }
}

export async function requestDoctorVerification(doctorId: string): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      toast.error('You must be logged in to request verification');
      return false;
    }
    
    const userId = session.user.id;
    
    const { error } = await supabase
      .from('doctor_verifications')
      .insert({ 
        doctor_id: doctorId, 
        user_id: userId 
      });
    
    if (error) {
      console.error('Error requesting doctor verification:', error);
      toast.error('Failed to request verification');
      return false;
    }
    
    toast.success('Verification request submitted');
    return true;
  } catch (error) {
    console.error('Error in requestDoctorVerification:', error);
    toast.error('Failed to request verification');
    return false;
  }
}

export async function verifyDoctorByCurrentUser(doctorId: string): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      toast.error('You must be logged in to claim a profile');
      return false;
    }
    
    const userId = session.user.id;
    
    const { data: existingVerifications, error: checkError } = await supabase
      .from('doctor_verifications')
      .select('*')
      .eq('user_id', userId)
      .eq('verified', true);
    
    if (checkError) {
      console.error('Error checking existing verifications:', checkError);
      toast.error('Failed to verify doctor status');
      return false;
    }
    
    if (existingVerifications && existingVerifications.length > 0) {
      toast.error('You have already verified another doctor profile');
      return false;
    }
    
    const { error } = await supabase
      .from('doctor_verifications')
      .insert({
        doctor_id: doctorId,
        user_id: userId,
        verified: true
      });
    
    if (error) {
      console.error('Error verifying doctor:', error);
      toast.error('Failed to claim profile');
      return false;
    }
    
    toast.success('Profile successfully claimed');
    return true;
  } catch (error) {
    console.error('Error in verifyDoctorByCurrentUser:', error);
    toast.error('Failed to claim profile');
    return false;
  }
}

export async function isUserDoctorOwner(doctorId: string, userId: string): Promise<boolean> {
  try {
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('created_by_user_id')
      .eq('id', doctorId)
      .maybeSingle();
    
    if (doctorError) {
      console.error('Error checking doctor ownership:', doctorError);
      return false;
    }
    
    if (doctor && doctor.created_by_user_id === userId) {
      return true;
    }
    
    const { data: verification, error: verificationError } = await supabase
      .from('doctor_verifications')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('user_id', userId)
      .eq('verified', true)
      .maybeSingle();
    
    if (verificationError) {
      console.error('Error checking verification:', verificationError);
      return false;
    }
    
    return !!verification;
  } catch (error) {
    console.error('Error in isUserDoctorOwner:', error);
    return false;
  }
}

export async function getDoctorProfilesByUserId(userId: string): Promise<SupabaseDoctor[]> {
  try {
    const { data: verifications, error: verificationError } = await supabase
      .from('doctor_verifications')
      .select('doctor_id')
      .eq('user_id', userId)
      .eq('verified', true);
    
    if (verificationError) {
      console.error('Error fetching verified doctors:', verificationError);
      return [];
    }
    
    if (!verifications || verifications.length === 0) {
      return [];
    }
    
    const doctorIds = verifications.map(v => v.doctor_id);
    const { data: doctors, error: doctorsError } = await supabase
      .from('doctors')
      .select('*')
      .in('id', doctorIds);
    
    if (doctorsError) {
      console.error('Error fetching doctor profiles:', doctorsError);
      return [];
    }
    
    return doctors as SupabaseDoctor[];
  } catch (error) {
    console.error('Error in getDoctorProfilesByUserId:', error);
    return [];
  }
}

export async function getDoctorRatings(doctorId: string): Promise<DoctorRating[]> {
  try {
    const { data, error } = await supabase
      .from('doctor_ratings')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching doctor ratings:', error);
      return [];
    }
    
    return data as DoctorRating[];
  } catch (error) {
    console.error('Error in getDoctorRatings:', error);
    return [];
  }
}

export async function getUserRating(doctorId: string, userId: string): Promise<DoctorRating | null> {
  try {
    const { data, error } = await supabase
      .from('doctor_ratings')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user rating:', error);
      return null;
    }
    
    return data as DoctorRating;
  } catch (error) {
    console.error('Error in getUserRating:', error);
    return null;
  }
}

export async function rateDoctor(doctorId: string, userId: string, rating: number, comment?: string): Promise<boolean> {
  try {
    const existingRating = await getUserRating(doctorId, userId);
    
    if (existingRating) {
      const { error } = await supabase
        .from('doctor_ratings')
        .update({ rating, comment })
        .eq('id', existingRating.id);
      
      if (error) {
        console.error('Error updating rating:', error);
        toast.error('Failed to update rating');
        return false;
      }
    } else {
      const { error } = await supabase
        .from('doctor_ratings')
        .insert([{ doctor_id: doctorId, user_id: userId, rating, comment }]);
      
      if (error) {
        console.error('Error creating rating:', error);
        toast.error('Failed to submit rating');
        return false;
      }
    }
    
    const ratings = await getDoctorRatings(doctorId);
    if (ratings && ratings.length > 0) {
      const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
      const avgRating = +(sum / ratings.length).toFixed(1); // Round to 1 decimal place
      
      await supabase
        .from('doctors')
        .update({ rating: avgRating })
        .eq('id', doctorId);
    }
    
    toast.success('Rating submitted successfully');
    return true;
  } catch (error) {
    console.error('Error in rateDoctor:', error);
    toast.error('Failed to submit rating');
    return false;
  }
}

export async function respondToRating(ratingId: string, response: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('doctor_ratings')
      .update({ doctor_response: response })
      .eq('id', ratingId);
    
    if (error) {
      console.error('Error responding to rating:', error);
      toast.error('Failed to submit response');
      return false;
    }
    
    toast.success('Response submitted successfully');
    return true;
  } catch (error) {
    console.error('Error in respondToRating:', error);
    toast.error('Failed to submit response');
    return false;
  }
}

export async function uploadDoctorImage(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('doctor_images')
      .upload(filePath, file);
    
    if (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }
    
    const { data: urlData } = supabase.storage
      .from('doctor_images')
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadDoctorImage:', error);
    toast.error('Failed to upload image');
    return null;
  }
}

export async function createDoctor(doctorData: Omit<SupabaseDoctor, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      toast.error('You must be logged in to create a doctor profile');
      return null;
    }
    
    const userId = session.user.id;
    
    const { data: existingDoctors, error: checkError } = await supabase
      .from('doctors')
      .select('id')
      .eq('created_by_user_id', userId);
    
    if (checkError) {
      console.error('Error checking existing profiles:', checkError);
      toast.error('Failed to create doctor profile');
      return null;
    }
    
    if (existingDoctors && existingDoctors.length > 0) {
      toast.error('You have already created a doctor profile');
      return null;
    }
    
    const contact = {...doctorData.contact};
    if (contact.address && contact.city && contact.wilaya) {
      contact.address = `${contact.address}_${contact.city}_${contact.wilaya}`;
    }
    
    const { data, error } = await supabase
      .from('doctors')
      .insert([{...doctorData, contact, created_by_user_id: userId}])
      .select();
    
    if (error) {
      console.error('Error creating doctor:', error);
      toast.error('Failed to create doctor profile');
      return null;
    }
    
    toast.success('Doctor profile created successfully');
    return data[0].id;
  } catch (error) {
    console.error('Error in createDoctor:', error);
    toast.error('Failed to create doctor profile');
    return null;
  }
}

export async function updateDoctor(id: string, doctorData: Partial<SupabaseDoctor>): Promise<boolean> {
  try {
    if (doctorData.contact) {
      const contact = {...doctorData.contact};
      const contactObj = contact as Record<string, any>;
      
      if (contactObj.address && contactObj.city && contactObj.wilaya && 
          typeof contactObj.address === 'string' && !contactObj.address.includes('_')) {
        contactObj.address = `${contactObj.address}_${contactObj.city}_${contactObj.wilaya}`;
        doctorData.contact = contact;
      }
    }
    
    const { error } = await supabase
      .from('doctors')
      .update(doctorData)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating doctor:', error);
      toast.error('Failed to update doctor profile');
      return false;
    }
    
    toast.success('Doctor profile updated successfully');
    return true;
  } catch (error) {
    console.error('Error in updateDoctor:', error);
    toast.error('Failed to update doctor profile');
    return false;
  }
}

export async function getProfileById(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data as Profile;
  } catch (error) {
    console.error('Error in getProfileById:', error);
    return null;
  }
}

export async function isVerifiedDoctor(doctorId: string): Promise<boolean> {
  try {
    // First check if the doctor was claimed by any user
    const { data: verification, error: verificationError } = await supabase
      .from('doctor_verifications')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('verified', true)
      .maybeSingle();
    
    if (verificationError) {
      console.error('Error checking verification status:', verificationError);
      return false;
    }
    
    if (verification) return true;
    
    // If not claimed, check if it was created by a doctor user
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('created_by_user_id')
      .eq('id', doctorId)
      .maybeSingle();
      
    if (doctorError) {
      console.error('Error checking doctor creation status:', doctorError);
      return false;
    }
    
    if (!doctor?.created_by_user_id) return false;
    
    // Check if the creator is a doctor-type user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', doctor.created_by_user_id)
      .maybeSingle();
      
    if (profileError) {
      console.error('Error checking creator profile:', profileError);
      return false;
    }
    
    return profile?.user_type === 'doctor';
  } catch (error) {
    console.error('Error in isVerifiedDoctor:', error);
    return false;
  }
}
