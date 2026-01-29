# AutoAnalyzer - 실시간 UI/UX 자동 분석 시스템

## 🎯 프로젝트 개요
**49개 공공기관의 실제 데이터를 학습**하여 **임의의 웹사이트를 실시간으로 평가**하는 AI 기반 UI/UX 분석 시스템

### ⚡ NEW! 실시간 분석 기능
- ✅ **임의의 URL 입력 → 즉시 평가** (추가 비용 없음!)
- ✅ **49개 기관 데이터 기반 유사도 분석**
- ✅ **Nielsen 10원칙 자동 평가**
- ✅ **개선 권장사항 자동 생성**

### 핵심 특징 🚀
- **데이터 기반 평가**: 49개 기관 × 6개 연령대 = 294 데이터포인트
- **Nielsen 10원칙 기반**: 과학적 사용성 평가 체계
- **25개 세부 항목**: 심층 분석 및 구체적 진단
- **실시간 분석**: HTML 구조 파싱 + 유사도 계산 + Nielsen 매핑
- **무료 사용**: 외부 API 없이 자체 데이터로 분석

---

## 🎬 데모

**공개 URL**: https://3000-i5ymwam9wcrmlh39bwo6s-a402f90a.sandbox.novita.ai

### 사용 방법
1. 웹사이트에 접속
2. "실시간 URL 분석" 섹션에 URL 입력 (예: `https://www.naver.com`)
3. "분석하기" 버튼 클릭
4. 결과 확인:
   - **종합 점수** (0~5점)
   - **편의성 점수** (접근성, 네비게이션 중심)
   - **디자인 점수** (시각적 요소 중심)
   - **Nielsen 10원칙 점수** (각 원칙별 점수 + 시각화)
   - **유사 사이트 TOP 5** (어떤 기관과 유사한지)
   - **개선 권장사항** (구체적 실행 방안)

### 테스트 결과 예시
- **naver.com**: 4.24점 (국무조정실 4.29 등과 유사)
- **mois.go.kr**: 3.76점 (접근성 미흡, Skip Link 부재)

---
- ✅ **Nielsen 10원칙 상세 분석**: 25개 세부 항목으로 확장된 사용성 평가
  - N1: 시스템 상태 가시성 (3개 항목)
  - N2: 시스템과 현실의 일치 (3개 항목)
  - N3: 사용자 제어 및 자유도 (3개 항목)
  - N4: 일관성 및 표준 (3개 항목)
  - N5: 오류 예방 (3개 항목)
  - N6: 기억보다 인식 (3개 항목)
  - N7: 유연성 및 효율성 (3개 항목)
  - N8: 미니멀한 디자인 (3개 항목)
  - N9: 오류 복구 지원 (3개 항목)
  - N10: 도움말 및 문서 (3개 항목)
- ✅ **구체적 진단**: 각 항목별 "왜 이 점수인가?" 설명
- ✅ **개선 방안**: 실행 가능한 UI/UX 개선 제안
- ✅ **연령대별 평가 점수 분석** (20대, 30대, 40대, 50대, 60대이상, 디지털취약계층)
- ✅ **Q1~Q10 항목별 점수 추적**
- ✅ **최고/최저 점수 기관 순위**
- ✅ **인터랙티브 차트 및 테이블**
- ✅ **기관별 상세 정보 모달**

---

## 🔧 실시간 분석 작동 원리

### 1단계: HTML 구조 파싱
```
URL 입력 → fetch HTML → 정규식 파싱
```

**분석 항목**:
- **네비게이션**: 메뉴, 링크, Breadcrumb, 검색 기능
- **접근성**: alt 텍스트, ARIA 레이블, lang 속성, Skip Link
- **콘텐츠**: 헤딩 구조, 문단, 리스트, 테이블
- **폼**: 입력 필드, label 연결, validation
- **시각적 요소**: 이미지, 비디오, 아이콘

### 2단계: 유사도 계산
49개 기관과 구조적 유사도 비교 (0~100점)

**가중치**:
- 접근성: **30%** (가장 중요)
- 네비게이션: **20%**
- 콘텐츠: **20%**
- 폼: **15%**
- 시각적 요소: **15%**

### 3단계: 점수 예측
유사한 상위 5개 기관의 점수를 가중 평균

**예시**:
```
유사 사이트:
1. 국무조정실 (4.29점, 유사도 44%)
2. 해양수산부 (4.27점, 유사도 44%)
3. 국민권익위원회 (4.25점, 유사도 44%)
...

→ 예측 점수: 4.24점
```

### 4단계: Nielsen 10원칙 매핑
HTML 구조 분석 결과를 Nielsen 원칙에 자동 매핑

**매핑 규칙**:
- **N1 (시스템 상태 가시성)**: Breadcrumb + 검색 기능 → +0.5점
- **N5 (오류 예방)**: 폼 validation + label 비율 → +0.6점
- **N6 (인식보다 회상)**: 검색 + Breadcrumb → +0.5점
- **N10 (도움말)**: 콘텐츠 구조 분석 → 기본 점수

### 5단계: 개선 제안 생성
낮은 점수 항목에 대한 구체적 개선 방안 자동 생성

**예시**:
- `altTextRatio < 0.9` → "🔍 모든 이미지에 대체 텍스트(alt)를 추가하세요"
- `!skipLinkExists` → "⚡ 스크린리더 사용자를 위한 Skip Link를 추가하세요"
- `!searchExists` → "🔎 사이트 내 검색 기능을 추가하세요"

---

## 📊 Nielsen 분석 예시

### 고용노동부 (종합 4.48/5.0)

**N3.1 뒤로가기/취소 기능: 4.75/5.0** ✅
- **진단**: 모든 페이지에 '이전' 버튼이 명확히 표시되며, 브라우저 뒤로가기도 정상 작동합니다.
- **평가**: Excellent

**N3.2 임시 저장 기능: 3.40/5.0** ⚠️
- **진단**: 임시 저장 기능이 없어 사용자가 실수로 페이지를 닫으면 모든 입력이 날아갑니다.
- **개선 방안**: 5분마다 자동 저장하고, '마지막 저장: 2분 전' 메시지를 표시하세요. '임시 저장' 버튼을 우측 하단에 배치하세요.
- **평가**: Poor → **예상 개선 효과: 3.40 → 4.50 (+1.10점)**

---

## 프로젝트 구조

```
webapp/
├── src/                         # Hono 백엔드 (TypeScript)
│   ├── index.tsx                # 메인 서버 + API 라우팅
│   └── analyzer/                # 실시간 분석 엔진 (NEW!)
│       ├── htmlAnalyzer.ts      # HTML 구조 파싱
│       └── similarityCalculator.ts  # 유사도 계산 + Nielsen 매핑
│
├── analysis/                    # Python 분석 스크립트 (로컬)
│   ├── krds_extractor.py        # KRDS Word 문서 파싱
│   ├── krds_image_extractor.py  # KRDS 이미지 추출 (787개)
│   ├── krds_image_analyzer.py   # AI 이미지 분석
│   ├── heuristic_extractor.py   # 휴리스틱 Excel 파싱 (49개)
│   ├── heuristic_nielsen_mapper.py  # 휴리스틱 → Nielsen 매핑
│   ├── final_integrator.py      # 3개 데이터 소스 통합
│   └── output/                  # 생성된 JSON 파일
│       ├── final_integrated_scores.json  # 최종 통합 점수
│       ├── integrated_nielsen_scores.json
│       └── ...
│
├── public/                      # 정적 파일 (Cloudflare Pages 배포)
│   ├── index.html               # 웹 대시보드
│   ├── css/style.css
│   ├── js/app.js                # 프론트엔드 로직 (실시간 분석 포함)
│   └── data/                    # JSON 데이터
│       ├── final_integrated_scores.json  # 49개 기관 통합 데이터
│       ├── nielsen_detailed_reports.json
│       └── ...
│
├── dist/                        # 빌드 결과 (Vite)
│   └── _worker.js               # Cloudflare Workers 번들
│
├── package.json                 # Node.js 의존성
├── tsconfig.json                # TypeScript 설정
├── vite.config.ts               # Vite 빌드 설정
└── README.md                    # 본 문서
```

---

## 사용 방법

### 옵션 1: 공개 데모 사용 (가장 간단)
**URL**: https://3000-i5ymwam9wcrmlh39bwo6s-a402f90a.sandbox.novita.ai

1. 웹사이트 접속
2. URL 입력 (예: `https://example.com`)
3. "분석하기" 버튼 클릭
4. 결과 확인

### 옵션 2: 로컬 개발 (개발자용)

#### 1. 저장소 클론
```bash
git clone https://github.com/yourusername/webapp.git
cd webapp
```

#### 2. 의존성 설치
```bash
npm install
```

#### 3. 빌드
```bash
npm run build
```

#### 4. 로컬 서버 실행
```bash
# PM2 사용 (추천)
pm2 start ecosystem.config.cjs

# 또는 직접 실행
npx wrangler pages dev dist --ip 0.0.0.0 --port 3000
```

#### 5. 브라우저에서 열기
```
http://localhost:3000
```

### 옵션 3: Cloudflare Pages 배포 (프로덕션)

#### 1. Cloudflare API 설정
```bash
# setup_cloudflare_api_key 도구 실행 (Deploy 탭에서 API 키 설정 필요)
```

#### 2. 빌드
```bash
npm run build
```

#### 3. 배포
```bash
# 프로젝트 생성 (최초 1회)
npx wrangler pages project create autoanalyzer \
  --production-branch main

# 배포
npx wrangler pages deploy dist --project-name autoanalyzer
```

#### 4. 환경 변수 설정 (필요 시)
```bash
npx wrangler pages secret put API_KEY --project-name autoanalyzer
```

---

## 📊 데이터 업데이트 방법

### 1단계: Python 분석 스크립트 실행 (로컬)

#### Excel 데이터 준비
`/home/user/uploaded_files/` 폴더에 다음 파일 업로드:
- UI_UX 평가시스템_20대.xlsx
- UI_UX 평가시스템_30대.xlsx
- UI_UX 평가시스템_40대.xlsx
- UI_UX 평가시스템_50대.xlsx
- UI_UX 평가시스템_60대이상.xlsx
- UI_UX 평가시스템_디지털취약계층.xlsx
- KRDS Word 문서 10개
- 휴리스틱 평가 Excel 49개

#### 분석 실행
```bash
cd /home/user/webapp/analysis

# 1. KRDS 데이터 추출
python krds_extractor.py

# 2. KRDS 이미지 추출 (787개)
python krds_image_extractor.py

# 3. 휴리스틱 평가 추출 (49개)
python heuristic_extractor.py

# 4. 휴리스틱 → Nielsen 매핑
python heuristic_nielsen_mapper.py

# 5. 최종 통합
python final_integrator.py
```

#### 결과
`analysis/output/` 폴더에 JSON 파일 생성:
- `final_integrated_scores.json`: **최종 통합 점수** (49개 기관)
- `integrated_nielsen_scores.json`: Nielsen 통합 점수
- `nielsen_detailed_reports.json`: Nielsen 상세 분석
- `krds_convenience_scores.json`: KRDS 편의성 점수
- `age_group_summary.json`: 연령대별 요약
- `site_averages.json`: 기관별 평균 점수
- `rankings.json`: 최고/최저 점수 순위

### 2단계: JSON 파일 복사
```bash
cp analysis/output/*.json public/data/
```

### 3단계: 재배포
```bash
npm run build
npx wrangler pages deploy dist --project-name autoanalyzer
```

---

## 기술 스택

### 프론트엔드
- HTML5 / CSS3
- JavaScript (Vanilla JS)
- Chart.js (데이터 시각화)
- Font Awesome (아이콘)
- Tailwind CSS (스타일링)

### 백엔드
- **Hono** (Lightweight Web Framework)
- **TypeScript** (타입 안정성)
- **Cloudflare Workers** (Edge Runtime)
- **Vite** (빌드 도구)

### 데이터 분석
- Python 3.8+
- pandas (데이터 처리)
- numpy (수치 계산)
- openpyxl (Excel 파일 읽기)
- python-docx (Word 문서 파싱)

### 배포
- **Cloudflare Pages** (정적 사이트 호스팅)
- **Cloudflare Workers** (서버리스 API)

---

## 데이터 구조

### nielsen_detailed_reports.json (NEW!)
**Nielsen 10원칙 기반 25개 항목 상세 분석**
```json
[
  {
    "site_name": "고용노동부",
    "overall_score": 4.48,
    "principles": {
      "N1_visibility": {
        "name": "시스템 상태 가시성",
        "weight": 0.10,
        "overall_score": 4.53,
        "items": {
          "N1.1": {
            "name": "현재 페이지 위치 표시",
            "score": 3.93,
            "level": "good",
            "diagnosis": "⚠️ Breadcrumb가 일부 페이지에서만 제공되거나 시각적으로 눈에 띄지 않습니다.",
            "improvement": "상단에 '홈 > 카테고리 > 현재페이지' 형태의 Breadcrumb을 추가하고..."
          },
          "N1.2": { ... },
          "N1.3": { ... }
        }
      },
      "N2_real_world": { ... },
      ...
    },
    "original_scores": {
      "Q1": 4.7,
      "Q2": 4.25,
      ...
    }
  }
]
```

**주요 필드 설명**:
- `overall_score`: Nielsen 종합 점수 (가중 평균)
- `principles`: 10개 원칙별 상세 분석
  - `overall_score`: 해당 원칙의 평균 점수
  - `items`: 각 원칙당 3개 세부 항목
    - `level`: `excellent` (4.5+), `good` (3.5~4.5), `poor` (<3.5)
    - `diagnosis`: 구체적 진단 (이모지 포함)
    - `improvement`: 실행 가능한 개선 방안

---

### site_averages.json
```json
[
  {
    "name": "고용노동부",
    "url": "https://www.moel.go.kr",
    "total_avg": 4.47,
    "convenience_avg": 4.49,
    "design_avg": 4.44,
    "scores": {
      "Q1": 4.7,
      "Q2": 4.25,
      ...
    },
    "age_groups": {
      "20대": { ... },
      "30대": { ... },
      ...
    }
  }
]
```

### rankings.json
```json
{
  "top_5": [ ... ],
  "bottom_5": [ ... ]
}
```

### age_group_summary.json
```json
{
  "20대": {
    "count": 49,
    "total_avg": 4.25,
    "convenience_avg": 4.28,
    "design_avg": 4.2
  },
  ...
}
```

---

## Nielsen 분석 활용 방법 🔍

### 1. 웹 인터페이스에서 확인
1. 기관 목록 테이블에서 🔬 아이콘 클릭
2. Nielsen 25개 항목 상세 리포트 확인
3. 낮은 점수 항목의 개선 방안 확인

### 2. JSON 데이터 직접 분석
```bash
# Nielsen 분석 결과 확인
cat web/data/nielsen_detailed_reports.json | jq '.[0].principles.N1_visibility.items'

# 특정 기관의 Nielsen 점수
cat web/data/nielsen_detailed_reports.json | jq '.[] | select(.site_name == "고용노동부")'

# 전체 기관의 Nielsen 종합 점수 순위
cat web/data/nielsen_detailed_reports.json | jq 'sort_by(-.overall_score) | .[0:5] | .[] | {name: .site_name, score: .overall_score}'
```

### 3. 개선 우선순위 결정
Nielsen 리포트의 "개선 우선순위" 섹션을 참고하여:
1. **낮은 점수 항목**부터 개선
2. **구체적 개선 방안** 실행
3. **예상 개선 효과** 확인

---

## 웹 서버 요구사항

- PHP 7.4 이상
- 웹 서버 (Apache, Nginx 등)
- JSON 파일 읽기 권한
- CORS 설정 (필요 시)

---

## 업데이트 방법

### 데이터 업데이트
1. 새로운 Excel 파일을 `analysis/data/` 폴더에 배치
2. `python age_analyzer.py` 실행 (기존 Q1~Q10 분석)
3. **`python nielsen_analyzer.py` 실행 (Nielsen 25개 항목 분석)** ← NEW!
4. 생성된 JSON 파일을 `web/data/` 폴더로 복사
5. FTP로 서버에 업로드

---

## 문제 해결

### JSON 파일을 찾을 수 없음
- `web/data/` 폴더에 JSON 파일이 있는지 확인
- FTP 업로드 시 폴더 구조가 올바른지 확인

### PHP 오류
- PHP 버전 확인 (7.4 이상)
- `json_decode` 함수 사용 가능 여부 확인
- 파일 읽기 권한 확인

### 차트가 표시되지 않음
- 브라우저 콘솔에서 JavaScript 오류 확인
- Chart.js CDN 로드 확인
- JSON 데이터 형식 확인

---

## 라이선스

Copyright © 2025 AutoAnalyzer. All rights reserved.

---

## 연락처

문의사항이 있으시면 연락주세요.
