
import { supabase } from '@/integrations/supabase/client';
import { SupabaseDoctor } from '@/types/supabase';
import { toast } from 'sonner';

export async function getDoctors(options: {
  specialty?: string | null;
  searchQuery?: string;
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
