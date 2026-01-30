# 이메일 발송 설정 가이드

## 📧 Resend API 설정하기

MGINE AutoAnalyzer의 문의하기 기능이 **ceo@mgine.co.kr**로 실제 이메일을 발송하도록 설정하는 방법입니다.

---

## 1️⃣ Resend 회원가입 (무료)

1. **Resend 웹사이트 방문**: https://resend.com
2. **Sign Up** 버튼 클릭
3. 이메일로 가입 (GitHub 계정으로도 가능)
4. 이메일 인증 완료

**무료 플랜 혜택**:
- ✅ 하루 100통 이메일 발송
- ✅ 월 3,000통 이메일 발송
- ✅ 발신 주소 검증 가능
- ✅ API 키 무제한 생성

---

## 2️⃣ API 키 발급받기

1. Resend 대시보드 로그인: https://resend.com/home
2. 좌측 메뉴에서 **"API Keys"** 클릭
3. **"Create API Key"** 버튼 클릭
4. 이름 입력 (예: "MGINE AutoAnalyzer")
5. Permission은 **"Sending access"** 선택
6. **"Add"** 버튼 클릭
7. 생성된 API 키를 복사 (예: `re_123abc456def...`)

⚠️ **중요**: API 키는 한 번만 표시되므로 반드시 안전한 곳에 저장하세요!

---

## 3️⃣ 로컬 개발 환경 설정

### `.dev.vars` 파일 수정

프로젝트 루트의 `.dev.vars` 파일을 열고 API 키를 입력하세요:

```env
# Resend API Key for email sending
RESEND_API_KEY=re_YOUR_ACTUAL_API_KEY_HERE
```

**예시**:
```env
RESEND_API_KEY=re_3kT9xL2mN8pQ5vR1wS7uY4zA6bC0dE
```

### 재시작

```bash
cd /home/user/webapp
npm run build
pm2 restart autoanalyzer
```

---

## 4️⃣ 프로덕션 환경 설정 (Cloudflare Pages)

### Secret 추가

```bash
# 프로젝트 이름을 실제 이름으로 변경하세요
npx wrangler secret put RESEND_API_KEY --project-name webapp

# 명령 실행 후 API 키 입력
Enter the secret text you'd like assigned to RESEND_API_KEY on the script named webapp:
> re_YOUR_ACTUAL_API_KEY_HERE
```

### 재배포

```bash
npm run deploy
```

---

## 5️⃣ 발신 주소 인증 (권장)

기본적으로 Resend는 `onboarding@resend.dev`를 발신 주소로 사용하지만, 자체 도메인을 인증하면 더 전문적인 이메일을 발송할 수 있습니다.

### 도메인 인증 방법:

1. Resend 대시보드에서 **"Domains"** 메뉴 클릭
2. **"Add Domain"** 버튼 클릭
3. 도메인 입력 (예: `mgine.co.kr`)
4. Resend가 제공하는 **DNS 레코드**를 도메인 DNS 설정에 추가
5. 인증 완료 후 발신 주소를 변경:

`src/index.tsx`의 714번째 줄:

```typescript
from: 'AutoAnalyzer <onboarding@resend.dev>', // 기본값
```

↓ 변경:

```typescript
from: 'AutoAnalyzer <noreply@mgine.co.kr>', // 인증된 도메인 사용
```

---

## 6️⃣ 테스트하기

### 로컬 테스트:

1. 브라우저에서 접속: https://3000-i5ymwam9wcrmlh39bwo6s-a402f90a.sandbox.novita.ai
2. 하단 **"문의하기"** 섹션으로 스크롤
3. 폼 작성 후 **"문의하기"** 버튼 클릭
4. **ceo@mgine.co.kr** 메일함 확인

### 에러 확인:

```bash
pm2 logs autoanalyzer --nostream | grep -i "email"
```

---

## 7️⃣ 이메일 발송 흐름

```
사용자 폼 작성
    ↓
문의하기 버튼 클릭
    ↓
POST /api/contact 호출
    ↓
Resend API로 이메일 발송
    ↓
ceo@mgine.co.kr로 전달
    ↓
성공 메시지 표시
```

---

## 📊 발송된 이메일 포맷

### 제목:
```
[AutoAnalyzer] OO주식회사 - 프로젝트 문의
```

### 본문 (HTML):
- 👤 **의뢰인 정보**: 회사명, 직위, 이름, 연락처, 이메일, 웹사이트
- 📋 **프로젝트 정보**: 희망 프로젝트 형태, 예산, 일정
- 💬 **의뢰 내용**: 상세 메시지
- 🕒 **발신 시간**: 자동 기록
- 📧 **답장 주소**: 문의자 이메일 (직접 답장 가능)

---

## 🔧 트러블슈팅

### 이메일이 발송되지 않을 때:

1. **API 키 확인**:
   ```bash
   cat .dev.vars
   ```

2. **로그 확인**:
   ```bash
   pm2 logs autoanalyzer --nostream --lines 50
   ```

3. **Resend 대시보드 확인**:
   - https://resend.com/emails
   - 발송 내역 및 에러 확인

4. **API 키 재발급**:
   - 기존 키 삭제 후 새로 발급
   - `.dev.vars` 파일 업데이트

### 스팸함에 들어갈 경우:

- **SPF/DKIM/DMARC** 레코드 설정 (도메인 인증 필수)
- 발신 주소를 인증된 도메인으로 변경
- 이메일 내용에 스팸 키워드 제거

---

## 💰 비용 안내

**무료 플랜**:
- 월 3,000통까지 무료
- 일일 100통 제한
- 대부분의 중소기업에 충분

**Pro 플랜** ($20/월):
- 월 50,000통
- 이메일 분석
- 우선 지원

**현재 예상 사용량**:
- 하루 평균 5~10건 문의 → 월 150~300통
- ✅ 무료 플랜으로 충분

---

## 📝 참고 자료

- Resend 공식 문서: https://resend.com/docs
- API Reference: https://resend.com/docs/api-reference
- Node.js SDK: https://github.com/resendlabs/resend-node
- Cloudflare Workers 통합: https://resend.com/docs/send-with-cloudflare-workers

---

## ✅ 체크리스트

- [ ] Resend 회원가입 완료
- [ ] API 키 발급 완료
- [ ] `.dev.vars` 파일에 API 키 추가
- [ ] 로컬 환경 재시작 및 테스트
- [ ] 프로덕션 Secret 추가 (`wrangler secret put`)
- [ ] 프로덕션 배포 및 테스트
- [ ] ceo@mgine.co.kr로 테스트 메일 수신 확인
- [ ] (선택) 도메인 인증 및 발신 주소 변경

---

**설정 완료 후 문의하기 기능이 정상 작동합니다!** 🚀

문제가 발생하면 PM2 로그를 확인하세요:
```bash
pm2 logs autoanalyzer --nostream
```
