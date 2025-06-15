export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      active_sessions: {
        Row: {
          id: number
          ip_address: string
          last_active: string
          login_at: string
          user_id: string
        }
        Insert: {
          id?: number
          ip_address: string
          last_active?: string
          login_at?: string
          user_id: string
        }
        Update: {
          id?: number
          ip_address?: string
          last_active?: string
          login_at?: string
          user_id?: string
        }
        Relationships: []
      }
      allowlisted_ips: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          ip_address_or_cidr: string
          is_active: boolean
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          ip_address_or_cidr: string
          is_active?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          ip_address_or_cidr?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "allowlisted_ips_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_categories: {
        Row: {
          color: string
          created_at: string
          id: string
          label: string
          updated_at: string
        }
        Insert: {
          color: string
          created_at?: string
          id: string
          label: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          author: string
          category: string | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          published: boolean
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          category?: string | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "article_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_ips: {
        Row: {
          attempts_count: number
          blocked_at: string
          blocked_until: string
          id: number
          ip_address: string
          reason: string | null
        }
        Insert: {
          attempts_count?: number
          blocked_at?: string
          blocked_until: string
          id?: number
          ip_address: string
          reason?: string | null
        }
        Update: {
          attempts_count?: number
          blocked_at?: string
          blocked_until?: string
          id?: number
          ip_address?: string
          reason?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          supplier_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          supplier_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          supplier_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_access_rules: {
        Row: {
          created_at: string | null
          feature_key: string
          id: string
          non_subscriber_access_level: Database["public"]["Enums"]["feature_access_level_enum"]
          non_subscriber_message_locked: string | null
          trial_access_level: Database["public"]["Enums"]["feature_access_level_enum"]
          trial_limit_value: number | null
          trial_message_locked: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          feature_key: string
          id?: string
          non_subscriber_access_level?: Database["public"]["Enums"]["feature_access_level_enum"]
          non_subscriber_message_locked?: string | null
          trial_access_level?: Database["public"]["Enums"]["feature_access_level_enum"]
          trial_limit_value?: number | null
          trial_message_locked?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          feature_key?: string
          id?: string
          non_subscriber_access_level?: Database["public"]["Enums"]["feature_access_level_enum"]
          non_subscriber_message_locked?: string | null
          trial_access_level?: Database["public"]["Enums"]["feature_access_level_enum"]
          trial_limit_value?: number | null
          trial_message_locked?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      free_trial_config: {
        Row: {
          allowed_supplier_ids: string[] | null
          last_rotation_at: string | null
          user_id: string
        }
        Insert: {
          allowed_supplier_ids?: string[] | null
          last_rotation_at?: string | null
          user_id: string
        }
        Update: {
          allowed_supplier_ids?: string[] | null
          last_rotation_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      login_logs: {
        Row: {
          attempted_at: string
          id: number
          ip_address: string
          success: boolean
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          attempted_at?: string
          id?: number
          ip_address: string
          success: boolean
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          attempted_at?: string
          id?: number
          ip_address?: string
          success?: boolean
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          target_roles: string[] | null
          target_subscription_types: string[] | null
          title: string
          views_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          target_roles?: string[] | null
          target_subscription_types?: string[] | null
          title: string
          views_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          target_roles?: string[] | null
          target_subscription_types?: string[] | null
          title?: string
          views_count?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          last_login: string | null
          phone: string | null
          role: string
          state: string | null
          subscription_start_date: string | null
          subscription_status: string | null
          subscription_type: string | null
          trial_end_date: string | null
          trial_start_date: string | null
          trial_status: Database["public"]["Enums"]["trial_status_enum"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          last_login?: string | null
          phone?: string | null
          role?: string
          state?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          subscription_type?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          trial_status?: Database["public"]["Enums"]["trial_status_enum"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_login?: string | null
          phone?: string | null
          role?: string
          state?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          subscription_type?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          trial_status?: Database["public"]["Enums"]["trial_status_enum"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      review_bans: {
        Row: {
          blocked_at: string
          blocked_by: string | null
          reason: string | null
          user_id: string
        }
        Insert: {
          blocked_at?: string
          blocked_by?: string | null
          reason?: string | null
          user_id: string
        }
        Update: {
          blocked_at?: string
          blocked_by?: string | null
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          hidden: boolean
          id: string
          rating: number
          supplier_id: string
          user_id: string
          user_name: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          hidden?: boolean
          id?: string
          rating: number
          supplier_id: string
          user_id: string
          user_name: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          hidden?: boolean
          id?: string
          rating?: number
          supplier_id?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      security_settings: {
        Row: {
          description: string | null
          id: number
          key: string
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          description?: string | null
          id?: number
          key: string
          updated_at?: string
          updated_by?: string | null
          value: string
        }
        Update: {
          description?: string | null
          id?: number
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      seo_settings: {
        Row: {
          author: string | null
          created_at: string
          facebook_app_id: string | null
          id: string
          keywords: string[] | null
          site_description: string
          site_image_url: string | null
          site_name: string
          site_title: string
          site_url: string
          twitter_handle: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          author?: string | null
          created_at?: string
          facebook_app_id?: string | null
          id?: string
          keywords?: string[] | null
          site_description?: string
          site_image_url?: string | null
          site_name?: string
          site_title?: string
          site_url?: string
          twitter_handle?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          author?: string | null
          created_at?: string
          facebook_app_id?: string | null
          id?: string
          keywords?: string[] | null
          site_description?: string
          site_image_url?: string | null
          site_name?: string
          site_title?: string
          site_url?: string
          twitter_handle?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_import_history: {
        Row: {
          error_count: number
          error_details: Json | null
          filename: string
          id: string
          imported_at: string
          imported_by: string | null
          status: string
          success_count: number
          total_count: number
        }
        Insert: {
          error_count?: number
          error_details?: Json | null
          filename: string
          id?: string
          imported_at?: string
          imported_by?: string | null
          status: string
          success_count?: number
          total_count?: number
        }
        Update: {
          error_count?: number
          error_details?: Json | null
          filename?: string
          id?: string
          imported_at?: string
          imported_by?: string | null
          status?: string
          success_count?: number
          total_count?: number
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          avg_price: string | null
          city: string
          code: string
          created_at: string
          custom_shipping_method: string | null
          description: string
          featured: boolean
          hidden: boolean
          id: string
          images: string[] | null
          instagram: string | null
          min_order: string | null
          name: string
          payment_methods: string[]
          requires_cnpj: boolean
          shipping_methods: string[]
          state: string
          updated_at: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          avg_price?: string | null
          city: string
          code: string
          created_at?: string
          custom_shipping_method?: string | null
          description: string
          featured?: boolean
          hidden?: boolean
          id?: string
          images?: string[] | null
          instagram?: string | null
          min_order?: string | null
          name: string
          payment_methods?: string[]
          requires_cnpj?: boolean
          shipping_methods?: string[]
          state: string
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          avg_price?: string | null
          city?: string
          code?: string
          created_at?: string
          custom_shipping_method?: string | null
          description?: string
          featured?: boolean
          hidden?: boolean
          id?: string
          images?: string[] | null
          instagram?: string | null
          min_order?: string | null
          name?: string
          payment_methods?: string[]
          requires_cnpj?: boolean
          shipping_methods?: string[]
          state?: string
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      suppliers_categories: {
        Row: {
          category_id: string
          supplier_id: string
        }
        Insert: {
          category_id: string
          supplier_id: string
        }
        Update: {
          category_id?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_categories_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_settings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          key: string
          last_updated_by: string | null
          meta_access_token: string | null
          name: string
          script: string | null
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          key: string
          last_updated_by?: string | null
          meta_access_token?: string | null
          name: string
          script?: string | null
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          key?: string
          last_updated_by?: string | null
          meta_access_token?: string | null
          name?: string
          script?: string | null
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          notification_id: string
          read: boolean
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_id: string
          read?: boolean
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_id?: string
          read?: boolean
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_failed_attempts_count: {
        Args: { check_ip: string; hours?: number }
        Returns: number
      }
      get_suppliers_paginated: {
        Args: {
          p_user_id?: string
          p_offset?: number
          p_limit?: number
          p_search_term?: string
          p_category_id?: string
          p_state?: string
          p_city?: string
          p_price?: string
          p_requires_cnpj?: boolean
          p_favorites?: string[]
        }
        Returns: {
          id: string
          code: string
          name: string
          description: string
          images: string[]
          instagram: string
          whatsapp: string
          website: string
          min_order: string
          payment_methods: string[]
          requires_cnpj: boolean
          avg_price: string
          shipping_methods: string[]
          custom_shipping_method: string
          city: string
          state: string
          categories: string[]
          featured: boolean
          hidden: boolean
          created_at: string
          updated_at: string
          average_rating: number
          is_locked_for_trial: boolean
          total_count: number
          has_more: boolean
        }[]
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_ip_blocked: {
        Args: { check_ip: string }
        Returns: boolean
      }
      is_ip_in_allowlist: {
        Args: { check_ip: string }
        Returns: boolean
      }
      update_session_last_active: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      user_can_review_supplier: {
        Args: { supplier_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      feature_access_level_enum:
        | "full"
        | "limited_count"
        | "limited_blurred"
        | "none"
      trial_status_enum: "not_started" | "active" | "expired" | "converted"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      feature_access_level_enum: [
        "full",
        "limited_count",
        "limited_blurred",
        "none",
      ],
      trial_status_enum: ["not_started", "active", "expired", "converted"],
    },
  },
} as const
