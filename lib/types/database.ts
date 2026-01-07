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
      event_time_slots: {
        Row: {
          id: string
          event_id: string
          title: string
          description: string | null
          start_datetime: string
          end_datetime: string
          capacity: number | null
          price: number | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          title: string
          description?: string | null
          start_datetime: string
          end_datetime: string
          capacity?: number | null
          price?: number | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          title?: string
          description?: string | null
          start_datetime?: string
          end_datetime?: string
          capacity?: number | null
          price?: number | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      event_registrations: {
        Row: {
          id: string
          event_id: string
          user_id: string
          time_slot_id: string | null
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
          time_slot_id?: string | null
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
          time_slot_id?: string | null
          guest_count?: number
          special_notes?: string | null
          registration_date?: string
          attendance_status?: 'registered' | 'attended' | 'cancelled' | 'no_show'
          created_at?: string
          updated_at?: string
        }
      }
      event_administrators: {
        Row: {
          id: string
          event_id: string
          user_id: string
          added_by: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          added_by: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          added_by?: string
          role?: string
          created_at?: string
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
          has_time_slots: boolean
        }
      }
      time_slots_with_stats: {
        Row: {
          id: string
          event_id: string
          title: string
          description: string | null
          start_datetime: string
          end_datetime: string
          capacity: number | null
          price: number | null
          sort_order: number
          created_at: string
          updated_at: string
          registration_count: number
          total_attendees: number
          remaining_capacity: number | null
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

// Helper types for time slots
export type TimeSlot = Database['public']['Tables']['event_time_slots']['Row']
export type TimeSlotInsert = Database['public']['Tables']['event_time_slots']['Insert']
export type TimeSlotUpdate = Database['public']['Tables']['event_time_slots']['Update']
export type TimeSlotWithStats = Database['public']['Views']['time_slots_with_stats']['Row']

// Helper types for events
export type Event = Database['public']['Tables']['events']['Row']
export type EventWithStats = Database['public']['Views']['events_with_stats']['Row']

// Helper types for registrations
export type EventRegistration = Database['public']['Tables']['event_registrations']['Row']
export type EventRegistrationInsert = Database['public']['Tables']['event_registrations']['Insert']

// Helper types for event administrators
export type EventAdministrator = Database['public']['Tables']['event_administrators']['Row']
export type EventAdministratorInsert = Database['public']['Tables']['event_administrators']['Insert']

// Event administrator with profile data
export interface EventAdministratorWithProfile extends EventAdministrator {
  profiles: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

// Profile type
export type Profile = Database['public']['Tables']['profiles']['Row']
