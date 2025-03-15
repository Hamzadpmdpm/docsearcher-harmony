
export interface SupabaseDoctor {
  id: string;
  name: string;
  specialty: string;
  subspecialties: string[] | null;
  hospital: string;
  rating: number;
  experience: number;
  education: string[];
  bio: string;
  languages: string[];
  accepting_new_patients: boolean;
  image: string;
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  created_at: string;
  updated_at: string;
}
