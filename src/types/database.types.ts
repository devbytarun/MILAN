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
      profiles: {
        Row: {
          id: string
          auth_user_id: string
          full_name: string | null
          role: Database['public']['Enums']['user_role']
          organization_name: string | null
          organization_type: string | null
          verification_status: Database['public']['Enums']['verification_status']
          phone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          auth_user_id: string
          full_name?: string | null
          role?: Database['public']['Enums']['user_role']
          organization_name?: string | null
          organization_type?: string | null
          verification_status?: Database['public']['Enums']['verification_status']
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string
          full_name?: string | null
          role?: Database['public']['Enums']['user_role']
          organization_name?: string | null
          organization_type?: string | null
          verification_status?: Database['public']['Enums']['verification_status']
          phone?: string | null
          created_at?: string
        }
        Relationships: []
      }
      cases: {
        Row: {
          id: string
          case_uid: string | null
          case_type: Database['public']['Enums']['case_type']
          status: Database['public']['Enums']['case_status']
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_uid?: string | null
          case_type: Database['public']['Enums']['case_type']
          status?: Database['public']['Enums']['case_status']
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_uid?: string | null
          case_type?: Database['public']['Enums']['case_type']
          status?: Database['public']['Enums']['case_status']
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      reports: {
        Row: {
          id: string
          case_id: string | null
          reporter_id: string | null
          source_type: Database['public']['Enums']['source_type'] | null
          comm_status: Database['public']['Enums']['communication_status'] | null
          report_notes: string | null
          found_location: string | null
          found_at: string | null
          referral_info: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_id?: string | null
          reporter_id?: string | null
          source_type?: Database['public']['Enums']['source_type'] | null
          comm_status?: Database['public']['Enums']['communication_status'] | null
          report_notes?: string | null
          found_location?: string | null
          found_at?: string | null
          referral_info?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_id?: string | null
          reporter_id?: string | null
          source_type?: Database['public']['Enums']['source_type'] | null
          comm_status?: Database['public']['Enums']['communication_status'] | null
          report_notes?: string | null
          found_location?: string | null
          found_at?: string | null
          referral_info?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      person_attributes: {
        Row: {
          id: string
          report_id: string | null
          full_name: string | null
          alternative_names: string | null
          age: number | null
          approximate_age: number | null
          gender: string | null
          date_of_birth: string | null
          blood_group: string | null
          height_cm: number | null
          weight_kg: number | null
          build: string | null
          hair_description: string | null
          hair_colour: string | null
          eye_colour: string | null
          skin_description: string | null
          birthmarks: string | null
          scars: string | null
          tattoos: string | null
          anatomical_features: string | null
          clothing: string | null
          footwear: string | null
          accessories: string | null
          belongings: string | null
          identifying_clue: string | null
          condition_status: string | null
        }
        Insert: {
          id?: string
          report_id?: string | null
          full_name?: string | null
          alternative_names?: string | null
          age?: number | null
          approximate_age?: number | null
          gender?: string | null
          date_of_birth?: string | null
          blood_group?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          build?: string | null
          hair_description?: string | null
          hair_colour?: string | null
          eye_colour?: string | null
          skin_description?: string | null
          birthmarks?: string | null
          scars?: string | null
          tattoos?: string | null
          anatomical_features?: string | null
          clothing?: string | null
          footwear?: string | null
          accessories?: string | null
          belongings?: string | null
          identifying_clue?: string | null
          condition_status?: string | null
        }
        Update: {
          id?: string
          report_id?: string | null
          full_name?: string | null
          alternative_names?: string | null
          age?: number | null
          approximate_age?: number | null
          gender?: string | null
          date_of_birth?: string | null
          blood_group?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          build?: string | null
          hair_description?: string | null
          hair_colour?: string | null
          eye_colour?: string | null
          skin_description?: string | null
          birthmarks?: string | null
          scars?: string | null
          tattoos?: string | null
          anatomical_features?: string | null
          clothing?: string | null
          footwear?: string | null
          accessories?: string | null
          belongings?: string | null
          identifying_clue?: string | null
          condition_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "person_attributes_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          }
        ]
      }
      media: {
        Row: {
          id: string
          report_id: string | null
          storage_path: string
          media_type: string | null
          visibility: string | null
          created_at: string
        }
        Insert: {
          id?: string
          report_id?: string | null
          storage_path: string
          media_type?: string | null
          visibility?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string | null
          storage_path?: string
          media_type?: string | null
          visibility?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          }
        ]
      }
      match_candidates: {
        Row: {
          id: string
          source_case_id: string | null
          candidate_case_id: string | null
          score: number | null
          confidence_tier: string | null
          matched_fields: Json | null
          missing_fields: Json | null
          conflicting_fields: Json | null
          explanation: string | null
          status: Database['public']['Enums']['match_status']
          created_at: string
        }
        Insert: {
          id?: string
          source_case_id?: string | null
          candidate_case_id?: string | null
          score?: number | null
          confidence_tier?: string | null
          matched_fields?: Json | null
          missing_fields?: Json | null
          conflicting_fields?: Json | null
          explanation?: string | null
          status?: Database['public']['Enums']['match_status']
          created_at?: string
        }
        Update: {
          id?: string
          source_case_id?: string | null
          candidate_case_id?: string | null
          score?: number | null
          confidence_tier?: string | null
          matched_fields?: Json | null
          missing_fields?: Json | null
          conflicting_fields?: Json | null
          explanation?: string | null
          status?: Database['public']['Enums']['match_status']
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_candidates_source_case_id_fkey"
            columns: ["source_case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_candidates_candidate_case_id_fkey"
            columns: ["candidate_case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          }
        ]
      }
      verification_actions: {
        Row: {
          id: string
          match_candidate_id: string | null
          reviewer_id: string | null
          action: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          match_candidate_id?: string | null
          reviewer_id?: string | null
          action: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          match_candidate_id?: string | null
          reviewer_id?: string | null
          action?: string
          reason?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_actions_match_candidate_id_fkey"
            columns: ["match_candidate_id"]
            isOneToOne: false
            referencedRelation: "match_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_actions_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      status_history: {
        Row: {
          id: string
          case_id: string | null
          old_status: string | null
          new_status: string | null
          changed_by: string | null
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          case_id?: string | null
          old_status?: string | null
          new_status?: string | null
          changed_by?: string | null
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          case_id?: string | null
          old_status?: string | null
          new_status?: string | null
          changed_by?: string | null
          reason?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_history_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: Database['public']['Enums']['user_role']
      }
      get_my_profile_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      approve_user: {
        Args: {
          p_user_id: string
          p_action?: Database['public']['Enums']['verification_status']
        }
        Returns: Json
      }
      get_pending_reviews: {
        Args: Record<PropertyKey, never>
        Returns: {
          match_id: string
          source_case_id: string
          source_case_uid: string
          candidate_case_id: string
          candidate_case_uid: string
          score: number
          confidence_tier: string
          explanation: string
          status: Database['public']['Enums']['match_status']
          created_at: string
        }[]
      }
      get_case_status: {
        Args: {
          p_case_id: string
        }
        Returns: Json
      }
      verify_match: {
        Args: {
          p_match_id: string
          p_action: string
          p_reason?: string
        }
        Returns: Json
      }
      save_match_results: {
        Args: {
          p_source_case_id: string
          p_results: Json
        }
        Returns: undefined
      }
      get_match_candidates: {
        Args: {
          p_source_case_id: string
          p_target_type: Database['public']['Enums']['case_type']
          p_gender_filter?: string
          p_age_estimate?: number
          p_limit_count?: number
        }
        Returns: {
          report_id: string
          case_id: string
          case_uid: string | null
          case_type: Database['public']['Enums']['case_type']
          found_location: string | null
          full_name: string | null
          alternative_names: string | null
          age: number | null
          approximate_age: number | null
          gender: string | null
          blood_group: string | null
          height_cm: number | null
          weight_kg: number | null
          build: string | null
          hair_description: string | null
          hair_colour: string | null
          eye_colour: string | null
          skin_description: string | null
          birthmarks: string | null
          scars: string | null
          tattoos: string | null
          anatomical_features: string | null
          clothing: string | null
          footwear: string | null
          accessories: string | null
          belongings: string | null
          identifying_clue: string | null
          condition_status: string | null
        }[]
      }
      create_case_with_report: {
        Args: {
          p_case_type: Database['public']['Enums']['case_type']
          p_source_type: Database['public']['Enums']['source_type']
          p_comm_status?: Database['public']['Enums']['communication_status']
          p_report_notes?: string
          p_found_location?: string
          p_found_at?: string
          p_referral_info?: string
          p_full_name?: string
          p_alternative_names?: string
          p_age?: number
          p_approximate_age?: number
          p_gender?: string
          p_date_of_birth?: string
          p_blood_group?: string
          p_height_cm?: number
          p_weight_kg?: number
          p_build?: string
          p_hair_description?: string
          p_hair_colour?: string
          p_eye_colour?: string
          p_skin_description?: string
          p_birthmarks?: string
          p_scars?: string
          p_tattoos?: string
          p_anatomical_features?: string
          p_clothing?: string
          p_footwear?: string
          p_accessories?: string
          p_belongings?: string
          p_identifying_clue?: string
          p_condition_status?: string
        }
        Returns: Json
      }
      link_report_to_case: {
        Args: {
          p_case_uid: string
          p_source_type: Database['public']['Enums']['source_type']
          p_comm_status?: Database['public']['Enums']['communication_status']
          p_report_notes?: string
          p_found_location?: string
          p_found_at?: string
          p_referral_info?: string
          p_full_name?: string
          p_alternative_names?: string
          p_age?: number
          p_approximate_age?: number
          p_gender?: string
          p_blood_group?: string
          p_height_cm?: number
          p_weight_kg?: number
          p_build?: string
          p_hair_description?: string
          p_hair_colour?: string
          p_eye_colour?: string
          p_skin_description?: string
          p_birthmarks?: string
          p_scars?: string
          p_tattoos?: string
          p_anatomical_features?: string
          p_clothing?: string
          p_footwear?: string
          p_accessories?: string
          p_belongings?: string
          p_identifying_clue?: string
          p_condition_status?: string
        }
        Returns: Json
      }
    }
    Enums: {
      user_role: 'FAMILY' | 'NGO' | 'ARMY_RESCUE' | 'HOSPITAL' | 'VOLUNTEER' | 'REVIEWER' | 'ADMIN'
      verification_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
      case_type: 'MISSING' | 'FOUND'
      case_status:
        | 'SUBMITTED'
        | 'SEARCHING'
        | 'NO_CANDIDATE'
        | 'POSSIBLE_MATCH'
        | 'UNDER_REVIEW'
        | 'VERIFIED_MATCH'
        | 'MATCH_REJECTED'
        | 'MORE_INFO_NEEDED'
        | 'CLOSED'
        | 'ARCHIVED'
      source_type: 'FAMILY' | 'NGO' | 'ARMY_RESCUE' | 'HOSPITAL' | 'VOLUNTEER' | 'ADMIN'
      communication_status: 'CAN_COMMUNICATE' | 'CANNOT_COMMUNICATE' | 'UNKNOWN'
      match_status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'MORE_INFO_NEEDED'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
