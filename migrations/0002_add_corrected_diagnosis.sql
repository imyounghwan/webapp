-- 진단 텍스트 수정 기능 추가
-- 관리자가 점수와 함께 진단 텍스트도 수정 가능

ALTER TABLE admin_corrections ADD COLUMN corrected_diagnosis TEXT;

-- 인덱스는 기존 것 사용 (추가 불필요)
