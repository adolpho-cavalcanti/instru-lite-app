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
      alunos: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alunos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      aulas: {
        Row: {
          created_at: string
          data: string
          duracao: number
          horario: string
          id: string
          observacoes: string | null
          pacote_id: string
          status: Database["public"]["Enums"]["status_aula"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: string
          duracao?: number
          horario: string
          id?: string
          observacoes?: string | null
          pacote_id: string
          status?: Database["public"]["Enums"]["status_aula"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: string
          duracao?: number
          horario?: string
          id?: string
          observacoes?: string | null
          pacote_id?: string
          status?: Database["public"]["Enums"]["status_aula"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aulas_pacote_id_fkey"
            columns: ["pacote_id"]
            isOneToOne: false
            referencedRelation: "pacotes"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          aluno_id: string
          comentario: string | null
          created_at: string
          id: string
          instrutor_id: string
          nota: number
          pacote_id: string | null
        }
        Insert: {
          aluno_id: string
          comentario?: string | null
          created_at?: string
          id?: string
          instrutor_id: string
          nota: number
          pacote_id?: string | null
        }
        Update: {
          aluno_id?: string
          comentario?: string | null
          created_at?: string
          id?: string
          instrutor_id?: string
          nota?: number
          pacote_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_instrutor_id_fkey"
            columns: ["instrutor_id"]
            isOneToOne: false
            referencedRelation: "instrutores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_pacote_id_fkey"
            columns: ["pacote_id"]
            isOneToOne: false
            referencedRelation: "pacotes"
            referencedColumns: ["id"]
          },
        ]
      }
      favoritos: {
        Row: {
          aluno_id: string
          created_at: string
          id: string
          instrutor_id: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          id?: string
          instrutor_id: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          id?: string
          instrutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favoritos_instrutor_id_fkey"
            columns: ["instrutor_id"]
            isOneToOne: false
            referencedRelation: "instrutores"
            referencedColumns: ["id"]
          },
        ]
      }
      instrutores: {
        Row: {
          anos_experiencia: number
          avaliacao_media: number | null
          bairros_atendimento: string[] | null
          bio: string | null
          categoria: Database["public"]["Enums"]["categoria_habilitacao"]
          created_at: string
          credenciamento_detran: string
          id: string
          preco_hora: number
          profile_id: string
          ranking_posicao: number | null
          stripe_account_id: string | null
          stripe_customer_id: string | null
          tem_veiculo: boolean
          updated_at: string
        }
        Insert: {
          anos_experiencia?: number
          avaliacao_media?: number | null
          bairros_atendimento?: string[] | null
          bio?: string | null
          categoria: Database["public"]["Enums"]["categoria_habilitacao"]
          created_at?: string
          credenciamento_detran: string
          id?: string
          preco_hora: number
          profile_id: string
          ranking_posicao?: number | null
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          tem_veiculo?: boolean
          updated_at?: string
        }
        Update: {
          anos_experiencia?: number
          avaliacao_media?: number | null
          bairros_atendimento?: string[] | null
          bio?: string | null
          categoria?: Database["public"]["Enums"]["categoria_habilitacao"]
          created_at?: string
          credenciamento_detran?: string
          id?: string
          preco_hora?: number
          profile_id?: string
          ranking_posicao?: number | null
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          tem_veiculo?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instrutores_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pacotes: {
        Row: {
          aluno_id: string
          avaliacao_liberada: boolean
          avaliacao_realizada: boolean
          created_at: string
          data_conclusao: string | null
          data_confirmacao: string | null
          horas_utilizadas: number
          id: string
          instrutor_id: string
          preco_total: number
          quantidade_horas: number
          status: Database["public"]["Enums"]["status_pacote"]
          stripe_payment_intent_id: string | null
          stripe_transfer_id: string | null
          taxa_plataforma: number
          updated_at: string
          valor_plataforma: number
        }
        Insert: {
          aluno_id: string
          avaliacao_liberada?: boolean
          avaliacao_realizada?: boolean
          created_at?: string
          data_conclusao?: string | null
          data_confirmacao?: string | null
          horas_utilizadas?: number
          id?: string
          instrutor_id: string
          preco_total: number
          quantidade_horas: number
          status?: Database["public"]["Enums"]["status_pacote"]
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          taxa_plataforma?: number
          updated_at?: string
          valor_plataforma: number
        }
        Update: {
          aluno_id?: string
          avaliacao_liberada?: boolean
          avaliacao_realizada?: boolean
          created_at?: string
          data_conclusao?: string | null
          data_confirmacao?: string | null
          horas_utilizadas?: number
          id?: string
          instrutor_id?: string
          preco_total?: number
          quantidade_horas?: number
          status?: Database["public"]["Enums"]["status_pacote"]
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          taxa_plataforma?: number
          updated_at?: string
          valor_plataforma?: number
        }
        Relationships: [
          {
            foreignKeyName: "pacotes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacotes_instrutor_id_fkey"
            columns: ["instrutor_id"]
            isOneToOne: false
            referencedRelation: "instrutores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cidade: string
          created_at: string
          foto: string | null
          id: string
          nome: string
          tipo: Database["public"]["Enums"]["user_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cidade: string
          created_at?: string
          foto?: string | null
          id?: string
          nome: string
          tipo: Database["public"]["Enums"]["user_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cidade?: string
          created_at?: string
          foto?: string | null
          id?: string
          nome?: string
          tipo?: Database["public"]["Enums"]["user_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_aluno_id: { Args: never; Returns: string }
      get_current_instrutor_id: { Args: never; Returns: string }
      get_current_profile_id: { Args: never; Returns: string }
      is_aluno: { Args: never; Returns: boolean }
      is_instrutor: { Args: never; Returns: boolean }
    }
    Enums: {
      categoria_habilitacao: "A" | "B" | "AB" | "C" | "D" | "E"
      status_aula: "agendada" | "realizada" | "cancelada"
      status_pacote:
        | "pendente"
        | "confirmado"
        | "em_andamento"
        | "concluido"
        | "cancelado"
      user_type: "instrutor" | "aluno"
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
      categoria_habilitacao: ["A", "B", "AB", "C", "D", "E"],
      status_aula: ["agendada", "realizada", "cancelada"],
      status_pacote: [
        "pendente",
        "confirmado",
        "em_andamento",
        "concluido",
        "cancelado",
      ],
      user_type: ["instrutor", "aluno"],
    },
  },
} as const
