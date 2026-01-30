-- 관리자 수정 이력 테이블
-- 이 데이터는 AI 학습에 활용됩니다.

CREATE TABLE IF NOT EXISTS admin_corrections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- 평가 대상
  url TEXT NOT NULL,
  evaluated_at DATETIME NOT NULL,
  
  -- 평가 항목
  item_id TEXT NOT NULL, -- 예: N1_1_current_location
  item_name TEXT NOT NULL, -- 예: 내가 어디있는지 알려주기
  
  -- 점수 변경
  original_score REAL NOT NULL, -- 자동 평가 원본 점수
  corrected_score REAL NOT NULL, -- 관리자 수정 점수
  score_diff REAL NOT NULL, -- 차이값 (corrected - original)
  
  -- HTML 구조 정보 (학습용)
  html_structure TEXT, -- JSON 형태로 저장
  
  -- 수정 이유/코멘트
  correction_reason TEXT,
  admin_comment TEXT,
  
  -- 메타데이터
  corrected_by TEXT, -- 관리자 ID (추후 로그인 시스템과 연동)
  corrected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- 학습 활용 여부
  used_for_learning BOOLEAN DEFAULT 0,
  learning_applied_at DATETIME
);

-- 인덱스 생성 (빠른 조회용)
CREATE INDEX IF NOT EXISTS idx_corrections_url ON admin_corrections(url);
CREATE INDEX IF NOT EXISTS idx_corrections_item_id ON admin_corrections(item_id);
CREATE INDEX IF NOT EXISTS idx_corrections_date ON admin_corrections(corrected_at);
CREATE INDEX IF NOT EXISTS idx_corrections_learning ON admin_corrections(used_for_learning);

-- 학습 데이터 집계 뷰
CREATE VIEW IF NOT EXISTS learning_data_summary AS
SELECT 
  item_id,
  item_name,
  COUNT(*) as correction_count,
  AVG(score_diff) as avg_score_diff,
  AVG(original_score) as avg_original_score,
  AVG(corrected_score) as avg_corrected_score,
  -- 자주 하향 조정되는 항목 판별
  CASE 
    WHEN AVG(score_diff) < -0.3 THEN '가중치_하향_필요'
    WHEN AVG(score_diff) > 0.3 THEN '가중치_상향_필요'
    ELSE '적정'
  END as adjustment_suggestion
FROM admin_corrections
WHERE used_for_learning = 0 -- 아직 학습에 반영 안된 데이터만
GROUP BY item_id, item_name
HAVING COUNT(*) >= 5; -- 최소 5건 이상 수정된 항목만
