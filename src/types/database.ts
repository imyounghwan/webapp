// D1 Database 타입 정의

export interface AdminCorrection {
  id: number;
  url: string;
  evaluated_at: string;
  item_id: string;
  item_name: string;
  original_score: number;
  corrected_score: number;
  score_diff: number;
  html_structure: string | null;
  correction_reason: string | null;
  admin_comment: string | null;
  corrected_by: string | null;
  corrected_at: string;
  used_for_learning: number; // SQLite boolean (0 or 1)
  learning_applied_at: string | null;
}

export interface LearningDataSummary {
  item_id: string;
  item_name: string;
  correction_count: number;
  avg_score_diff: number;
  avg_original_score: number;
  avg_corrected_score: number;
  adjustment_suggestion: '가중치_하향_필요' | '가중치_상향_필요' | '적정';
}

export interface CorrectionRequest {
  url: string;
  evaluated_at: string;
  item_id: string;
  item_name: string;
  original_score: number;
  corrected_score: number;
  html_structure?: string;
  correction_reason?: string;
  admin_comment?: string;
  corrected_by?: string;
}

// Cloudflare Bindings
export interface Env {
  DB: D1Database;
}
