-- 기본 관리자 계정 생성
-- 관리자: admin@mgine.co.kr / Admin123!
-- 테스트: test@mgine.co.kr / Test123!
INSERT OR IGNORE INTO users (email, password_hash, name, role, is_active) 
VALUES 
  ('admin@mgine.co.kr', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'MGINE 관리자', 'admin', 1),
  ('test@mgine.co.kr', '54de7f606f2523cba8efac173fab42fb7f59d56ceff974c8fdb7342cf2cfe345', '테스트 사용자', 'user', 1);
