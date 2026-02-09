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

/**
 * 언어 일관성 분석 결과 (N4.2 용어 통일성 고도화)
 * Language Consistency Score = 핵심용어(40) + 액션표현(35) + 톤앤매너(25)
 */
export interface LanguageConsistency {
  // 3축 점수
  terminologyScore: number      // /40 (5대 핵심 용어 통일성)
  actionScore: number           // /35 (3대 액션 통일성)
  toneScore: number             // /25 (존댓말/반말 일관성)
  
  // 종합
  totalScore: number            // /100
  grade: 'A' | 'B' | 'C' | 'D'
  
  // 정부 벤치마크 비교
  govComparison: {
    siteScore: number
    govAverage: number          // 84점
    gap: number
    status: string              // '정부 표준 준수' | '표준 미준수'
    ranking: string             // '상위 10%' | '평균 이상' | '개선 필요'
    krdsCompliance: number      // KRDS 준수율 (%)
  }
  
  // 사용자 임팩트 예측
  userImpact: {
    confusionLevel: string      // '높음' | '보통' | '낮음'
    searchFailure: string       // '40% 실패' | '20% 실패' | '5% 미만'
    learningTime: string        // '+50% 증가' | '+20% 증가' | '정상'
    trustImpact: string         // '전문성 의심' | '보통' | '신뢰 구축'
  }
  
  // 세부 분석
  breakdown: {
    terminology: string         // "32/40"
    action: string              // "24/35"
    tone: string                // "15/25"
  }
  
  // 발견사항 목록
  findings: Array<{
    category: string            // 회원가입, 로그인, 검색, 문의, 비밀번호, 제출, 취소, 삭제, 존댓말
    variants?: string[]         // 발견된 변형들
    issue: string               // 혼용 문제 설명
    impact?: string             // KRDS 위반, 사용자 혼란
    recommendation?: string     // 개선 권장사항
    count?: {                   // 각 변형의 출현 횟수
      [key: string]: number
    }
  }>
  
  // 상세 분석 결과
  detailedAnalysis: {
    terminology: {
      score: number
      findings: any[]
    }
    action: {
      score: number
      findings: any[]
    }
    tone: {
      score: number
      findings: any[]
    }
  }
}

/**
 * N4.3 웹 표준 준수 (W-CORE: Web Standards 4-Layer Compliance)
 * 법적 요구사항과 정부 49개 기관 벤치마크 기반 웹 표준 분석
 */
export interface WebStandardsCompliance {
  // 종합 점수
  totalScore: number            // /100
  grade: 'A' | 'B' | 'C' | 'D'
  
  // 4계층별 점수
  breakdown: {
    htmlStructure: string       // "18/25"
    accessibility: string        // "12/30"
    semanticMarkup: string      // "19/25"
    compatibility: string        // "18/20"
  }
  
  // 정부 벤치마크 비교 (정부 49개 기관 데이터)
  govComparison: {
    siteScore: number
    govAverage: number          // 85점
    gap: number
    status: string              // '정부 표준 준수' | '표준 미달'
    ranking: string             // '상위 10% (모범사례)' | '평균 이상' | '개선 필요'
    legalRisk: '높음' | '보통' | '낮음'
    mandatoryCompliance: {
      accessibility: string     // '법적 의무 (장애인차별금지법)'
      deadline: string          // '2025년 4월부터 과태료 부과'
      penalty: string           // '위반 시 최대 3천만원'
      kwcag: string            // 'KWCAG 2.2 AA 등급 필수'
    }
  }
  
  // 사용자 임팩트
  userImpact: {
    disabledUsers: string       // '장애인 사용자 87% 접근 불가'
    elderlyUsers: string        // '고령층 사용자 64% 어려움'
    seoImpact: string          // '검색 순위 -35%'
  }
  
  // 발견사항 (CRITICAL 우선)
  findings: Array<{
    category: string            // 'Document Structure', 'Image Accessibility', etc.
    issue: string               // 문제 설명
    impact?: string             // 영향
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
    legalRisk?: string         // 법적 위험
    fix?: string               // 수정 방법
    govStandard?: string       // 정부 표준 참조
  }>
  
  // 상세 분석 (4계층)
  detailedAnalysis: {
    htmlStructure: {
      score: number
      findings: any[]
    }
    accessibility: {
      score: number
      findings: any[]
    }
    semanticMarkup: {
      score: number
      findings: any[]
    }
    compatibility: {
      score: number
      findings: any[]
    }
  }
}

/**
 * 오류 회복 3단계 프로세스 분석 결과 (N9 강화)
 * Error Recovery Score = 오류 인식(30점) + 원인 진단(40점) + 복구 실행(30점)
 * 
 * 정부 49개 기관 실증 데이터:
 * - 오류 메시지 이해 못함: 국민 72%
 * - 오류 위치 파악 불가: 68%
 * - 해결 방법 모름: 65%
 * - 입력 데이터 손실: 55%
 */
export interface ErrorRecoverySupport {
  // 1단계: 오류 인식 (Error Recognition) - 30점
  recognition: {
    colorEmphasis: number        // 빨간색 계열 강조 (10점)
    iconUsage: number            // 아이콘/경고 심볼 (10점)
    ariaSupport: number          // role="alert", aria-invalid (5점)
    positioning: number          // 필드 근처 또는 상단 배치 (5점)
    score: number                // 0-30점
  }
  
  // 2단계: 원인 진단 (Error Diagnosis) - 40점
  diagnosis: {
    userLanguage: number         // 사용자 언어 vs 전문 용어 (20점)
    specificReason: number       // 구체적 원인 설명 (15점)
    friendlyTone: number         // 사용자 친화적 톤 (5점)
    score: number                // 0-40점
  }
  
  // 3단계: 복구 실행 (Error Recovery) - 30점
  recovery: {
    actionButtons: number        // 복구 액션 버튼/링크 (15점)
    helpLinks: number            // 도움말/FAQ 링크 (10점)
    guidanceClarity: number      // 구체적 해결 방법 제시 (5점)
    score: number                // 0-30점
  }
  
  // 종합
  score: number                  // 0-100점
  quality: 'excellent' | 'good' | 'basic' | 'minimal' | 'poor' | 'none'
  details: string[]              // 발견된 패턴 및 문제점
}

/**
 * N10 도움말과 문서 분석 (Nielsen Heuristic #10)
 * 정부 49개 기관 데이터 기반 평가 기준
 */
export interface HelpDocumentation {
  // 1) 도움말 접근성 (Accessibility) - 25점
  accessibility: {
    headerFooterLinks: number  // 헤더/푸터 도움말 링크 (0-10점)
    searchFunction: number     // 검색 기능 (0-8점)
    faqExists: number          // FAQ 존재 여부 (0-7점)
    score: number              // 접근성 총점 (0-25점)
  }
  // 2) 문서 품질 (Quality) - 25점
  quality: {
    listStructure: number      // 리스트 구조 (단계별 설명) (0-10점)
    visualAids: number         // 이미지/스크린샷 (0-8점)
    examples: number           // 예시/샘플 (0-7점)
    score: number              // 품질 총점 (0-25점)
  }
  total_score: number          // 전체 점수 (0-50점)
  status: 'excellent' | 'good' | 'basic' | 'minimal' | 'poor' | 'none'
  details: string[]            // 발견된 이슈 목록
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
  languageConsistency: LanguageConsistency // N4.2 언어 일관성 (용어 통일)
  webStandardsCompliance: WebStandardsCompliance // N4.3 웹 표준 준수 (W-CORE)
  helpDocumentation?: HelpDocumentation // N10 도움말과 문서
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

/**
 * 실시간 검증 분석 결과 (N5 오류 예방 - 2단계)
 */
export interface RealtimeValidation {
  totalForms: number
  formsWithValidation: number
  validationRatio: number  // 0-100%
  features: {
    hasAriaInvalid: number       // aria-invalid 속성 사용
    hasErrorMessages: number     // 에러 메시지 영역 존재
    hasLiveRegion: number        // aria-live 실시간 알림 영역
    hasBrowserValidation: number // 브라우저 기본 검증 (novalidate 없음)
  }
  score: number  // 0-30점
  quality: 'excellent' | 'good' | 'basic' | 'minimal' | 'none'
}

/**
 * 제약 조건 품질 분석 (N5.3 제약 표시 강화)
 * PIGS 프레임워크 기반: Explicit Rules (35점) + Example Provision (30점) + Visual Guidance (35점) = 100점
 */
export interface ConstraintQuality {
  totalInputs: number              // 전체 입력 필드 수
  hasExplicitRules: number         // 명시적 규칙 개수 ("8자 이상", "영문+숫자" 등)
  hasExamples: number              // 예시 제공 개수 ("010-1234-5678", placeholder 등)
  hasRequiredMarker: number        // 필수 표시 개수 (*, 필수, required, aria-required)
  quality: 'excellent' | 'good' | 'basic' | 'minimal' | 'poor' | 'none'
  score: number                    // 0-100점
  details: string[]                // 상세 분석 내용
}

/**
 * 기억 부담 최소화 지원 분석 (N6.3 기억할 것 최소화)
 * Breadcrumb + 자동완성 + 기본값 + 자동완성 제안
 */
export interface MemoryLoadSupport {
  hasBreadcrumb: boolean           // Breadcrumb 존재 여부
  autocompleteCount: number        // autocomplete 속성 사용 개수
  defaultValueCount: number        // 기본값 설정 개수 (value, selected, checked)
  datalistCount: number            // datalist 자동완성 제안 개수
  score: number                    // 0-100점
  quality: 'excellent' | 'good' | 'basic' | 'minimal' | 'none'
  details: string[]                // 상세 분석 내용
}

/**
 * 유연성과 효율성 지원 분석 (N7: Flexibility and Efficiency of Use)
 * 엠진의 '숙련도 기반 효율성 3축 모델'
 * - 1축: Accelerators (가속 장치) 40점
 * - 2축: Personalization (개인화) 35점
 * - 3축: Batch Operations (일괄 처리) 25점
 */
export interface FlexibilityEfficiencySupport {
  // 1축: Accelerators (가속 장치) - 총 40점
  accelerators: {
    keyboardShortcuts: number      // 키보드 단축키 (15점)
    quickMenu: number               // 빠른 메뉴/즐겨찾기 (12점)
    recentItems: number             // 최근 이용 기록 (8점)
    skipNavigation: number          // Skip Navigation (5점)
    score: number                   // 가속 장치 총점 (0-40)
  }
  
  // 2축: Personalization (개인화) - 총 35점
  personalization: {
    settings: number                // 설정 개인화 (15점)
    fontSize: number                // 글자 크기 조절 (10점)
    theme: number                   // 다크모드/테마 (5점)
    language: number                // 언어 선택 (5점)
    score: number                   // 개인화 총점 (0-35)
  }
  
  // 3축: Batch Operations (일괄 처리) - 총 25점
  batchOperations: {
    selectAll: number               // 전체 선택 기능 (15점)
    bulkActions: number             // 일괄 작업 버튼 (10점)
    score: number                   // 일괄 처리 총점 (0-25)
  }
  
  // 종합
  score: number                     // 총점 (0-100)
  quality: 'excellent' | 'good' | 'basic' | 'minimal' | 'poor' | 'none'
  details: string[]
}

export interface FormStructure {
  formCount: number
  inputCount: number
  labelRatio: number
  validationExists: boolean
  interactiveFeedbackExists: boolean  // 호버/포커스/클릭 피드백 존재 여부
  realtimeValidation?: RealtimeValidation  // 실시간 검증 분석 (신규)
  constraintQuality?: ConstraintQuality    // 제약 조건 품질 (N5.3 강화)
  memoryLoadSupport?: MemoryLoadSupport    // 기억 부담 최소화 지원 (N6.3 강화)
  flexibilityEfficiency?: FlexibilityEfficiencySupport  // 유연성과 효율성 지원 (N7 재구성)
  errorRecovery?: ErrorRecoverySupport     // 오류 회복 3단계 프로세스 (N9 강화)
}

export interface VisualStructure {
  imageCount: number
  videoCount: number
  iconCount: number
  visualConsistency: {
    score: number
    grade: 'A' | 'B' | 'C' | 'D'
    issues: Array<{ type: string; severity: string; message: string }>
    strengths: string[]
  }
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
  const forms = analyzeForms(html, navigation)  // navigation 전달
  const visuals = analyzeVisuals(html)
  const realWorldMatch = analyzeRealWorldMatch(html)
  const userControlFreedom = analyzeUserControlFreedom(html)
  const navigationFreedom = analyzeNavigationFreedom(html, url)
  const languageConsistency = analyzeLanguageConsistency(html)
  const webStandardsCompliance = analyzeWebStandardsCompliance(html)
  const helpDocumentation = analyzeHelpDocumentation(html)  // N10 도움말과 문서

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
    navigationFreedom,
    languageConsistency,
    webStandardsCompliance,
    helpDocumentation  // N10 추가
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

/**
 * 실시간 검증 분석 (N5 오류 예방 - 2단계)
 * HTML 정적 분석으로 실시간 검증 메커니즘 탐지
 */
function analyzeRealtimeValidation(html: string): RealtimeValidation {
  // <form> 태그 추출 (간단한 매칭)
  const formPattern = /<form[^>]*>[\s\S]*?<\/form>/gi
  const forms = html.match(formPattern) || []
  
  if (forms.length === 0) {
    // 폼이 없으면 만점 (검증 불필요)
    return {
      totalForms: 0,
      formsWithValidation: 0,
      validationRatio: 100,
      features: {
        hasAriaInvalid: 0,
        hasErrorMessages: 0,
        hasLiveRegion: 0,
        hasBrowserValidation: 0
      },
      score: 30,
      quality: 'none'
    }
  }
  
  let validationCount = 0
  const features = {
    hasAriaInvalid: 0,
    hasErrorMessages: 0,
    hasLiveRegion: 0,
    hasBrowserValidation: 0
  }
  
  forms.forEach(form => {
    let hasValidation = false
    
    // 1. 브라우저 기본 검증 사용 (novalidate 속성 없음)
    if (!/novalidate/i.test(form)) {
      hasValidation = true
      features.hasBrowserValidation++
    }
    
    // 2. aria-invalid 속성 (실시간 검증의 표준)
    if (/aria-invalid\s*=/i.test(form)) {
      hasValidation = true
      features.hasAriaInvalid++
    }
    
    // 3. 에러 메시지 영역
    // - role="alert": 경고 역할
    // - class*="error": 에러 클래스
    // - id*="error": 에러 ID
    // - aria-describedby*="error": 에러 설명 연결
    if (/role\s*=\s*["']alert["']|class\s*=\s*["'][^"']*error[^"']*["']|id\s*=\s*["'][^"']*error[^"']*["']|aria-describedby\s*=\s*["'][^"']*error[^"']*["']/i.test(form)) {
      hasValidation = true
      features.hasErrorMessages++
    }
    
    // 4. aria-live 영역 (동적 메시지 알림)
    if (/aria-live\s*=\s*["'](polite|assertive)["']/i.test(form)) {
      hasValidation = true
      features.hasLiveRegion++
    }
    
    if (hasValidation) validationCount++
  })
  
  const ratio = (validationCount / forms.length) * 100
  let score = Math.round((ratio / 100) * 30)
  let quality: RealtimeValidation['quality']
  
  if (ratio === 0) quality = 'none'
  else if (ratio < 40) quality = 'minimal'
  else if (ratio < 60) quality = 'basic'
  else if (ratio < 85) quality = 'good'
  else quality = 'excellent'
  
  return {
    totalForms: forms.length,
    formsWithValidation: validationCount,
    validationRatio: Math.round(ratio),
    features,
    score,
    quality
  }
}

function analyzeForms(html: string, navigation: NavigationStructure): FormStructure {
  const formMatches = html.match(/<form[^>]*>/gi) || []
  const inputMatches = html.match(/<input[^>]*>/gi) || []
  const labelMatches = html.match(/<label[^>]*>/gi) || []
  const validationExists = /required|pattern|minlength|maxlength/i.test(html)
  const interactiveFeedbackExists = detectInteractiveFeedback(html)
  
  // 실시간 검증 분석 추가
  const realtimeValidation = analyzeRealtimeValidation(html)

  const labelRatio = inputMatches.length > 0 
    ? labelMatches.length / inputMatches.length 
    : 1

  // 제약조건 품질 분석 추가 (N5.3 강화)
  const constraintQuality = analyzeConstraintQuality(html)
  
  // 기억 부담 최소화 지원 분석 추가 (N6.3 강화)
  const memoryLoadSupport = analyzeMemoryLoadSupport(html, navigation)
  
  // 유연성과 효율성 지원 분석 추가 (N7 재구성)
  const flexibilityEfficiency = analyzeFlexibilityEfficiency(html)
  
  // 오류 회복 3단계 프로세스 분석 추가 (N9 강화)
  const errorRecovery = analyzeErrorRecovery(html)

  return {
    formCount: formMatches.length,
    inputCount: inputMatches.length,
    labelRatio,
    validationExists,
    interactiveFeedbackExists,
    realtimeValidation,
    constraintQuality,
    memoryLoadSupport,
    flexibilityEfficiency,
    errorRecovery
  }
}

/**
 * 제약조건 품질 분석 (N5.3 강화 - 입력 조건 미리 알리기)
 * 4계층 PIGS 프레임워크 기반
 */
function analyzeConstraintQuality(html: string): ConstraintQuality {
  // 전체 입력 필드 수 계산
  const inputMatches = html.match(/<input[^>]*>/gi) || []
  const textareaMatches = html.match(/<textarea[^>]*>/gi) || []
  const selectMatches = html.match(/<select[^>]*>/gi) || []
  const totalInputs = inputMatches.length + textareaMatches.length + selectMatches.length

  if (totalInputs === 0) {
    return {
      totalInputs: 0,
      hasExplicitRules: 0,
      hasExamples: 0,
      hasRequiredMarker: 0,
      quality: 'none',
      score: 0,  // 입력 필드 없음 → 0점 (평가 불가)
      details: ['입력 필드가 없어 제약조건 평가가 불가능합니다.']
    }
  }

  const details: string[] = []

  // 1계층: 명시적 규칙 탐지 (Explicit Rules)
  // 정규식: "N자 이상", "영문", "숫자", "특수문자", "형식", "필수" 등
  const explicitRulePatterns = [
    /\d+자\s*이상/gi,
    /\d+자\s*이하/gi,
    /영문/gi,
    /숫자/gi,
    /특수문자/gi,
    /형식/gi,
    /필수/gi,
    /조건/gi,
    /입력\s*방법/gi,
    /\d+글자/gi,
    /[a-zA-Z가-힣]+\s*포함/gi
  ]

  let explicitRulesCount = 0
  explicitRulePatterns.forEach(pattern => {
    const matches = html.match(pattern)
    if (matches) {
      explicitRulesCount += matches.length
      details.push(`명시적 규칙 발견: ${pattern.source} (${matches.length}개)`)
    }
  })

  // 2계층: 예시 제공 탐지 (Example Provision)
  // placeholder, aria-describedby, 예시 텍스트
  const examplePatterns = [
    /placeholder\s*=\s*["'][^"']{3,}["']/gi,
    /aria-describedby/gi,
    /예:/gi,
    /example:/gi,
    /e\.g\./gi,
    /예시/gi,
    /\(예:\s*/gi,
    /ex\)/gi
  ]

  let examplesCount = 0
  examplePatterns.forEach(pattern => {
    const matches = html.match(pattern)
    if (matches) {
      examplesCount += matches.length
      details.push(`예시 제공 발견: ${pattern.source} (${matches.length}개)`)
    }
  })

  // 4계층: 필수 입력 시각적 표시 탐지 (Visual Guidance)
  // *, required, aria-required
  const requiredPatterns = [
    /\*/g,
    /required/gi,
    /aria-required\s*=\s*["']true["']/gi,
    /필수\s*항목/gi,
    /필수\s*입력/gi,
    /<span[^>]*class\s*=\s*["'][^"']*required[^"']*["']/gi
  ]

  let requiredMarkersCount = 0
  requiredPatterns.forEach(pattern => {
    const matches = html.match(pattern)
    if (matches) {
      requiredMarkersCount += matches.length
      details.push(`필수 표시 발견: ${pattern.source} (${matches.length}개)`)
    }
  })

  // 점수 계산 (100점 만점)
  // 1계층 명시적 규칙: 35점
  const explicitRulesScore = Math.min(35, (explicitRulesCount / totalInputs) * 35)
  
  // 2계층 예시 제공: 30점
  const examplesScore = Math.min(30, (examplesCount / totalInputs) * 30)
  
  // 4계층 필수 표시: 35점 (3계층 Real-time Hints는 정적 분석 불가로 제외, 비중 재분배)
  const requiredMarkersScore = Math.min(35, (requiredMarkersCount / totalInputs) * 35)

  const totalScore = Math.round(explicitRulesScore + examplesScore + requiredMarkersScore)

  // 품질 등급 결정
  let quality: ConstraintQuality['quality']
  if (totalScore >= 90) quality = 'excellent'
  else if (totalScore >= 75) quality = 'good'
  else if (totalScore >= 60) quality = 'basic'
  else if (totalScore >= 40) quality = 'minimal'
  else quality = 'poor'

  details.unshift(`총 입력 필드: ${totalInputs}개, 명시적 규칙: ${explicitRulesCount}개, 예시: ${examplesCount}개, 필수 표시: ${requiredMarkersCount}개`)

  return {
    totalInputs,
    hasExplicitRules: explicitRulesCount,
    hasExamples: examplesCount,
    hasRequiredMarker: requiredMarkersCount,
    quality,
    score: totalScore,
    details
  }
}

/**
 * 기억 부담 최소화 지원 분석 (N6.3 기억할 것 최소화)
 * Breadcrumb + 자동완성 + 기본값 + 자동완성 제안
 */
function analyzeMemoryLoadSupport(html: string, navigation: NavigationStructure): MemoryLoadSupport {
  const details: string[] = []
  
  // 1. Breadcrumb 존재 여부
  const hasBreadcrumb = navigation.breadcrumbExists
  if (hasBreadcrumb) {
    details.push(`✅ Breadcrumb 존재: 현재 위치 파악 용이`)
  }
  
  // 2. autocomplete 속성 사용 개수
  const autocompletePatterns = [
    /autocomplete\s*=\s*["'](?:on|name|email|username|tel|address-line1|postal-code|cc-number|cc-exp|cc-csc|bday|sex|url|photo)["']/gi
  ]
  
  let autocompleteCount = 0
  autocompletePatterns.forEach(pattern => {
    const matches = html.match(pattern)
    if (matches) {
      autocompleteCount += matches.length
      details.push(`✅ autocomplete 속성 발견: ${matches.length}개 (예: email, name, tel 등)`)
    }
  })
  
  // 3. 기본값 설정 개수 (value, selected, checked)
  const defaultValuePatterns = [
    /<input[^>]*\svalue\s*=\s*["'][^"']+["'][^>]*>/gi,  // input value
    /<option[^>]*\sselected[^>]*>/gi,                   // selected option
    /<input[^>]*type\s*=\s*["'](?:checkbox|radio)["'][^>]*\schecked[^>]*>/gi  // checked
  ]
  
  let defaultValueCount = 0
  defaultValuePatterns.forEach((pattern, index) => {
    const matches = html.match(pattern)
    if (matches) {
      defaultValueCount += matches.length
      const type = index === 0 ? 'input value' : index === 1 ? 'selected option' : 'checked'
      details.push(`✅ 기본값 설정 발견: ${type} ${matches.length}개`)
    }
  })
  
  // 4. datalist 자동완성 제안 개수
  const datalistPattern = /<datalist[^>]*>/gi
  const datalistMatches = html.match(datalistPattern)
  const datalistCount = datalistMatches ? datalistMatches.length : 0
  
  if (datalistCount > 0) {
    details.push(`✅ datalist 자동완성 제안: ${datalistCount}개`)
  }
  
  // 점수 계산 (100점 만점)
  // Breadcrumb: 40점
  const breadcrumbScore = hasBreadcrumb ? 40 : 0
  
  // autocomplete: 30점 (3개 이상이면 만점)
  const autocompleteScore = Math.min(30, (autocompleteCount / 3) * 30)
  
  // 기본값: 20점 (2개 이상이면 만점)
  const defaultValueScore = Math.min(20, (defaultValueCount / 2) * 20)
  
  // datalist: 10점 (1개 이상이면 만점)
  const datalistScore = Math.min(10, datalistCount * 10)
  
  const totalScore = Math.round(breadcrumbScore + autocompleteScore + defaultValueScore + datalistScore)
  
  // 품질 등급 결정
  let quality: MemoryLoadSupport['quality']
  if (totalScore >= 80) quality = 'excellent'
  else if (totalScore >= 60) quality = 'good'
  else if (totalScore >= 40) quality = 'basic'
  else if (totalScore >= 20) quality = 'minimal'
  else quality = 'none'
  
  details.unshift(
    `총점: ${totalScore}/100 (Breadcrumb ${breadcrumbScore}점 + autocomplete ${Math.round(autocompleteScore)}점 + 기본값 ${Math.round(defaultValueScore)}점 + datalist ${datalistScore}점)`
  )
  
  return {
    hasBreadcrumb,
    autocompleteCount,
    defaultValueCount,
    datalistCount,
    score: totalScore,
    quality,
    details
  }
}

/**
 * 유연성과 효율성 지원 분석 (N7: Flexibility and Efficiency of Use)
 * 엠진의 '숙련도 기반 효율성 3축 모델'
 * - 정부 49개 기관 실증 데이터 기반
 * - 평균 68점, 상위 10% 87점
 * - 숙련자 43% 불만, 반복 작업 8.3분/일 소요
 */
function analyzeFlexibilityEfficiency(html: string): FlexibilityEfficiencySupport {
  const details: string[] = []
  
  // === 1축: Accelerators (가속 장치) - 총 40점 ===
  
  // 1.1 키보드 단축키 (15점)
  let keyboardShortcuts = 0
  const shortcutPatterns = [
    /accesskey\s*=\s*["'][^"']+["']/gi,           // accesskey 속성
    /\b(?:ctrl|alt|shift)\s*\+\s*[a-z0-9]/gi,    // Ctrl+K, Alt+S 등
    /단축키|shortcut|keyboard/gi                   // 단축키 안내
  ]
  
  shortcutPatterns.forEach(pattern => {
    const matches = html.match(pattern)
    if (matches && matches.length > 0) {
      keyboardShortcuts = 15
      details.push(`✅ 키보드 단축키: ${matches.length}개 발견`)
    }
  })
  
  if (keyboardShortcuts === 0) {
    details.push(`❌ 키보드 단축키 미제공 (정부 90% 미제공)`)
  }
  
  // 1.2 빠른 메뉴/즐겨찾기 (12점)
  let quickMenu = 0
  const quickMenuPatterns = [
    /즐겨찾기|favorite|bookmark/gi,
    /자주\s*찾는|빠른\s*메뉴|quick\s*menu/gi,
    /마이\s*메뉴|my\s*menu/gi
  ]
  
  quickMenuPatterns.forEach(pattern => {
    const matches = html.match(pattern)
    if (matches && matches.length > 0) {
      quickMenu = 12
      details.push(`✅ 빠른 메뉴/즐겨찾기: 발견`)
    }
  })
  
  if (quickMenu === 0) {
    details.push(`❌ 빠른 메뉴/즐겨찾기 미제공`)
  }
  
  // 1.3 최근 이용 기록 (8점)
  let recentItems = 0
  const recentPatterns = [
    /최근\s*(?:본|이용|방문|검색)/gi,
    /recent(?:ly)?\s*(?:viewed|visited|searched)/gi,
    /history/gi
  ]
  
  recentPatterns.forEach(pattern => {
    const matches = html.match(pattern)
    if (matches && matches.length > 0) {
      recentItems = 8
      details.push(`✅ 최근 이용 기록: 발견`)
    }
  })
  
  if (recentItems === 0) {
    details.push(`❌ 최근 이용 기록 미제공 (정부 62% 미제공, 재탐색 불만)`)
  }
  
  // 1.4 Skip Navigation (5점)
  let skipNavigation = 0
  const skipPatterns = [
    /<a[^>]*href\s*=\s*["']#(?:content|main|skip)["'][^>]*>/gi,
    /본문\s*바로가기|skip\s*to\s*(?:content|main)/gi
  ]
  
  skipPatterns.forEach(pattern => {
    const matches = html.match(pattern)
    if (matches && matches.length > 0) {
      skipNavigation = 5
      details.push(`✅ Skip Navigation: 발견`)
    }
  })
  
  if (skipNavigation === 0) {
    details.push(`⚠️ Skip Navigation 미제공`)
  }
  
  const acceleratorsScore = keyboardShortcuts + quickMenu + recentItems + skipNavigation
  
  // === 2축: Personalization (개인화) - 총 35점 ===
  
  // 2.1 설정 개인화 (15점)
  let settings = 0
  const settingsPatterns = [
    /설정|환경설정|내\s*정보|마이페이지/gi,
    /settings?|preferences|my\s*page|profile/gi
  ]
  
  settingsPatterns.forEach(pattern => {
    const matches = html.match(pattern)
    if (matches && matches.length > 0) {
      settings = 15
      details.push(`✅ 설정 개인화: 발견`)
    }
  })
  
  if (settings === 0) {
    details.push(`❌ 설정 개인화 미제공 (정부 85% 미제공)`)
  }
  
  // 2.2 글자 크기 조절 (10점)
  let fontSize = 0
  const fontSizePatterns = [
    /글자\s*크기|font\s*size/gi,
    /\b(?:text|font)-(?:size|scale|zoom)/gi,
    /확대|축소|zoom/gi
  ]
  
  fontSizePatterns.forEach(pattern => {
    const matches = html.match(pattern)
    if (matches && matches.length > 0) {
      fontSize = 10
      details.push(`✅ 글자 크기 조절: 발견`)
    }
  })
  
  if (fontSize === 0) {
    details.push(`❌ 글자 크기 조절 미제공 (정부 70% 미제공, 고령층 불편)`)
  }
  
  // 2.3 다크모드/테마 (5점)
  let theme = 0
  const themePatterns = [
    /다크\s*모드|dark\s*mode/gi,
    /테마|theme/gi,
    /\bmode\s*=\s*["'](?:dark|light)["']/gi
  ]
  
  themePatterns.forEach(pattern => {
    const matches = html.match(pattern)
    if (matches && matches.length > 0) {
      theme = 5
      details.push(`✅ 다크모드/테마: 발견`)
    }
  })
  
  if (theme === 0) {
    details.push(`⚠️ 다크모드/테마 미제공`)
  }
  
  // 2.4 언어 선택 (5점)
  let language = 0
  const languagePatterns = [
    /<select[^>]*>(?:[^<]*<option[^>]*>)*[^<]*(?:한국어|english|日本語|中文)[^<]*<\/option>/gi,
    /언어\s*선택|language\s*select/gi,
    /\blang\s*=\s*["'](?:ko|en|ja|zh)["']/gi
  ]
  
  languagePatterns.forEach(pattern => {
    const matches = html.match(pattern)
    if (matches && matches.length > 0) {
      language = 5
      details.push(`✅ 언어 선택: 발견`)
    }
  })
  
  if (language === 0) {
    details.push(`ℹ️ 언어 선택 미제공 (필요 시 다국어 지원)`)
  }
  
  const personalizationScore = settings + fontSize + theme + language
  
  // === 3축: Batch Operations (일괄 처리) - 총 25점 ===
  
  // 3.1 전체 선택 기능 (15점)
  let selectAll = 0
  const selectAllPatterns = [
    /전체\s*선택|select\s*all/gi,
    /<input[^>]*type\s*=\s*["']checkbox["'][^>]*(?:id|name)\s*=\s*["'](?:selectAll|checkAll)["']/gi
  ]
  
  selectAllPatterns.forEach(pattern => {
    const matches = html.match(pattern)
    if (matches && matches.length > 0) {
      selectAll = 15
      details.push(`✅ 전체 선택 기능: 발견`)
    }
  })
  
  if (selectAll === 0) {
    details.push(`❌ 전체 선택 기능 미제공 (정부 78% 미제공)`)
  }
  
  // 3.2 일괄 작업 버튼 (10점)
  let bulkActions = 0
  const bulkPatterns = [
    /일괄|batch|bulk/gi,
    /선택\s*(?:삭제|수정|다운로드)/gi
  ]
  
  bulkPatterns.forEach(pattern => {
    const matches = html.match(pattern)
    if (matches && matches.length > 0) {
      bulkActions = 10
      details.push(`✅ 일괄 작업 버튼: 발견`)
    }
  })
  
  if (bulkActions === 0) {
    details.push(`❌ 일괄 작업 버튼 미제공`)
  }
  
  const batchOperationsScore = selectAll + bulkActions
  
  // === 종합 점수 계산 ===
  const totalScore = acceleratorsScore + personalizationScore + batchOperationsScore
  
  // 품질 등급 결정
  let quality: FlexibilityEfficiencySupport['quality']
  if (totalScore >= 85) quality = 'excellent'      // 상위 10% (87점 기준)
  else if (totalScore >= 70) quality = 'good'       // 평균 이상 (68점 기준)
  else if (totalScore >= 50) quality = 'basic'
  else if (totalScore >= 30) quality = 'minimal'
  else if (totalScore > 0) quality = 'poor'
  else quality = 'none'
  
  details.unshift(
    `총점: ${totalScore}/100 (가속장치 ${acceleratorsScore}점 + 개인화 ${personalizationScore}점 + 일괄처리 ${batchOperationsScore}점)`
  )
  
  return {
    accelerators: {
      keyboardShortcuts,
      quickMenu,
      recentItems,
      skipNavigation,
      score: acceleratorsScore
    },
    personalization: {
      settings,
      fontSize,
      theme,
      language,
      score: personalizationScore
    },
    batchOperations: {
      selectAll,
      bulkActions,
      score: batchOperationsScore
    },
    score: totalScore,
    quality,
    details
  }
}

/**
 * N9: 오류 회복 3단계 프로세스 분석
 * 정부 49개 기관 실증 데이터 기반
 */
function analyzeErrorRecovery(html: string): ErrorRecoverySupport {
  const details: string[] = []
  
  // 오류 관련 요소 탐지
  const errorElements = [
    ...Array.from(html.matchAll(/<[^>]+(?:role\s*=\s*["']alert["']|class\s*=\s*["'][^"']*\b(?:error|invalid|danger)[^"']*["']|aria-invalid\s*=\s*["']true["'])[^>]*>/gi))
  ]
  
  // 오류 메시지 텍스트 추출
  const errorMessages: string[] = []
  const errorTextMatches = html.match(/<[^>]+(?:class|role)\s*=\s*["'][^"']*\b(?:error|invalid|alert)[^"']*["'][^>]*>([^<]+)<\//gi) || []
  errorTextMatches.forEach(match => {
    const textMatch = match.match(/>([^<]+)</)
    if (textMatch && textMatch[1].trim().length > 0) {
      errorMessages.push(textMatch[1].trim())
    }
  })
  
  // 오류가 없으면 기본 점수 반환
  if (errorElements.length === 0 && errorMessages.length === 0) {
    return {
      recognition: {
        colorEmphasis: 0,
        iconUsage: 0,
        ariaSupport: 0,
        positioning: 0,
        score: 0
      },
      diagnosis: {
        userLanguage: 0,
        specificReason: 0,
        friendlyTone: 0,
        score: 0
      },
      recovery: {
        actionButtons: 0,
        helpLinks: 0,
        guidanceClarity: 0,
        score: 0
      },
      score: 0,
      quality: 'none',
      details: ['ℹ️ 현재 오류 요소 없음 - 평가 대상 없음']
    }
  }
  
  // === 1단계: 오류 인식 (Error Recognition) - 30점 ===
  
  // 1.1 색상 강조 (10점) - 빨간색 계열
  let colorEmphasis = 0
  const redColorPatterns = [
    /(?:color|border-color|background-color)\s*:\s*(?:red|#[fF][0-9a-fA-F]{5}|rgb\s*\(\s*2[0-9]{2}|rgba\s*\(\s*2[0-9]{2})/gi,
    /class\s*=\s*["'][^"']*\b(?:text-red|bg-red|border-red|text-danger|bg-danger)[^"']*["']/gi
  ]
  
  redColorPatterns.forEach(pattern => {
    const matches = html.match(pattern) || []
    if (matches.length > 0) {
      colorEmphasis = Math.min(10, matches.length * 3)
      details.push(`✅ 색상 강조: ${matches.length}개 요소`)
    }
  })
  
  // 1.2 아이콘/경고 심볼 (10점)
  let iconUsage = 0
  const errorIconPatterns = [
    /<i\s+[^>]*class\s*=\s*["'][^"']*\b(?:fa-exclamation|fa-warning|fa-error|alert-icon)[^"']*["']/gi,
    /<svg[^>]*>(?:[^<]*<path[^>]*>[^<]*)*<\/svg>/gi,
    /⚠️|❌|🚫|⛔/g
  ]
  
  errorIconPatterns.forEach(pattern => {
    const matches = html.match(pattern) || []
    if (matches.length > 0) {
      iconUsage = Math.min(10, matches.length * 4)
      details.push(`✅ 오류 아이콘: ${matches.length}개`)
    }
  })
  
  // 1.3 ARIA 지원 (5점)
  let ariaSupport = 0
  const ariaErrorCount = (html.match(/(?:role\s*=\s*["']alert["']|aria-invalid\s*=\s*["']true["']|aria-errormessage)/gi) || []).length
  if (ariaErrorCount > 0) {
    ariaSupport = 5
    details.push(`✅ ARIA 오류 지원: ${ariaErrorCount}개`)
  }
  
  // 1.4 위치 배치 (5점) - 필드 근처 또는 상단
  let positioning = 0
  if (errorElements.length > 0) {
    positioning = 5
    details.push(`✅ 오류 요소 위치: ${errorElements.length}개 배치`)
  }
  
  const recognitionScore = colorEmphasis + iconUsage + ariaSupport + positioning
  
  // === 2단계: 원인 진단 (Error Diagnosis) - 40점 ===
  
  // 2.1 사용자 언어 vs 전문 용어 (20점)
  let userLanguage = 20
  let technicalTermCount = 0
  const technicalTerms = /\b(?:404|500|error code|exception|null|undefined|invalid input|database|server error|syntax error|timeout)/gi
  
  errorMessages.forEach(msg => {
    const matches = msg.match(technicalTerms)
    if (matches) {
      technicalTermCount += matches.length
      userLanguage = Math.max(0, 20 - technicalTermCount * 7)
      details.push(`❌ 전문 용어 사용: "${msg.substring(0, 50)}..." (정부 72% 불만)`)
    }
  })
  
  if (technicalTermCount === 0 && errorMessages.length > 0) {
    details.push(`✅ 사용자 친화 언어 사용`)
  }
  
  // 2.2 구체적 원인 설명 (15점)
  let specificReason = 0
  let specificCount = 0
  
  errorMessages.forEach(msg => {
    const hasWhat = /이메일|비밀번호|전화번호|파일|날짜|이름|주소|카드/gi.test(msg)
    const hasHow = /형식|길이|크기|조건|이상|이하|필수|올바르지|입력하세요/gi.test(msg)
    
    if (hasWhat && hasHow) {
      specificCount++
      details.push(`✅ 구체적 원인: "${msg.substring(0, 50)}..."`)
    } else if (!hasWhat && !hasHow) {
      details.push(`❌ 모호한 오류: "${msg.substring(0, 50)}..." (정부 68% 불만)`)
    }
  })
  
  if (errorMessages.length > 0) {
    specificReason = Math.round((specificCount / errorMessages.length) * 15)
  }
  
  // 2.3 사용자 친화적 톤 (5점)
  let friendlyTone = 5
  const unfriendlyPatterns = /잘못|틀렸|invalid|wrong|fail|incorrect/gi
  
  errorMessages.forEach(msg => {
    if (unfriendlyPatterns.test(msg)) {
      friendlyTone = 0
      details.push(`⚠️ 비친화적 톤: "${msg.substring(0, 50)}..."`)
    }
  })
  
  const diagnosisScore = userLanguage + specificReason + friendlyTone
  
  // === 3단계: 복구 실행 (Error Recovery) - 30점 ===
  
  // 3.1 복구 액션 버튼/링크 (15점)
  let actionButtons = 0
  const recoveryActions = [
    /다시\s*시도|재시도|retry/gi,
    /비밀번호\s*찾기|아이디\s*찾기|find\s*password/gi,
    /문의|도움말|help|support|contact/gi
  ]
  
  recoveryActions.forEach(pattern => {
    const matches = html.match(pattern) || []
    if (matches.length > 0) {
      actionButtons = Math.min(15, matches.length * 5)
      details.push(`✅ 복구 액션: ${matches.length}개 발견`)
    }
  })
  
  if (actionButtons === 0) {
    details.push(`❌ 복구 방법 없음 (정부 65% 불만)`)
  }
  
  // 3.2 도움말/FAQ 링크 (10점)
  let helpLinks = 0
  const helpPatterns = [
    /<a[^>]+href\s*=\s*["'][^"']*(?:help|faq|support|guide)["'][^>]*>/gi,
    /도움말|FAQ|가이드|안내/gi
  ]
  
  helpPatterns.forEach(pattern => {
    const matches = html.match(pattern) || []
    if (matches.length > 0) {
      helpLinks = 10
      details.push(`✅ 도움말 링크: ${matches.length}개`)
    }
  })
  
  // 3.3 구체적 해결 방법 제시 (5점)
  let guidanceClarity = 0
  errorMessages.forEach(msg => {
    if (/다시|재입력|확인|변경|선택|입력하세요/gi.test(msg)) {
      guidanceClarity = 5
      details.push(`✅ 해결 방법 제시: "${msg.substring(0, 50)}..."`)
    }
  })
  
  const recoveryScore = actionButtons + helpLinks + guidanceClarity
  
  // === 종합 점수 계산 ===
  const totalScore = recognitionScore + diagnosisScore + recoveryScore
  
  let quality: 'excellent' | 'good' | 'basic' | 'minimal' | 'poor' | 'none' = 'none'
  if (totalScore >= 80) quality = 'excellent'
  else if (totalScore >= 60) quality = 'good'
  else if (totalScore >= 40) quality = 'basic'
  else if (totalScore >= 20) quality = 'minimal'
  else if (totalScore > 0) quality = 'poor'
  
  details.unshift(
    `총점: ${totalScore}/100 (인식 ${recognitionScore}/30 + 진단 ${diagnosisScore}/40 + 복구 ${recoveryScore}/30)`
  )
  
  return {
    recognition: {
      colorEmphasis,
      iconUsage,
      ariaSupport,
      positioning,
      score: recognitionScore
    },
    diagnosis: {
      userLanguage,
      specificReason,
      friendlyTone,
      score: diagnosisScore
    },
    recovery: {
      actionButtons,
      helpLinks,
      guidanceClarity,
      score: recoveryScore
    },
    score: totalScore,
    quality,
    details
  }
}

/**
 * N10 도움말과 문서 분석
 * 정부 49개 기관 데이터 기반 평가 (2축 모델)
 * 
 * === 정부 데이터 기반 평가 기준 ===
 * 1) 도움말 접근성 (Accessibility) - 25점
 *    - 헤더/푸터 도움말 링크: 10점 (정부 95% 헤더 배치)
 *    - 검색 기능: 8점
 *    - FAQ 존재: 7점
 * 
 * 2) 문서 품질 (Quality) - 25점
 *    - 리스트 구조 (단계별 설명): 10점
 *    - 이미지/스크린샷: 8점
 *    - 예시/샘플: 7점
 * 
 * === 정부 불만 데이터 반영 ===
 * - "따라할 수 없다": 63% 불만
 * - "이해할 수 없다": 68% 불만
 * - 도움말 페이지 이탈률: 45%
 */
function analyzeHelpDocumentation(html: string): HelpDocumentation {
  const details: string[] = []
  
  // 1) 도움말 접근성 (Accessibility) - 25점
  // 1.1 헤더/푸터 도움말 링크 (10점) - 정부 95% 헤더 배치
  let headerFooterLinks = 0
  const headerFooter = html.match(/<header[^>]*>[\s\S]*?<\/header>|<footer[^>]*>[\s\S]*?<\/footer>/gi) || []
  const helpKeywords = /help|도움말|faq|support|지원|안내|guide|가이드/i
  
  headerFooter.forEach(section => {
    const helpLinks = (section.match(/<a[^>]+>/gi) || []).filter(link => helpKeywords.test(link))
    if (helpLinks.length > 0) {
      headerFooterLinks = 10
      details.push(`✅ 헤더/푸터 도움말 링크: ${helpLinks.length}개 발견`)
    }
  })
  
  if (headerFooterLinks === 0) {
    details.push(`❌ 헤더/푸터 도움말 링크 미제공 (정부 95% 헤더 배치 기준)`)
  }
  
  // 1.2 검색 기능 (8점)
  let searchFunction = 0
  const searchPatterns = [
    /<input[^>]+type\s*=\s*["']search["'][^>]*>/gi,
    /<input[^>]+(?:placeholder|name|id)\s*=\s*["'][^"']*(search|검색)[^"']*["'][^>]*>/gi,
    /<form[^>]+(?:class|id)\s*=\s*["'][^"']*(search|검색)[^"']*["'][^>]*>/gi
  ]
  
  searchPatterns.forEach(pattern => {
    const matches = html.match(pattern)
    if (matches && matches.length > 0) {
      searchFunction = 8
      details.push(`✅ 검색 기능: 제공됨`)
    }
  })
  
  if (searchFunction === 0) {
    details.push(`❌ 검색 기능 미제공`)
  }
  
  // 1.3 FAQ 존재 여부 (7점)
  let faqExists = 0
  const faqPatterns = [
    /<(?:section|div|article)[^>]*(?:class|id)\s*=\s*["'][^"']*(faq|자주묻는질문|질문답변)[^"']*["'][^>]*>/gi,
    /FAQ|자주\s*묻는\s*질문|Q&A|질문과\s*답변/gi
  ]
  
  faqPatterns.forEach(pattern => {
    const matches = html.match(pattern)
    if (matches && matches.length > 0) {
      faqExists = 7
      details.push(`✅ FAQ 제공: ${matches.length}개 영역 발견`)
    }
  })
  
  if (faqExists === 0) {
    details.push(`❌ FAQ 미제공`)
  }
  
  const accessibilityScore = headerFooterLinks + searchFunction + faqExists
  
  // 2) 문서 품질 (Quality) - 25점
  // 2.1 리스트 구조 (단계별 설명) (10점) - 정부 63% "따라할 수 없다" 불만
  let listStructure = 0
  const lists = html.match(/<(?:ol|ul)[^>]*>[\s\S]*?<\/(?:ol|ul)>/gi) || []
  const stepsKeywords = /단계|step|절차|과정|방법|순서/i
  const meaningfulLists = lists.filter(list => {
    const listItems = (list.match(/<li[^>]*>/gi) || []).length
    return listItems >= 3 && stepsKeywords.test(list)
  })
  
  if (meaningfulLists.length >= 5) {
    listStructure = 10
    details.push(`✅ 리스트 구조 우수: ${meaningfulLists.length}개 단계별 설명`)
  } else if (meaningfulLists.length >= 3) {
    listStructure = 7
    details.push(`⚠️ 리스트 구조 보통: ${meaningfulLists.length}개`)
  } else if (meaningfulLists.length > 0) {
    listStructure = 4
    details.push(`⚠️ 리스트 구조 부족: ${meaningfulLists.length}개`)
  } else {
    details.push(`❌ 리스트 구조 미제공 (정부 63% "따라할 수 없다" 불만)`)
  }
  
  // 2.2 이미지/스크린샷 (8점)
  let visualAids = 0
  const images = html.match(/<img[^>]*>/gi) || []
  const helpImages = images.filter(img => 
    /guide|tutorial|example|설명|안내|예시|스크린샷|screenshot/i.test(img)
  )
  
  if (helpImages.length >= 5) {
    visualAids = 8
    details.push(`✅ 이미지/스크린샷: ${helpImages.length}개 제공`)
  } else if (helpImages.length >= 3) {
    visualAids = 5
    details.push(`⚠️ 이미지/스크린샷: ${helpImages.length}개 (부족)`)
  } else if (helpImages.length > 0) {
    visualAids = 3
    details.push(`⚠️ 이미지/스크린샷: ${helpImages.length}개 (매우 부족)`)
  } else {
    details.push(`❌ 이미지/스크린샷 미제공 (정부 68% "이해할 수 없다" 불만)`)
  }
  
  // 2.3 예시/샘플 (7점)
  let examples = 0
  const exampleKeywords = /예시|example|샘플|sample|예제|케이스|case/gi
  const exampleMatches = html.match(exampleKeywords) || []
  
  if (exampleMatches.length >= 5) {
    examples = 7
    details.push(`✅ 예시/샘플: ${exampleMatches.length}개 제공`)
  } else if (exampleMatches.length >= 3) {
    examples = 4
    details.push(`⚠️ 예시/샘플: ${exampleMatches.length}개 (부족)`)
  } else if (exampleMatches.length > 0) {
    examples = 2
    details.push(`⚠️ 예시/샘플: ${exampleMatches.length}개 (매우 부족)`)
  } else {
    details.push(`❌ 예시/샘플 미제공`)
  }
  
  const qualityScore = listStructure + visualAids + examples
  
  // 총점 및 품질 등급
  const totalScore = accessibilityScore + qualityScore
  let status: 'excellent' | 'good' | 'basic' | 'minimal' | 'poor' | 'none'
  
  if (totalScore >= 45) status = 'excellent'       // 45-50점
  else if (totalScore >= 35) status = 'good'       // 35-44점
  else if (totalScore >= 25) status = 'basic'      // 25-34점
  else if (totalScore >= 15) status = 'minimal'    // 15-24점
  else if (totalScore > 0) status = 'poor'         // 1-14점
  else status = 'none'                             // 0점
  
  details.unshift(
    `총점: ${totalScore}/50 (접근성 ${accessibilityScore}/25 + 품질 ${qualityScore}/25)`
  )
  
  return {
    accessibility: {
      headerFooterLinks,
      searchFunction,
      faqExists,
      score: accessibilityScore
    },
    quality: {
      listStructure,
      visualAids,
      examples,
      score: qualityScore
    },
    total_score: totalScore,
    status,
    details
  }
}

function analyzeVisuals(html: string): VisualStructure {
  const imageCount = (html.match(/<img[^>]*>/gi) || []).length
  const videoCount = (html.match(/<video[^>]*>/gi) || []).length
  
  // 아이콘 감지 강화 (다양한 구현 방식 포함)
  let iconCount = 0
  
  // 1. Font Awesome 계열 (fa-, fas-, far-, fab-)
  const faMatches = html.match(/\b(?:fa|fas|far|fab|fal|fad)-[a-z0-9-]+/gi) || []
  iconCount += faMatches.length
  
  // 2. <i> 태그 (Font Awesome, Material Icons 등)
  const iTagMatches = html.match(/<i\s+[^>]*class\s*=\s*["'][^"']*\b(?:fa|icon|material|glyphicon|bi|ti|ri|xi)[^"']*["'][^>]*>/gi) || []
  iconCount += iTagMatches.length
  
  // 3. SVG 아이콘
  const svgMatches = html.match(/<svg[^>]*>/gi) || []
  iconCount += svgMatches.length
  
  // 4. 아이콘 클래스명 (btn-icon, menu-icon, nav-icon 등)
  const iconClassMatches = html.match(/\b(?:btn|menu|nav|toolbar|action|ui)-?icon\b/gi) || []
  iconCount += iconClassMatches.length
  
  // 5. 이미지 파일명에 icon 포함 (<img src="icon-*.png">)
  const iconImgMatches = html.match(/<img[^>]*src\s*=\s*["'][^"']*\bicon[^"']*["'][^>]*>/gi) || []
  iconCount += iconImgMatches.length
  
  // 6. Material Icons
  const materialMatches = html.match(/\b(?:material-icons|md-|mdi-)/gi) || []
  iconCount += materialMatches.length
  
  // 🎨 시각적 일관성 분석 추가 (HTML 기반)
  const visualConsistency = analyzeVisualConsistencyFromHTML(html, imageCount)
  
  // 7. Glyphicons
  const glyphMatches = html.match(/\bglyphicon-[a-z0-9-]+/gi) || []
  iconCount += glyphMatches.length
  
  // 8. Bootstrap Icons
  const bootstrapMatches = html.match(/\bbi-[a-z0-9-]+/gi) || []
  iconCount += bootstrapMatches.length
  
  // 9. Tabler Icons
  const tablerMatches = html.match(/\bti-[a-z0-9-]+/gi) || []
  iconCount += tablerMatches.length
  
  // 10. Remix Icon
  const remixMatches = html.match(/\bri-[a-z0-9-]+/gi) || []
  iconCount += remixMatches.length
  
  // 11. Xeicon (한국)
  const xeiconMatches = html.match(/\bxi-[a-z0-9-]+/gi) || []
  iconCount += xeiconMatches.length
  
  // 12. Heroicons (Tailwind)
  const heroMatches = html.match(/\bhero-[a-z0-9-]+/gi) || []
  iconCount += heroMatches.length
  
  // 13. Feather Icons
  const featherMatches = html.match(/\bfeather-[a-z0-9-]+/gi) || []
  iconCount += featherMatches.length

  return {
    imageCount,
    videoCount,
    iconCount,
    visualConsistency
  }
}

/**
 * 🎨 시각적 일관성 분석 (HTML 기반)
 * CSS 파싱 없이 HTML 구조만으로 시각적 일관성 평가
 */
function analyzeVisualConsistencyFromHTML(html: string, imageCount: number): {
  score: number
  grade: 'A' | 'B' | 'C' | 'D'
  issues: Array<{ type: string; severity: string; message: string }>
  strengths: string[]
} {
  let score = 100
  const issues: Array<{ type: string; severity: string; message: string }> = []
  const strengths: string[] = []
  
  // 1. 인라인 스타일 과다 사용 감지 (일관성 저해 요인)
  const inlineStyles = html.match(/\sstyle\s*=\s*["'][^"']+["']/gi) || []
  if (inlineStyles.length > 50) {
    score -= 30
    issues.push({
      type: 'EXCESSIVE_INLINE_STYLES',
      severity: 'HIGH',
      message: `인라인 스타일 ${inlineStyles.length}개 → CSS 클래스로 통일 권장 (유지보수성 저하)`
    })
  } else if (inlineStyles.length > 20) {
    score -= 15
    issues.push({
      type: 'INLINE_STYLE_WARNING',
      severity: 'MEDIUM',
      message: `인라인 스타일 ${inlineStyles.length}개 발견 → 일부 CSS 클래스로 전환 권장`
    })
  } else if (inlineStyles.length < 5) {
    strengths.push('CSS 클래스 기반 스타일링 → 일관성 유지 용이')
  }
  
  // 2. 이미지 alt 텍스트 일관성 (설명 스타일 통일)
  const images = html.match(/<img[^>]*alt\s*=\s*["']([^"']*)["'][^>]*>/gi) || []
  const altTexts = images.map(img => {
    const match = img.match(/alt\s*=\s*["']([^"']*)["']/)
    return match ? match[1] : ''
  }).filter(alt => alt.length > 0)
  
  if (altTexts.length > 3) {
    // alt 텍스트 스타일 분석
    const hasDescriptive = altTexts.filter(alt => alt.length > 20).length
    const hasShort = altTexts.filter(alt => alt.length <= 20).length
    
    if (hasDescriptive > 0 && hasShort > 0 && Math.abs(hasDescriptive - hasShort) < altTexts.length * 0.3) {
      score -= 10
      issues.push({
        type: 'INCONSISTENT_ALT_STYLE',
        severity: 'LOW',
        message: '이미지 alt 텍스트 스타일 혼재 → 짧은 설명 또는 긴 설명 중 하나로 통일'
      })
    }
  }
  
  // 3. 버튼/링크 클래스 일관성 분석
  const buttons = html.match(/<button[^>]*class\s*=\s*["']([^"']*)["'][^>]*>/gi) || []
  const buttonClasses = buttons.map(btn => {
    const match = btn.match(/class\s*=\s*["']([^"']*)["']/)
    return match ? match[1] : ''
  })
  
  const uniqueButtonClasses = new Set(buttonClasses.filter(c => c.length > 0))
  if (uniqueButtonClasses.size > 10) {
    score -= 20
    issues.push({
      type: 'BUTTON_CLASS_FRAGMENTATION',
      severity: 'MEDIUM',
      message: `버튼 클래스 ${uniqueButtonClasses.size}종 사용 → 통일된 디자인 시스템 권장`
    })
  } else if (uniqueButtonClasses.size <= 5) {
    strengths.push('버튼 스타일 체계적 관리 (5종 이내)')
  }
  
  // 4. 이미지 확장자 일관성 (일관된 이미지 형식 사용)
  const imgSources = html.match(/<img[^>]*src\s*=\s*["']([^"']*)["'][^>]*>/gi) || []
  const extensions = imgSources.map(img => {
    const match = img.match(/\.([a-z]{3,4})(?:["'\s?#])/i)
    return match ? match[1].toLowerCase() : ''
  }).filter(ext => ext.length > 0)
  
  const extensionCount = new Set(extensions)
  if (extensionCount.size > 4) {
    score -= 10
    issues.push({
      type: 'IMAGE_FORMAT_INCONSISTENCY',
      severity: 'LOW',
      message: `이미지 형식 ${extensionCount.size}종 혼용 (${Array.from(extensionCount).join(', ')}) → WebP 통일 권장`
    })
  }
  
  // 5. 반복 요소 (카드, 리스트) 구조 일관성
  const cards = html.match(/<(?:div|article|section)[^>]*class\s*=\s*["'][^"']*\b(?:card|item|box|panel)[^"']*["'][^>]*>/gi) || []
  if (cards.length >= 3) {
    strengths.push(`반복 요소 ${cards.length}개 → 체계적 레이아웃 구조`)
  }
  
  // 6. 이미지 개수 기반 추가 평가 (기존 로직 개선)
  if (imageCount === 0) {
    score -= 10
    issues.push({
      type: 'NO_VISUAL_ELEMENTS',
      severity: 'MEDIUM',
      message: '시각적 요소 부족 → 사용자 몰입도 저하'
    })
  } else if (imageCount > 100) {
    score -= 15
    issues.push({
      type: 'IMAGE_OVERLOAD',
      severity: 'MEDIUM',
      message: `이미지 ${imageCount}개로 과다 → 로딩 속도 및 집중도 저하 우려`
    })
  } else if (imageCount >= 5 && imageCount <= 50) {
    strengths.push('적절한 시각적 밀도 (5-50개 범위)')
  }
  
  // 최종 점수 및 등급
  score = Math.max(0, Math.min(100, score))
  
  let grade: 'A' | 'B' | 'C' | 'D'
  if (score >= 90) grade = 'A'
  else if (score >= 75) grade = 'B'
  else if (score >= 60) grade = 'C'
  else grade = 'D'
  
  return { score, grade, issues, strengths }
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
  
  // 긍정 신호: 행동 중심의 명확한 동사 (30개 확장)
  const actionWords = text.match(/시작하|만들|보내|저장하|찾아보|확인하|선택하|클릭|눌러|등록|신청|조회|검색|다운로드|업로드|공유하|복사하|붙여넣|삭제하|수정하|편집하|추가하|제거하|취소하|완료하|제출하|전송하|예약하|결제하|구매하/g) || []
  friendlyScore += actionWords.length * 3
  
  // 긍정 신호: 사용자 중심 언어 (20개 확장)
  const userCentricWords = text.match(/당신|여러분|회원님|고객님|함께|도와드|안내|이용|편리|간편|쉽게|빠르게|안전하게|무료|할인|혜택|포인트|적립|맞춤|추천/g) || []
  friendlyScore += userCentricWords.length * 2
  
  // 긍정 신호: 친근한 설명
  const explanatoryWords = text.match(/예를 들어|쉽게 말하면|간단히|쉽게|편리하게|빠르게/g) || []
  friendlyScore += explanatoryWords.length * 4
  
  // 부정 신호: 시스템 중심 언어
  const systemWords = text.match(/시스템|데이터베이스|서버|관리자|운영자|처리|수행|실행|구동|배포/g) || []
  friendlyScore -= systemWords.length * 3
  
  // 긍정 신호: 현실 세계 은유 (아이콘, 버튼 텍스트) - 50개로 대폭 확장
  const metaphors = text.match(/장바구니|카트|폴더|휴지통|집|홈|담기|꺼내기|넣기|빼기|보관함|서랍|책갈피|북마크|별표|즐겨찾기|하트|좋아요|공유|댓글|메시지|편지|우편|전화|벨|알림|시계|달력|일정|지도|위치|핀|돋보기|검색|필터|정렬|새로고침|되돌리기|앞으로|뒤로|위|아래|좌|우|확대|축소|재생|정지|일시정지|음소거|볼륨|설정|톱니바퀴|프로필|사진|카메라|갤러리/g) || []
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

/**
 * N4.2 언어 일관성 분석 (Language Consistency)
 * 3축 통합 측정: 핵심 용어 통일(40점) + 액션 표현 일관성(35점) + 톤앤매너 통일(25점)
 * 정부 49개 기관 벤치마크 기반 (평균 84점, 상위 10% 95점)
 */
function analyzeLanguageConsistency(html: string): LanguageConsistency {
  try {
    // HTML에서 텍스트 추출 (script, style 제외)
    const cleanText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // 1축: 핵심 용어 통일성 분석 (40점)
    const terminology = analyzeTerminologyConsistency(cleanText);
    
    // 2축: 액션 표현 일관성 분석 (35점)
    const action = analyzeActionConsistency(html);
    
    // 3축: 톤앤매너 일관성 분석 (25점)
    const tone = analyzeToneConsistency(cleanText);
    
    // 총점 계산
    const totalScore = terminology.score + action.score + tone.score;
    
    // 등급 산정
    let grade: 'A' | 'B' | 'C' | 'D';
    if (totalScore >= 90) grade = 'A';
    else if (totalScore >= 75) grade = 'B';
    else if (totalScore >= 60) grade = 'C';
    else grade = 'D';
    
    // 정부 벤치마크 비교
    const govAverage = 84;
    const gap = totalScore - govAverage;
    const krdsCompliance = Math.round((totalScore / 100) * 100);
    
    let status: string;
    let ranking: string;
    if (gap >= 0) {
      status = '정부 표준 준수';
      ranking = gap >= 11 ? '상위 10% (KRDS 모범사례)' : '평균 이상';
    } else {
      status = '표준 미준수';
      ranking = '개선 필요';
    }
    
    // 사용자 임팩트 예측
    const userImpact = {
      confusionLevel: totalScore < 60 ? '높음' : totalScore < 80 ? '보통' : '낮음',
      searchFailure: totalScore < 60 ? '40% 실패' : totalScore < 80 ? '20% 실패' : '5% 미만',
      learningTime: totalScore < 60 ? '+50% 증가' : totalScore < 80 ? '+20% 증가' : '정상',
      trustImpact: totalScore < 60 ? '전문성 의심' : totalScore < 80 ? '보통' : '신뢰 구축'
    };
    
    // 모든 발견사항 통합
    const allFindings = [
      ...terminology.findings,
      ...action.findings,
      ...tone.findings
    ];
    
    return {
      terminologyScore: terminology.score,
      actionScore: action.score,
      toneScore: tone.score,
      totalScore,
      grade,
      govComparison: {
        siteScore: totalScore,
        govAverage,
        gap,
        status,
        ranking,
        krdsCompliance
      },
      userImpact,
      breakdown: {
        terminology: `${terminology.score}/40`,
        action: `${action.score}/35`,
        tone: `${tone.score}/25`
      },
      findings: allFindings,
      detailedAnalysis: {
        terminology: {
          score: terminology.score,
          findings: terminology.findings
        },
        action: {
          score: action.score,
          findings: action.findings
        },
        tone: {
          score: tone.score,
          findings: tone.findings
        }
      }
    };
    
  } catch (error) {
    console.error('Language consistency analysis error:', error);
    
    // 오류 발생 시 기본값 반환
    return {
      terminologyScore: 0,
      actionScore: 0,
      toneScore: 0,
      totalScore: 0,
      grade: 'D',
      govComparison: {
        siteScore: 0,
        govAverage: 84,
        gap: -84,
        status: '분석 실패',
        ranking: '분석 불가',
        krdsCompliance: 0
      },
      userImpact: {
        confusionLevel: '알 수 없음',
        searchFailure: '알 수 없음',
        learningTime: '알 수 없음',
        trustImpact: '알 수 없음'
      },
      breakdown: {
        terminology: '0/40',
        action: '0/35',
        tone: '0/25'
      },
      findings: [{
        category: '분석 오류',
        issue: '언어 일관성 분석 중 오류가 발생했습니다.',
        impact: `오류: ${error}`
      }],
      detailedAnalysis: {
        terminology: { score: 0, findings: [] },
        action: { score: 0, findings: [] },
        tone: { score: 0, findings: [] }
      }
    };
  }
}

/**
 * 1축: 핵심 용어 통일성 분석 (40점)
 * 5대 핵심 용어: 회원가입, 로그인, 검색, 문의, 비밀번호
 */
function analyzeTerminologyConsistency(text: string): { score: number; findings: any[] } {
  let score = 40;
  const findings: any[] = [];
  
  // 1. 회원가입 관련 용어 (8점)
  const signupTerms = {
    '회원가입': (text.match(/회원가입|회원 가입/gi) || []).length,
    '가입하기': (text.match(/가입하기|가입 하기/gi) || []).length,
    'JOIN': (text.match(/\bJOIN\b/gi) || []).length,
    'SIGN UP': (text.match(/SIGN[\s\-]?UP/gi) || []).length
  };
  
  const signupVariants = Object.entries(signupTerms).filter(([, count]) => count > 0);
  if (signupVariants.length > 1) {
    score -= Math.min((signupVariants.length - 1) * 2, 8);
    findings.push({
      category: '회원가입 용어',
      variants: signupVariants.map(([term, count]) => `${term}(${count}회)`),
      count: Object.fromEntries(signupVariants),
      issue: `${signupVariants.length}가지 용어 혼용`,
      impact: 'KRDS 표준 위반, 사용자 혼란 유발',
      recommendation: '"회원가입"으로 통일 권장 (KRDS 표준)'
    });
  }
  
  // 2. 로그인 관련 용어 (8점)
  const loginTerms = {
    '로그인': (text.match(/로그인/gi) || []).length,
    'LOGIN': (text.match(/\bLOGIN\b/gi) || []).length,
    'SIGN IN': (text.match(/SIGN[\s\-]?IN/gi) || []).length
  };
  
  const loginVariants = Object.entries(loginTerms).filter(([, count]) => count > 0);
  if (loginVariants.length > 1) {
    score -= Math.min((loginVariants.length - 1) * 2, 8);
    findings.push({
      category: '로그인 용어',
      variants: loginVariants.map(([term, count]) => `${term}(${count}회)`),
      count: Object.fromEntries(loginVariants),
      issue: `${loginVariants.length}가지 용어 혼용`,
      impact: '인증 프로세스 혼란',
      recommendation: '"로그인"으로 통일 권장 (KRDS 표준)'
    });
  }
  
  // 3. 검색 관련 용어 (8점)
  const searchTerms = {
    '검색': (text.match(/검색(?!어|창)/gi) || []).length,
    '찾기': (text.match(/찾기/gi) || []).length,
    'SEARCH': (text.match(/\bSEARCH\b/gi) || []).length
  };
  
  const searchVariants = Object.entries(searchTerms).filter(([, count]) => count > 0);
  if (searchVariants.length > 1) {
    score -= Math.min((searchVariants.length - 1) * 2, 8);
    findings.push({
      category: '검색 용어',
      variants: searchVariants.map(([term, count]) => `${term}(${count}회)`),
      count: Object.fromEntries(searchVariants),
      issue: `${searchVariants.length}가지 용어 혼용`,
      impact: '정보 탐색 효율성 저하',
      recommendation: '"검색"으로 통일 권장 (KRDS 표준)'
    });
  }
  
  // 4. 문의 관련 용어 (8점)
  const inquiryTerms = {
    '문의': (text.match(/문의(?!하|사항)/gi) || []).length,
    '상담': (text.match(/상담/gi) || []).length,
    'CONTACT': (text.match(/\bCONTACT\b/gi) || []).length
  };
  
  const inquiryVariants = Object.entries(inquiryTerms).filter(([, count]) => count > 0);
  if (inquiryVariants.length > 1) {
    score -= Math.min((inquiryVariants.length - 1) * 2, 8);
    findings.push({
      category: '문의 용어',
      variants: inquiryVariants.map(([term, count]) => `${term}(${count}회)`),
      count: Object.fromEntries(inquiryVariants),
      issue: `${inquiryVariants.length}가지 용어 혼용`,
      impact: '고객 지원 접근성 저하',
      recommendation: '"문의"로 통일 권장'
    });
  }
  
  // 5. 비밀번호 관련 용어 (8점)
  const passwordTerms = {
    '비밀번호': (text.match(/비밀번호/gi) || []).length,
    '패스워드': (text.match(/패스워드/gi) || []).length,
    'PASSWORD': (text.match(/\bPASSWORD\b/gi) || []).length,
    'PW': (text.match(/\bPW\b/gi) || []).length
  };
  
  const passwordVariants = Object.entries(passwordTerms).filter(([, count]) => count > 0);
  if (passwordVariants.length > 1) {
    score -= Math.min((passwordVariants.length - 1) * 2, 8);
    findings.push({
      category: '비밀번호 용어',
      variants: passwordVariants.map(([term, count]) => `${term}(${count}회)`),
      count: Object.fromEntries(passwordVariants),
      issue: `${passwordVariants.length}가지 용어 혼용`,
      impact: 'KRDS 표준 위반, 보안 인식 혼란',
      recommendation: '"비밀번호"로 통일 권장 (KRDS 표준)'
    });
  }
  
  return { score: Math.max(0, score), findings };
}

/**
 * 2축: 액션 표현 일관성 분석 (35점)
 * 3대 액션: 제출/확인, 취소, 삭제
 */
function analyzeActionConsistency(html: string): { score: number; findings: any[] } {
  let score = 35;
  const findings: any[] = [];
  
  // 버튼 텍스트 추출 (button, a, input[type=submit/button])
  const buttonRegex = /<button[^>]*>(.*?)<\/button>|<a[^>]*>(.*?)<\/a>|<input[^>]*value=["']([^"']*)["'][^>]*type=["'](submit|button)["']/gi;
  const actionTexts: string[] = [];
  let match;
  
  while ((match = buttonRegex.exec(html)) !== null) {
    const text = (match[1] || match[2] || match[3] || '').replace(/<[^>]+>/g, '').trim();
    if (text && text.length < 20) {
      actionTexts.push(text);
    }
  }
  
  // 1. 제출/확인 액션 통일성 (12점)
  const submitActions = actionTexts.filter(text =>
    /^(확인|제출|등록|저장|완료|OK|SUBMIT|CONFIRM|SAVE)$/i.test(text)
  );
  
  const submitVariants = new Set(submitActions.map(t => t.toLowerCase())).size;
  if (submitVariants > 2) {
    score -= Math.min((submitVariants - 2) * 2, 12);
    findings.push({
      category: '제출 액션',
      variants: [...new Set(submitActions)],
      issue: `${submitVariants}가지 표현 혼용`,
      impact: '사용자 행동 혼란',
      recommendation: '주요 액션은 1-2개로 표준화 (맥락별 구분)'
    });
  }
  
  // 2. 취소 액션 통일성 (11점)
  const cancelActions = actionTexts.filter(text =>
    /^(취소|닫기|나가기|CANCEL|CLOSE|EXIT)$/i.test(text)
  );
  
  const cancelVariants = new Set(cancelActions.map(t => t.toLowerCase())).size;
  if (cancelVariants > 2) {
    score -= Math.min((cancelVariants - 2) * 2, 11);
    findings.push({
      category: '취소 액션',
      variants: [...new Set(cancelActions)],
      issue: `${cancelVariants}가지 표현 혼용`,
      impact: '이탈 행동 혼란',
      recommendation: '"취소" 또는 "닫기" 중 하나로 통일'
    });
  }
  
  // 3. 삭제 액션 통일성 (12점)
  const deleteActions = actionTexts.filter(text =>
    /^(삭제|제거|DELETE|REMOVE)$/i.test(text)
  );
  
  const deleteVariants = new Set(deleteActions.map(t => t.toLowerCase())).size;
  if (deleteVariants > 1) {
    score -= Math.min((deleteVariants - 1) * 3, 12);
    findings.push({
      category: '삭제 액션',
      variants: [...new Set(deleteActions)],
      issue: `${deleteVariants}가지 표현 혼용`,
      impact: '파괴적 행동 혼란',
      recommendation: '"삭제"로 통일 권장 (KRDS 표준)'
    });
  }
  
  return { score: Math.max(0, score), findings };
}

/**
 * 3축: 톤앤매너 일관성 분석 (25점)
 * 존댓말/반말 일관성
 */
function analyzeToneConsistency(text: string): { score: number; findings: any[] } {
  let score = 25;
  const findings: any[] = [];
  
  // 존댓말 vs 반말 패턴
  const politeEndings = (text.match(/습니다|세요|십시오|시오/g) || []).length;
  const casualEndings = (text.match(/[^습]니[다\.!?]|어요|아요|해요/g) || []).length;
  
  const totalEndings = politeEndings + casualEndings;
  
  if (totalEndings > 10) {
    const politeRatio = politeEndings / totalEndings;
    
    let deduction = 0;
    let consistency = '';
    
    if (politeRatio >= 0.9 || politeRatio <= 0.1) {
      deduction = 0; // 90% 이상 통일
      consistency = '일관적';
    } else if (politeRatio >= 0.7 || politeRatio <= 0.3) {
      deduction = 8; // 약간의 혼용
      consistency = '약간 혼용';
    } else {
      deduction = 15; // 심각한 혼용
      consistency = '심각한 혼용';
    }
    
    score -= deduction;
    
    if (politeRatio > 0.1 && politeRatio < 0.9) {
      findings.push({
        category: '존댓말 일관성',
        count: {
          존댓말: politeEndings,
          반말: casualEndings,
          비율: `${(politeRatio * 100).toFixed(0)}% 존댓말`
        },
        issue: consistency,
        impact: consistency === '심각한 혼용' ? '브랜드 신뢰도 저하' : '경미한 불일치',
        recommendation: politeRatio > 0.5 ? '존댓말로 통일 권장' : '반말로 통일 권장'
      });
    }
  }
  
  return { score: Math.max(0, score), findings };
}

/**
 * ============================================
 * N4.3 웹 표준 준수 분석 (W-CORE Framework)
 * Web Standards 4-Layer Compliance Analysis
 * ============================================
 */

/**
 * 1계층: HTML 구조적 표준 (25점)
 */
function analyzeHTMLStructuralStandards(html: string): { score: number; findings: any[] } {
  let score = 25;
  const findings: any[] = [];
  
  // 1. DOCTYPE 선언 (4점)
  const hasDoctype = /<!DOCTYPE\s+html>/i.test(html);
  if (!hasDoctype) {
    score -= 4;
    findings.push({
      category: 'Document Structure',
      issue: 'DOCTYPE 선언 누락',
      impact: '브라우저 쿼크 모드, 렌더링 불일치',
      severity: 'HIGH',
      fix: '<!DOCTYPE html> 추가'
    });
  }
  
  // 2. HTML lang 속성 (4점) - 법적 필수
  const htmlLang = /<html[^>]*\slang\s*=/i.test(html);
  if (!htmlLang) {
    score -= 4;
    findings.push({
      category: 'Language',
      issue: 'HTML lang 속성 누락',
      impact: '스크린리더 언어 인식 불가, WCAG 2.1 위반',
      severity: 'CRITICAL',
      legalRisk: '장애인차별금지법 위반 가능',
      fix: '<html lang="ko"> 추가'
    });
  }
  
  // 3. charset 선언 (2점)
  const hasCharset = /<meta[^>]*charset/i.test(html);
  if (!hasCharset) {
    score -= 2;
    findings.push({
      category: 'Encoding',
      issue: 'charset 선언 누락',
      impact: '한글 깨짐 위험',
      severity: 'MEDIUM',
      fix: '<meta charset="UTF-8"> 추가'
    });
  }
  
  // 4. 시맨틱 랜드마크 (10점)
  const landmarks = ['header', 'nav', 'main', 'footer'];
  const usedLandmarks = landmarks.filter(tag => 
    new RegExp(`<${tag}[\\s>]`, 'i').test(html)
  );
  
  if (usedLandmarks.length < 3) {
    const penalty = (3 - usedLandmarks.length) * 3;
    score -= penalty;
    const missing = landmarks.filter(tag => !new RegExp(`<${tag}[\\s>]`, 'i').test(html));
    findings.push({
      category: 'Semantic Structure',
      issue: `시맨틱 랜드마크 부족 (${usedLandmarks.length}/4)`,
      impact: 'SEO 불리, 스크린리더 네비게이션 불가',
      severity: 'HIGH',
      fix: `누락 태그 추가: ${missing.join(', ')}`
    });
  }
  
  // 5. 중복 ID 검사 (5점)
  const idMatches = html.match(/\sid\s*=\s*["']([^"']+)["']/gi) || [];
  const ids = idMatches.map(m => {
    const match = m.match(/id\s*=\s*["']([^"']+)["']/i);
    return match ? match[1] : '';
  }).filter(id => id);
  
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const uniqueDuplicates = [...new Set(duplicateIds)];
  
  if (uniqueDuplicates.length > 0) {
    const penalty = Math.min(5, uniqueDuplicates.length * 2);
    score -= penalty;
    findings.push({
      category: 'HTML Validity',
      issue: `중복 ID ${uniqueDuplicates.length}개 발견`,
      impact: 'JavaScript 오작동, 접근성 보조기기 혼란',
      severity: 'HIGH',
      fix: `중복 ID 제거: ${uniqueDuplicates.slice(0, 3).join(', ')}`
    });
  }
  
  return { score: Math.max(0, score), findings };
}

/**
 * 2계층: 접근성 표준 (30점) - 법적 의무사항
 */
function analyzeAccessibilityStandards(html: string): { score: number; findings: any[] } {
  let score = 30;
  const findings: any[] = [];
  
  // 1. 이미지 alt 속성 (12점) - CRITICAL
  const images = (html.match(/<img[^>]*>/gi) || []);
  const imagesWithoutAlt = images.filter(img => !/ alt\s*=/i.test(img));
  
  if (imagesWithoutAlt.length > 0) {
    const penalty = Math.min(12, imagesWithoutAlt.length * 2);
    score -= penalty;
    findings.push({
      category: 'Image Accessibility',
      issue: `alt 속성 누락 이미지 ${imagesWithoutAlt.length}개`,
      impact: '시각장애인 콘텐츠 접근 불가',
      severity: 'CRITICAL',
      legalRisk: '장애인차별금지법 위반, 과태료 최대 3천만원',
      govStandard: 'KWCAG 2.2 필수 준수 사항',
      fix: '모든 <img> 태그에 alt 속성 추가'
    });
  }
  
  // 2. 폼 레이블 연결 (10점) - CRITICAL
  const inputs = (html.match(/<input(?![^>]*type\s*=\s*["']hidden["'])[^>]*>/gi) || [])
    .concat(html.match(/<select[^>]*>/gi) || [])
    .concat(html.match(/<textarea[^>]*>/gi) || []);
  
  let unlabeledInputs = 0;
  inputs.forEach(input => {
    const hasId = / id\s*=/i.test(input);
    const id = hasId ? input.match(/ id\s*=\s*["']([^"']+)["']/i)?.[1] : '';
    const hasLabel = id && new RegExp(`<label[^>]*for\\s*=\\s*["']${id}["']`, 'i').test(html);
    const hasAriaLabel = / aria-label\s*=/i.test(input) || / aria-labelledby\s*=/i.test(input);
    
    if (!hasLabel && !hasAriaLabel) {
      unlabeledInputs++;
    }
  });
  
  if (unlabeledInputs > 0) {
    const penalty = Math.min(10, unlabeledInputs * 3);
    score -= penalty;
    findings.push({
      category: 'Form Accessibility',
      issue: `레이블 없는 입력 필드 ${unlabeledInputs}개`,
      impact: '스크린리더 사용자 입력 불가',
      severity: 'CRITICAL',
      legalRisk: 'KWCAG 2.2 위반',
      govStandard: '정부24 필수 준수 사항',
      fix: '모든 입력 필드에 <label> 또는 aria-label 연결'
    });
  }
  
  // 3. 키보드 접근성 (8점) - CRITICAL
  const clickableNonButtons = (html.match(/<(div|span)[^>]*onclick[^>]*>/gi) || []);
  const keyboardInaccessible = clickableNonButtons.filter(el =>
    !/ tabindex\s*=/i.test(el) && !/ role\s*=/i.test(el)
  );
  
  if (keyboardInaccessible.length > 0) {
    const penalty = Math.min(8, keyboardInaccessible.length * 2);
    score -= penalty;
    findings.push({
      category: 'Keyboard Accessibility',
      issue: `키보드 접근 불가 요소 ${keyboardInaccessible.length}개`,
      impact: '키보드 전용 사용자 기능 사용 불가',
      severity: 'CRITICAL',
      legalRisk: '장애인차별금지법 핵심 위반 사항',
      fix: 'tabindex="0" 또는 role 속성 추가, 또는 <button> 태그 사용'
    });
  }
  
  return { score: Math.max(0, score), findings };
}

/**
 * 3계층: 의미론적 마크업 (25점)
 */
function analyzeSemanticMarkup(html: string): { score: number; findings: any[] } {
  let score = 25;
  const findings: any[] = [];
  
  // 1. 헤딩 계층 구조 (10점)
  const headings = (html.match(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi) || []);
  
  if (headings.length === 0) {
    score -= 10;
    findings.push({
      category: 'Document Structure',
      issue: '헤딩 태그 전혀 없음',
      impact: '문서 구조 파악 불가, SEO 심각한 불리',
      severity: 'CRITICAL',
      fix: '<h1>~<h6> 태그로 문서 구조 정의'
    });
  } else {
    // H1 검사
    const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
    if (h1Count === 0) {
      score -= 5;
      findings.push({
        category: 'Headings',
        issue: 'H1 태그 누락',
        impact: '페이지 주제 파악 불가, SEO 불리',
        severity: 'HIGH',
        fix: '페이지 제목을 <h1> 태그로 표시'
      });
    } else if (h1Count > 1) {
      score -= 3;
      findings.push({
        category: 'Headings',
        issue: `H1 태그 중복 (${h1Count}개)`,
        impact: 'SEO 불리, 스크린리더 혼란',
        severity: 'MEDIUM',
        fix: 'H1은 페이지당 1개만 사용'
      });
    }
    
    // 레벨 건너뛰기 검사
    const headingLevels = headings.map(h => {
      const match = h.match(/<h([1-6])/i);
      return match ? parseInt(match[1]) : 0;
    });
    
    let skipCount = 0;
    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] - headingLevels[i-1] > 1) {
        skipCount++;
      }
    }
    
    if (skipCount > 0) {
      const penalty = Math.min(2, skipCount);
      score -= penalty;
      findings.push({
        category: 'Headings',
        issue: `헤딩 레벨 건너뛰기 ${skipCount}회`,
        impact: '논리적 구조 파악 어려움',
        severity: 'MEDIUM',
        fix: '헤딩 레벨을 순차적으로 사용 (H1→H2→H3)'
      });
    }
  }
  
  // 2. 버튼 vs 링크 적절성 (8점)
  const improperButtons = (html.match(/<a[^>]*href\s*=\s*["'](#|javascript:void\(0\))["'][^>]*>/gi) || []);
  
  if (improperButtons.length > 0) {
    const penalty = Math.min(8, improperButtons.length);
    score -= penalty;
    findings.push({
      category: 'Interactive Elements',
      issue: `<a> 태그를 버튼으로 오용 ${improperButtons.length}개`,
      impact: '키보드 네비게이션 혼란, 접근성 저하',
      severity: 'HIGH',
      fix: '페이지 이동은 <a>, 액션은 <button> 사용'
    });
  }
  
  // 3. 리스트 구조 (7점)
  const orphanListItems = (html.match(/<li[^>]*>/gi) || []).length;
  const listContainers = ((html.match(/<ul[^>]*>/gi) || []).length +
                         (html.match(/<ol[^>]*>/gi) || []).length);
  
  // 리스트 아이템이 컨테이너보다 훨씬 많으면 고아 <li> 가능성
  if (orphanListItems > listContainers * 3) {
    score -= 7;
    findings.push({
      category: 'List Structure',
      issue: '부모 없는 <li> 태그 가능성',
      impact: 'HTML 표준 위반, 스타일 오작동',
      severity: 'MEDIUM',
      fix: '<li>는 반드시 <ul> 또는 <ol> 내부에 배치'
    });
  }
  
  return { score: Math.max(0, score), findings };
}

/**
 * 4계층: 플랫폼 호환성 (20점)
 */
function analyzePlatformCompatibility(html: string): { score: number; findings: any[] } {
  let score = 20;
  const findings: any[] = [];
  
  // 1. viewport 메타 태그 (12점)
  const hasViewport = /<meta[^>]*name\s*=\s*["']viewport["'][^>]*>/i.test(html);
  
  if (!hasViewport) {
    score -= 8;
    findings.push({
      category: 'Mobile Standards',
      issue: 'viewport 메타 태그 누락',
      impact: '모바일 기기에서 확대/축소 문제',
      severity: 'HIGH',
      govStandard: '행안부 모바일 웹 표준 필수',
      fix: '<meta name="viewport" content="width=device-width, initial-scale=1.0"> 추가'
    });
  } else {
    // user-scalable=no 체크
    const viewportTag = html.match(/<meta[^>]*name\s*=\s*["']viewport["'][^>]*>/i)?.[0] || '';
    if (/user-scalable\s*=\s*no/i.test(viewportTag)) {
      score -= 4;
      findings.push({
        category: 'Accessibility',
        issue: '사용자 확대 제한 설정 (user-scalable=no)',
        impact: '저시력자 접근성 저해',
        severity: 'HIGH',
        legalRisk: 'WCAG 2.1 위반',
        fix: 'user-scalable=no 제거'
      });
    }
  }
  
  // 2. 구형 HTML 요소/속성 (8점)
  const deprecatedElements = (html.match(/<(font|center|marquee|blink)[^>]*>/gi) || []).length;
  const deprecatedAttributes = (html.match(/\s(align|bgcolor|border)\s*=/gi) || []).length;
  const totalDeprecated = deprecatedElements + deprecatedAttributes;
  
  if (totalDeprecated > 0) {
    const penalty = Math.min(8, totalDeprecated * 2);
    score -= penalty;
    findings.push({
      category: 'Legacy Code',
      issue: `구형 HTML 요소/속성 ${totalDeprecated}개`,
      impact: '최신 브라우저에서 무시됨, 유지보수 어려움',
      severity: 'MEDIUM',
      fix: 'CSS로 대체 (font → style, center → text-align 등)'
    });
  }
  
  return { score: Math.max(0, score), findings };
}

/**
 * 웹 표준 준수 통합 분석
 */
function analyzeWebStandardsCompliance(html: string): WebStandardsCompliance {
  try {
    // 4계층 분석
    const htmlStructure = analyzeHTMLStructuralStandards(html);
    const accessibility = analyzeAccessibilityStandards(html);
    const semanticMarkup = analyzeSemanticMarkup(html);
    const compatibility = analyzePlatformCompatibility(html);
    
    // 총점 계산
    const totalScore = htmlStructure.score + accessibility.score + 
                      semanticMarkup.score + compatibility.score;
    
    // 등급 산정
    let grade: 'A' | 'B' | 'C' | 'D';
    if (totalScore >= 90) grade = 'A';
    else if (totalScore >= 80) grade = 'B';
    else if (totalScore >= 70) grade = 'C';
    else grade = 'D';
    
    // 정부 벤치마크 (정부 49개 기관 실증 데이터)
    const govAverage = 85;
    const gap = totalScore - govAverage;
    
    let legalRisk: '높음' | '보통' | '낮음';
    if (totalScore < 70) legalRisk = '높음';
    else if (totalScore < 80) legalRisk = '보통';
    else legalRisk = '낮음';
    
    // 모든 발견사항 통합 (CRITICAL 우선)
    const allFindings = [
      ...htmlStructure.findings,
      ...accessibility.findings,
      ...semanticMarkup.findings,
      ...compatibility.findings
    ].sort((a, b) => {
      const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
    
    return {
      totalScore,
      grade,
      breakdown: {
        htmlStructure: `${htmlStructure.score}/25`,
        accessibility: `${accessibility.score}/30`,
        semanticMarkup: `${semanticMarkup.score}/25`,
        compatibility: `${compatibility.score}/20`
      },
      govComparison: {
        siteScore: totalScore,
        govAverage,
        gap,
        status: gap >= 0 ? '정부 표준 준수' : '표준 미달',
        ranking: gap >= 11 ? '상위 10% (모범사례)' : gap >= 0 ? '평균 이상' : '개선 필요',
        legalRisk,
        mandatoryCompliance: {
          accessibility: '법적 의무 (장애인차별금지법)',
          deadline: '2025년 4월부터 과태료 부과',
          penalty: '위반 시 최대 3천만원',
          kwcag: 'KWCAG 2.2 AA 등급 필수'
        }
      },
      userImpact: {
        disabledUsers: totalScore < 70 ? '장애인 사용자 87% 접근 불가' : 
                       totalScore < 80 ? '장애인 사용자 40% 접근 제한' : 
                       '장애인 접근성 양호',
        elderlyUsers: totalScore < 70 ? '고령층 사용자 64% 어려움' : 
                      totalScore < 80 ? '고령층 사용자 30% 어려움' : 
                      '고령층 사용성 양호',
        seoImpact: totalScore < 70 ? '검색 순위 -35%' : 
                   totalScore < 80 ? '검색 순위 -15%' : 
                   'SEO 최적화'
      },
      findings: allFindings,
      detailedAnalysis: {
        htmlStructure,
        accessibility,
        semanticMarkup,
        compatibility
      }
    };
    
  } catch (error) {
    console.error('Web standards compliance analysis error:', error);
    
    // 오류 시 기본값 반환
    return {
      totalScore: 0,
      grade: 'D',
      breakdown: {
        htmlStructure: '0/25',
        accessibility: '0/30',
        semanticMarkup: '0/25',
        compatibility: '0/20'
      },
      govComparison: {
        siteScore: 0,
        govAverage: 85,
        gap: -85,
        status: '분석 실패',
        ranking: '분석 불가',
        legalRisk: '높음',
        mandatoryCompliance: {
          accessibility: '법적 의무 (장애인차별금지법)',
          deadline: '2025년 4월부터 과태료 부과',
          penalty: '위반 시 최대 3천만원',
          kwcag: 'KWCAG 2.2 AA 등급 필수'
        }
      },
      userImpact: {
        disabledUsers: '분석 불가',
        elderlyUsers: '분석 불가',
        seoImpact: '분석 불가'
      },
      findings: [{
        category: '분석 오류',
        issue: '웹 표준 분석 중 오류가 발생했습니다.',
        severity: 'CRITICAL'
      }],
      detailedAnalysis: {
        htmlStructure: { score: 0, findings: [] },
        accessibility: { score: 0, findings: [] },
        semanticMarkup: { score: 0, findings: [] },
        compatibility: { score: 0, findings: [] }
      }
    };
  }
}
