/**
 * HTML 구조 분석 모듈
 * 49개 기관 데이터 기반 유사도 분석
 */

/**
 * 로딩 UI 탐지 결과 (하이브리드 분석)
 */
export interface LoadingUIDetection {
  score: number              // 0-10점: 로딩 UI 품질 점수
  hasLoadingUI: boolean      // 로딩 UI 존재 여부
  staticPatterns: {          // 정적 HTML 분석 결과
    ariaAttributes: number   // ARIA 로딩 속성 개수
    progressTags: number     // <progress>/<meter> 태그 개수
    loadingClasses: number   // loading 관련 클래스 개수
    loadingText: number      // 로딩 텍스트 개수
    spinAnimations: number   // CSS 스피너 애니메이션 개수
    loadingIcons: number     // 로딩 아이콘 개수
  }
  dynamicDetection?: {       // 동적 분석 결과 (Puppeteer 사용 시)
    loadingScreenFound: boolean
    loadingDuration: number  // 로딩 화면 지속 시간 (ms)
    loadingElements: string[]  // 발견된 로딩 요소들
  }
  details: string[]          // 발견된 패턴 상세 목록
}

/**
 * 행동 피드백 분석 결과 (3차원 측정)
 * Responsiveness Score = 즉시 피드백 + 상태 변화 능력 + 사용자 도움 수준
 */
export interface ActionFeedback {
  score: number                    // 0-10점: 종합 반응성 점수
  hasActionFeedback: boolean       // 행동 피드백 존재 여부
  
  // 1차원: 즉시 피드백 (Immediate Feedback)
  immediateFeedback: {
    hoverEffects: number           // 호버 효과 요소 개수
    focusEffects: number           // 포커스 효과 요소 개수
    activeEffects: number          // 클릭 액티브 효과 개수
    transitions: number            // CSS 트랜지션/애니메이션 개수
    microInteractions: number      // 마이크로 인터랙션 총점
  }
  
  // 2차원: 상태 변화 능력 (Dynamic State Management)
  stateManagement: {
    ariaExpanded: number           // 접기/펼치기 요소 (아코디언, 메뉴)
    ariaPressed: number            // 토글 버튼
    ariaSelected: number           // 탭, 선택 가능 요소
    ariaChecked: number            // 체크박스/라디오 (ARIA)
    detailsElements: number        // <details> 네이티브 접기/펼치기
    dialogElements: number         // <dialog> 모달
    stateInteractionScore: number  // 상태 기반 인터랙션 총점
  }
  
  // 3차원: 사용자 도움 수준 (User Assistance)
  userAssistance: {
    autocomplete: number           // 자동완성 입력 개수
    inputmode: number              // 모바일 키패드 최적화
    datalist: number               // HTML5 데이터리스트
    combobox: number               // ARIA 콤보박스
    ariaLive: number               // 실시간 알림 영역
    roleAlert: number              // 경고/알림
    ariaBusy: number               // 로딩 상태 관리
    progressbar: number            // 진행 상태 표시
    assistanceScore: number        // 사용자 도움 총점
  }
  
  // 인터랙션 밀도 (Interaction Density)
  interactionDensity: number       // 반응형 요소 / 전체 클릭 가능 요소
  
  details: string[]                // 발견된 패턴 상세 목록
}

export interface HTMLStructure {
  url: string
  html?: string  // 원본 HTML (KRDS 평가용)
  navigation: NavigationStructure
  accessibility: AccessibilityScore
  content: ContentStructure
  forms: FormStructure
  visuals: VisualStructure
}

export interface NavigationStructure {
  menuCount: number
  linkCount: number
  breadcrumbExists: boolean
  searchExists: boolean
  depthLevel: number
}

export interface AccessibilityScore {
  altTextRatio: number
  ariaLabelCount: number
  headingStructure: boolean
  langAttribute: boolean
  skipLinkExists: boolean
  loadingIndicatorExists: boolean  // 하위 호환성을 위해 유지
  loadingUI: LoadingUIDetection    // 새로운 상세 분석 결과
  actionFeedback: ActionFeedback   // 행동 피드백 상세 분석 결과
}

export interface ContentStructure {
  headingCount: number
  paragraphCount: number
  listCount: number
  tableCount: number
}

export interface FormStructure {
  formCount: number
  inputCount: number
  labelRatio: number
  validationExists: boolean
  interactiveFeedbackExists: boolean  // 호버/포커스/클릭 피드백 존재 여부
}

export interface VisualStructure {
  imageCount: number
  videoCount: number
  iconCount: number
}

/**
 * HTML 텍스트를 파싱하여 구조 분석
 */
export function analyzeHTML(
  html: string, 
  url: string, 
  dynamicLoadingUI?: {  // Puppeteer에서 전달되는 동적 분석 결과
    loadingScreenFound: boolean
    loadingDuration: number
    loadingElements: string[]
  }
): HTMLStructure {
  // 간단한 정규식 기반 파싱 (Cloudflare Workers에서 DOM 파서 없이 작동)
  
  const navigation = analyzeNavigation(html)
  const accessibility = analyzeAccessibility(html, dynamicLoadingUI)
  const content = analyzeContent(html)
  const forms = analyzeForms(html)
  const visuals = analyzeVisuals(html)

  return {
    url,
    html,  // 원본 HTML 저장 (KRDS 평가용)
    navigation,
    accessibility,
    content,
    forms,
    visuals
  }
}

function analyzeNavigation(html: string): NavigationStructure {
  const navMatches = html.match(/<nav[^>]*>/gi) || []
  const linkMatches = html.match(/<a\s+[^>]*href/gi) || []
  
  // Breadcrumb 감지 (다양한 패턴 지원)
  const breadcrumbExists = 
    /breadcrumb/i.test(html) ||                    // breadcrumb
    /location[_-]?wrap/i.test(html) ||             // location_wrap, location-wrap
    /현재[\s]*위치/i.test(html) ||                  // 현재위치, 현재 위치
    /navi[_-]?home/i.test(html) ||                 // navi_home, navi-home
    /(class|id)\s*=\s*["'][^"']*path[^"']*["']/i.test(html) ||  // path 클래스/ID
    /(class|id)\s*=\s*["'][^"']*location[^"']*["']/i.test(html) || // location 클래스/ID
    />\s*Home\s*<.*?>\s*[>›▶]\s*</i.test(html)    // Home > 메뉴 형태
  
  // 검색 기능 탐지 (개선된 포괄적 패턴)
  const searchExists = 
    // HTML5 표준
    /type\s*=\s*["']search["']/i.test(html) ||
    // ARIA 접근성
    /role\s*=\s*["']search["']/i.test(html) ||
    // name 속성으로 검색 (search, query, keyword, searchWord 등)
    /name\s*=\s*["'](search|query|keyword|searchWord|q|kwd)[^"']*["']/i.test(html) ||
    // class/id에 search 포함
    /(class|id)\s*=\s*["'][^"']*search[^"']*["']/i.test(html) ||
    // placeholder에 "검색" 텍스트
    /placeholder\s*=\s*["'][^"']*검색[^"']*["']/i.test(html) ||
    /placeholder\s*=\s*["'][^"']*search[^"']*["']/i.test(html) ||
    // 검색 버튼
    /<button[^>]*>[^<]*검색[^<]*<\/button>/i.test(html) ||
    /<button[^>]*>[^<]*search[^<]*<\/button>/i.test(html) ||
    // 검색 링크
    /<a[^>]*href\s*=\s*["'][^"']*(search|\/search\.)[^"']*["'][^>]*>[^<]*검색[^<]*<\/a>/i.test(html) ||
    // input 근처에 검색 관련 텍스트
    /<input[^>]*[^>]*>[\s\S]{0,100}검색/i.test(html)
  
  // 메뉴 깊이 추정 (ul > li > ul 구조 카운트)
  const nestedUlMatches = html.match(/<ul[^>]*>[\s\S]*?<li[^>]*>[\s\S]*?<ul/gi) || []
  const depthLevel = nestedUlMatches.length > 0 ? 2 : 1

  return {
    menuCount: navMatches.length,
    linkCount: linkMatches.length,
    breadcrumbExists,
    searchExists,
    depthLevel
  }
}

function analyzeAccessibility(
  html: string,
  dynamicLoadingUI?: {
    loadingScreenFound: boolean
    loadingDuration: number
    loadingElements: string[]
  }
): AccessibilityScore {
  const imgMatches = html.match(/<img[^>]*>/gi) || []
  const imgWithAltMatches = html.match(/<img[^>]*alt\s*=/gi) || []
  const ariaLabelMatches = html.match(/aria-label\s*=/gi) || []
  const headings = html.match(/<h[1-6][^>]*>/gi) || []
  const langAttribute = /<html[^>]*lang\s*=/i.test(html)
  const skipLinkExists = /skip[\s-]*(to[\s-]*)?content|skip[\s-]*navigation/i.test(html)

  // 로딩 UI 하이브리드 분석
  const loadingUI = detectLoadingUIHybrid(html)
  
  // 행동 피드백 3차원 측정
  const actionFeedback = detectActionFeedback(html)
  
  // 동적 분석 결과 병합 (Puppeteer 사용 시)
  if (dynamicLoadingUI) {
    loadingUI.dynamicDetection = dynamicLoadingUI
    
    // 동적 분석에서 로딩 UI를 발견했으면 점수 상향
    if (dynamicLoadingUI.loadingScreenFound) {
      loadingUI.score += 3  // 동적 분석 보너스 +3점
      loadingUI.score = Math.min(loadingUI.score, 10)  // 최대 10점
      loadingUI.hasLoadingUI = true
      loadingUI.details.push(`동적 분석: 로딩 UI 발견 (지속시간: ${dynamicLoadingUI.loadingDuration}ms)`)
      loadingUI.details.push(...dynamicLoadingUI.loadingElements.map(el => `동적 요소: ${el}`))
    }
  }
  
  const loadingIndicatorExists = loadingUI.hasLoadingUI  // 하위 호환성

  // alt 텍스트 비율
  const altTextRatio = imgMatches.length > 0 
    ? imgWithAltMatches.length / imgMatches.length 
    : 1

  // 헤딩 구조 존재 여부
  const headingStructure = headings.length > 0

  return {
    altTextRatio,
    ariaLabelCount: ariaLabelMatches.length,
    headingStructure,
    langAttribute,
    skipLinkExists,
    loadingIndicatorExists,
    loadingUI,          // 새로운 상세 분석 결과
    actionFeedback      // 행동 피드백 상세 분석 결과
  }
}

/**
 * 로딩 인디케이터 감지
 * 스피너, 프로그레스 바, 로딩 상태 표시 등을 다양한 방법으로 탐지
 */
/**
 * 로딩 UI 하이브리드 분석 (정적 + 동적)
 * 
 * 1단계: 정적 HTML 분석
 * - ARIA 속성 (aria-busy, role=progressbar, aria-live 등)
 * - HTML5 태그 (<progress>, <meter>)
 * - 클래스명 패턴 (loading, spinner, loader 등)
 * - 로딩 텍스트 (한글/영문)
 * - CSS 애니메이션 (스피너 회전 등)
 * - 로딩 아이콘 (Font Awesome, Material Icons 등)
 * 
 * 2단계: 스코어링 시스템
 * - 각 패턴별 점수 부여
 * - 종합 점수 계산 (0-10점)
 * 
 * @param html - 분석할 HTML 문자열
 * @returns LoadingUIDetection - 로딩 UI 탐지 결과
 */
function detectLoadingUIHybrid(html: string): LoadingUIDetection {
  const details: string[] = []
  const staticPatterns = {
    ariaAttributes: 0,
    progressTags: 0,
    loadingClasses: 0,
    loadingText: 0,
    spinAnimations: 0,
    loadingIcons: 0
  }

  // 1. ARIA 로딩 속성 (각 1점, 최대 4점)
  if (/aria-busy\s*=\s*["']true["']/i.test(html)) {
    staticPatterns.ariaAttributes++
    details.push('aria-busy="true" 발견')
  }
  if (/role\s*=\s*["']status["']/i.test(html)) {
    staticPatterns.ariaAttributes++
    details.push('role="status" 발견')
  }
  if (/role\s*=\s*["']progressbar["']/i.test(html)) {
    staticPatterns.ariaAttributes++
    details.push('role="progressbar" 발견')
  }
  if (/aria-live\s*=\s*["'](polite|assertive)["']/i.test(html)) {
    staticPatterns.ariaAttributes++
    details.push('aria-live 발견')
  }

  // 2. HTML5 progress/meter 태그 (각 1.5점, 최대 3점)
  const progressMatches = html.match(/<progress[^>]*>/gi) || []
  const meterMatches = html.match(/<meter[^>]*>/gi) || []
  staticPatterns.progressTags = progressMatches.length + meterMatches.length
  if (progressMatches.length > 0) {
    details.push(`<progress> 태그 ${progressMatches.length}개 발견`)
  }
  if (meterMatches.length > 0) {
    details.push(`<meter> 태그 ${meterMatches.length}개 발견`)
  }

  // 3. 로딩 관련 클래스/ID (각 0.5점, 최대 2.5점)
  const loadingClassPatterns = [
    { pattern: /class\s*=\s*["'][^"']*\bloading\b[^"']*["']/i, name: 'loading 클래스' },
    { pattern: /class\s*=\s*["'][^"']*\bloader\b[^"']*["']/i, name: 'loader 클래스' },
    { pattern: /class\s*=\s*["'][^"']*\bspinner\b[^"']*["']/i, name: 'spinner 클래스' },
    { pattern: /class\s*=\s*["'][^"']*\bskeleton\b[^"']*["']/i, name: 'skeleton 클래스' },
    { pattern: /class\s*=\s*["'][^"']*\bplaceholder\b[^"']*["']/i, name: 'placeholder 클래스' }
  ]
  
  loadingClassPatterns.forEach(({ pattern, name }) => {
    if (pattern.test(html)) {
      staticPatterns.loadingClasses++
      details.push(`${name} 발견`)
    }
  })

  // 4. 로딩 관련 텍스트 (각 0.5점, 최대 2점)
  const loadingTextPatterns = [
    { pattern: /로딩\s*(중|...)/i, name: '한글 "로딩 중"' },
    { pattern: /처리\s*(중|...)/i, name: '한글 "처리 중"' },
    { pattern: /잠시만\s*기다려/i, name: '한글 "잠시만 기다려"' },
    { pattern: /불러오는\s*중/i, name: '한글 "불러오는 중"' },
    { pattern: /loading/i, name: '영문 "loading"' },
    { pattern: /please\s+wait/i, name: '영문 "please wait"' },
    { pattern: /processing/i, name: '영문 "processing"' }
  ]

  loadingTextPatterns.forEach(({ pattern, name }) => {
    if (pattern.test(html)) {
      staticPatterns.loadingText++
      details.push(`${name} 텍스트 발견`)
    }
  })

  // 5. CSS 애니메이션 (1점)
  if (/@keyframes\s+(spin|rotate|loading|pulse)/i.test(html)) {
    staticPatterns.spinAnimations++
    details.push('CSS 애니메이션 키프레임 발견')
  }
  if (/animation\s*:\s*[^;]*(spin|rotate|loading|pulse)/i.test(html)) {
    staticPatterns.spinAnimations++
    details.push('CSS 애니메이션 속성 발견')
  }

  // 6. Font Awesome 또는 Material Icons (1점)
  const iconPatterns = [
    { pattern: /fa-spinner|fa-circle-notch|fa-sync|fa-cog/i, name: 'Font Awesome 로딩 아이콘' },
    { pattern: /material-icons[^>]*>\s*(hourglass|sync|autorenew|loop|cached)/i, name: 'Material Icons 로딩 아이콘' }
  ]

  iconPatterns.forEach(({ pattern, name }) => {
    if (pattern.test(html)) {
      staticPatterns.loadingIcons++
      details.push(`${name} 발견`)
    }
  })

  // 7. 점수 계산
  let score = 0
  score += Math.min(staticPatterns.ariaAttributes * 1, 4)      // 최대 4점
  score += Math.min(staticPatterns.progressTags * 1.5, 3)     // 최대 3점
  score += Math.min(staticPatterns.loadingClasses * 0.5, 2.5) // 최대 2.5점
  score += Math.min(staticPatterns.loadingText * 0.3, 2)      // 최대 2점 (0.3점씩)
  score += Math.min(staticPatterns.spinAnimations * 0.5, 1)   // 최대 1점
  score += Math.min(staticPatterns.loadingIcons * 1, 1)       // 최대 1점

  // 점수를 10점 만점으로 정규화
  score = Math.min(score, 10)

  const hasLoadingUI = score >= 2 // 2점 이상이면 로딩 UI 있다고 판단

  return {
    score,
    hasLoadingUI,
    staticPatterns,
    details
  }
}

/**
 * 하위 호환성을 위한 기존 함수 (deprecated)
 */
function detectLoadingIndicator(html: string): boolean {
  // 새로운 하이브리드 분석 결과를 사용
  const loadingUI = detectLoadingUIHybrid(html)
  return loadingUI.hasLoadingUI
}

/**
 * 상호작용 피드백 감지 (호버/포커스/클릭 반응)
 * 버튼, 링크, 폼 요소 등에 대한 시각적 피드백 존재 여부 확인
 */
/**
 * 행동 피드백 3차원 측정 시스템
 * Responsiveness Score = 즉시 피드백 + 상태 변화 능력 + 사용자 도움 수준
 */
function detectActionFeedback(html: string): ActionFeedback {
  const details: string[] = []
  
  // ========================================
  // 1차원: 즉시 피드백 (Immediate Feedback)
  // ========================================
  
  // 호버 효과
  const hoverPatterns = [
    /:hover/gi,
    /\.hover|--hover|_hover/gi,
    /class\s*=\s*["'][^"']*hover[^"']*["']/gi
  ]
  const hoverEffects = hoverPatterns.reduce((count, pattern) => {
    const matches = html.match(pattern) || []
    return count + matches.length
  }, 0)
  
  // 포커스 효과
  const focusPatterns = [
    /:focus(-visible|-within)?/gi,
    /\.focus|--focus|_focus/gi,
    /class\s*=\s*["'][^"']*focus[^"']*["']/gi
  ]
  const focusEffects = focusPatterns.reduce((count, pattern) => {
    const matches = html.match(pattern) || []
    return count + matches.length
  }, 0)
  
  // 액티브 효과 (클릭 시)
  const activePatterns = [
    /:active/gi,
    /\.active|--active|_active/gi,
    /class\s*=\s*["'][^"']*active[^"']*["']/gi
  ]
  const activeEffects = activePatterns.reduce((count, pattern) => {
    const matches = html.match(pattern) || []
    return count + matches.length
  }, 0)
  
  // CSS 트랜지션/애니메이션
  const transitionPatterns = [
    /transition\s*:/gi,
    /transform\s*:/gi,
    /animation\s*:/gi,
    /@keyframes/gi
  ]
  const transitions = transitionPatterns.reduce((count, pattern) => {
    const matches = html.match(pattern) || []
    return count + matches.length
  }, 0)
  
  // 마이크로 인터랙션 점수 계산
  const microInteractions = Math.min(
    hoverEffects * 0.3 + 
    focusEffects * 0.4 + 
    activeEffects * 0.2 + 
    transitions * 0.1,
    3.0  // 최대 3점
  )
  
  if (hoverEffects > 0) details.push(`✓ 호버 효과: ${hoverEffects}개`)
  if (focusEffects > 0) details.push(`✓ 포커스 효과: ${focusEffects}개`)
  if (activeEffects > 0) details.push(`✓ 클릭 액티브 효과: ${activeEffects}개`)
  if (transitions > 0) details.push(`✓ CSS 트랜지션/애니메이션: ${transitions}개`)
  
  // ========================================
  // 2차원: 상태 변화 능력 (Dynamic State Management)
  // ========================================
  
  const ariaExpanded = (html.match(/aria-expanded\s*=\s*["'](true|false)["']/gi) || []).length
  const ariaPressed = (html.match(/aria-pressed\s*=\s*["'](true|false|mixed)["']/gi) || []).length
  const ariaSelected = (html.match(/aria-selected\s*=\s*["'](true|false)["']/gi) || []).length
  const ariaChecked = (html.match(/aria-checked\s*=\s*["'](true|false|mixed)["']/gi) || []).length
  const detailsElements = (html.match(/<details[^>]*>/gi) || []).length
  const dialogElements = (html.match(/<dialog[^>]*>/gi) || []).length
  
  // 상태 기반 인터랙션 점수 계산
  const stateInteractionScore = Math.min(
    ariaExpanded * 0.5 +    // 아코디언, 메뉴 (중요도 높음)
    ariaPressed * 0.4 +      // 토글 버튼
    ariaSelected * 0.4 +     // 탭, 선택
    ariaChecked * 0.3 +      // 체크박스
    detailsElements * 0.6 +  // 네이티브 접기/펼치기
    dialogElements * 0.8,    // 모달 (중요도 매우 높음)
    4.0  // 최대 4점
  )
  
  if (ariaExpanded > 0) details.push(`✓ 접기/펼치기 (aria-expanded): ${ariaExpanded}개`)
  if (ariaPressed > 0) details.push(`✓ 토글 버튼 (aria-pressed): ${ariaPressed}개`)
  if (ariaSelected > 0) details.push(`✓ 선택 가능 요소 (aria-selected): ${ariaSelected}개`)
  if (ariaChecked > 0) details.push(`✓ 체크 상태 (aria-checked): ${ariaChecked}개`)
  if (detailsElements > 0) details.push(`✓ <details> 요소: ${detailsElements}개`)
  if (dialogElements > 0) details.push(`✓ <dialog> 모달: ${dialogElements}개`)
  
  // ========================================
  // 3차원: 사용자 도움 수준 (User Assistance)
  // ========================================
  
  const autocomplete = (html.match(/autocomplete\s*=\s*["'][^"']+["']/gi) || []).length
  const inputmode = (html.match(/inputmode\s*=\s*["'][^"']+["']/gi) || []).length
  const datalist = (html.match(/<input[^>]*list\s*=\s*["'][^"']+["']/gi) || []).length
  const combobox = (html.match(/role\s*=\s*["']combobox["']/gi) || []).length
  const ariaLive = (html.match(/aria-live\s*=\s*["'](polite|assertive|off)["']/gi) || []).length
  const roleAlert = (html.match(/role\s*=\s*["'](alert|status)["']/gi) || []).length
  const ariaBusy = (html.match(/aria-busy\s*=\s*["']true["']/gi) || []).length
  const progressbar = (html.match(/role\s*=\s*["']progressbar["']/gi) || []).length
  
  // 사용자 도움 점수 계산
  const assistanceScore = Math.min(
    autocomplete * 0.3 +     // 자동완성
    inputmode * 0.2 +        // 모바일 키패드
    datalist * 0.5 +         // 데이터리스트 (중요)
    combobox * 0.6 +         // 콤보박스 (매우 중요)
    ariaLive * 0.4 +         // 실시간 알림
    roleAlert * 0.3 +        // 경고
    ariaBusy * 0.5 +         // 로딩 상태
    progressbar * 0.6,       // 진행 상태
    3.0  // 최대 3점
  )
  
  if (autocomplete > 0) details.push(`✓ 자동완성 (autocomplete): ${autocomplete}개`)
  if (inputmode > 0) details.push(`✓ 모바일 키패드 최적화 (inputmode): ${inputmode}개`)
  if (datalist > 0) details.push(`✓ 데이터리스트 (datalist): ${datalist}개`)
  if (combobox > 0) details.push(`✓ 콤보박스 (role=combobox): ${combobox}개`)
  if (ariaLive > 0) details.push(`✓ 실시간 알림 (aria-live): ${ariaLive}개`)
  if (roleAlert > 0) details.push(`✓ 경고/상태 (role=alert/status): ${roleAlert}개`)
  if (ariaBusy > 0) details.push(`✓ 로딩 상태 (aria-busy): ${ariaBusy}개`)
  if (progressbar > 0) details.push(`✓ 진행 상태 (role=progressbar): ${progressbar}개`)
  
  // ========================================
  // 인터랙션 밀도 계산
  // ========================================
  
  // 전체 클릭 가능 요소
  const clickableElements = [
    ...html.matchAll(/<(button|a)[^>]*>/gi),
    ...html.matchAll(/<input[^>]*type\s*=\s*["'](button|submit|reset)["']/gi),
    ...html.matchAll(/role\s*=\s*["']button["']/gi)
  ].length
  
  // 반응형 요소 (피드백이 있는 요소)
  const responsiveElements = hoverEffects + focusEffects + activeEffects + 
                             ariaExpanded + ariaPressed + ariaSelected
  
  const interactionDensity = clickableElements > 0 
    ? Math.round((responsiveElements / clickableElements) * 100) / 100
    : 0
  
  // ========================================
  // 종합 점수 계산 (0-10점)
  // ========================================
  
  const score = Math.min(
    microInteractions + stateInteractionScore + assistanceScore,
    10.0
  )
  
  const hasActionFeedback = score >= 2.0  // 2점 이상이면 피드백 있음
  
  return {
    score,
    hasActionFeedback,
    immediateFeedback: {
      hoverEffects,
      focusEffects,
      activeEffects,
      transitions,
      microInteractions: Math.round(microInteractions * 10) / 10
    },
    stateManagement: {
      ariaExpanded,
      ariaPressed,
      ariaSelected,
      ariaChecked,
      detailsElements,
      dialogElements,
      stateInteractionScore: Math.round(stateInteractionScore * 10) / 10
    },
    userAssistance: {
      autocomplete,
      inputmode,
      datalist,
      combobox,
      ariaLive,
      roleAlert,
      ariaBusy,
      progressbar,
      assistanceScore: Math.round(assistanceScore * 10) / 10
    },
    interactionDensity,
    details
  }
}

function detectInteractiveFeedback(html: string): boolean {
  // 하위 호환성을 위해 유지
  const actionFeedback = detectActionFeedback(html)
  return actionFeedback.hasActionFeedback
}

function analyzeContent(html: string): ContentStructure {
  const headingCount = (html.match(/<h[1-6][^>]*>/gi) || []).length
  const paragraphCount = (html.match(/<p[^>]*>/gi) || []).length
  const listCount = (html.match(/<ul[^>]*>|<ol[^>]*>/gi) || []).length
  const tableCount = (html.match(/<table[^>]*>/gi) || []).length

  return {
    headingCount,
    paragraphCount,
    listCount,
    tableCount
  }
}

function analyzeForms(html: string): FormStructure {
  const formMatches = html.match(/<form[^>]*>/gi) || []
  const inputMatches = html.match(/<input[^>]*>/gi) || []
  const labelMatches = html.match(/<label[^>]*>/gi) || []
  const validationExists = /required|pattern|minlength|maxlength/i.test(html)
  const interactiveFeedbackExists = detectInteractiveFeedback(html)

  const labelRatio = inputMatches.length > 0 
    ? labelMatches.length / inputMatches.length 
    : 1

  return {
    formCount: formMatches.length,
    inputCount: inputMatches.length,
    labelRatio,
    validationExists,
    interactiveFeedbackExists
  }
}

function analyzeVisuals(html: string): VisualStructure {
  const imageCount = (html.match(/<img[^>]*>/gi) || []).length
  const videoCount = (html.match(/<video[^>]*>/gi) || []).length
  const iconMatches = html.match(/fa-|icon-|\.svg|<i\s+class/gi) || []

  return {
    imageCount,
    videoCount,
    iconCount: iconMatches.length
  }
}
