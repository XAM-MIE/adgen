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
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          title: string
          type: 'marketing' | 'brand'
          status: 'draft' | 'completed' | 'archived'
          data: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          title: string
          type: 'marketing' | 'brand'
          status?: 'draft' | 'completed' | 'archived'
          data: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          title?: string
          type?: 'marketing' | 'brand'
          status?: 'draft' | 'completed' | 'archived'
          data?: Json
        }
      }
      marketing_campaigns: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          project_id: string
          campaign_type: string
          target_audience: string
          tone: string
          prompt: string
          generated_content: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          project_id: string
          campaign_type: string
          target_audience: string
          tone: string
          prompt: string
          generated_content: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          project_id?: string
          campaign_type?: string
          target_audience?: string
          tone?: string
          prompt?: string
          generated_content?: Json
        }
      }
      brand_kits: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          project_id: string
          industry: string
          style: string
          values: string
          prompt: string
          brand_data: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          project_id: string
          industry: string
          style: string
          values: string
          prompt: string
          brand_data: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          project_id?: string
          industry?: string
          style?: string
          values?: string
          prompt?: string
          brand_data?: Json
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      project_type: 'marketing' | 'brand'
      project_status: 'draft' | 'completed' | 'archived'
    }
  }
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types
export type Profile = Tables<'profiles'>
export type Project = Tables<'projects'>
export type MarketingCampaign = Tables<'marketing_campaigns'>
export type BrandKit = Tables<'brand_kits'>

// Project data interfaces
export interface ProjectMarketingData {
  type: string
  target: string
  tone: string
  prompt: string
  content: Array<{
    id: number
    type: string
    content: string
    platform: string
  }>
}

export interface ProjectBrandData {
  industry: string
  style: string
  values: string
  prompt: string
  brandKit: {
    name: string
    colors: {
      primary: string
      secondary: string
      accent: string
      text: string
    }
    typography: {
      heading: string
      body: string
      description: string
    }
    taglines: string[]
  }
}
