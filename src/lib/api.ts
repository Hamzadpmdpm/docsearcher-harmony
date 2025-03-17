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
      .eq('doctor_id', doctorId);
    
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
    
    toast.success('Rating submitted successfully');
    return true;
  } catch (error) {
    console.error('Error in rateDoctor:', error);
    toast.error('Failed to submit rating');
    return false;
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
    
    const { data, error } = await supabase
      .from('doctors')
      .insert([{...doctorData, created_by_user_id: userId}])
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
      .single();
    
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
    const { data, error } = await supabase
      .from('doctor_verifications')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('verified', true)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking verification status:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in isVerifiedDoctor:', error);
    return false;
  }
}
