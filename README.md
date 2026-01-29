# AutoAnalyzer - UI/UX 자동 분석 시스템

## 프로젝트 개요
49개 공공기관의 국민평가 데이터(6개 연령대)를 분석하여 UI/UX 점수를 시각화하는 웹 애플리케이션

### 주요 기능
- ✅ 연령대별 평가 점수 분석 (20대, 30대, 40대, 50대, 60대이상, 디지털취약계층)
- ✅ Q1~Q10 항목별 점수 추적
- ✅ 최고/최저 점수 기관 순위
- ✅ 인터랙티브 차트 및 테이블
- ✅ 기관별 상세 정보 모달

---

## 프로젝트 구조

```
webapp/
├── analysis/                    # Python 분석 스크립트 (로컬 실행)
│   ├── data/                    # Excel 원본 데이터
│   ├── output/                  # 생성된 JSON 파일
│   ├── age_analyzer.py          # 연령별 분석 스크립트
│   └── requirements.txt         # Python 패키지
│
└── web/                         # 웹 서버 업로드 파일 (FTP)
    ├── index.html               # 메인 페이지
    ├── css/
    │   └── style.css            # 스타일시트
    ├── js/
    │   └── app.js               # JavaScript 애플리케이션
    ├── api/                     # PHP API 엔드포인트
    │   ├── get_sites.php
    │   ├── get_rankings.php
    │   └── get_age_groups.php
    └── data/                    # JSON 데이터 파일
        ├── site_averages.json
        ├── rankings.json
        ├── age_group_summary.json
        └── analysis_results.json
```

---

## 사용 방법

### 1단계: 로컬 PC에서 데이터 분석

#### Python 환경 설정
```bash
cd analysis
pip install -r requirements.txt
```

#### Excel 데이터 준비
`analysis/data/` 폴더에 다음 파일을 배치:
- UI_UX 평가시스템_20대.xlsx
- UI_UX 평가시스템_30대.xlsx
- UI_UX 평가시스템_40대.xlsx
- UI_UX 평가시스템_50대.xlsx
- UI_UX 평가시스템_60대이상.xlsx
- UI_UX 평가시스템_디지털취약계층.xlsx

#### 분석 실행
```bash
python age_analyzer.py
```

결과: `analysis/output/` 폴더에 JSON 파일 생성

### 2단계: JSON 파일을 웹 서버로 복사

`analysis/output/` 폴더의 모든 JSON 파일을 `web/data/` 폴더로 복사:
```bash
cp analysis/output/*.json web/data/
```

### 3단계: FTP로 웹 서버에 업로드

#### FTP 업로드 파일 목록
```
web/
├── index.html
├── css/style.css
├── js/app.js
├── api/
│   ├── get_sites.php
│   ├── get_rankings.php
│   └── get_age_groups.php
└── data/
    ├── site_averages.json
    ├── rankings.json
    ├── age_group_summary.json
    └── analysis_results.json
```

#### FileZilla 사용 예시
1. FileZilla 열기
2. 호스트, 사용자명, 비밀번호 입력
3. 연결
4. `web/` 폴더의 모든 파일을 서버의 `public_html/` 또는 `www/` 폴더로 업로드

#### 명령줄 FTP 사용 예시
```bash
ftp your-server.com
# 사용자명과 비밀번호 입력
cd public_html
lcd web
mput *
```

---

## 기술 스택

### 프론트엔드
- HTML5 / CSS3
- JavaScript (Vanilla JS)
- Chart.js (데이터 시각화)
- Font Awesome (아이콘)

### 백엔드
- PHP 7.4+ (API 엔드포인트)
- JSON (데이터 저장)

### 데이터 분석
- Python 3.8+
- pandas (데이터 처리)
- numpy (수치 계산)
- openpyxl (Excel 파일 읽기)

---

## 데이터 구조

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

## 웹 서버 요구사항

- PHP 7.4 이상
- 웹 서버 (Apache, Nginx 등)
- JSON 파일 읽기 권한
- CORS 설정 (필요 시)

---

## 업데이트 방법

### 데이터 업데이트
1. 새로운 Excel 파일을 `analysis/data/` 폴더에 배치
2. `python age_analyzer.py` 실행
3. 생성된 JSON 파일을 `web/data/` 폴더로 복사
4. FTP로 서버에 업로드

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
