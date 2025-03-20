
import { supabase } from '@/integrations/supabase/client';
import { Profile, SupabaseDoctor } from '@/types/supabase';
import { toast } from 'sonner';

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

export async function getDoctorProfilesByUserId(userId: string): Promise<SupabaseDoctor[]> {
  try {
    // First, get the doctor verifications for this user
    const { data: verifications, error: verificationError } = await supabase
      .from('doctor_verifications')
      .select('doctor_id')
      .eq('user_id', userId)
      .eq('verified', true);
    
    if (verificationError) {
      console.error('Error fetching doctor verifications:', verificationError);
      return [];
    }
    
    if (!verifications || verifications.length === 0) {
      return [];
    }
    
    // Extract the doctor IDs from the verifications
    const doctorIds = verifications.map(v => v.doctor_id);
    
    // Get the doctor profiles for these IDs
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
