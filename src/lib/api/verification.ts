
import { supabase } from '@/integrations/supabase/client';
import { DoctorVerification } from '@/types/supabase';
import { toast } from 'sonner';
import { getProfileById } from './profiles';

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
