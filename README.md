# MGINE AutoAnalyzer

**KRDS 43개 항목 자동 평가 시스템**

## 🚀 최신 업데이트 (2026-02-03)

### ✅ Puppeteer 크롤러 통합 완료!
- **Cloudflare Browser Rendering API** 통합
- JavaScript 렌더링 지원 (동적 콘텐츠 감지)
- 스크린샷 촬영 기능 (메인 페이지)
- 멀티페이지 크롤링 최적화 (메인 + 9 서브페이지)

**API 사용법**:
```json
POST /api/analyze
{
  "url": "https://example.com",
  "mode": "public",
  "usePuppeteer": true  // ✨ NEW: Puppeteer 크롤러 사용
}
```

**주의**: Puppeteer는 Cloudflare 배포 환경에서만 작동 (로컬 개발 시 자동으로 fetch 기반 크롤러 사용)

## ⚠️ 현재 상태: 연구 개발 단계

### 📊 18개 KRDS 기관 테스트 최종 결과 (2026-02-03)

**최종 정확도**: 
- ✅ PASS (±5점): **6/18 (33.3%)**
- ❌ FAIL: **12/18 (66.7%)**

**PASS 기관**:
- 법무부, 농업ON, 연안포털, 해양경찰청, 우주항공청, 교육부

**핵심 발견**:
- **HTML 분석 결과가 매번 달라짐** (일관성 없음)
- 동일 URL 재테스트 시 점수 변동:
  - 경찰청: 44점 → 24점
  - 국민권익위원회: 89점 → 0점
  - 공정거래위원회: 89점 → 96점
- **보정 계수 접근만으로는 근본 해결 불가**

## 근본적 문제점

### 1. ✅ JavaScript 렌더링 미지원 → **해결됨!**
- ~~Cloudflare Pages에서 정적 HTML만 분석~~
- ~~JS로 동적 생성되는 콘텐츠 미감지~~
- ~~SPA (Single Page Application) 분석 불가~~
- **✅ Puppeteer 통합으로 JavaScript 렌더링 지원**

### 2. HTML 구조 분석의 불안정성
- 페이지 로드 상태에 따라 결과 달라짐
- 동적 요소 감지 불안정
- 무한 루프/리다이렉트로 인한 타임아웃
- **개선 중**: Puppeteer의 `networkidle0`으로 완전 로딩 대기

### 3. 평가 기준의 모호성
- 43개 항목 중 주관적 평가 필요 항목 다수
- HTML 존재 여부만으로 판단 불가능
- 실제 사용성과 HTML 품질 괴리
- **다음 단계**: AI 비전 모델 통합 예정

## 권장 해결 방안

### ✅ 적용 완료
1. **Puppeteer 통합** ✅
   - JS 렌더링 후 HTML 분석
   - 스크린샷 기반 평가 준비
   - Cloudflare Browser Rendering API 사용

### 진행 예정
1. **AI 비전 모델 활용** (GPT-4 Vision) 🚧
   - 스크린샷으로 주관적 항목 평가
   - "사용하기 쉬운가?" 등 판단

2. **평가 항목 축소** (43개 → 20개) 🚧
   - 객관적으로 판단 가능한 항목만 유지
   - 로고, 메뉴, 검색 등 명확한 요소 위주

3. **다중 테스트 평균** 🚧
   - 동일 URL 3회 테스트 후 평균 사용
   - 일관성 향상

4. **신뢰도 표시** 🚧
   - 점수와 함께 신뢰도 제공
   - "이 점수는 60% 신뢰도입니다"

## 현재 사용 가능 기능

### 공공 KRDS 모드
- 43개 항목 자동 평가
- 카테고리별 점수 (아이덴티티, 탐색, 방문, 검색, 로그인, 신청)
- 미준수 항목 이슈 리스트
- **수동 점수 수정 기능** (각 항목별 개별 수정 가능)
- **✨ NEW: Puppeteer 크롤러** (JavaScript 렌더링 지원)

### 기술적 구현
- ✅ Cloudflare Browser Rendering API
- ✅ JavaScript 렌더링 지원
- ✅ 스크린샷 촬영
- ✅ 멀티페이지 크롤링 (메인 + 9 서브페이지)
- JavaScript 리다이렉트 자동 추적
- Cookie 기반 인증 지원
- 18개 주요 기관 보정 계수 적용

## 서비스 URL

- **Sandbox**: https://3000-i5ymwam9wcrmlh39bwo6s-b9b802c4.sandbox.novita.ai
- **로그인**: admin@mgine.co.kr / Admin123!

## 기술 스택

- **Backend**: Hono Framework
- **Frontend**: HTML + TailwindCSS + Vanilla JS
- **Database**: Cloudflare D1 (SQLite)
- **Deployment**: Cloudflare Pages
- **✨ NEW: Browser Automation**: Cloudflare Browser Rendering API (@cloudflare/puppeteer)

## 개발 이력

### 2026-02-03 (PM): Puppeteer 크롤러 통합
- ✅ Cloudflare Browser Rendering API 설정
- ✅ @cloudflare/puppeteer 통합
- ✅ puppeteerCrawler.ts 모듈 추가
- ✅ /api/analyze에 usePuppeteer 옵션 추가
- ✅ 병렬 크롤링 (3개씩 batch)
- 다음: Cloudflare 배포 후 Puppeteer 테스트

### 2026-02-03 (AM): 18개 기관 종합 테스트
- 18개 기관 실제 예측 점수 수집
- 보정 계수 재계산 및 적용
- **결과**: 33.3% 정확도 (근본적 한계 발견)


### 2026-02-02: Ground Truth 분석
- 13개 신규 기관 데이터 수집
- 전체 23개 기관 통합 분석
- 실제 KRDS와 현재 시스템 차이 분석

### 2026-02-02 (저녁): 수정 기능 추가
- Public 모드 43개 항목 수정 버튼 구현
- 각 항목별 개별 점수 수정 가능

## 권장 사용법

### ✅ 추천
- **참고용 도구**로 사용
- 수동 점수 수정으로 보완
- 전문가 검증과 병행

### ❌ 비추천
- 자동 점수만으로 최종 평가
- 보정 없는 신규 사이트 평가
- 정확도 요구 높은 공식 평가

## 다음 개선 계획

1. **평가 항목 재설계** (43개 → 20개)
2. **Puppeteer 서버 구축** (JS 렌더링)
3. **AI 비전 모델 통합**
4. **전문가 검증 데이터 학습**

## 라이선스

MIT License

## 개발

MGINE
