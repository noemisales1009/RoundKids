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
      patients: {
        Row: {
          id: string
          name: string
          bed_number: number
          mother_name: string | null
          dob: string
          created_at: string | null
          updated_at: string | null
          nomepaciente_norm: string | null
          diagnosis: string | null
          status: string | null
          comorbidade: string | null
          dt_internacao: string | null
          peso: number | null
          destino: string | null
          suporte_ventilatorio: string[] | null
        }
        Insert: {
          id?: string
          name: string
          bed_number: number
          mother_name?: string | null
          dob: string
          created_at?: string | null
          updated_at?: string | null
          diagnosis?: string | null
          status?: string | null
          comorbidade?: string | null
          dt_internacao?: string | null
          peso?: number | null
          destino?: string | null
          suporte_ventilatorio?: string[] | null
        }
        Update: {
          id?: string
          name?: string
          bed_number?: number
          mother_name?: string | null
          dob?: string
          created_at?: string | null
          updated_at?: string | null
          diagnosis?: string | null
          status?: string | null
          comorbidade?: string | null
          dt_internacao?: string | null
          peso?: number | null
          destino?: string | null
          suporte_ventilatorio?: string[] | null
        }
      }
      users: {
        Row: {
          id: string
          name: string | null
          email: string | null
          sector: string | null
          role: string | null
          created_at: string | null
          updated_at: string | null
          foto: string | null
          access_level: string | null
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          sector?: string | null
          role?: string | null
          created_at?: string | null
          updated_at?: string | null
          foto?: string | null
          access_level?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          sector?: string | null
          role?: string | null
          created_at?: string | null
          updated_at?: string | null
          foto?: string | null
          access_level?: string | null
        }
      }
      npt_calculations: {
        Row: {
          id: string
          patient_id: string
          user_id: string
          weight: number
          date_of_birth: string
          amino_acid_dose: number
          lipid_dose: number
          calorie_nitrogen_ratio: number
          hydration_target: number
          protein_concentration: number
          lipid_concentration: number
          glucose_source_1: number
          glucose_source_2: number
          sodium_dose: number
          potassium_dose: number
          calcium_dose: number
          magnesium_dose: number
          phosphorus_dose: number
          phosphorus_source: 'sodium' | 'potassium'
          npt_stages: 1 | 2 | 4
          total_volume: number | null
          total_calories: number | null
          glucose_concentration_final: number | null
          osmolarity: number | null
          calcium_concentration_meq_per_liter: number | null
          magnesium_concentration_meq_per_liter: number | null
          divalent_trivalent_cations_concentration: number | null
          peripheral_route_warning: boolean | null
          notes: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          user_id: string
          weight: number
          date_of_birth: string
          amino_acid_dose: number
          lipid_dose: number
          calorie_nitrogen_ratio: number
          hydration_target: number
          protein_concentration: number
          lipid_concentration: number
          glucose_source_1: number
          glucose_source_2: number
          sodium_dose: number
          potassium_dose: number
          calcium_dose: number
          magnesium_dose: number
          phosphorus_dose: number
          phosphorus_source: 'sodium' | 'potassium'
          npt_stages: 1 | 2 | 4
          total_volume?: number | null
          total_calories?: number | null
          glucose_concentration_final?: number | null
          osmolarity?: number | null
          calcium_concentration_meq_per_liter?: number | null
          magnesium_concentration_meq_per_liter?: number | null
          divalent_trivalent_cations_concentration?: number | null
          peripheral_route_warning?: boolean | null
          notes?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          user_id?: string
          weight?: number
          date_of_birth?: string
          amino_acid_dose?: number
          lipid_dose?: number
          calorie_nitrogen_ratio?: number
          hydration_target?: number
          protein_concentration?: number
          lipid_concentration?: number
          glucose_source_1?: number
          glucose_source_2?: number
          sodium_dose?: number
          potassium_dose?: number
          calcium_dose?: number
          magnesium_dose?: number
          phosphorus_dose?: number
          phosphorus_source?: 'sodium' | 'potassium'
          npt_stages?: 1 | 2 | 4
          total_volume?: number | null
          total_calories?: number | null
          glucose_concentration_final?: number | null
          osmolarity?: number | null
          calcium_concentration_meq_per_liter?: number | null
          magnesium_concentration_meq_per_liter?: number | null
          divalent_trivalent_cations_concentration?: number | null
          peripheral_route_warning?: boolean | null
          notes?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      npt_calculations_with_patient: {
        Row: {
          id: string
          patient_id: string
          patient_name: string
          bed_number: number
          patient_status: string | null
          created_by_name: string | null
          weight: number
          date_of_birth: string
          total_calories: number | null
          osmolarity: number | null
          status: string | null
          created_at: string | null
        }
      }
    }
  }
}
