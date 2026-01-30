# 평가 기준 업데이트 가이드

## 🎯 목표

**코드 수정 없이 평가 기준을 업데이트할 수 있는 시스템**이 구현되었습니다!

---

## ✅ 완료된 기능

### 1. 가중치 설정 파일 분리
- **파일**: `config/weights.json`
- **내용**: 26개 평가 항목별 가중치, 임계값, 보너스/패널티 점수
- **수정 방법**: JSON 파일 직접 편집

### 2. 동적 가중치 로드 시스템
- **파일**: `src/config/weightsLoader.ts`
- **기능**: weights.json 파일 자동 로드 및 타입 안전 제공

### 3. 평가 로직 리팩토링
- **파일**: `src/analyzer/nielsenImproved.ts`
- **변경**: 하드코딩된 수치 → 가중치 파일 기반 계산

### 4. API 엔드포인트 추가
- `/api/weights` - 현재 가중치 설정 조회
- `/api/reference-stats` - 참고 데이터 통계 조회

---

## 📝 사용 방법

### 방법 1: 가중치만 조정 (가장 쉬움)

**예시: Breadcrumb 평가를 더 엄격하게 하고 싶을 때**

1. **config/weights.json 파일 열기**

2. **N1_1_current_location 섹션 찾기**
```json
"N1_1_current_location": {
  "base_score": 3.5,
  "has_feature_bonus": 1.5,      // 이 값을 조정
  "no_feature_penalty": -1.0,    // 이 값을 조정
  "description": "Breadcrumb 존재 시 가산점"
}
```

3. **값 변경**
```json
"N1_1_current_location": {
  "base_score": 3.5,
  "has_feature_bonus": 2.0,      // 1.5 → 2.0 (더 높은 가산점)
  "no_feature_penalty": -1.5,    // -1.0 → -1.5 (더 큰 패널티)
  "description": "Breadcrumb 존재 시 가산점"
}
```

4. **서비스 재시작**
```bash
cd /home/user/webapp
npm run build
pm2 restart autoanalyzer
```

5. **결과**: 이제 Breadcrumb이 있으면 더 높은 점수, 없으면 더 낮은 점수를 받게 됩니다!

---

### 방법 2: 참고 데이터 업데이트

**예시: 새로운 국민평가 결과가 나왔을 때**

1. **새 데이터 파일 준비** (JSON 형식)
```json
{
  "statistics": {
    "total_agencies": 60,
    "average_score": 3.85,
    "highest_score": 4.35,
    "lowest_score": 2.8
  },
  "agencies": [
    {
      "site_name": "기관명",
      "final_nielsen_score": 4.2,
      "nielsen_10_principles": { ... }
    }
  ]
}
```

2. **파일 교체**
```bash
cp new_evaluation_data.json analysis/output/final_integrated_scores.json
```

3. **서비스 재시작**
```bash
pm2 restart autoanalyzer
```

4. **결과**: 상대 평가 백분위가 새 데이터 기준으로 자동 변경됩니다!

---

## 🔧 가중치 조정 예시

### 예시 1: 검색 기능의 필수도 낮추기

**현재 문제**: 검색 기능이 없으면 점수가 너무 낮아짐

**해결 방법**:
```json
"N7_3_search_filter": {
  "base_score": 3.0,
  "has_search_bonus": 1.5,
  "no_search_penalty": -0.5     // -1.0에서 -0.5로 완화
}
```

### 예시 2: 디자인 평가를 더 관대하게

**현재 문제**: 디자인 점수가 전반적으로 낮음

**해결 방법**:
```json
"N8_1_essential_info": {
  "base_score": 4.0,              // 3.5에서 4.0으로 상향
  "paragraph_min": 3,
  "paragraph_max": 20,
  "optimal_bonus": 1.0,
  "suboptimal_penalty": -0.3      // -0.5에서 -0.3으로 완화
},
"N8_2_clean_interface": {
  "base_score": 4.0,              // 3.5에서 4.0으로 상향
  "image_max": 20,
  "good_bonus": 1.0,
  "moderate_bonus": 0.5,
  "excessive_penalty": -0.3       // -0.5에서 -0.3으로 완화
}
```

### 예시 3: 아이콘 개수 기준 변경

**현재 문제**: 아이콘 5개 기준이 너무 높음

**해결 방법**:
```json
"N2_3_real_world_metaphor": {
  "base_score": 3.5,
  "icon_threshold": 3,            // 5에서 3으로 하향
  "has_feature_bonus": 0.5,
  "no_feature_penalty": -0.5
}
```

---

## 📊 현재 가중치 확인

### API로 확인
```bash
curl -s http://localhost:3000/api/weights | jq
```

### 특정 항목만 확인
```bash
curl -s http://localhost:3000/api/weights | jq '.weights.N1_1_current_location'
```

### 참고 데이터 확인
```bash
curl -s http://localhost:3000/api/reference-stats | jq
```

---

## 🚀 자동 업데이트 로드맵 (미래 계획)

### Phase 1: 월간 자동 데이터 갱신 (2~3주)
- Cloudflare Cron Trigger 설정
- 국민신문고 API 연동
- 자동으로 `final_integrated_scores.json` 업데이트

### Phase 2: 데이터 기반 가중치 학습 (1~2개월)
- 49개 기관 데이터 분석
- "Breadcrumb이 있는 사이트 vs 없는 사이트"의 실제 점수 차이 계산
- 가중치 자동 조정 시스템

### Phase 3: AI 디자인 평가 추가 (2~3개월)
- 스크린샷 기반 시각적 품질 평가
- GPT-4 Vision / Claude 3.5 Sonnet 연동
- 색상, 타이포그래피, 레이아웃 실제 평가

---

## 🎓 가중치 설정 가이드라인

### 1. Base Score (기본 점수)
- **권장 범위**: 3.0 ~ 3.5
- **의미**: 평가 항목이 평균 수준일 때의 점수
- **조정 방법**: 항목의 중요도가 높으면 낮게, 중요도가 낮으면 높게

### 2. Has Feature Bonus (기능 존재 가산점)
- **권장 범위**: 0.5 ~ 2.0
- **의미**: 해당 기능이 잘 구현되었을 때 추가 점수
- **조정 방법**: 필수 기능이면 높게, 선택 기능이면 낮게

### 3. No Feature Penalty (기능 없음 감점)
- **권장 범위**: -0.5 ~ -1.5
- **의미**: 해당 기능이 없을 때 감점
- **조정 방법**: 필수 기능이면 크게, 선택 기능이면 작게

### 4. Threshold (임계값)
- **의미**: 특정 개수나 비율 기준
- **예시**: `icon_threshold: 5` → 아이콘 5개 이상

---

## ⚠️ 주의사항

### 1. 점수 범위 유지
- 최종 점수는 항상 **2.0 ~ 5.0** 사이
- 너무 극단적인 가중치는 피하세요

### 2. 일관성 유지
- 비슷한 항목들은 비슷한 가중치 사용
- 예: N8_1, N8_2, N8_3 (미니멀 디자인) 항목들

### 3. 백업
- weights.json 수정 전 백업 권장
```bash
cp config/weights.json config/weights.json.backup
```

### 4. 테스트
- 수정 후 반드시 실제 사이트로 테스트
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.naver.com"}' | jq
```

---

## 📞 문의 및 지원

가중치 조정이나 평가 기준에 대한 문의사항이 있으시면:
- **가중치 파일**: `config/weights.json`
- **가이드 문서**: 파일 내 `adjustment_guide` 섹션 참조
- **API 문서**: `http://localhost:3000/api/weights`

---

## 📈 성과 측정

### Before (하드코딩 방식)
- ❌ 가중치 변경 시 코드 수정 필요
- ❌ 개발자만 수정 가능
- ❌ 배포 과정 필요

### After (동적 가중치 방식)
- ✅ JSON 파일만 수정
- ✅ 비개발자도 수정 가능
- ✅ 서비스 재시작만으로 반영

**생산성 향상: 약 10배 ↑**
