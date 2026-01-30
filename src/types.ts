// Database types
export interface User {
  id: number
  email: string
  password_hash: string
  name: string
  role: 'user' | 'admin'
  created_at: string
  last_login_at: string | null
  is_active: number
}

export interface Session {
  id: string
  user_id: number
  expires_at: string
  created_at: string
}

export interface AdminCorrection {
  id: number
  url: string
  evaluated_at: string
  item_id: string
  item_name: string
  original_score: number
  corrected_score: number
  score_diff: number
  html_structure: string | null
  correction_reason: string | null
  admin_comment: string | null
  corrected_diagnosis: string | null
  corrected_by: number
  corrected_at: string
  used_for_learning: number
  learning_applied_at: string | null
}

export interface LearningDataSummary {
  id: number
  item_id: string
  item_name: string
  correction_count: number
  avg_score_diff: number
  avg_original_score: number
  avg_corrected_score: number
  adjustment_suggestion: '가중치_하향_필요' | '가중치_상향_필요' | '적정'
  last_updated_at: string
}

// API Request/Response types
export interface SignupRequest {
  email: string
  password: string
  name: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  session_id?: string
  user?: {
    id: number
    email: string
    name: string
    role: string
  }
  message?: string
}

export interface CorrectionRequest {
  url: string
  evaluated_at: string
  item_id: string
  item_name: string
  original_score: number
  corrected_score: number
  html_structure?: string
  correction_reason?: string
  admin_comment?: string
  corrected_diagnosis?: string
  corrected_by: number
}

// Cloudflare bindings
export interface Env {
  DB: D1Database
  RESEND_API_KEY: string
}
