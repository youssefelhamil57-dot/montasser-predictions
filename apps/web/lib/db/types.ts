/**
 * Database row types for the post-0006 schema.
 *
 * The app is now a public predictions feed — the only table the runtime
 * reads from is `public.predictions`. Everything else (profiles, badges,
 * user_*) was dropped in migration 0006.
 */

export type RiskLevel = "low" | "medium" | "high";

export interface PredictionRow {
  id: string;
  sport: string;
  league: string;
  match_id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  prediction_type: string;
  predicted_outcome: string;
  confidence_score: number;
  ai_reasoning: string | null;
  key_factors: string[] | null;
  odds_suggested: number | null;
  risk_level: RiskLevel | null;
  actual_outcome: string | null;
  is_correct: boolean | null;
  model_version: string;
  data_sources: Record<string, unknown> | null;
  is_premium: boolean;
  is_featured: boolean;
  views_count: number;
  clicks_to_bet: number;
  created_at: string;
}

// supabase-js v2 generic-schema shape requires Relationships on every table.
type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      predictions: Table<
        PredictionRow,
        Omit<PredictionRow, "id" | "created_at" | "views_count" | "clicks_to_bet"> & {
          id?: string;
          created_at?: string;
          views_count?: number;
          clicks_to_bet?: number;
        }
      >;
    };
    Views: { [_ in never]: never };
    Functions: {
      bump_prediction_view: { Args: { p_id: string }; Returns: null };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
