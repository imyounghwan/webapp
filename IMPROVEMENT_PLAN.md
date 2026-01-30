# 평가 기준 자동 업데이트 시스템 개선 계획

## 현재 시스템의 한계

### 1. 하드코딩된 평가 기준
```typescript
// 현재: 고정된 수치
N1_1_current_location: calculateScore(3.5, navigation.breadcrumbExists ? 1.5 : -1.0)
```

**문제점:**
- 새로운 데이터가 나와도 수동으로 코드 수정 필요
- 49개 기관 평균(3.79점)을 기준으로 만들었지만, 새 데이터 반영 안 됨
- 디자인 평가는 HTML 구조만 보고 시각적 품질은 판단 못함

### 2. 정적 참고 데이터
```json
{
  "statistics": {
    "total_agencies": 49,
    "average_score": 3.79,
    "highest_score": 4.29,
    "lowest_score": 2.7
  }
}
```

**문제점:**
- 2024년 데이터 기준으로 고정
- 신규 국민평가 결과 나와도 수동 업데이트 필요

---

## 개선 방안

### 옵션 1: 데이터 기반 동적 기준선 (추천) ⭐

**개념:**
- 참고 데이터를 주기적으로 업데이트
- 평가 기준(가중치)를 데이터 통계로부터 자동 계산

**구현 방법:**

#### A. 참고 데이터 자동 업데이트
```typescript
// src/data/referenceDataUpdater.ts

interface ReferenceData {
  lastUpdated: string
  statistics: {
    total_agencies: number
    average_score: number
    highest_score: number
    lowest_score: number
    score_distribution: {
      excellent: number  // 4.5+ 비율
      good: number      // 3.5-4.4 비율
      average: number   // 2.5-3.4 비율
      poor: number      // <2.5 비율
    }
  }
  agencies: Array<{
    site_name: string
    score: number
    nielsen_10_principles: Record<string, number>
  }>
}

// 국민신문고 API에서 최신 데이터 가져오기 (월 1회 자동 실행)
async function updateReferenceData(): Promise<ReferenceData> {
  // 1. 국민신문고 오픈 API 호출
  const newData = await fetch('https://www.epeople.go.kr/api/...')
  
  // 2. JSON 파일 업데이트
  await writeFile('final_integrated_scores.json', JSON.stringify(newData))
  
  // 3. 통계 재계산
  return calculateStatistics(newData)
}
```

#### B. 동적 가중치 계산
```typescript
// src/analyzer/dynamicWeights.ts

interface DynamicWeights {
  // 각 항목별 가중치를 데이터로부터 학습
  N1_1_breadcrumb_weight: number
  N2_3_icon_threshold: number
  N8_1_content_ratio: number
  // ... 26개 항목
}

function calculateWeights(referenceData: ReferenceData): DynamicWeights {
  const { agencies } = referenceData
  
  // 예: Breadcrumb이 있는 사이트의 평균 점수 vs 없는 사이트
  const withBreadcrumb = agencies.filter(a => a.has_breadcrumb)
  const withoutBreadcrumb = agencies.filter(a => !a.has_breadcrumb)
  
  const avgWithBreadcrumb = average(withBreadcrumb.map(a => a.score))
  const avgWithoutBreadcrumb = average(withoutBreadcrumb.map(a => a.score))
  
  // 가중치 = 차이를 기반으로 계산
  const breadcrumbWeight = (avgWithBreadcrumb - avgWithoutBreadcrumb) * 2
  
  return {
    N1_1_breadcrumb_weight: breadcrumbWeight,
    // ... 다른 항목들도 동일하게 계산
  }
}
```

#### C. 적용된 평가 로직
```typescript
// src/analyzer/nielsenImproved.ts (개선 후)

export function calculateImprovedNielsen(
  structure: HTMLStructure,
  weights: DynamicWeights  // 데이터 기반 가중치 주입
): ImprovedNielsenScores {
  return {
    N1_1_current_location: calculateScore(
      3.5,
      navigation.breadcrumbExists ? weights.N1_1_breadcrumb_weight : -1.0
    ),
    // ... 다른 항목들
  }
}
```

**장점:**
- ✅ 새로운 국민평가 데이터가 나오면 자동으로 기준 업데이트
- ✅ 코드 수정 없이 가중치만 조정
- ✅ 실제 공공기관 데이터 기반이므로 신뢰도 높음

**단점:**
- ⚠️ 여전히 HTML 구조 기반 평가 (시각적 디자인은 못 봄)
- ⚠️ 국민신문고 API 연동 필요

---

### 옵션 2: AI 기반 시각적 디자인 평가 추가 (디자인 평가 개선) 🎨

**개념:**
- 스크린샷을 찍어서 AI가 시각적 품질 평가
- GPT-4 Vision, Claude 3.5 Sonnet 등 활용

**구현 방법:**

```typescript
// src/analyzer/visualDesignAnalyzer.ts

import { analyzeImage } from './aiVision'

interface VisualDesignScores {
  color_harmony: number        // 색상 조화
  typography_quality: number   // 타이포그래피 품질
  layout_balance: number       // 레이아웃 균형
  whitespace_usage: number     // 여백 활용
  visual_hierarchy: number     // 시각적 계층
}

async function analyzeVisualDesign(url: string): Promise<VisualDesignScores> {
  // 1. Playwright로 스크린샷 촬영
  const screenshot = await captureScreenshot(url)
  
  // 2. AI Vision API로 분석
  const prompt = `
    이 웹사이트 디자인을 다음 기준으로 평가해주세요 (각 2.0~5.0점):
    1. 색상 조화 (Color Harmony): 색상 팔레트가 조화롭고 브랜드 일관성이 있는가?
    2. 타이포그래피 (Typography): 글꼴 선택과 크기, 줄 간격이 가독성 있는가?
    3. 레이아웃 균형 (Layout Balance): 요소 배치가 균형있고 시선 흐름이 자연스러운가?
    4. 여백 활용 (Whitespace): 적절한 여백으로 답답하지 않은가?
    5. 시각적 계층 (Visual Hierarchy): 중요한 정보가 눈에 잘 띄는가?
    
    참고: 49개 한국 공공기관 평균 점수는 3.79점입니다.
  `
  
  const result = await analyzeImage(screenshot, prompt)
  
  return {
    color_harmony: result.color_harmony,
    typography_quality: result.typography,
    layout_balance: result.layout,
    whitespace_usage: result.whitespace,
    visual_hierarchy: result.hierarchy
  }
}
```

**통합:**
```typescript
// 기존 HTML 구조 분석 + AI 시각적 분석 결합
const htmlScores = calculateImprovedNielsen(structure)
const visualScores = await analyzeVisualDesign(url)

// 디자인 항목은 AI 분석 결과 활용
const finalScores = {
  ...htmlScores,
  N2_3_real_world_metaphor: visualScores.visual_hierarchy,
  N4_1_visual_consistency: visualScores.color_harmony,
  N8_2_clean_interface: visualScores.whitespace_usage,
  // ...
}
```

**장점:**
- ✅ 실제 시각적 디자인 품질 평가 가능
- ✅ 색상, 타이포그래피 등 미학적 요소 판단
- ✅ 최신 AI 모델 활용 시 지속적으로 정확도 향상

**단점:**
- ⚠️ 비용 발생 (스크린샷 + AI API 호출)
- ⚠️ 분석 시간 증가 (현재 3~5초 → 10~15초)
- ⚠️ AI 판단의 일관성 보장 어려움

---

### 옵션 3: 하이브리드 접근 (옵션1 + 옵션2) 🚀

**개념:**
- 기본: 데이터 기반 동적 기준선 (옵션1)
- 디자인 항목만: AI 시각적 평가 (옵션2)

**구현:**
```typescript
// 편의성 항목 (21개): HTML 구조 + 동적 가중치
const convenienceScores = calculateWithDynamicWeights(structure, weights)

// 디자인 항목 (5개): AI 시각적 평가
const designScores = await analyzeVisualDesign(url)

// 최종 26개 항목
const allScores = {
  ...convenienceScores,  // N1.1 ~ N10.2 (편의성)
  ...designScores        // N2.3, N4.1, N8.1, N8.2, N8.3 (디자인)
}
```

**장점:**
- ✅ 편의성: 빠르고 정확한 HTML 분석 + 데이터 기반 업데이트
- ✅ 디자인: 실제 시각적 품질 AI 평가
- ✅ 비용 최소화 (5개 항목만 AI 사용)

**단점:**
- ⚠️ 구현 복잡도 높음
- ⚠️ 여전히 비용 발생

---

## 추천 로드맵

### Phase 1: 데이터 자동 업데이트 (1~2주) ⭐ 우선 추천
1. 국민신문고 API 연동
2. 월 1회 자동 데이터 갱신 (Cloudflare Cron Trigger)
3. 동적 가중치 계산 로직 구현
4. 상대 평가 백분위 자동 업데이트

### Phase 2: AI 디자인 평가 추가 (2~3주)
1. Playwright 스크린샷 기능
2. GPT-4 Vision / Claude 3.5 Sonnet 연동
3. 디자인 항목 5개만 AI 평가
4. 비용/속도 최적화

### Phase 3: 학습 시스템 (장기)
1. 사용자 평가 데이터 수집
2. 실제 사용자 만족도 vs AI 점수 비교
3. 가중치 자동 튜닝 (ML 모델)

---

## 즉시 구현 가능한 간단한 개선

지금 당장 코드 수정 없이 할 수 있는 것:

### 1. 참고 데이터 JSON 파일만 교체
```bash
# 새로운 국민평가 결과가 나오면
cp new_evaluation_data.json analysis/output/final_integrated_scores.json

# 서비스 재시작
pm2 restart autoanalyzer
```

→ 상대 평가 백분위가 새 데이터 기준으로 자동 변경됨

### 2. 가중치 설정 파일 분리
```typescript
// config/weights.json (신규 생성)
{
  "N1_1_breadcrumb_weight": 1.5,
  "N2_3_icon_threshold": 5,
  "N8_1_content_density": 0.3,
  "last_updated": "2024-01-30"
}

// 코드에서 로드
const weights = await loadWeights()
```

→ 코드 수정 없이 설정 파일만 변경하면 가중치 조정 가능

---

## 결론

**질문에 대한 답:**

> "데이터가 쌓이면 쌓이는 데로 이 결과를 업데이트 시켜주면 너의 평가기준도 바뀌는건지?"

**현재는 아니지만, 가능하게 만들 수 있습니다:**

1. **✅ 쉬운 방법** (지금 바로 가능):
   - `final_integrated_scores.json` 파일만 교체 → 상대 평가 기준 변경
   
2. **✅ 추천 방법** (1~2주 개발):
   - 옵션 1 구현 → 국민평가 데이터 자동 업데이트 + 동적 가중치
   
3. **✅ 완벽한 방법** (1~2개월):
   - 옵션 3 구현 → 데이터 기반 자동 업데이트 + AI 디자인 평가

**특히 디자인 평가는:**
- 현재: HTML만 보고 판단 (아이콘 개수, 이미지 개수 등) ❌
- 개선 후: 실제 스크린샷을 AI가 보고 색상/타이포/레이아웃 평가 ✅

어떤 옵션으로 진행하시겠습니까?
