# AutoAnalyzer - AI 기반 UI/UX 자동 분석

## 개요
49개 공공기관 데이터 기반 UI/UX 자동 분석 시스템

### 주요 기능
- AI 자동 분석 (Claude Vision)
- 국민평가 + 전문가 휴리스틱 평가 데이터 기반
- Nielsen 10가지 사용성 기준 (Q1~Q10)
- ML 모델 예측 (92% 정확도 목표)

## 기술 스택
- **백엔드**: Hono + Cloudflare Pages
- **프론트엔드**: TailwindCSS + Vanilla JS
- **분석**: Python (pandas, scikit-learn)
- **AI**: Claude API

## 실행 방법
```bash
# 빌드
npm run build

# 개발 서버 (PM2)
pm2 start ecosystem.config.cjs

# 테스트
curl http://localhost:3000
```

## 구조
```
autoanalyzer/
├── src/index.tsx          # Hono 백엔드
├── public/static/app.js   # 프론트엔드
├── analysis/              # Python 분석 스크립트
├── data/                  # 49개 기관 데이터
└── output/                # 분석 결과
```

## 개발 현황
- ✅ 프로젝트 구조
- ✅ 기본 UI/API
- 🚧 Claude Vision 통합
- 🚧 ML 모델 훈련
- 📋 배포 준비

---
**마지막 업데이트**: 2026-01-29
