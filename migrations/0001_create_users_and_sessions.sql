-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'user', 'admin'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME,
  is_active INTEGER DEFAULT 1 -- 1: 활성, 0: 비활성
);

-- 세션 테이블
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 관리자 평가 수정 테이블
CREATE TABLE IF NOT EXISTS admin_corrections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  evaluated_at DATETIME NOT NULL,
  item_id TEXT NOT NULL, -- N1_1, N2_1 등
  item_name TEXT NOT NULL,
  original_score REAL NOT NULL,
  corrected_score REAL NOT NULL,
  score_diff REAL NOT NULL, -- corrected_score - original_score
  html_structure TEXT, -- JSON string
  correction_reason TEXT,
  admin_comment TEXT,
  corrected_diagnosis TEXT,
  corrected_by INTEGER NOT NULL, -- user_id
  corrected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  used_for_learning INTEGER DEFAULT 0, -- 0: 미사용, 1: 학습에 사용됨
  learning_applied_at DATETIME,
  FOREIGN KEY (corrected_by) REFERENCES users(id)
);

-- 학습 데이터 요약 테이블 (관리자가 수정한 데이터 집계)
CREATE TABLE IF NOT EXISTS learning_data_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id TEXT UNIQUE NOT NULL,
  item_name TEXT NOT NULL,
  correction_count INTEGER DEFAULT 0,
  avg_score_diff REAL DEFAULT 0,
  avg_original_score REAL DEFAULT 0,
  avg_corrected_score REAL DEFAULT 0,
  last_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_corrections_url ON admin_corrections(url);
CREATE INDEX IF NOT EXISTS idx_admin_corrections_item_id ON admin_corrections(item_id);
CREATE INDEX IF NOT EXISTS idx_admin_corrections_corrected_by ON admin_corrections(corrected_by);
CREATE INDEX IF NOT EXISTS idx_admin_corrections_corrected_at ON admin_corrections(corrected_at);
CREATE INDEX IF NOT EXISTS idx_learning_data_summary_item_id ON learning_data_summary(item_id);
