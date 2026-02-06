-- 피드백 데이터 테이블
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_name TEXT,
  category TEXT,
  original_score REAL,
  new_score REAL NOT NULL,
  score_delta REAL,
  new_description TEXT,
  new_recommendation TEXT,
  session_id TEXT,
  timestamp TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성 (빠른 조회)
CREATE INDEX IF NOT EXISTS idx_feedback_item_id ON feedback(item_id);
CREATE INDEX IF NOT EXISTS idx_feedback_url ON feedback(url);
CREATE INDEX IF NOT EXISTS idx_feedback_timestamp ON feedback(timestamp);

-- 복합 인덱스 (item_id + url로 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_feedback_item_url ON feedback(item_id, url);
