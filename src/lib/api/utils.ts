
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
