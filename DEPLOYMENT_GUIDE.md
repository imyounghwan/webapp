# 🚀 Puppeteer 통합 프로젝트 배포 안내

## 📦 백업 다운로드

**백업 파일**: [webapp_puppeteer_integrated.tar.gz](https://www.genspark.ai/api/files/s/xQvvYU0n)

## 🎯 현재 상태

✅ **완료된 작업**:
- Cloudflare Browser Rendering API 통합
- @cloudflare/puppeteer 패키지 설치
- JavaScript 렌더링 지원
- 멀티페이지 크롤링 (메인 + 9 서브페이지)
- 스크린샷 촬영 기능
- 배포 준비 완료 (빌드 성공)

⚠️ **배포 필요**:
- Cloudflare Pages 배포
- Browser Rendering API 활성화
- Puppeteer 테스트 (5개 기관)

---

## 📋 로컬 환경에서 배포하기

### 1️⃣ 백업 파일 다운로드 및 압축 해제

```bash
# 다운로드 (wget 또는 curl)
wget https://www.genspark.ai/api/files/s/xQvvYU0n -O webapp_puppeteer_integrated.tar.gz

# 또는 브라우저에서 다운로드 후 터미널에서 이동
cd ~/Downloads

# 압축 해제
tar -xzf webapp_puppeteer_integrated.tar.gz
cd home/user/webapp
```

### 2️⃣ 의존성 설치

```bash
# Node.js 패키지 설치
npm install

# 빌드 확인
npm run build
```

### 3️⃣ Cloudflare 인증 설정

#### 방법 A: Wrangler 로그인 (권장)
```bash
# Cloudflare 계정 로그인
npx wrangler login

# 인증 확인
npx wrangler whoami
```

#### 방법 B: API Token 사용
```bash
# 환경 변수로 API Token 설정
export CLOUDFLARE_API_TOKEN="your-api-token-here"

# 또는 wrangler.toml에 추가
account_id = "your-account-id"
```

**API Token 생성 방법**:
1. [Cloudflare Dashboard](https://dash.cloudflare.com/) 로그인
2. Profile → API Tokens → Create Token
3. "Edit Cloudflare Workers" 템플릿 사용
4. 추가 권한: Account - Browser Rendering: Edit
5. 생성된 토큰 복사

### 4️⃣ Cloudflare Pages 프로젝트 생성

```bash
# Pages 프로젝트 생성 (최초 1회만)
npx wrangler pages project create webapp \
  --production-branch main \
  --compatibility-date 2026-01-29
```

### 5️⃣ 배포

```bash
# 빌드 및 배포
npm run build
npx wrangler pages deploy dist --project-name webapp

# 또는 npm script 사용
npm run deploy:prod
```

배포 완료 후 URL:
- **Production**: `https://webapp.pages.dev`
- **Branch**: `https://main.webapp.pages.dev`

### 6️⃣ Browser Rendering API 활성화 (중요!)

⚠️ **Puppeteer를 사용하려면 반드시 활성화해야 함!**

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages
2. `webapp` 프로젝트 선택
3. Settings → Functions → Browser Rendering
4. **Enable Browser Rendering** 클릭

**가격**:
- Free: 월 1,000 requests
- Paid: $0.002/request (~2.5원)

---

## 🧪 Puppeteer 테스트

### 1️⃣ 로그인 및 세션 획득

```bash
# 로그인 API 호출
curl -X POST https://webapp.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mgine.co.kr",
    "password": "Admin123!"
  }'

# 응답에서 session_id 복사
# { "session_id": "abc123...", ... }
```

### 2️⃣ Fetch vs Puppeteer 비교 테스트

```bash
#!/bin/bash
# test_puppeteer.sh

API_URL="https://webapp.pages.dev"
SESSION_ID="your-session-id-here"  # 위에서 복사한 session_id

echo "=== 🧪 Puppeteer vs Fetch 비교 테스트 ==="
echo ""

# 테스트 기관
declare -A SITES=(
  ["경찰청"]="https://crims.police.go.kr/|71.4"
  ["국세청"]="https://nts.go.kr/|57.1"
  ["교육부"]="https://www.moe.go.kr/|44.4"
  ["과기정통부"]="https://www.epost.go.kr/|50.0"
  ["공정거래위"]="https://www.ftc.go.kr/|89.0"
)

for NAME in "${!SITES[@]}"; do
  IFS='|' read -r URL EXPECTED <<< "${SITES[$NAME]}"
  
  echo "-----------------------------------"
  echo "🏢 기관: $NAME"
  echo "🌐 URL: $URL"
  echo "🎯 예상 점수: $EXPECTED"
  echo ""
  
  # Fetch 크롤러
  echo "  📄 Fetch 크롤러:"
  FETCH_SCORE=$(curl -s -X POST "$API_URL/api/analyze" \
    -H "Content-Type: application/json" \
    -H "X-Session-ID: $SESSION_ID" \
    -d "{\"url\":\"$URL\",\"mode\":\"public\",\"usePuppeteer\":false}" \
    | jq -r '.krds.convenience_score // "ERROR"')
  echo "     점수: $FETCH_SCORE"
  
  sleep 2
  
  # Puppeteer 크롤러
  echo "  🤖 Puppeteer 크롤러:"
  PUPPET_SCORE=$(curl -s -X POST "$API_URL/api/analyze" \
    -H "Content-Type: application/json" \
    -H "X-Session-ID: $SESSION_ID" \
    -d "{\"url\":\"$URL\",\"mode\":\"public\",\"usePuppeteer\":true}" \
    | jq -r '.krds.convenience_score // "ERROR"')
  echo "     점수: $PUPPET_SCORE"
  
  # 차이 계산
  if [[ "$PUPPET_SCORE" != "ERROR" && "$FETCH_SCORE" != "ERROR" ]]; then
    DIFF=$(echo "$PUPPET_SCORE - $FETCH_SCORE" | bc)
    echo "  📊 차이: $DIFF"
    
    # 예상 점수와 비교
    PUPPET_DIFF=$(echo "$EXPECTED - $PUPPET_SCORE" | bc | tr -d '-')
    if (( $(echo "$PUPPET_DIFF <= 5" | bc -l) )); then
      echo "  ✅ Puppeteer: PASS (±5점 이내)"
    else
      echo "  ❌ Puppeteer: FAIL (차이: $PUPPET_DIFF)"
    fi
  fi
  
  echo ""
  sleep 5  # Rate limiting 방지
done

echo "==================================="
echo "✅ 테스트 완료!"
```

**실행**:
```bash
chmod +x test_puppeteer.sh
./test_puppeteer.sh
```

### 3️⃣ 예상 결과

| 기관 | 예상 | Fetch | Puppeteer | 개선 여부 |
|------|------|-------|-----------|----------|
| 경찰청 | 71.4 | 24 | **71** ✅ | +47점 |
| 국세청 | 57.1 | 88 | **57** ✅ | -31점 (정확도↑) |
| 교육부 | 44.4 | 48 | **44** ✅ | -4점 (정확도↑) |
| 과기정통부 | 50.0 | 32 | **50** ✅ | +18점 |
| 공정거래위 | 89.0 | 96 | **89** ✅ | -7점 (정확도↑) |

**목표**: **5/5 PASS (100% 정확도)**

---

## 🐛 문제 해결

### "Browser binding not found" 오류
```
Error: Browser binding 'MYBROWSER' not found
```

**해결**:
1. Cloudflare Dashboard → Workers & Pages → webapp
2. Settings → Functions → Browser Rendering → **Enable**
3. 재배포: `npx wrangler pages deploy dist --project-name webapp`

### "Puppeteer launch failed" 오류
```
Error: Failed to launch browser
```

**해결**:
- Browser Rendering API가 활성화되었는지 확인
- Free Plan 한도 확인 (월 1,000 requests)
- Cloudflare Dashboard → Logs 확인

### 타임아웃 오류
```
Error: Timeout of 30000ms exceeded
```

**해결**:
- 일부 사이트는 로딩이 느림
- `timeout` 옵션 증가 (최대 60000ms)
- 또는 해당 사이트 제외

---

## 📊 테스트 결과 보고

테스트 완료 후 다음 정보를 기록:

```markdown
### Puppeteer 테스트 결과 (날짜: YYYY-MM-DD)

**환경**:
- Cloudflare Pages: webapp.pages.dev
- Browser Rendering API: 활성화

**결과**:
| 기관 | 예상 | Fetch | Puppeteer | 차이 | 상태 |
|------|------|-------|-----------|------|------|
| 경찰청 | 71.4 | XX | XX | XX | PASS/FAIL |
| 국세청 | 57.1 | XX | XX | XX | PASS/FAIL |
| 교육부 | 44.4 | XX | XX | XX | PASS/FAIL |
| 과기정통부 | 50.0 | XX | XX | XX | PASS/FAIL |
| 공정거래위 | 89.0 | XX | XX | XX | PASS/FAIL |

**정확도**: X/5 (XX%)

**결론**:
- Puppeteer가 개선했는가? YES/NO
- 다음 단계: AI Vision 통합 / 추가 디버깅
```

---

## 🎯 다음 단계

### ✅ Puppeteer 성공 시 (70%+ 정확도)
→ **AI Vision 통합** 진행
- GPT-4 Vision API
- 스크린샷 기반 주관적 항목 평가
- 43개 항목 전체 정확도 90%+ 목표

### ⚠️ Puppeteer 미개선 시
→ **추가 분석 필요**
- 로그 확인
- HTML 구조 상세 분석
- 보정 계수 재조정

---

## 📚 참고 자료

- [프로젝트 README](/home/user/webapp/README.md)
- [배포 가이드](/home/user/webapp/DEPLOYMENT.md)
- [Cloudflare Browser Rendering Docs](https://developers.cloudflare.com/browser-rendering/)
- [Puppeteer API](https://developers.cloudflare.com/browser-rendering/puppeteer/)

---

**배포 및 테스트를 진행해주세요!** 🚀

결과를 공유해주시면 다음 단계(AI Vision 통합)를 함께 진행하겠습니다!
