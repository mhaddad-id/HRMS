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
          identity_no: string | null
          phone: string | null
          father_name: string | null
          mother_name: string | null
          date_of_birth: string | null
          address: string | null
          emergency_contact: string | null
          position: string
          office: string | null
          office_id: string | null
          supervisor_id: string | null
          salary: number
          employment_date: string
          ending_date: string | null
          supervisor: string | null
          annual_score: number
          sick_score: number
          competence_score: number
          status: 'active' | 'inactive'
          gender: 'male' | 'female' | null
          currency: 'USD' | 'EUR' | 'TRY'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          employee_code?: string
          first_name: string
          last_name: string
          email: string
          identity_no?: string | null
          phone?: string | null
          father_name?: string | null
          mother_name?: string | null
          date_of_birth?: string | null
          address?: string | null
          emergency_contact?: string | null
          position: string
          office?: string | null
          office_id?: string | null
          supervisor_id?: string | null
          salary?: number
          employment_date?: string
          ending_date?: string | null
          supervisor?: string | null
          annual_score?: number
          sick_score?: number
          competence_score?: number
          status?: 'active' | 'inactive'
          gender?: 'male' | 'female' | null
          currency?: 'USD' | 'EUR' | 'TRY'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          employee_code?: string
          first_name?: string
          last_name?: string
          email?: string
          identity_no?: string | null
          phone?: string | null
          father_name?: string | null
          mother_name?: string | null
          date_of_birth?: string | null
          address?: string | null
          emergency_contact?: string | null
          position?: string
          office?: string | null
          office_id?: string | null
          supervisor_id?: string | null
          salary?: number
          employment_date?: string
          ending_date?: string | null
          supervisor?: string | null
          annual_score?: number
          sick_score?: number
          competence_score?: number
          status?: 'active' | 'inactive'
          gender?: 'male' | 'female' | null
          currency?: 'USD' | 'EUR' | 'TRY'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_office_id_fkey"
            columns: ["office_id"]
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_supervisor_id_fkey"
            columns: ["supervisor_id"]
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          role: UserRole
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: UserRole
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: UserRole
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      offices: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      leaves: {
        Row: {
          id: string
          employee_id: string
          leave_type: string
          start_date: string
          end_date: string
          reason: string | null
          status: string
          manager_status: string
          hr_status: string
          manager_id: string | null
          hr_id: string | null
          manager_at: string | null
          hr_at: string | null
          review_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          leave_type: string
          start_date: string
          end_date: string
          reason?: string | null
          status?: string
          manager_status?: string
          hr_status?: string
          manager_id?: string | null
          hr_id?: string | null
          manager_at?: string | null
          hr_at?: string | null
          review_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          leave_type?: string
          start_date?: string
          end_date?: string
          reason?: string | null
          status?: string
          manager_status?: string
          hr_status?: string
          manager_id?: string | null
          hr_id?: string | null
          manager_at?: string | null
          hr_at?: string | null
          review_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaves_employee_id_fkey"
            columns: ["employee_id"]
            referencedRelation: "employees"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type UserRole = 'admin' | 'hr_manager' | 'employee'
export type Employee = Database['public']['Tables']['employees']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Office = Database['public']['Tables']['offices']['Row']
export type Leave = Database['public']['Tables']['leaves']['Row']
