export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            employees: {
                Row: {
                    id: string
                    user_id: string | null
                    employee_code: string
                    first_name: string
                    last_name: string
                    email: string
                    phone: string | null
                    position: string
                    salary: number
                    employment_date: string
                    status: 'active' | 'inactive'
                    profile_photo_url: string | null
                    created_at: string
                    updated_at: string
                    identity_no: string | null
                    father_name: string | null
                    mother_name: string | null
                    date_of_birth: string | null
                    address: string | null
                    emergency_contact: string | null
                    ending_date: string | null
                    supervisor: string | null
                    office: string | null
                    office_id: string | null
                    supervisor_id: string | null
                    annual_score: number
                    sick_score: number
                    competence_score: number
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    employee_code: string
                    first_name: string
                    last_name: string
                    email: string
                    phone?: string | null
                    position: string
                    salary: number
                    employment_date: string
                    status?: 'active' | 'inactive'
                    profile_photo_url?: string | null
                    created_at?: string
                    updated_at?: string
                    identity_no?: string | null
                    father_name?: string | null
                    mother_name?: string | null
                    date_of_birth?: string | null
                    address?: string | null
                    emergency_contact?: string | null
                    ending_date?: string | null
                    supervisor?: string | null
                    office?: string | null
                    office_id?: string | null
                    supervisor_id?: string | null
                    annual_score?: number
                    sick_score?: number
                    competence_score?: number
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    employee_code?: string
                    first_name?: string
                    last_name?: string
                    email?: string
                    phone?: string | null
                    position?: string
                    salary?: number
                    employment_date?: string
                    status?: 'active' | 'inactive'
                    profile_photo_url?: string | null
                    created_at?: string
                    updated_at?: string
                    identity_no?: string | null
                    father_name?: string | null
                    mother_name?: string | null
                    date_of_birth?: string | null
                    address?: string | null
                    emergency_contact?: string | null
                    ending_date?: string | null
                    supervisor?: string | null
                    office?: string | null
                    office_id?: string | null
                    supervisor_id?: string | null
                    annual_score?: number
                    sick_score?: number
                    competence_score?: number
                }
            }
            offices: {
                Row: {
                    id: string
                    name: string
                    address: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    address?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    address?: string | null
                    created_at?: string
                }
            }
        }
    }
}

export type Employee = Database['public']['Tables']['employees']['Row'];

export type UserRole = 'admin' | 'hr_manager' | 'employee';

export interface User {
    id: string;
    email: string;
    full_name: string | null;
    first_name?: string | null;
    last_name?: string | null;
    role: UserRole;
    created_at: string;
}

