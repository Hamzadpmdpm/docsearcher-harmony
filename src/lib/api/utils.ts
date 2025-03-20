
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function getSpecialties(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('specialties')
      .select('specialty')
      .order('specialty');
    
    if (error) {
      console.error('Error fetching specialties:', error);
      toast.error('Failed to load specialties');
      return [];
    }
    
    // Extract specialty strings from the array of objects
    const specialtiesList = data.map(item => item.specialty).filter(Boolean) as string[];
    return specialtiesList;
  } catch (error) {
    console.error('Error in getSpecialties:', error);
    toast.error('Failed to load specialties');
    return [];
  }
}

export async function uploadDoctorImage(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `doctors/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      toast.error('Failed to upload image');
      return null;
    }
    
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadDoctorImage:', error);
    toast.error('Failed to upload image');
    return null;
  }
}
