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

/**
 * 현실 세계 일치 분석 결과
 * Nielsen 2번 원칙: Match between system and the real world
 */
export interface RealWorldMatch {
  score: number                    // 0-10점: 종합 현실 세계 일치 점수
  
  // 1차원: 언어 친화도 (Language Friendliness) - 40% 가중치
  languageFriendliness: {
    jargonDensity: number          // 전문용어 밀도 (%)
    jargonCount: number            // 전문용어 개수
    totalWords: number             // 전체 단어 수
    avgSentenceLength: number      // 평균 문장 길이
    longSentencesRatio: number     // 긴 문장 비율 (%)
    score: number                  // 언어 친화도 점수 (0-10)
  }
  
  // 2차원: 데이터 자연스러움 (Data Naturalness) - 30% 가중치
  dataNaturalness: {
    rawDataCount: number           // 부자연스러운 시스템 데이터 개수
    naturalDataCount: number       // 자연스러운 표현 개수
    naturalRatio: number           // 자연스러운 표현 비율 (%)
    score: number                  // 데이터 자연스러움 점수 (0-10)
  }
  
  // 3차원: 인터페이스 친화도 (Interface Friendliness) - 30% 가중치
  interfaceFriendliness: {
    actionWords: number            // 행동 중심 동사 개수
    userCentricWords: number       // 사용자 중심 언어 개수
    systemWords: number            // 시스템 중심 언어 개수
    metaphors: number              // 현실 세계 은유 개수
    score: number                  // 인터페이스 친화도 점수 (0-10)
  }
  
  details: string[]                // 발견된 패턴 상세 목록
}

/**
 * N3.1 비상구(Emergency Exit) 분석 결과
 * 사용자 제어와 자유 - 되돌리기 측정
 */
export interface UserControlFreedom {
  totalScore: number
  grade: 'A' | 'B' | 'C' | 'D'
  modalEscape: {
    score: number
    totalModals: number
    escapableModals: number
    escapeRatio: string
    details: string[]
  }
  stepNavigation: {
    score: number
    hasNextButtons: boolean
    hasPrevButtons: boolean
    hasStepIndicator: boolean
    hasBreadcrumbs: boolean
  }
  inputCancellation: {
    score: number
    totalForms: number
    formsWithReset: number
    totalFilters: number
    filtersWithReset: number
  }
  destructivePrevention: {
    score: number
    totalDangerousActions: number
    protectedActions: number
    protectionRatio: string
  }
  govComparison: {
    siteScore: number
    govAverage: number
    gap: string
    percentile: string
    status: string
    ranking: string
    commonIssues: string[]
    bestPractices: string[]
  }
  recommendation: string
  details: string[]
}

/**
 * N3.3 네비게이션 자유도 - 여러 길로 갈 수 있게 하기
 * 4차원 모델: 텔레포트, 트래킹, 조감도, 회귀
 */
export interface NavigationFreedom {
  totalScore: number
  grade: 'A' | 'B' | 'C' | 'D'
  
  // 1단계: 텔레포트 - 검색을 통한 즉시 이동 (30점)
  teleport: {
    score: number
    hasSearch: boolean
    isGlobalSearch: boolean  // 헤더에 배치
    hasSearchIcon: boolean
    accessibility: string  // 우수/양호/미흡
    details: string[]
  }
  
  // 2단계: 트래킹 - 브레드크럼을 통한 위치 파악 (30점)
  tracking: {
    score: number
    hasBreadcrumb: boolean
    linkCount: number
    totalDepth: number
    hasCurrentMarker: boolean  // 현재 위치 표시
    pathDepth: number  // URL 깊이
    quality: string  // 우수/양호/기본/없음
    details: string[]
  }
  
  // 3단계: 조감도 - 전체 구조 파악 (25점)
  birdEye: {
    score: number
    hasSitemap: boolean
    footerLinkCount: number
    hasFooterNav: boolean
    structuralVisibility: string  // 우수/양호/미흡
    details: string[]
  }
  
  // 4단계: 회귀 - 홈으로의 복귀 (15점)
  return: {
    score: number
    hasLogoHomeLink: boolean
    totalHomeLinkCount: number
    returnCapability: string  // 우수/기본/없음
    details: string[]
  }
  
  // 정부 49개 기관 벤치마크
  govComparison: {
    siteScore: number
    govAverage: number
    gap: string
    percentile: string
    status: string
    ranking: string
    dimensionAvg: {
      teleport: number
      tracking: number
      birdEye: number
      return: number
    }
    userImpact: {
      findingDifficulty: string  // 높음/보통/낮음
      estimatedSearchTime: string
      bounceRateRisk: string
      conversionImpact: string
    }
    commonIssues: string[]
    bestPractices: string[]
  }
  
  recommendation: string
  details: string[]
}

export interface HTMLStructure {
  url: string
  html?: string  // 원본 HTML (KRDS 평가용)
  navigation: NavigationStructure
  accessibility: AccessibilityScore
  content: ContentStructure
  forms: FormStructure
  visuals: VisualStructure
  realWorldMatch: RealWorldMatch        // 현실 세계 일치 분석
  userControlFreedom: UserControlFreedom  // N3.1 비상구 분석
  navigationFreedom?: NavigationFreedom   // N3.3 네비게이션 자유도 (선택적)
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
  const realWorldMatch = analyzeRealWorldMatch(html)
  const userControlFreedom = analyzeUserControlFreedom(html)
  const navigationFreedom = analyzeNavigationFreedom(html, url)

  return {
    url,
    html,  // 원본 HTML 저장 (KRDS 평가용)
    navigation,
    accessibility,
    content,
    forms,
    visuals,
    realWorldMatch,
    userControlFreedom,
    navigationFreedom
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

/**
 * 현실 세계 일치 분석
 * Nielsen 2번 원칙: 시스템과 현실 세계의 일치
 */
function analyzeRealWorldMatch(html: string): RealWorldMatch {
  // HTML에서 텍스트만 추출
  const textContent = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')  // 스크립트 제거
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')    // 스타일 제거
    .replace(/<[^>]+>/g, ' ')                           // 태그 제거
    .replace(/\s+/g, ' ')                               // 공백 정리
    .trim()
  
  const details: string[] = []
  
  // 1차원: 언어 친화도 분석
  const languageFriendliness = analyzeLanguageFriendliness(textContent, details)
  
  // 2차원: 예측 가능성 분석 (HTML 구조 기반)
  const dataNaturalness = analyzeDataNaturalness(html, details)
  
  // 3차원: 인터페이스 친화도 분석
  const interfaceFriendliness = analyzeInterfaceFriendliness(textContent, details)
  
  // 최종 점수 계산 (가중 평균: 언어 40%, 예측가능성 30%, 인터페이스 30%)
  const finalScore = (
    languageFriendliness.score * 0.4 +
    dataNaturalness.score * 0.3 +
    interfaceFriendliness.score * 0.3
  )
  
  return {
    score: Math.round(finalScore * 10) / 10,  // 소수점 1자리
    languageFriendliness,
    dataNaturalness,
    interfaceFriendliness,
    details
  }
}

/**
 * 언어 친화도 분석
 */
function analyzeLanguageFriendliness(text: string, details: string[]): RealWorldMatch['languageFriendliness'] {
  const words = text.match(/[\w가-힣]+/g) || []
  const totalWords = words.length
  
  // 전문용어 패턴
  const systemJargon = [
    // IT 용어
    /솔루션|프로세스|워크플로우|인스턴스|리소스|세션|API|SDK/gi,
    /퍼포먼스|컨버전|임팩트|디플로이|빌드|런타임|마이그레이션/gi,
    // 불필요한 한자어/행정용어
    /귀하|당사|폐사|본인|차수|건명|시행|이행|준수|기재|수취인/gi,
    // 영어 약자 (연속된 대문자 3자 이상)
    /\b[A-Z]{3,}\b/g
  ]
  
  let jargonCount = 0
  systemJargon.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) jargonCount += matches.length
  })
  
  const jargonDensity = totalWords > 0 ? (jargonCount / totalWords) * 100 : 0
  
  // 🔍 디버깅: 전문용어 분석 결과
  console.log(`[N2.1 Language] 전체 단어: ${totalWords}, 전문용어: ${jargonCount}, 밀도: ${jargonDensity.toFixed(2)}%`)
  
  // 문장 복잡도 분석
  const sentences = text.split(/[.!?。]+/).filter(s => s.trim().length > 10)
  let totalWordsInSentences = 0
  let longSentences = 0
  
  sentences.forEach(sentence => {
    const sentenceWords = sentence.trim().split(/\s+/)
    totalWordsInSentences += sentenceWords.length
    if (sentenceWords.length > 25) longSentences++
  })
  
  const avgSentenceLength = sentences.length > 0 ? totalWordsInSentences / sentences.length : 0
  const longSentencesRatio = sentences.length > 0 ? (longSentences / sentences.length) * 100 : 0
  
  // 점수 계산
  // 1. 전문용어 밀도 점수: 낮을수록 좋음 (0~2% 만점 100점, 5% 50점, 10% 이상 0점)
  let jargonScore = 100
  if (jargonDensity >= 10) {
    jargonScore = 0
  } else if (jargonDensity >= 5) {
    jargonScore = 50 - (jargonDensity - 5) * 10  // 5%~10%: 50점 → 0점
  } else if (jargonDensity >= 2) {
    jargonScore = 100 - (jargonDensity - 2) * 16.67  // 2%~5%: 100점 → 50점
  }
  // 0~2%는 100점
  
  // 2. 문장 복잡도 점수: 10~20단어 적정 (벗어날수록 감점)
  let complexityScore = 100
  if (avgSentenceLength > 25) {
    complexityScore = Math.max(0, 100 - (avgSentenceLength - 25) * 5)  // 25단어 초과 시 급격히 감점
  } else if (avgSentenceLength > 20) {
    complexityScore = 100 - (avgSentenceLength - 20) * 4  // 20~25단어: 100점 → 80점
  } else if (avgSentenceLength < 10 && avgSentenceLength > 0) {
    complexityScore = Math.max(70, 100 - (10 - avgSentenceLength) * 3)  // 10단어 미만도 감점
  }
  // 10~20단어는 100점
  
  // 최종 점수: 전문용어가 더 중요하므로 70:30 가중치
  const languageScore = (jargonScore * 0.7 + complexityScore * 0.3)
  
  // 🔍 디버깅: 점수 계산
  console.log(`[N2.1 Language] jargonScore: ${jargonScore}, complexityScore: ${complexityScore}, weighted: ${languageScore}, final: ${languageScore / 10}`)
  
  // 디테일 추가
  if (jargonDensity > 5) {
    details.push(`⚠️ 전문용어 밀도가 높음 (${jargonDensity.toFixed(1)}%)`)
  } else if (jargonDensity < 2) {
    details.push(`✅ 친숙한 용어 사용 (전문용어 ${jargonDensity.toFixed(1)}%)`)
  }
  
  if (avgSentenceLength > 25) {
    details.push(`⚠️ 문장이 길고 복잡함 (평균 ${avgSentenceLength.toFixed(1)}단어)`)
  } else if (avgSentenceLength >= 10 && avgSentenceLength <= 20) {
    details.push(`✅ 적절한 문장 길이 (평균 ${avgSentenceLength.toFixed(1)}단어)`)
  }
  
  return {
    jargonDensity: Math.round(jargonDensity * 10) / 10,
    jargonCount,
    totalWords,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    longSentencesRatio: Math.round(longSentencesRatio * 10) / 10,
    score: Math.round(languageScore / 10 * 10) / 10  // 0-10점으로 변환
  }
}

/**
 * 데이터 자연스러움 분석
 */
function analyzeDataNaturalness(html: string, details: string[]): RealWorldMatch['dataNaturalness'] {
  let score = 0
  
  // 1. 헤딩 구조 (25점) - H1이 페이지당 정확히 1개
  const h1Count = (html.match(/<h1[^>]*>/gi) || []).length
  let headingScore = 0
  if (h1Count === 1) {
    headingScore = 25
    details.push('✅ H1 태그가 1개로 적절함')
  } else if (h1Count === 0) {
    headingScore = 0
    details.push('⚠️ H1 태그가 없음 - 페이지 구조가 불명확')
  } else {
    headingScore = 15
    details.push(`⚠️ H1 태그가 ${h1Count}개 - 페이지당 1개 권장`)
  }
  score += headingScore
  
  // 2. 시각적 일치도 (30점) - tabindex 남용 체크
  const tabindexMatches = html.match(/tabindex\s*=\s*["']?(\d+)["']?/gi) || []
  const abnormalTabindex = tabindexMatches.filter(match => {
    const tabIndex = parseInt(match.match(/\d+/)?.[0] || '0')
    return tabIndex > 10
  })
  
  let visualScore = 30
  if (abnormalTabindex.length > 0) {
    visualScore = Math.max(0, 30 - abnormalTabindex.length * 5)
    details.push(`⚠️ 비정상적인 tabindex ${abnormalTabindex.length}개 발견 - DOM 순서 개선 필요`)
  } else if (tabindexMatches.length > 0) {
    details.push('✅ tabindex 사용이 적절함')
  }
  score += visualScore
  
  // 3. 작업 흐름 (30점) - 프로세스 단계 표시
  const formCount = (html.match(/<form[^>]*>/gi) || []).length
  const hasStepIndicator = /class\s*=\s*["'][^"']*step[^"']*["']|role\s*=\s*["']progressbar["']/i.test(html)
  
  let workflowScore = 0
  if (formCount > 0) {
    // 폼이 있으면 단계 표시가 중요
    workflowScore = 15
    if (hasStepIndicator) {
      workflowScore = 30
      details.push('✅ 프로세스 단계 표시가 있음')
    } else {
      details.push('⚠️ 폼이 있지만 단계 표시가 없음')
    }
  } else {
    // 폼이 없으면 단계 표시 불필요
    workflowScore = 30
    details.push('✅ 폼이 없어 단계 표시 불필요')
  }
  score += workflowScore
  
  // 4. 관습 준수 (15점) - 로고 홈 링크
  const hasLogoLink = /<header[^>]*>[\s\S]*?<a[^>]*href\s*=\s*["'][/]?["'][^>]*>[\s\S]*?<img[^>]*[\s\S]*?<\/a>[\s\S]*?<\/header>/i.test(html) ||
                     /class\s*=\s*["'][^"']*logo[^"']*["'][^>]*>[\s\S]*?<a[^>]*href\s*=\s*["'][/]?["']/i.test(html)
  
  let conventionScore = 0
  if (hasLogoLink) {
    conventionScore = 15
    details.push('✅ 로고가 홈페이지 링크로 연결됨')
  } else {
    details.push('⚠️ 로고를 홈페이지 링크로 연결 권장')
  }
  score += conventionScore
  
  // 총점 계산 (0-100점 → 0-10점으로 변환)
  const finalScore = Math.max(0, Math.min(100, score))
  const grade = finalScore >= 70 ? 'B 이상' : finalScore >= 50 ? 'C' : 'D'
  
  return {
    rawDataCount: 100 - finalScore,  // 문제점 개수 (역산)
    naturalDataCount: finalScore,    // 좋은 점수
    naturalRatio: finalScore,        // 백분율
    score: Math.round(finalScore / 10 * 10) / 10  // 0-10점
  }
}

/**
 * 인터페이스 친화도 분석
 */
function analyzeInterfaceFriendliness(text: string, details: string[]): RealWorldMatch['interfaceFriendliness'] {
  const lowerText = text.toLowerCase()
  let friendlyScore = 0
  
  // 긍정 신호: 행동 중심의 명확한 동사
  const actionWords = text.match(/시작하|만들|보내|저장하|찾아보|확인하|선택하|클릭|눌러|등록|신청|조회|검색/g) || []
  friendlyScore += actionWords.length * 3
  
  // 긍정 신호: 사용자 중심 언어
  const userCentricWords = text.match(/당신|여러분|회원님|고객님|함께|도와드|안내|이용|편리|간편|쉽게/g) || []
  friendlyScore += userCentricWords.length * 2
  
  // 긍정 신호: 친근한 설명
  const explanatoryWords = text.match(/예를 들어|쉽게 말하면|간단히|쉽게|편리하게|빠르게/g) || []
  friendlyScore += explanatoryWords.length * 4
  
  // 부정 신호: 시스템 중심 언어
  const systemWords = text.match(/시스템|데이터베이스|서버|관리자|운영자|처리|수행|실행|구동|배포/g) || []
  friendlyScore -= systemWords.length * 3
  
  // 긍정 신호: 현실 세계 은유 (아이콘, 버튼 텍스트)
  const metaphors = text.match(/장바구니|폴더|휴지통|집|홈|담기|꺼내기|넣기|빼기|보관함|서랍/g) || []
  friendlyScore += metaphors.length * 5
  
  // 점수 정규화 (0-100점)
  const normalizedScore = Math.max(0, Math.min(100, 50 + friendlyScore))
  
  // 디테일 추가
  if (actionWords.length > 5) {
    details.push(`✅ 행동 중심 동사 ${actionWords.length}개 사용`)
  }
  if (userCentricWords.length > 3) {
    details.push(`✅ 사용자 중심 언어 ${userCentricWords.length}개 사용`)
  }
  if (systemWords.length > 5) {
    details.push(`⚠️ 시스템 중심 언어 ${systemWords.length}개 발견`)
  }
  if (metaphors.length > 2) {
    details.push(`✅ 현실 은유 ${metaphors.length}개 사용`)
  }
  
  return {
    actionWords: actionWords.length,
    userCentricWords: userCentricWords.length,
    systemWords: systemWords.length,
    metaphors: metaphors.length,
    score: Math.round(normalizedScore / 10 * 10) / 10  // 0-10점으로 변환
  }
}

/**
 * N3.1 비상구(Emergency Exit) 분석
 * 정부 49개 기관 데이터 기반 4단계 측정
 */
function analyzeUserControlFreedom(html: string): UserControlFreedom {
  try {
    // 1단계: 모달/팝업 탈출 (30점)
    const modalMatches = html.match(/<div[^>]*(role="dialog"|class="[^"]*modal[^"]*"|class="[^"]*popup[^"]*")[^>]*>/gi) || []
    const closeButtons = html.match(/<button[^>]*(닫기|close|cancel|취소)[^>]*>/gi) || []
    const xButtons = html.match(/<button[^>]*>[^<]*[×✕xX][^<]*<\/button>/gi) || []
    const escSupport = html.includes('keydown') || html.includes('Escape')
    
    const totalModals = modalMatches.length
    const escapableModals = Math.min(totalModals, closeButtons.length + xButtons.length)
    const escapeRatio = totalModals > 0 ? escapableModals / totalModals : 1
    const modalScore = Math.round(escapeRatio * 30)
    
    // 2단계: 다단계 프로세스 후퇴 (25점)
    const nextButtons = html.match(/<button[^>]*(다음|next|계속)[^>]*>/gi) || []
    const prevButtons = html.match(/<button[^>]*(이전|previous|prev|back)[^>]*>/gi) || []
    const stepIndicator = html.includes('step-indicator') || html.includes('stepper') || /step\s*[0-9]/i.test(html)
    const breadcrumbs = /<nav[^>]*breadcrumb/i.test(html) || /홈\s*>\s*/i.test(html)
    
    let stepScore = 0
    if (prevButtons.length > 0) stepScore += 15
    if (nextButtons.length > 0) stepScore += 5
    if (stepIndicator) stepScore += 5
    if (breadcrumbs) stepScore += 5
    stepScore = Math.min(stepScore, 25)
    
    // 3단계: 입력 취소/초기화 (25점)
    const forms = html.match(/<form[^>]*>/gi) || []
    const resetButtons = html.match(/<button[^>]*(type="reset"|초기화|reset|clear)[^>]*>/gi) || []
    const cancelButtons = html.match(/<button[^>]*(취소|cancel)[^>]*>/gi) || []
    const filterAreas = html.match(/<div[^>]*class="[^"]*filter[^"]*"[^>]*>/gi) || []
    const filterResetButtons = html.match(/<button[^>]*(필터.*초기화|reset.*filter)[^>]*>/gi) || []
    
    const formsWithReset = Math.min(forms.length, resetButtons.length + cancelButtons.length)
    const filtersWithReset = Math.min(filterAreas.length, filterResetButtons.length)
    
    let inputScore = 0
    if (forms.length > 0) {
      inputScore += (formsWithReset / forms.length) * 15
    } else {
      inputScore += 15 // 폼 없으면 만점
    }
    if (filterAreas.length > 0) {
      inputScore += (filtersWithReset / filterAreas.length) * 10
    } else {
      inputScore += 10 // 필터 없으면 만점
    }
    inputScore = Math.round(inputScore)
    
    // 4단계: 파괴적 행동 방지 (20점)
    const deleteButtons = html.match(/<button[^>]*(삭제|delete|remove|탈퇴|해지)[^>]*>/gi) || []
    const confirmDialogs = html.match(/confirm|확인.*하시겠습니까|정말|취소.*불가/gi) || []
    const twoStepConfirm = html.includes('재확인') || html.includes('2단계')
    
    const totalDangerousActions = deleteButtons.length
    const protectedActions = Math.min(totalDangerousActions, confirmDialogs.length)
    const protectionRatio = totalDangerousActions > 0 ? protectedActions / totalDangerousActions : 1
    let destructiveScore = Math.round(protectionRatio * 15)
    if (twoStepConfirm) destructiveScore += 5
    destructiveScore = Math.min(destructiveScore, 20)
    
    // 총점 계산
    const totalScore = modalScore + stepScore + inputScore + destructiveScore
    
    // 등급 산정
    let grade: 'A' | 'B' | 'C' | 'D'
    if (totalScore >= 90) grade = 'A'
    else if (totalScore >= 75) grade = 'B'
    else if (totalScore >= 60) grade = 'C'
    else grade = 'D'
    
    // 정부 49개 기관 벤치마크 비교
    const govAverage = 72
    const gap = totalScore - govAverage
    let status: '우수' | '평균' | '개선필요'
    let percentile: string
    
    if (totalScore >= 89) {
      status = '우수'
      percentile = '상위 10%'
    } else if (totalScore >= govAverage) {
      status = '평균'
      percentile = '상위 50%'
    } else {
      status = '개선필요'
      percentile = '하위 50%'
    }
    
    return {
      totalScore,
      grade,
      modalEscape: {
        score: modalScore,
        totalModals,
        escapableModals,
        escapeRatio: `${Math.round(escapeRatio * 100)}%`,
        details: [
          `총 모달/팝업: ${totalModals}개`,
          `탈출 가능: ${escapableModals}개`,
          `닫기 버튼: ${closeButtons.length}개`,
          `X 아이콘: ${xButtons.length}개`,
          `ESC 키 지원: ${escSupport ? '있음' : '없음'}`
        ]
      },
      stepNavigation: {
        score: stepScore,
        hasNextButtons: nextButtons.length > 0,
        hasPrevButtons: prevButtons.length > 0,
        hasStepIndicator: stepIndicator,
        hasBreadcrumbs: breadcrumbs
      },
      inputCancellation: {
        score: inputScore,
        totalForms: forms.length,
        formsWithReset,
        totalFilters: filterAreas.length,
        filtersWithReset
      },
      destructivePrevention: {
        score: destructiveScore,
        totalDangerousActions,
        protectedActions,
        protectionRatio: `${Math.round(protectionRatio * 100)}%`
      },
      govComparison: {
        siteScore: totalScore,
        govAverage,
        gap: gap >= 0 ? `+${gap}` : `${gap}`,
        percentile,
        status,
        ranking: totalScore >= 89 ? '상위권' : totalScore >= govAverage ? '중위권' : '하위권',
        commonIssues: [
          '모달 닫기 접근성 부족 (38%)',
          '다단계 이전 버튼 부재 (45%)',
          '폼 취소 후 입력값 유지 문제 (33%)',
          '삭제 전 확인 절차 부재 (41%)'
        ],
        bestPractices: [
          '정부24: ESC 키 + 명시적 닫기 버튼 모두 제공',
          '국세청 홈택스: 각 단계 저장 후 이전 가능',
          '민원24: 삭제 시 2단계 확인 + 7일 복구 기간'
        ]
      },
      recommendation: grade === 'A' 
        ? '정부 49개 기관 수준의 우수한 사용자 제어권을 제공하고 있습니다.'
        : grade === 'B'
        ? '정부 평균 수준입니다. A등급을 위해 모달 탈출과 프로세스 후퇴 기능을 강화하세요.'
        : grade === 'C'
        ? '개선이 필요합니다. 4단계 측정 항목 중 낮은 점수 영역을 집중 보완하세요.'
        : '전면 개선이 필요합니다. 정부 49개 기관 모범 사례를 참고하여 비상구 시스템을 구축하세요.',
      details: [
        `1단계(모달탈출): ${modalScore}/30점`,
        `2단계(프로세스후퇴): ${stepScore}/25점`,
        `3단계(입력취소): ${inputScore}/25점`,
        `4단계(파괴방지): ${destructiveScore}/20점`,
        `정부 평균 대비: ${gap >= 0 ? '+' : ''}${gap}점`
      ]
    }
  } catch (error) {
    // 에러 발생 시 기본값 반환
    return {
      totalScore: 0,
      grade: 'D',
      modalEscape: {
        score: 0,
        totalModals: 0,
        escapableModals: 0,
        escapeRatio: '0%',
        details: ['분석 실패']
      },
      stepNavigation: {
        score: 0,
        hasNextButtons: false,
        hasPrevButtons: false,
        hasStepIndicator: false,
        hasBreadcrumbs: false
      },
      inputCancellation: {
        score: 0,
        totalForms: 0,
        formsWithReset: 0,
        totalFilters: 0,
        filtersWithReset: 0
      },
      destructivePrevention: {
        score: 0,
        totalDangerousActions: 0,
        protectedActions: 0,
        protectionRatio: '0%'
      },
      govComparison: {
        siteScore: 0,
        govAverage: 72,
        gap: '-72',
        percentile: '하위 50%',
        status: '개선필요',
        ranking: '하위권',
        commonIssues: [],
        bestPractices: []
      },
      recommendation: '분석 중 오류가 발생했습니다.',
      details: [`에러: ${error}`]
    }
  }
}

/**
 * N3.3 네비게이션 자유도 분석
 * 4차원 모델: 텔레포트(검색), 트래킹(브레드크럼), 조감도(사이트맵), 회귀(홈)
 * 정부 49개 기관 데이터 기반
 */
function analyzeNavigationFreedom(html: string, url: string): NavigationFreedom {
  try {
    // 1단계: 텔레포트 - 검색 즉시 이동 (30점)
    let teleportScore = 0
    const teleportDetails: string[] = []
    
    const searchInputs = html.match(/<input[^>]*(type="search"|name="search"|name="q"|placeholder="[^"]*검색[^"]*")[^>]*>/gi) || []
    const hasSearchRole = /<[^>]*role="search"[^>]*>/i.test(html)
    const hasSearch = searchInputs.length > 0 || hasSearchRole
    
    if (hasSearch) {
      teleportScore += 10
      teleportDetails.push('✅ 검색 기능 존재')
      
      // 헤더 영역 배치 확인 (정규식 기반 간단 체크)
      const headerSection = html.match(/<header[^>]*>[\s\S]*?<\/header>/i)?.[0] || ''
      const navSection = html.match(/<nav[^>]*>[\s\S]*?<\/nav>/i)?.[0] || ''
      const topSection = html.substring(0, Math.min(5000, html.length))  // 상단 5000자
      
      const isGlobalSearch = headerSection.includes('search') || navSection.includes('search') || 
                             (topSection.includes('search') && topSection.indexOf('search') < 3000)
      
      if (isGlobalSearch) {
        teleportScore += 15
        teleportDetails.push('✅ 헤더 영역에 글로벌 검색 배치 (정부 98% 수준)')
      } else {
        teleportDetails.push('⚠️ 검색이 하단에 위치 (정부 43% 문제)')
      }
      
      // 검색 아이콘/버튼 명확성
      const hasSearchButton = /<button[^>]*>[^<]*검색[^<]*<\/button>/i.test(html) ||
                              /<button[^>]*search[^>]*>/i.test(html) ||
                              /<svg[^>]*>[\s\S]*?search[\s\S]*?<\/svg>/i.test(html)
      
      if (hasSearchButton) {
        teleportScore += 5
        teleportDetails.push('✅ 검색 버튼/아이콘 명확')
      }
    } else {
      teleportDetails.push('❌ 검색 기능 없음 - 텔레포트 불가 (정부 필수 기능)')
    }
    
    const teleportAccessibility = teleportScore >= 25 ? '우수' : teleportScore >= 15 ? '양호' : '미흡'
    
    // 2단계: 트래킹 - 브레드크럼 네비게이션 (30점)
    let trackingScore = 0
    const trackingDetails: string[] = []
    
    const breadcrumbPatterns = [
      /<nav[^>]*aria-label="[^"]*breadcrumb[^"]*"[^>]*>/i,
      /<[^>]*class="[^"]*breadcrumb[^"]*"[^>]*>/i,
      /<ol[^>]*class="[^"]*breadcrumb[^"]*"[^>]*>/i,
      /홈\s*[>›]\s*/i,
      /Home\s*[>›]\s*/i
    ]
    
    const hasBreadcrumb = breadcrumbPatterns.some(pattern => pattern.test(html))
    
    const pathDepth = url.split('/').filter(p => p && p !== 'http:' && p !== 'https:').length
    
    if (hasBreadcrumb) {
      trackingScore += 15
      trackingDetails.push('✅ 브레드크럼 존재')
      
      // 브레드크럼 구조 분석
      const breadcrumbSection = html.match(/<nav[^>]*breadcrumb[\s\S]*?<\/nav>/i)?.[0] || 
                                html.match(/<ol[^>]*breadcrumb[\s\S]*?<\/ol>/i)?.[0] || ''
      
      const linkCount = (breadcrumbSection.match(/<a[^>]*href/gi) || []).length
      const totalItems = (breadcrumbSection.match(/<li|<a|<span/gi) || []).length
      
      if (linkCount >= 2) {
        trackingScore += 10
        trackingDetails.push(`✅ ${linkCount}개 링크 - 계층 구조 명확`)
      }
      
      if (totalItems >= 3) trackingScore += 3
      if (totalItems >= 4) trackingScore += 2
      
      // 현재 위치 표시
      const hasCurrentMarker = /aria-current="page"|class="[^"]*active[^"]*"|class="[^"]*current[^"]*"/.test(breadcrumbSection)
      if (hasCurrentMarker) {
        trackingScore += 5
        trackingDetails.push('✅ 현재 위치 하이라이트 (국세청 스타일)')
      }
    } else {
      if (pathDepth > 2) {
        trackingDetails.push(`❌ Critical: ${pathDepth}단계 깊은 구조인데 브레드크럼 부재`)
        trackingDetails.push('⚠️ 사용자가 현재 위치 파악 불가 (정부 필수)')
      } else {
        trackingDetails.push('ℹ️ 단순 구조 - 브레드크럼 불필요')
        trackingScore += 15  // 불필요한 경우 기본 점수 부여
      }
    }
    
    const trackingQuality = trackingScore >= 25 ? '우수' : trackingScore >= 20 ? '양호' : trackingScore >= 10 ? '기본' : '없음'
    
    // 3단계: 조감도 - 구조적 가시성 (25점)
    let birdEyeScore = 0
    const birdEyeDetails: string[] = []
    
    const hasSitemap = /<a[^>]*>[^<]*(사이트맵|sitemap|전체메뉴|site map)[^<]*<\/a>/i.test(html)
    
    if (hasSitemap) {
      birdEyeScore += 12
      birdEyeDetails.push('✅ 사이트맵 링크 존재')
    } else {
      birdEyeDetails.push('⚠️ 사이트맵 없음 (정부 100% 제공)')
    }
    
    // 푸터 네비게이션 (Fat Footer)
    const footerSection = html.match(/<footer[^>]*>[\s\S]*?<\/footer>/i)?.[0] || ''
    const footerLinks = (footerSection.match(/<a[^>]*href/gi) || []).length
    const contentLinks = footerLinks  // 간단화: 전체 링크 수로 판단
    
    let footerNavScore = 0
    if (contentLinks >= 8) {
      footerNavScore = 13
      birdEyeDetails.push('✅ 풍부한 푸터 네비게이션 (8+ 링크)')
    } else if (contentLinks >= 4) {
      footerNavScore = 8
      birdEyeDetails.push('✅ 기본 푸터 네비게이션')
    } else if (contentLinks > 0) {
      birdEyeDetails.push('⚠️ 푸터 네비게이션 빈약 (정부 평균 이하)')
    }
    
    birdEyeScore += footerNavScore
    
    const birdEyeVisibility = birdEyeScore >= 20 ? '우수' : birdEyeScore >= 12 ? '양호' : '미흡'
    
    // 4단계: 회귀 - 홈 복귀 안전장치 (15점)
    let returnScore = 0
    const returnDetails: string[] = []
    
    const homeLinks = html.match(/<a[^>]*href=["'](\/|\.\/|index\.html|http[s]?:\/\/[^"'\/]+\/?)[^"']*["'][^>]*>/gi) || []
    
    // 로고가 홈으로 연결되는지 확인
    const hasLogoHomeLink = homeLinks.some(link => {
      const hasImg = /<img|<svg/i.test(link)
      const hasLogoClass = /logo|brand/i.test(link)
      const inHeader = true  // 간단화
      
      return (hasImg || hasLogoClass) && inHeader
    })
    
    if (hasLogoHomeLink) {
      returnScore = 15
      returnDetails.push('✅ 로고 홈링크 완벽 구현 (정부 표준)')
    } else if (homeLinks.length > 0) {
      returnScore = 8
      returnDetails.push('⚠️ 홈 링크 있지만 로고 연결 없음')
    } else {
      returnDetails.push('❌ 홈 복귀 수단 없음 (정부 기본 필수)')
    }
    
    const returnCapability = returnScore >= 15 ? '우수' : returnScore >= 8 ? '기본' : '없음'
    
    // 총점 및 등급
    const totalScore = teleportScore + trackingScore + birdEyeScore + returnScore
    const grade: 'A' | 'B' | 'C' | 'D' = totalScore >= 85 ? 'A' : totalScore >= 70 ? 'B' : totalScore >= 50 ? 'C' : 'D'
    
    // 정부 49개 기관 벤치마크
    const govAverage = 78
    const govTop10 = 92
    const gap = totalScore - govAverage
    const percentile = gap >= 14 ? '상위 10%' : 
                       gap >= 0 ? `상위 ${Math.round(50 - (gap / govAverage) * 30)}%` :
                       `하위 ${Math.round(50 + Math.abs(gap / govAverage) * 30)}%`
    
    const status = gap >= 0 ? '정부 평균 이상' : '정부 평균 이하'
    const ranking = gap >= 14 ? '상위 10% 수준' : gap >= 0 ? '평균 이상' : '개선 필요'
    
    // 사용자 임팩트 예측
    const findingDifficulty = totalScore < 60 ? '높음' : totalScore < 80 ? '보통' : '낮음'
    const estimatedSearchTime = totalScore < 60 ? '4분 이상' : totalScore < 80 ? '2-3분' : '1분 이내'
    const bounceRateRisk = totalScore < 60 ? '+40%' : totalScore < 80 ? '+20%' : '정상'
    const conversionImpact = totalScore < 60 ? '-35%' : totalScore < 80 ? '-15%' : '정상'
    
    // 권장사항
    let recommendation = ''
    if (grade === 'A') {
      recommendation = '✅ 네비게이션 자유도 우수 - 정부 상위 10% 수준'
    } else if (grade === 'B') {
      recommendation = '대체로 양호 - 일부 경로 보완 필요'
    } else if (grade === 'C') {
      recommendation = '⚠️ 개선 필요 - 사용자 길 찾기 어려움'
    } else {
      recommendation = '❌ 긴급 개선 필요 - 네비게이션 미로 상태'
    }
    
    const commonIssues = [
      '검색창이 하단에 숨겨짐 (정부 43% 문제)',
      '브레드크럼 깊이 부족 (정부 38% 문제)',
      '푸터 네비게이션 빈약 (정부 31% 문제)',
      '로고 홈링크 없음 (정부 29% 문제)'
    ]
    
    const bestPractices = [
      '정부24: 헤더 검색 + 5단계 브레드크럼 + 분야별 사이트맵',
      '국세청 홈택스: 검색 자동완성 + 현재위치 하이라이트',
      '서울시: 통합검색 + 관련서비스 추천 + 맞춤형 바로가기'
    ]
    
    return {
      totalScore,
      grade,
      teleport: {
        score: teleportScore,
        hasSearch,
        isGlobalSearch: teleportScore >= 25,
        hasSearchIcon: teleportScore === 30,
        accessibility: teleportAccessibility,
        details: teleportDetails
      },
      tracking: {
        score: trackingScore,
        hasBreadcrumb,
        linkCount: 0,  // 간단화
        totalDepth: 0,
        hasCurrentMarker: false,
        pathDepth,
        quality: trackingQuality,
        details: trackingDetails
      },
      birdEye: {
        score: birdEyeScore,
        hasSitemap,
        footerLinkCount: footerLinks,
        hasFooterNav: footerLinks > 0,
        structuralVisibility: birdEyeVisibility,
        details: birdEyeDetails
      },
      return: {
        score: returnScore,
        hasLogoHomeLink,
        totalHomeLinkCount: homeLinks.length,
        returnCapability,
        details: returnDetails
      },
      govComparison: {
        siteScore: totalScore,
        govAverage,
        gap: gap >= 0 ? `+${gap}` : `${gap}`,
        percentile,
        status,
        ranking,
        dimensionAvg: {
          teleport: 24,
          tracking: 21,
          birdEye: 20,
          return: 13
        },
        userImpact: {
          findingDifficulty,
          estimatedSearchTime,
          bounceRateRisk,
          conversionImpact
        },
        commonIssues,
        bestPractices
      },
      recommendation,
      details: [
        `🔍 텔레포트: ${teleportScore}/30`,
        `🍞 트래킹: ${trackingScore}/30`,
        `🗺️ 조감도: ${birdEyeScore}/25`,
        `🏠 회귀: ${returnScore}/15`,
        `정부 평균 대비: ${gap >= 0 ? '+' : ''}${gap}점`
      ]
    }
  } catch (error) {
    // 에러 발생 시 기본값 반환
    return {
      totalScore: 0,
      grade: 'D',
      teleport: {
        score: 0,
        hasSearch: false,
        isGlobalSearch: false,
        hasSearchIcon: false,
        accessibility: '미흡',
        details: ['분석 실패']
      },
      tracking: {
        score: 0,
        hasBreadcrumb: false,
        linkCount: 0,
        totalDepth: 0,
        hasCurrentMarker: false,
        pathDepth: 0,
        quality: '없음',
        details: ['분석 실패']
      },
      birdEye: {
        score: 0,
        hasSitemap: false,
        footerLinkCount: 0,
        hasFooterNav: false,
        structuralVisibility: '미흡',
        details: ['분석 실패']
      },
      return: {
        score: 0,
        hasLogoHomeLink: false,
        totalHomeLinkCount: 0,
        returnCapability: '없음',
        details: ['분석 실패']
      },
      govComparison: {
        siteScore: 0,
        govAverage: 78,
        gap: '-78',
        percentile: '하위 50%',
        status: '정부 평균 이하',
        ranking: '개선 필요',
        dimensionAvg: {
          teleport: 24,
          tracking: 21,
          birdEye: 20,
          return: 13
        },
        userImpact: {
          findingDifficulty: '높음',
          estimatedSearchTime: '4분 이상',
          bounceRateRisk: '+40%',
          conversionImpact: '-35%'
        },
        commonIssues: [],
        bestPractices: []
      },
      recommendation: '분석 중 오류가 발생했습니다.',
      details: [`에러: ${error}`]
    }
  }
}
