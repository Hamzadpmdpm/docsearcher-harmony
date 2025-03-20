
import { supabase } from '@/integrations/supabase/client';
import { SupabaseDoctor } from '@/types/supabase';
import { toast } from 'sonner';
import { getDoctorRatings } from './ratings';

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
    
    // Update each doctor with the most current rating from the ratings table
    const updatedDoctors = await Promise.all(data.map(async (doctor) => {
      const ratings = await getDoctorRatings(doctor.id);
      if (ratings && ratings.length > 0) {
        const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
        const avgRating = +(sum / ratings.length).toFixed(1);
        return {...doctor, rating: avgRating};
      }
      return doctor;
    }));
    
    return updatedDoctors as SupabaseDoctor[];
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
    
    // Always update doctor with current rating from ratings
    const ratings = await getDoctorRatings(id);
    if (ratings && ratings.length > 0) {
      const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
      const avgRating = +(sum / ratings.length).toFixed(1); // Round to 1 decimal place
      data.rating = avgRating;
      
      // Update rating in database for consistency
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
