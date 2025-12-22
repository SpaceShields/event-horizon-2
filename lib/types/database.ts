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
          email: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      event_categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          organization_name: string | null
          owner_id: string
          category_id: number
          location_type: 'physical' | 'virtual' | 'hybrid'
          address: string | null
          meeting_url: string | null
          start_datetime: string
          end_datetime: string
          timezone: string
          capacity: number | null
          ticket_price: number | null
          registration_instructions: string | null
          status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug?: string
          description: string
          organization_name?: string | null
          owner_id: string
          category_id: number
          location_type: 'physical' | 'virtual' | 'hybrid'
          address?: string | null
          meeting_url?: string | null
          start_datetime: string
          end_datetime: string
          timezone?: string
          capacity?: number | null
          ticket_price?: number | null
          registration_instructions?: string | null
          status?: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string
          organization_name?: string | null
          owner_id?: string
          category_id?: number
          location_type?: 'physical' | 'virtual' | 'hybrid'
          address?: string | null
          meeting_url?: string | null
          start_datetime?: string
          end_datetime?: string
          timezone?: string
          capacity?: number | null
          ticket_price?: number | null
          registration_instructions?: string | null
          status?: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      event_registrations: {
        Row: {
          id: string
          event_id: string
          user_id: string
          guest_count: number
          special_notes: string | null
          registration_date: string
          attendance_status: 'registered' | 'attended' | 'cancelled' | 'no_show'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          guest_count?: number
          special_notes?: string | null
          registration_date?: string
          attendance_status?: 'registered' | 'attended' | 'cancelled' | 'no_show'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          guest_count?: number
          special_notes?: string | null
          registration_date?: string
          attendance_status?: 'registered' | 'attended' | 'cancelled' | 'no_show'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      events_with_stats: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          organization_name: string | null
          owner_id: string
          category_id: number
          location_type: 'physical' | 'virtual' | 'hybrid'
          address: string | null
          meeting_url: string | null
          start_datetime: string
          end_datetime: string
          timezone: string
          capacity: number | null
          ticket_price: number | null
          registration_instructions: string | null
          status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
          image_url: string | null
          created_at: string
          updated_at: string
          registration_count: number
          total_attendees: number
          is_full: boolean
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
