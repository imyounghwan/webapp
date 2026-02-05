-- 문의하기 테이블
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company TEXT NOT NULL,
  position TEXT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  url TEXT,
  project_type TEXT, -- 쉼표로 구분된 프로젝트 타입
  message TEXT NOT NULL,
  budget TEXT,
  schedule TEXT,
  privacy_agreed INTEGER NOT NULL DEFAULT 0, -- 0: 미동의, 1: 동의
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, rejected
  admin_note TEXT, -- 관리자 메모
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_email ON contact_inquiries(email);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at ON contact_inquiries(created_at);
