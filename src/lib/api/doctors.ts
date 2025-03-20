import { supabase } from '@/integrations/supabase/client';
import { SupabaseDoctor, Profile } from '@/types/supabase';
import { toast } from 'sonner';
import { getDoctorRatings } from './ratings';

export async function createDoctor(doctorData: Omit<SupabaseDoctor, 'id' | 'created_at' | 'updated_at'>, userId?: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .insert([{
        ...doctorData,
        ...(userId && { created_by_user_id: userId }),
      }])
      .select();
    
    if (error) {
      console.error('Error creating doctor:', error);
      toast.error('Failed to create doctor profile');
      return null;
    }
    
    if (data && data[0] && data[0].id) {
      toast.success('Doctor profile created successfully');
      return data[0].id;
    }
    
    return null;
  } catch (error) {
    console.error('Error in createDoctor:', error);
    toast.error('Failed to create doctor profile');
    return null;
  }
}

export async function getDoctors(): Promise<SupabaseDoctor[]> {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .order('name');
    
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

export async function getDoctorsBySpecialty(specialty: string): Promise<SupabaseDoctor[]> {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('specialty', specialty)
      .order('name');
    
    if (error) {
      console.error('Error fetching doctors by specialty:', error);
      toast.error('Failed to load doctors');
      return [];
    }
    
    return data as SupabaseDoctor[];
  } catch (error) {
    console.error('Error in getDoctorsBySpecialty:', error);
    toast.error('Failed to load doctors');
    return [];
  }
}

export async function getDoctorById(id: string): Promise<SupabaseDoctor | null> {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching doctor:', error);
      toast.error('Failed to load doctor profile');
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    // Ensure doctor's contact is parsed
    if (typeof data.contact === 'string') {
      try {
        data.contact = JSON.parse(data.contact);
      } catch (e) {
        console.error('Error parsing doctor contact data:', e);
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
    toast.error('Failed to load doctor profile');
    return null;
  }
}
