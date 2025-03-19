
import { supabase } from '@/integrations/supabase/client';
import { DoctorRating } from '@/types/supabase';
import { toast } from 'sonner';

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
