# 관리자 점수 수정 및 AI 학습 시스템

## 📋 개요

이 시스템은 관리자가 평가 점수를 수정하면, 그 데이터가 자동으로 학습 데이터로 축적되어 AI 평가 기준을 점진적으로 개선하는 구조입니다.

**핵심 아이디어**: 관리자 수정값 → 데이터 축적 → 패턴 분석 → 가중치 자동 조정 제안 → 평가 기준 개선

---

## 🎯 주요 기능

### 1. **인라인 점수 편집 UI**

각 평가 항목 옆에 "✏️ 수정" 버튼이 표시됩니다.

- **편집 모드**: 클릭 시 점수를 2.0 ~ 5.0 범위 내에서 수정 가능
- **수정 사유 입력**: 왜 수정했는지 메모 가능 (선택사항)
- **즉시 저장**: 저장 버튼 클릭 시 데이터베이스에 자동 기록

**UI 위치**: 
- 편의성 항목 (21개)
- 디자인 항목 (5개)

---

### 2. **D1 데이터베이스 (SQLite 기반)**

관리자 수정 데이터를 저장하는 테이블:

```sql
CREATE TABLE admin_corrections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  evaluated_at DATETIME NOT NULL,
  item_id TEXT NOT NULL,              -- 예: N1_1_current_location
  item_name TEXT NOT NULL,            -- 예: 내가 어디있는지 알려주기
  original_score REAL NOT NULL,       -- 자동 평가 원본 점수
  corrected_score REAL NOT NULL,      -- 관리자 수정 점수
  score_diff REAL NOT NULL,           -- 차이값
  html_structure TEXT,                -- HTML 구조 (학습용)
  correction_reason TEXT,             -- 수정 사유
  admin_comment TEXT,
  corrected_by TEXT,
  corrected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  used_for_learning BOOLEAN DEFAULT 0,
  learning_applied_at DATETIME
);
```

**학습 데이터 요약 뷰**:
```sql
CREATE VIEW learning_data_summary AS
SELECT 
  item_id,
  item_name,
  COUNT(*) as correction_count,
  AVG(score_diff) as avg_score_diff,
  CASE 
    WHEN AVG(score_diff) < -0.3 THEN '가중치_하향_필요'
    WHEN AVG(score_diff) > 0.3 THEN '가중치_상향_필요'
    ELSE '적정'
  END as adjustment_suggestion
FROM admin_corrections
WHERE used_for_learning = 0
GROUP BY item_id
HAVING COUNT(*) >= 5;
```

---

### 3. **API 엔드포인트**

#### **① 점수 수정 저장**
```bash
POST /api/corrections

{
  "url": "https://example.com",
  "evaluated_at": "2024-01-30T12:00:00Z",
  "item_id": "N1_1",
  "item_name": "내가 어디있는지 알려주기",
  "original_score": 5.0,
  "corrected_score": 3.5,
  "correction_reason": "브레드크럼이 너무 작아서 잘 안보임",
  "admin_comment": "사용자 테스트 결과 반영"
}
```

#### **② 특정 URL의 수정 이력 조회**
```bash
GET /api/corrections/https://example.com

Response:
{
  "url": "https://example.com",
  "corrections": [
    {
      "id": 1,
      "item_id": "N1_1",
      "item_name": "내가 어디있는지 알려주기",
      "original_score": 5.0,
      "corrected_score": 3.5,
      "score_diff": -1.5,
      "correction_reason": "브레드크럼이 너무 작아서 잘 안보임",
      "corrected_at": "2024-01-30T12:00:00Z"
    }
  ],
  "count": 1
}
```

#### **③ 학습 데이터 인사이트**
```bash
GET /api/learning-insights

Response:
{
  "summary": [
    {
      "item_id": "N1_1",
      "item_name": "내가 어디있는지 알려주기",
      "correction_count": 15,
      "avg_score_diff": -1.2,
      "avg_original_score": 4.8,
      "avg_corrected_score": 3.6,
      "adjustment_suggestion": "가중치_하향_필요"
    }
  ],
  "statistics": {
    "total_corrections": 50,
    "unique_urls": 20,
    "corrected_items": 12,
    "avg_score_diff": -0.5,
    "pending_learning": 50
  },
  "top_corrected_items": [...],
  "recommendations": [
    {
      "item_id": "N1_1",
      "item_name": "내가 어디있는지 알려주기",
      "suggestion": "가중치_하향_필요",
      "evidence": "15건의 수정 데이터, 평균 -1.20점 차이"
    }
  ]
}
```

#### **④ 가중치 자동 조정 제안**
```bash
GET /api/weight-suggestions

Response:
{
  "suggestions": [
    {
      "item_id": "N1_1",
      "item_name": "내가 어디있는지 알려주기",
      "current_weights": {
        "base_score": 3.5,
        "has_feature_bonus": 1.5,
        "no_feature_penalty": -1.0
      },
      "suggested_weights": {
        "base_score": 3.5,
        "has_feature_bonus": 0.9,
        "no_feature_penalty": -1.3
      },
      "reason": "관리자가 평균 -1.20점 하향 조정함. 15건의 수정 데이터 분석 결과, 현재 자동 평가가 과대평가되고 있습니다.",
      "evidence": {
        "correction_count": 15,
        "avg_score_diff": -1.2,
        "avg_original_score": 4.8,
        "avg_corrected_score": 3.6
      },
      "adjustment_type": "decrease",
      "confidence": "high"
    }
  ],
  "total_suggestions": 5,
  "high_confidence": 2,
  "medium_confidence": 3
}
```

---

## 🔄 학습 파이프라인

### **Phase 1: 데이터 수집**
1. 관리자가 평가 항목 점수를 수정
2. 수정 사유와 함께 데이터베이스에 저장
3. HTML 구조 정보도 함께 저장 (향후 고급 학습용)

### **Phase 2: 패턴 분석**
- 수정 데이터 5건 이상 쌓이면 `learning_data_summary` 뷰에 자동 집계
- 항목별 평균 점수 차이 분석
- 자주 하향 조정되는 항목 vs 자주 상향 조정되는 항목 구분

### **Phase 3: 가중치 조정 제안**
- 평균 차이 0.3점 이상 → 유의미한 차이로 판단
- 평균 차이 0.5점 이상 → 매우 유의미, 높은 신뢰도
- 수정 건수 20건 이상 → 신뢰도 자동 상승

**조정 로직 예시**:
```
관리자가 평균 -1.2점 하향 조정 (15건)
→ has_feature_bonus를 1.5에서 0.9로 감소 (조정폭: 0.6)
→ no_feature_penalty를 -1.0에서 -1.3으로 증가 (조정폭: 0.3)
```

### **Phase 4: 수동 적용 (현재)**
1. `/api/weight-suggestions` 호출하여 제안 확인
2. 제안 내용 검토
3. `config/weights.json` 파일 수정
4. 서비스 재시작: `pm2 restart autoanalyzer`

### **Phase 5: 자동 적용 (향후 구현 예정)**
- 데이터 100건 이상 쌓이면 자동 적용 권장
- 신뢰도 높은 제안만 자동 적용
- 가중치 변경 이력 관리

---

## 📊 사용 시나리오

### **시나리오 1: N1.1 항목 과대평가 발견**

**문제**: 브레드크럼이 있으면 무조건 5.0점을 주는데, 실제로는 너무 작거나 잘 안보이는 경우가 많음

**해결 과정**:
1. 여러 사이트 분석 후 관리자가 N1.1 점수를 5.0 → 3.5로 수정 (15회)
2. 수정 사유: "브레드크럼이 너무 작아서 잘 안보임"
3. 시스템이 자동으로 패턴 감지: 평균 -1.2점 차이
4. 가중치 조정 제안: `has_feature_bonus` 1.5 → 0.9
5. 관리자가 제안 확인 후 적용
6. 이후 평가에서 브레드크럼 가중치가 낮아짐

**결과**: AI가 브레드크럼의 실제 가치를 더 정확하게 평가하게 됨

---

### **시나리오 2: N7.3 검색 기능 중요도 상승**

**문제**: 검색 기능이 없어도 크게 감점하지 않았는데, 실제로는 사용자가 매우 불편해함

**해결 과정**:
1. 사용자 테스트 결과를 반영하여 관리자가 검색 없는 사이트의 N7.3 점수를 3.0 → 4.0으로 상향 (10회)
2. 시스템이 패턴 감지: 평균 +1.0점 차이
3. 가중치 조정 제안: `has_search_bonus` 1.5 → 2.0
4. 적용 후 검색 기능의 중요도 상승

**결과**: AI가 검색 기능의 중요성을 더 높게 평가

---

## 🛠️ 개발 환경 설정

### **로컬 개발**

```bash
# 1. 마이그레이션 적용
npx wrangler d1 migrations apply webapp-db --local

# 2. 빌드
npm run build

# 3. 서비스 시작 (D1 활성화)
pm2 start ecosystem.config.cjs

# 4. 테스트
curl http://localhost:3000/api/learning-insights
```

### **프로덕션 배포**

```bash
# 1. D1 데이터베이스 생성
npx wrangler d1 create webapp-db

# 2. wrangler.jsonc에 database_id 추가

# 3. 마이그레이션 적용 (프로덕션)
npx wrangler d1 migrations apply webapp-db

# 4. 배포
npm run deploy
```

---

## 📈 향후 개선 계획

### **Phase 1 (현재 완료)**
- ✅ D1 데이터베이스 설계
- ✅ 인라인 편집 UI
- ✅ 수정 이력 저장 API
- ✅ 학습 데이터 분석 API
- ✅ 가중치 조정 제안 API

### **Phase 2 (다음 단계)**
- 🔲 관리자 대시보드 (학습 데이터 시각화)
- 🔲 가중치 자동 적용 시스템 (신뢰도 기반)
- 🔲 A/B 테스트 (기존 가중치 vs 새 가중치)
- 🔲 HTML 구조 패턴 학습 (고급)

### **Phase 3 (장기 계획)**
- 🔲 머신러닝 모델 통합 (TensorFlow.js)
- 🔲 사용자 피드백 수집 시스템
- 🔲 자동 재학습 스케줄러 (월 1회)
- 🔲 가중치 버전 관리 시스템

---

## 🔐 보안 고려사항

**현재 구현**:
- 로그인 시스템 전제 (권한 체크 없음)
- D1 데이터베이스는 서버 사이드에서만 접근 가능

**향후 추가 예정**:
- JWT 기반 관리자 인증
- 수정 권한 레벨 구분 (관리자 / 슈퍼관리자)
- 수정 이력 감사 로그

---

## 📝 API 테스트 예제

### **점수 수정 테스트**
```bash
# 1. Google 분석
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.google.com"}'

# 2. 점수 수정
curl -X POST http://localhost:3000/api/corrections \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.google.com",
    "evaluated_at": "2024-01-30T12:00:00Z",
    "item_id": "N1_1",
    "item_name": "내가 어디있는지 알려주기",
    "original_score": 5.0,
    "corrected_score": 3.5,
    "correction_reason": "테스트"
  }'

# 3. 수정 이력 확인
curl http://localhost:3000/api/corrections/https://www.google.com

# 4. 학습 인사이트 확인
curl http://localhost:3000/api/learning-insights

# 5. 가중치 조정 제안 확인
curl http://localhost:3000/api/weight-suggestions
```

---

## 💡 핵심 요약

**관리자의 수정 → AI 학습 → 평가 기준 자동 개선**

1. **수정 데이터 축적**: 관리자가 점수를 수정할 때마다 데이터 저장
2. **패턴 자동 분석**: 5건 이상 쌓이면 평균 차이 계산
3. **가중치 조정 제안**: 유의미한 차이 발견 시 조정 제안
4. **점진적 개선**: 제안을 반영하면 AI 평가 정확도 향상

**결과**: 사용할수록 똑똑해지는 AI 평가 시스템 🚀
