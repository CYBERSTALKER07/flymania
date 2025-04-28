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
      airlines: {
        Row: {
          country: string
          iata_code: string
          name: string
        }
        Insert: {
          country: string
          iata_code: string
          name: string
        }
        Update: {
          country?: string
          iata_code?: string
          name?: string
        }
        Relationships: []
      }
      airports: {
        Row: {
          city: string
          country: string
          iata_code: string
          name: string
          state: string | null
        }
        Insert: {
          city: string
          country: string
          iata_code: string
          name: string
          state?: string | null
        }
        Update: {
          city?: string
          country?: string
          iata_code?: string
          name?: string
          state?: string | null
        }
        Relationships: []
      }
      consumptions: {
        Row: {
          amount: number
          commentary: string | null
          created_at: string
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          user_id: string
        }
        Insert: {
          amount: number
          commentary?: string | null
          created_at?: string
          id?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          user_id: string
        }
        Update: {
          amount?: number
          commentary?: string | null
          created_at?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          commentary: string | null
          created_at: string
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          user_id: string
        }
        Insert: {
          amount: number
          commentary?: string | null
          created_at?: string
          id?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          user_id: string
        }
        Update: {
          amount?: number
          commentary?: string | null
          created_at?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          user_id?: string
        }
        Relationships: []
      }
      prepaid_clients: {
        Row: {
          agent_id: string
          agent_name: string
          amount: number
          client_name: string
          created_at: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
        }
        Insert: {
          agent_id: string
          agent_name: string
          amount: number
          client_name: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
        }
        Update: {
          agent_id?: string
          agent_name?: string
          amount?: number
          client_name?: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          commission_rate: number | null
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string
          email: string
          id: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          commission_rate?: number | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      ticket_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payment_date: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          ticket_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payment_date?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          ticket_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payment_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_payments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          agent_id: string
          agent_name: string
          airline_code: string
          airline_country: string
          airline_name: string
          base_price: number | null
          comments: string | null
          commission_rate: number | null
          contact_info: string | null
          created_at: string
          destination_city: string
          destination_code: string
          destination_country: string
          destination_name: string
          fees: number | null
          hotel_price: number | null
          hotel_supplier: string | null
          id: string
          insurance_paid: number | null
          insurance_price: number | null
          insurance_supplier: string | null
          issue_date: string
          order_number: string | null
          origin_city: string
          origin_code: string
          origin_country: string
          origin_name: string
          other_services_comments: string | null
          other_services_paid: number | null
          other_services_price: number | null
          other_services_supplier: string | null
          paid_amount: number
          passenger_name: string
          payment_date: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          price: number
          remaining_amount: number | null
          return_date: string | null
          service_type: string | null
          supplier: string | null
          ticket_price: number | null
          ticket_supplier: string | null
          train_paid: number | null
          train_price: number | null
          train_supplier: string | null
          transfer_price: number | null
          transfer_supplier: string | null
          travel_date: string
        }
        Insert: {
          agent_id: string
          agent_name: string
          airline_code: string
          airline_country: string
          airline_name: string
          base_price?: number | null
          comments?: string | null
          commission_rate?: number | null
          contact_info?: string | null
          created_at?: string
          destination_city: string
          destination_code: string
          destination_country: string
          destination_name: string
          fees?: number | null
          hotel_price?: number | null
          hotel_supplier?: string | null
          id?: string
          insurance_paid?: number | null
          insurance_price?: number | null
          insurance_supplier?: string | null
          issue_date?: string
          order_number?: string | null
          origin_city: string
          origin_code: string
          origin_country: string
          origin_name: string
          other_services_comments?: string | null
          other_services_paid?: number | null
          other_services_price?: number | null
          other_services_supplier?: string | null
          paid_amount?: number
          passenger_name: string
          payment_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          price: number
          remaining_amount?: number | null
          return_date?: string | null
          service_type?: string | null
          supplier?: string | null
          ticket_price?: number | null
          ticket_supplier?: string | null
          train_paid?: number | null
          train_price?: number | null
          train_supplier?: string | null
          transfer_price?: number | null
          transfer_supplier?: string | null
          travel_date: string
        }
        Update: {
          agent_id?: string
          agent_name?: string
          airline_code?: string
          airline_country?: string
          airline_name?: string
          base_price?: number | null
          comments?: string | null
          commission_rate?: number | null
          contact_info?: string | null
          created_at?: string
          destination_city?: string
          destination_code?: string
          destination_country?: string
          destination_name?: string
          fees?: number | null
          hotel_price?: number | null
          hotel_supplier?: string | null
          id?: string
          insurance_paid?: number | null
          insurance_price?: number | null
          insurance_supplier?: string | null
          issue_date?: string
          order_number?: string | null
          origin_city?: string
          origin_code?: string
          origin_country?: string
          origin_name?: string
          other_services_comments?: string | null
          other_services_paid?: number | null
          other_services_price?: number | null
          other_services_supplier?: string | null
          paid_amount?: number
          passenger_name?: string
          payment_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          price?: number
          remaining_amount?: number | null
          return_date?: string | null
          service_type?: string | null
          supplier?: string | null
          ticket_price?: number | null
          ticket_supplier?: string | null
          train_paid?: number | null
          train_price?: number | null
          train_supplier?: string | null
          transfer_price?: number | null
          transfer_supplier?: string | null
          travel_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_agent_with_password: {
        Args:
          | {
              _email: string
              _password: string
              _name: string
              _commission_rate: number
            }
          | {
              _email: string
              _password: string
              _name: string
              _commission_rate: number
              _role?: string
            }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_valid_admin_password: {
        Args: { input_password: string }
        Returns: boolean
      }
      pg_get_coldef: {
        Args: { in_schema: string; in_table: string; in_column: string }
        Returns: string
      }
    }
    Enums: {
      payment_method: "cash" | "bank_transfer" | "visa" | "uzcard" | "terminal"
      payment_status: "pending" | "paid"
      user_role: "agent" | "admin"
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
      payment_method: ["cash", "bank_transfer", "visa", "uzcard", "terminal"],
      payment_status: ["pending", "paid"],
      user_role: ["agent", "admin"],
    },
  },
} as const
