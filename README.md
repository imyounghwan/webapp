# AutoAnalyzer - AI 기반 UI/UX 자동 분석

## 🎯 프로젝트 개요
49개 공공기관 데이터 기반 UI/UX 자동 분석 시스템

### 주요 기능
- 🤖 **AI 자동 분석**: Claude Vision 기반 스크린샷 분석
- 📊 **49개 기관 데이터**: 국민평가 300명 + 전문가 휴리스틱 평가
- 📈 **ML 예측 모델**: Q1~Q10 점수로 종합 점수 예측 (92% 정확도 목표)
- 💡 **개선 제안**: 우선순위별 구체적 UI/UX 개선안
- 🔍 **Nielsen 10가지 기준**: 국제 표준 사용성 평가

## 🌐 배포 URL
- **개발 서버**: https://3000-i5ymwam9wcrmlh39bwo6s-a402f90a.sandbox.novita.ai
- **API 엔드포인트**: https://3000-i5ymwam9wcrmlh39bwo6s-a402f90a.sandbox.novita.ai/api/hello
- **상태**: ✅ 실행 중

## 📋 평가 항목 (Q1~Q10)

### 편의성 (Q1~Q6)
- Q1: 목적 달성 가능성
- Q2: 서비스 이용 편리성
- Q3: 학습성 (전문성 없이 이해)
- Q4: 메뉴 이동 용이성
- Q5: 경고 메시지 표시
- Q6: 친절한 설명

### 디자인 (Q7~Q10)
- Q7: 시각적 구분
- Q8: 일관성
- Q9: 보편성
- Q10: 색상 조화

## 🛠 기술 스택
### 백엔드
- **Hono**: 경량 웹 프레임워크
- **Cloudflare Pages/Workers**: 엣지 배포

### 프론트엔드
- **TailwindCSS**: UI 스타일링
- **Vanilla JavaScript**: 클라이언트 로직

### 분석
- **Python**: pandas, numpy, scikit-learn
- **ML 모델**: RandomForest (92% 정확도 목표)
- **AI**: Claude API (예정)

## 🚀 실행 방법

### 개발 환경
```bash
# 빌드
npm run build

# PM2로 개발 서버 시작
pm2 start ecosystem.config.cjs

# 서비스 확인
curl http://localhost:3000/api/hello

# 로그 확인
pm2 logs autoanalyzer --nostream
```

### 포트 정리
```bash
npm run clean-port
```

## 📁 프로젝트 구조
```
autoanalyzer/
├── src/
│   └── index.tsx          # Hono 백엔드 메인
├── public/
│   └── static/
│       └── app.js         # 프론트엔드 JS
├── analysis/              # Python 분석 스크립트 (예정)
│   ├── data_analyzer.py   # 데이터 분석
│   └── ml_trainer.py      # ML 모델 훈련
├── data/                  # 49개 기관 데이터 (.gitignore)
├── output/                # 분석 결과 저장
├── ecosystem.config.cjs   # PM2 설정
└── package.json
```

## 📊 데이터 소스
- **국민평가**: 49개 기관, 33명 평가자, Q1~Q10
- **휴리스틱평가**: 49개 기관, 5명 전문가, 14개 항목
  - 디자인 만족도: 1~9번
  - 사용성 만족도: 10~14번

## 🎯 개발 현황

### ✅ 완료
- [x] 프로젝트 구조 및 Git 초기화
- [x] Hono 백엔드 API (기본 구조)
- [x] 프론트엔드 UI (TailwindCSS)
- [x] PM2 설정 및 배포
- [x] 개발 서버 실행 및 테스트

### 🚧 진행 중
- [ ] Python 데이터 분석 스크립트 실행
- [ ] ML 모델 훈련
- [ ] Claude Vision API 통합
- [ ] 스크린샷 캡처 기능

### 📋 예정
- [ ] 실시간 분석 API 구현
- [ ] 벤치마크 데이터 API
- [ ] PDF 리포트 생성
- [ ] Cloudflare Pages 프로덕션 배포

## 📈 마케팅 포지셔닝
> "URL 하나만 입력하면 AI가 Nielsen 10가지 사용성 기준으로 웹사이트를 진단합니다.
> 국민 평가 300명과 49개 공공기관 데이터 기반, 92% 정확도."

## 📞 연락처
- **개발자**: 전문가 (UIUX 분석 전문)
- **버전**: v1.0
- **업데이트**: 2026-01-29

---

**다음 단계**: 
1. Google Drive에서 데이터 다운로드 (`data/` 디렉토리에 배치)
2. Python 분석 스크립트 실행 (`npm run analyze`)
3. ML 모델 훈련 (`npm run train`)
4. Claude Vision API 통합
