# 🎬 가중치 업데이트 데모

## 시나리오: "검색 기능의 필수도를 낮추고 싶다"

### 문제점
현재 `N7.3_검색 및 필터` 항목에서 검색 기능이 없으면 **-1.0점** 감점으로 너무 가혹합니다.

### 해결 과정

#### 1. 현재 가중치 확인
```bash
curl -s http://localhost:3000/api/weights | jq '.weights.N7_3_search_filter'
```

**결과:**
```json
{
  "base_score": 3.0,
  "has_search_bonus": 1.5,
  "no_search_penalty": -1.0,  ← 이것이 문제!
  "description": "검색 기능 존재 시 가산점"
}
```

#### 2. config/weights.json 수정

**Before:**
```json
"N7_3_search_filter": {
  "base_score": 3.0,
  "has_search_bonus": 1.5,
  "no_search_penalty": -1.0
}
```

**After:**
```json
"N7_3_search_filter": {
  "base_score": 3.5,              // 3.0 → 3.5 (기본 점수 상향)
  "has_search_bonus": 1.0,        // 1.5 → 1.0 (보너스 하향)
  "no_search_penalty": -0.5       // -1.0 → -0.5 (패널티 완화) ✅
}
```

#### 3. 서비스 재시작
```bash
cd /home/user/webapp
npm run build
pm2 restart autoanalyzer
```

#### 4. 결과 비교

**테스트 사이트**: https://www.naver.com (검색 있음) vs https://example.com (검색 없음)

**Before 수정 전:**
- Naver (검색 있음): N7.3 점수 4.5점
- Example (검색 없음): N7.3 점수 2.0점
- **점수 차이**: 2.5점

**After 수정 후:**
- Naver (검색 있음): N7.3 점수 4.5점
- Example (검색 없음): N7.3 점수 3.0점
- **점수 차이**: 1.5점 (완화됨! ✅)

---

## 실제 테스트 명령어

### 1. 현재 가중치 확인
```bash
curl -s http://localhost:3000/api/weights | jq '.weights.N7_3_search_filter'
```

### 2. 특정 사이트 N7.3 점수 확인
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.naver.com"}' -s \
  | jq '.predicted_score.convenience_items[] | select(.item_id == "N7_3")'
```

### 3. 전체 점수 비교
```bash
# Before 수정 전
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.google.com"}' -s \
  | jq '{overall: .predicted_score.overall, N7_3: (.predicted_score.convenience_items[] | select(.item_id == "N7_3") | .score)}'

# config/weights.json 수정 후

# After 수정 후
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.google.com"}' -s \
  | jq '{overall: .predicted_score.overall, N7_3: (.predicted_score.convenience_items[] | select(.item_id == "N7_3") | .score)}'
```

---

## 추가 데모 시나리오

### 시나리오 2: "Breadcrumb을 더 중요하게 평가하고 싶다"

**config/weights.json 수정:**
```json
"N1_1_current_location": {
  "base_score": 3.5,
  "has_feature_bonus": 2.0,      // 1.5 → 2.0 (가산점 증가)
  "no_feature_penalty": -1.5     // -1.0 → -1.5 (감점 증가)
}
```

### 시나리오 3: "디자인 평가를 전반적으로 관대하게"

**config/weights.json에서 N8_1, N8_2, N8_3 모두 수정:**
```json
"N8_1_essential_info": {
  "base_score": 4.0,              // 3.5 → 4.0
  "optimal_bonus": 1.0,
  "suboptimal_penalty": -0.3      // -0.5 → -0.3
},
"N8_2_clean_interface": {
  "base_score": 4.0,              // 3.5 → 4.0
  "good_bonus": 1.0,
  "excessive_penalty": -0.3       // -0.5 → -0.3
},
"N8_3_visual_hierarchy": {
  "base_score": 4.0,              // 3.5 → 4.0
  "optimal_bonus": 1.5,
  "low_penalty": -0.8             // -1.0 → -0.8
}
```

---

## 📊 변경 효과 시뮬레이션

### 1개 항목 수정의 전체 점수 영향

**N7.3 검색 필터 가중치 변경:**
- 가중치 차이: -1.0 → -0.5 (0.5점 완화)
- 전체 26개 항목 중 1개
- **전체 점수 영향**: 약 +0.02점 (0.5 / 26)

**실제로 체감되려면:**
- 5개 이상 항목을 조정하거나
- 더 큰 가중치 변경 필요 (예: -1.0 → 0)

---

## ✅ 장점 요약

1. **코드 수정 없음**: JSON 파일만 편집
2. **즉시 반영**: 서비스 재시작만으로 적용
3. **롤백 쉬움**: 백업 파일로 복원
4. **실험 가능**: 다양한 가중치 조합 테스트
5. **투명성**: 누구나 가중치 기준 확인 가능

---

## 🎓 학습 포인트

- **가중치가 클수록**: 해당 기능의 중요도가 높음
- **Base score가 높을수록**: 평균적으로 높은 점수 부여
- **Penalty가 클수록**: 해당 기능 부재 시 더 큰 감점
- **균형 중요**: 모든 항목을 너무 높거나 낮게 설정하지 말 것

---

## 📝 체크리스트

- [ ] weights.json 백업 완료
- [ ] 수정 전 현재 점수 기록
- [ ] 가중치 수정
- [ ] 빌드 및 재시작
- [ ] 동일 사이트로 재테스트
- [ ] 변경 효과 확인
- [ ] 만족스러우면 커밋, 아니면 롤백
