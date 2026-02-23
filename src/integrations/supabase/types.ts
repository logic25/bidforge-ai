export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agencies: {
        Row: {
          agency_type: string
          created_at: string
          id: string
          industry_tags: string[] | null
          name: string
          procurement_url: string | null
          state: string
          website: string | null
        }
        Insert: {
          agency_type?: string
          created_at?: string
          id?: string
          industry_tags?: string[] | null
          name: string
          procurement_url?: string | null
          state: string
          website?: string | null
        }
        Update: {
          agency_type?: string
          created_at?: string
          id?: string
          industry_tags?: string[] | null
          name?: string
          procurement_url?: string | null
          state?: string
          website?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          id: string
          industries: string[] | null
          keywords: string[] | null
          name: string
          onboarding_completed: boolean
          settings: Json | null
          states: string[] | null
          stripe_customer_id: string | null
          subscription_tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          industries?: string[] | null
          keywords?: string[] | null
          name?: string
          onboarding_completed?: boolean
          settings?: Json | null
          states?: string[] | null
          stripe_customer_id?: string | null
          subscription_tier?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          industries?: string[] | null
          keywords?: string[] | null
          name?: string
          onboarding_completed?: boolean
          settings?: Json | null
          states?: string[] | null
          stripe_customer_id?: string | null
          subscription_tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      rfp_content: {
        Row: {
          category: Database["public"]["Enums"]["content_category"]
          company_id: string
          content: string | null
          created_at: string
          id: string
          tags: string[] | null
          title: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          category?: Database["public"]["Enums"]["content_category"]
          company_id: string
          content?: string | null
          created_at?: string
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["content_category"]
          company_id?: string
          content?: string | null
          created_at?: string
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "rfp_content_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      rfp_response_drafts: {
        Row: {
          content: Json | null
          created_at: string
          id: string
          rfp_id: string
          status: Database["public"]["Enums"]["draft_status"]
          version: number
        }
        Insert: {
          content?: Json | null
          created_at?: string
          id?: string
          rfp_id: string
          status?: Database["public"]["Enums"]["draft_status"]
          version?: number
        }
        Update: {
          content?: Json | null
          created_at?: string
          id?: string
          rfp_id?: string
          status?: Database["public"]["Enums"]["draft_status"]
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "rfp_response_drafts_rfp_id_fkey"
            columns: ["rfp_id"]
            isOneToOne: false
            referencedRelation: "rfps"
            referencedColumns: ["id"]
          },
        ]
      }
      rfp_sections: {
        Row: {
          ai_suggested_response: string | null
          content: string | null
          created_at: string
          id: string
          rfp_id: string
          section_order: number
          title: string
        }
        Insert: {
          ai_suggested_response?: string | null
          content?: string | null
          created_at?: string
          id?: string
          rfp_id: string
          section_order?: number
          title: string
        }
        Update: {
          ai_suggested_response?: string | null
          content?: string | null
          created_at?: string
          id?: string
          rfp_id?: string
          section_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfp_sections_rfp_id_fkey"
            columns: ["rfp_id"]
            isOneToOne: false
            referencedRelation: "rfps"
            referencedColumns: ["id"]
          },
        ]
      }
      rfps: {
        Row: {
          agency: string | null
          bid_amount: number | null
          bid_decision: string | null
          bid_no_bid_score: number | null
          company_id: string
          contact_email: string | null
          contact_name: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          notes: string | null
          source_url: string | null
          stage: Database["public"]["Enums"]["rfp_stage"]
          title: string
          updated_at: string
          win_loss_reason: string | null
        }
        Insert: {
          agency?: string | null
          bid_amount?: number | null
          bid_decision?: string | null
          bid_no_bid_score?: number | null
          company_id: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          source_url?: string | null
          stage?: Database["public"]["Enums"]["rfp_stage"]
          title: string
          updated_at?: string
          win_loss_reason?: string | null
        }
        Update: {
          agency?: string | null
          bid_amount?: number | null
          bid_decision?: string | null
          bid_no_bid_score?: number | null
          company_id?: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          source_url?: string | null
          stage?: Database["public"]["Enums"]["rfp_stage"]
          title?: string
          updated_at?: string
          win_loss_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfps_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_company_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "member"
      content_category:
        | "boilerplate"
        | "case_study"
        | "team_bio"
        | "certification"
        | "past_performance"
        | "compliance"
      draft_status: "draft" | "final"
      rfp_stage: "draft" | "review" | "submitted" | "won" | "lost"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "member"],
      content_category: [
        "boilerplate",
        "case_study",
        "team_bio",
        "certification",
        "past_performance",
        "compliance",
      ],
      draft_status: ["draft", "final"],
      rfp_stage: ["draft", "review", "submitted", "won", "lost"],
    },
  },
} as const
