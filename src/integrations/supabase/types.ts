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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          message: string
          response: string
          sentiment: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          message: string
          response: string
          sentiment?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          message?: string
          response?: string
          sentiment?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      canteens: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          opening_hours: Json | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          opening_hours?: Json | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          opening_hours?: Json | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dining_tables: {
        Row: {
          canteen_id: string | null
          capacity: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          location: string | null
          qr_code: string | null
          table_number: string
          updated_at: string | null
        }
        Insert: {
          canteen_id?: string | null
          capacity?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          qr_code?: string | null
          table_number: string
          updated_at?: string | null
        }
        Update: {
          canteen_id?: string | null
          capacity?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          qr_code?: string | null
          table_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dining_tables_canteen_id_fkey"
            columns: ["canteen_id"]
            isOneToOne: false
            referencedRelation: "canteens"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          admin_response: string | null
          created_at: string | null
          food_rating: number | null
          id: string
          is_helpful_count: number | null
          order_id: string
          rating: number
          review_text: string | null
          service_rating: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string | null
          food_rating?: number | null
          id?: string
          is_helpful_count?: number | null
          order_id: string
          rating: number
          review_text?: string | null
          service_rating?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string | null
          food_rating?: number | null
          id?: string
          is_helpful_count?: number | null
          order_id?: string
          rating?: number
          review_text?: string | null
          service_rating?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          available_from: string | null
          available_to: string | null
          canteen_id: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          available_from?: string | null
          available_to?: string | null
          canteen_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          available_from?: string | null
          available_to?: string | null
          canteen_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_canteen_id_fkey"
            columns: ["canteen_id"]
            isOneToOne: false
            referencedRelation: "canteens"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          ingredients: string[] | null
          is_available: boolean | null
          is_vegan: boolean | null
          is_vegetarian: boolean | null
          name: string
          nutritional_info: Json | null
          preparation_time: number | null
          price: number
          spice_level: number | null
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_available?: boolean | null
          is_vegan?: boolean | null
          is_vegetarian?: boolean | null
          name: string
          nutritional_info?: Json | null
          preparation_time?: number | null
          price: number
          spice_level?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_available?: boolean | null
          is_vegan?: boolean | null
          is_vegetarian?: boolean | null
          name?: string
          nutritional_info?: Json | null
          preparation_time?: number | null
          price?: number
          spice_level?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          item_status: Database["public"]["Enums"]["order_status"] | null
          menu_item_id: string
          order_id: string
          quantity: number
          special_instructions: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_status?: Database["public"]["Enums"]["order_status"] | null
          menu_item_id: string
          order_id: string
          quantity: number
          special_instructions?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          item_status?: Database["public"]["Enums"]["order_status"] | null
          menu_item_id?: string
          order_id?: string
          quantity?: number
          special_instructions?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          completed_at: string | null
          created_at: string | null
          estimated_preparation_time: number | null
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          special_instructions: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          table_id: string | null
          table_number: string
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          estimated_preparation_time?: number | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          table_id?: string | null
          table_number: string
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          estimated_preparation_time?: number | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          table_id?: string | null
          table_number?: string
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "dining_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          order_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          refund_amount: number | null
          refund_reason: string | null
          split_info: Json | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          order_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          split_info?: Json | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          order_id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          split_info?: Json | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          image: string | null
          menu_item_id: string
          name: string
          price: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          image?: string | null
          menu_item_id: string
          name: string
          price?: number | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          image?: string | null
          menu_item_id?: string
          name?: string
          price?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_order_total: {
        Args: { order_id_param: string }
        Returns: {
          subtotal: number
          tax_amount: number
          total_amount: number
        }[]
      }
      clean_old_audit_logs: { Args: never; Returns: undefined }
      create_notification: {
        Args: {
          p_data?: Json
          p_message: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      get_order_statistics: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          average_order_value: number
          completed_orders: number
          pending_orders: number
          total_orders: number
          total_revenue: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "customer" | "staff" | "admin"
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "ready"
        | "served"
        | "cancelled"
      payment_method: "upi" | "card" | "cash" | "split"
      payment_status: "pending" | "completed" | "failed" | "refunded"
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
      app_role: ["customer", "staff", "admin"],
      order_status: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "served",
        "cancelled",
      ],
      payment_method: ["upi", "card", "cash", "split"],
      payment_status: ["pending", "completed", "failed", "refunded"],
    },
  },
} as const
