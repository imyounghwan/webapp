-- 피드백 데이터 저장 테이블
CREATE TABLE IF NOT EXISTS feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id TEXT NOT NULL,                    -- 평가 항목 ID (예: N1_1, N1_2)
  url TEXT NOT NULL,                        -- 평가 대상 URL
  original_score REAL NOT NULL,             -- 원본 점수
  new_score REAL NOT NULL,                  -- 수정된 점수
  score_delta REAL NOT NULL,                -- 점수 차이 (new_score - original_score)
  new_description TEXT,                     -- 수정된 설명 (선택)
  new_recommendation TEXT,                  -- 수정된 권장사항 (선택)
  timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- 생성 시각
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP  -- 생성 시각 (중복, 호환성)
);

-- 인덱스 생성 (빠른 조회를 위해)
CREATE INDEX IF NOT EXISTS idx_feedbacks_item_id ON feedbacks(item_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_url ON feedbacks(url);
CREATE INDEX IF NOT EXISTS idx_feedbacks_timestamp ON feedbacks(timestamp DESC);

-- 복합 인덱스 (item_id + url 조합 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_feedbacks_item_url ON feedbacks(item_id, url);
