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
      posts: {
        Row: {
          author_id: string | null
          content: string
          cover_image: string | null
          created_at: string | null
          id: string
          published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          cover_image?: string | null
          created_at?: string | null
          id?: string
          published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string | null
          id?: string
          published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          admin: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          admin?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          admin?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_user_if_not_exists: {
        Args: {
          user_id: string
          user_email: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
