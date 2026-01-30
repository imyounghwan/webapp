# 🔍 검색 기능 탐지 로직 분석

## 현재 검색 탐지 방법 (htmlAnalyzer.ts 87번째 줄)

```typescript
const searchExists = 
  /type\s*=\s*["']search["']/i.test(html) || 
  /role\s*=\s*["']search["']/i.test(html)
```

### 탐지 조건
1. **`type="search"`**: HTML5 검색 입력 필드
   ```html
   <input type="search" placeholder="검색어 입력">
   ```

2. **`role="search"`**: ARIA role 검색 영역
   ```html
   <div role="search">
     <input type="text" placeholder="검색">
   </div>
   ```

---

## 문제점: 매우 제한적인 탐지

### ❌ 탐지 **못하는** 경우 (대부분의 한국 사이트)

#### 1. `type="text"` 사용하는 검색창
```html
<!-- KB국민은행, 대부분의 금융사 -->
<input type="text" name="query" placeholder="검색">
<button type="submit">검색</button>
```

#### 2. JavaScript로 구현된 검색
```html
<!-- 동적 검색창 -->
<div class="search-box" onclick="showSearch()">
  <i class="icon-search"></i>
  검색
</div>
```

#### 3. 이미지/버튼으로 구현된 검색
```html
<!-- 아이콘 검색 -->
<button class="search-btn">
  <img src="/images/search-icon.png">
</button>
```

#### 4. 검색 텍스트만 있는 경우
```html
<!-- 링크 형태 검색 -->
<a href="/search">검색</a>
```

---

## 실제 사이트 예시

### ✅ 탐지 **성공한** 사이트 (7개, 12.5%)
- 네이버, 중앙일보, 동아일보, 매일경제, 국세청, 경희대, 중소벤처기업부

**공통점**: `type="search"` 또는 `role="search"` 사용

### ❌ 탐지 **실패한** 사이트 (49개, 87.5%)
- KB국민은행, 신한은행, 우리은행 등 대부분의 금융사
- 교육부, 환경부 등 대부분의 공공기관

**공통점**: `type="text"` 또는 JavaScript 검색 사용

---

## KB국민은행 실제 검색 기능

### 1. 메인 페이지 우측 상단
```html
<!-- 실제로는 이런 형태 (추정) -->
<div class="header-search">
  <input type="text" name="searchWord" placeholder="통합검색">
  <button type="submit">
    <img src="search_icon.png">
  </button>
</div>
```

### 2. 모바일 햄버거 메뉴 내부
```html
<div class="mobile-search">
  <input type="text" placeholder="검색어를 입력하세요">
  <button>검색</button>
</div>
```

**결과**: 검색 기능은 **있지만**, `type="search"`가 아니라서 **탐지 실패**

---

## 개선 방안

### 1. 더 포괄적인 탐지 로직
```typescript
const searchExists = 
  // 현재 방식
  /type\s*=\s*["']search["']/i.test(html) || 
  /role\s*=\s*["']search["']/i.test(html) ||
  
  // 추가 패턴
  /name\s*=\s*["'](search|query|keyword|searchWord)["']/i.test(html) ||
  /(class|id)\s*=\s*["'][^"']*search[^"']*["']/i.test(html) ||
  /placeholder\s*=\s*["'][^"']*검색[^"']*["']/i.test(html) ||
  /<button[^>]*>[^<]*검색[^<]*<\/button>/i.test(html) ||
  /<a[^>]*>[^<]*검색[^<]*<\/a>/i.test(html)
```

### 2. 업종별 가중치
```typescript
// 검색 기능이 없어도 감점 적게
if (industry === '금융' || industry === '공공기관') {
  // 검색 없음 = -3점 (기존 -9점)
  N6_1 = 3.5  // 기존 2.0
  N7_1 = 3.5
  N10_1 = 3.5
}
```

### 3. 다중 페이지 분석
- 메인 페이지 + 서브 페이지 2-3개 분석
- 검색 기능은 로그인 후 페이지에서 재확인

---

## 결론

### 질문: "검색 기능 있는데 어떻게 찾은거지?"
**답변**: 
1. ✅ KB국민은행에는 **실제로 검색 기능이 있습니다**
2. ❌ 하지만 `type="search"` 표준을 사용하지 않아서 **탐지 실패**
3. 🔴 탐지 로직이 **너무 제한적** (HTML5 표준만 인식)
4. 🔴 대부분의 한국 사이트는 `type="text"` 사용 (87.5% 탐지 실패)

### 개선 필요성
- 현재: **12.5% 탐지율** (7/56)
- 개선 후: **70-80% 탐지율** (예상)

이것이 KB국민은행이 부당하게 낮은 점수를 받은 또 다른 이유입니다! 🎯
