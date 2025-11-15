// Base profile
export interface Profile {
  id: number;
  type: 'DENTIST' | 'STUDENT' | 'TECHNICIAN';
  createdAt: string;
  updatedAt?: string;
}

// Dentist profile
export interface DentistProfile extends Profile {
  type: 'DENTIST';
  clinicName?: string;
}

// Student profile
export interface StudentProfile extends Profile {
  type: 'STUDENT';
  universityName?: string;
  semester?: string;
}

// Technician profile
export interface TechnicianProfile extends Profile {
  type: 'TECHNICIAN';
  labName?: string;
  specialization?: string;
}

// Union type for all profiles
export type AnyProfile = DentistProfile | StudentProfile | TechnicianProfile;
