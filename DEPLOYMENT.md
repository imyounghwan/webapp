# Cloudflare Pages 배포 가이드

## 🚀 배포 준비 완료!

Puppeteer 크롤러가 통합되어 Cloudflare Pages에 배포할 준비가 완료되었습니다.

## 📋 배포 전 체크리스트

- ✅ Puppeteer 크롤러 통합 완료
- ✅ wrangler.jsonc에 browser binding 설정
- ✅ @cloudflare/puppeteer 패키지 설치
- ✅ 최종 빌드 완료 (dist/_worker.js)
- ⚠️ Cloudflare API Key 설정 필요

## 🔑 1단계: Cloudflare API Key 설정

### Deploy 탭에서 설정하기
1. 좌측 사이드바에서 **Deploy** 탭 클릭
2. Cloudflare API Token 생성:
   - Cloudflare Dashboard → Profile → API Tokens
   - "Edit Cloudflare Workers" 템플릿 사용
   - 또는 "Custom Token"으로 다음 권한 추가:
     - Account - Cloudflare Pages: Edit
     - Account - Browser Rendering: Edit
     - Zone - Workers Scripts: Edit
3. 생성된 토큰을 Deploy 탭에 입력 및 저장

### 또는 터미널에서 설정
```bash
# wrangler 로그인
npx wrangler login

# 인증 확인
npx wrangler whoami
```

## 🚢 2단계: Cloudflare Pages에 배포

### 방법 1: 자동 배포 (npm script)
```bash
cd /home/user/webapp
npm run deploy
```

### 방법 2: 수동 배포 (wrangler CLI)
```bash
cd /home/user/webapp

# 빌드
npm run build

# 배포
npx wrangler pages deploy dist --project-name webapp
```

## 🔧 3단계: Browser Rendering API 설정

Cloudflare Dashboard에서 Browser Rendering API를 활성화해야 합니다:

1. Cloudflare Dashboard → Workers & Pages
2. webapp 프로젝트 선택
3. Settings → Functions → Browser Rendering
4. **Enable Browser Rendering** 클릭

## ✅ 4단계: 배포 확인

배포 후 다음 URL에서 접근 가능:
- **Production**: `https://webapp.pages.dev`
- **Branch**: `https://main.webapp.pages.dev`

### API 테스트
```bash
# Health check
curl https://webapp.pages.dev/api/hello

# 일반 크롤러 테스트
curl -X POST https://webapp.pages.dev/api/analyze \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: your-session-id" \
  -d '{
    "url": "https://www.moe.go.kr/",
    "mode": "public",
    "usePuppeteer": false
  }'

# Puppeteer 크롤러 테스트 ✨
curl -X POST https://webapp.pages.dev/api/analyze \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: your-session-id" \
  -d '{
    "url": "https://www.moe.go.kr/",
    "mode": "public",
    "usePuppeteer": true
  }'
```

## 🧪 5단계: Puppeteer 성능 테스트

### 테스트 대상 기관 (5개)
1. 경찰청 - https://crims.police.go.kr/ (예상: 71.4점)
2. 국세청 - https://nts.go.kr/ (예상: 57.1점)
3. 교육부 - https://www.moe.go.kr/ (예상: 44.4점)
4. 과학기술정보통신부 - https://www.epost.go.kr/ (예상: 50.0점)
5. 공정거래위원회 - https://www.ftc.go.kr/ (예상: 89.0점)

### 테스트 스크립트
```bash
#!/bin/bash
# test_puppeteer_production.sh

API_URL="https://webapp.pages.dev"
SESSION_ID="your-session-id-here"

echo "=== Puppeteer vs Fetch 비교 테스트 ==="

for URL in \
  "https://crims.police.go.kr/" \
  "https://nts.go.kr/" \
  "https://www.moe.go.kr/" \
  "https://www.epost.go.kr/" \
  "https://www.ftc.go.kr/"
do
  echo ""
  echo "🔍 Testing: $URL"
  
  echo "  📄 Fetch 크롤러:"
  curl -s -X POST "$API_URL/api/analyze" \
    -H "Content-Type: application/json" \
    -H "X-Session-ID: $SESSION_ID" \
    -d "{\"url\":\"$URL\",\"mode\":\"public\",\"usePuppeteer\":false}" \
    | jq -r '.krds.convenience_score'
  
  echo "  🤖 Puppeteer 크롤러:"
  curl -s -X POST "$API_URL/api/analyze" \
    -H "Content-Type: application/json" \
    -H "X-Session-ID: $SESSION_ID" \
    -d "{\"url\":\"$URL\",\"mode\":\"public\",\"usePuppeteer\":true}" \
    | jq -r '.krds.convenience_score'
done
```

## 📊 예상 결과

### 개선 예상
- **JavaScript 렌더링**: 동적 콘텐츠 감지 개선
- **일관성**: 매번 같은 점수 산출
- **정확도**: 33.3% → **70%+ 목표**

### 만약 개선되지 않는다면?
1. **Browser Rendering API 활성화 확인**
2. **로그 확인**: Cloudflare Dashboard → Workers & Pages → Logs
3. **AI Vision 통합** 필요 (다음 단계)

## 🔄 6단계: 전체 재배포 (업데이트 시)

```bash
cd /home/user/webapp

# 코드 수정 후
git add .
git commit -m "update: 기능 개선"

# 빌드 및 배포
npm run build
npx wrangler pages deploy dist --project-name webapp
```

## 💰 비용 안내

### Browser Rendering API 가격
- **Free Tier**: 매월 1,000 requests
- **Paid**: $0.002 per request (약 2.5원)

### 예상 비용 (월간)
- 테스트 (100 requests): 무료
- 중간 사용 (5,000 requests): $10 (약 12,500원)
- 많은 사용 (20,000 requests): $40 (약 50,000원)

## 🆘 문제 해결

### "Browser binding not found" 오류
- wrangler.jsonc에 browser binding 확인
- Browser Rendering API 활성화 확인

### "Puppeteer launch failed" 오류
- Cloudflare Dashboard에서 Browser Rendering API 활성화
- 프로덕션 환경에서만 작동 (로컬은 Chrome 필요)

### 타임아웃 오류
- Puppeteer는 기본 30초 타임아웃
- timeout 옵션으로 조정 가능

## 📚 참고 문서

- [Cloudflare Browser Rendering Docs](https://developers.cloudflare.com/browser-rendering/)
- [Puppeteer API Reference](https://developers.cloudflare.com/browser-rendering/puppeteer/)
- [Pricing](https://developers.cloudflare.com/browser-rendering/pricing/)

---

**배포 준비 완료!** 🎉
Deploy 탭에서 Cloudflare API Key를 설정한 후 배포를 진행하세요!
