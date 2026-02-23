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
      bid_score_criteria: {
        Row: {
          company_id: string
          created_at: string
          criterion_name: string
          description: string | null
          id: string
          sort_order: number
          weight: number
        }
        Insert: {
          company_id: string
          created_at?: string
          criterion_name: string
          description?: string | null
          id?: string
          sort_order?: number
          weight?: number
        }
        Update: {
          company_id?: string
          created_at?: string
          criterion_name?: string
          description?: string | null
          id?: string
          sort_order?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "bid_score_criteria_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
      deadline_events: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          event_date: string
          event_type: Database["public"]["Enums"]["deadline_event_type"]
          id: string
          reminder_days_before: number[] | null
          reminders_sent: Json | null
          rfp_id: string | null
          title: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          event_date: string
          event_type?: Database["public"]["Enums"]["deadline_event_type"]
          id?: string
          reminder_days_before?: number[] | null
          reminders_sent?: Json | null
          rfp_id?: string | null
          title: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          event_date?: string
          event_type?: Database["public"]["Enums"]["deadline_event_type"]
          id?: string
          reminder_days_before?: number[] | null
          reminders_sent?: Json | null
          rfp_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "deadline_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deadline_events_rfp_id_fkey"
            columns: ["rfp_id"]
            isOneToOne: false
            referencedRelation: "rfps"
            referencedColumns: ["id"]
          },
        ]
      }
      discovered_rfps: {
        Row: {
          added_to_pipeline: boolean
          agency: string | null
          company_id: string
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          is_dismissed: boolean
          match_reason: string | null
          relevance_score: number | null
          rfp_id: string | null
          source_url: string | null
          title: string
          value_estimate: number | null
        }
        Insert: {
          added_to_pipeline?: boolean
          agency?: string | null
          company_id: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_dismissed?: boolean
          match_reason?: string | null
          relevance_score?: number | null
          rfp_id?: string | null
          source_url?: string | null
          title: string
          value_estimate?: number | null
        }
        Update: {
          added_to_pipeline?: boolean
          agency?: string | null
          company_id?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_dismissed?: boolean
          match_reason?: string | null
          relevance_score?: number | null
          rfp_id?: string | null
          source_url?: string | null
          title?: string
          value_estimate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "discovered_rfps_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovered_rfps_rfp_id_fkey"
            columns: ["rfp_id"]
            isOneToOne: false
            referencedRelation: "rfps"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_email_templates: {
        Row: {
          body: string
          company_id: string
          created_at: string
          id: string
          name: string
          subject: string
          template_type: string
        }
        Insert: {
          body: string
          company_id: string
          created_at?: string
          id?: string
          name: string
          subject: string
          template_type?: string
        }
        Update: {
          body?: string
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          subject?: string
          template_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_email_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
      rfi_requests: {
        Row: {
          company_id: string
          created_at: string
          id: string
          project_name: string
          questions: Json
          recipient_email: string | null
          recipient_name: string | null
          responded_at: string | null
          response_data: Json | null
          response_token: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["rfi_status"]
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          project_name: string
          questions?: Json
          recipient_email?: string | null
          recipient_name?: string | null
          responded_at?: string | null
          response_data?: Json | null
          response_token?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["rfi_status"]
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          project_name?: string
          questions?: Json
          recipient_email?: string | null
          recipient_name?: string | null
          responded_at?: string | null
          response_data?: Json | null
          response_token?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["rfi_status"]
        }
        Relationships: [
          {
            foreignKeyName: "rfi_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      rfi_templates: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_default: boolean
          name: string
          questions: Json
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          name: string
          questions?: Json
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          name?: string
          questions?: Json
        }
        Relationships: [
          {
            foreignKeyName: "rfi_templates_company_id_fkey"
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
      rfp_monitoring_rules: {
        Row: {
          agency_filter: string[] | null
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          keywords: string[] | null
          max_value: number | null
          min_value: number | null
          notify_email: string | null
        }
        Insert: {
          agency_filter?: string[] | null
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          keywords?: string[] | null
          max_value?: number | null
          min_value?: number | null
          notify_email?: string | null
        }
        Update: {
          agency_filter?: string[] | null
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          keywords?: string[] | null
          max_value?: number | null
          min_value?: number | null
          notify_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfp_monitoring_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      rfp_partner_outreach: {
        Row: {
          company_id: string
          id: string
          partner_email: string
          partner_name: string
          responded_at: string | null
          response_data: Json | null
          response_token: string | null
          rfp_id: string
          sent_at: string | null
          status: Database["public"]["Enums"]["partner_outreach_status"]
        }
        Insert: {
          company_id: string
          id?: string
          partner_email: string
          partner_name: string
          responded_at?: string | null
          response_data?: Json | null
          response_token?: string | null
          rfp_id: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["partner_outreach_status"]
        }
        Update: {
          company_id?: string
          id?: string
          partner_email?: string
          partner_name?: string
          responded_at?: string | null
          response_data?: Json | null
          response_token?: string | null
          rfp_id?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["partner_outreach_status"]
        }
        Relationships: [
          {
            foreignKeyName: "rfp_partner_outreach_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfp_partner_outreach_rfp_id_fkey"
            columns: ["rfp_id"]
            isOneToOne: false
            referencedRelation: "rfps"
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
      rfp_sources: {
        Row: {
          check_frequency: string
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          last_checked: string | null
          name: string
          source_type: string
          url: string
        }
        Insert: {
          check_frequency?: string
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_checked?: string | null
          name: string
          source_type?: string
          url: string
        }
        Update: {
          check_frequency?: string
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_checked?: string | null
          name?: string
          source_type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfp_sources_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
      deadline_event_type: "deadline" | "milestone" | "review" | "custom"
      draft_status: "draft" | "final"
      partner_outreach_status:
        | "pending"
        | "sent"
        | "viewed"
        | "responded"
        | "declined"
      rfi_status: "draft" | "sent" | "viewed" | "responded"
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
      deadline_event_type: ["deadline", "milestone", "review", "custom"],
      draft_status: ["draft", "final"],
      partner_outreach_status: [
        "pending",
        "sent",
        "viewed",
        "responded",
        "declined",
      ],
      rfi_status: ["draft", "sent", "viewed", "responded"],
      rfp_stage: ["draft", "review", "submitted", "won", "lost"],
    },
  },
} as const
