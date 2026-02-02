/**
 * KRDS (KWCAG 2.2) 평가 체계
 * 한국형 웹 콘텐츠 편의성 지침 2.2
 * - 4원칙 (Perceivable, Operable, Understandable, Robust)
 * - 14지침
 * - 33검사 항목
 * - 웹 편의성 준수 평가
 */

import type { HTMLStructure } from './htmlAnalyzer'

export interface KRDSScores {
  // 원칙 1: 인식의 용이성 (Perceivable) - 9개 항목
  P1_1_1_alt_text: number           // 적절한 대체 텍스트 제공
  P1_2_1_multimedia_caption: number // 자막 제공
  P1_3_1_table_structure: number    // 표의 구성
  P1_3_2_linear_structure: number   // 콘텐츠의 선형구조
  P1_3_3_clear_instructions: number // 명확한 지시사항 제공
  P1_4_1_color_independent: number  // 색에 무관한 콘텐츠 인식
  P1_4_2_no_auto_play: number       // 자동 재생 금지
  P1_4_3_contrast_ratio: number     // 텍스트 콘텐츠의 명도 대비
  P1_4_4_content_distinction: number // 콘텐츠 간의 구분

  // 원칙 2: 운용의 용이성 (Operable) - 15개 항목
  O2_1_1_keyboard_access: number    // 키보드 사용 보장
  O2_1_2_focus_visible: number      // 초점 이동과 표시
  O2_1_3_input_control: number      // 조작 가능
  O2_1_4_shortcut_key: number       // 문자 단축키
  O2_2_1_time_control: number       // 응답시간 조절
  O2_2_2_pause_control: number      // 정지 기능 제공
  O2_3_1_flash_limit: number        // 깜빡임과 번쩍임 사용 제한
  O2_4_1_skip_navigation: number    // 반복 영역 건너뛰기
  O2_4_2_page_title: number         // 제목 제공
  O2_4_3_link_purpose: number       // 적절한 링크 텍스트
  O2_4_4_page_reference: number     // 고정된 참조 위치 정보
  O2_5_1_single_pointer: number     // 단일 포인터 입력 지원
  O2_5_2_pointer_cancel: number     // 포인터 입력 취소
  O2_5_3_label_name: number         // 레이블과 네임
  O2_5_4_motion_operation: number   // 동작기반 작동

  // 원칙 3: 이해의 용이성 (Understandable) - 7개 항목
  U3_1_1_language_attr: number      // 기본 언어 표시
  U3_2_1_user_control: number       // 사용자 요구에 따른 실행
  U3_2_2_help_consistency: number   // 찾기 쉬운 도움 정보
  U3_3_1_error_correction: number   // 오류 정정
  U3_3_2_label_provision: number    // 레이블 제공
  U3_3_3_accessible_auth: number    // 접근 가능한 인증
  U3_3_4_auto_fill: number          // 반복 입력 정보

  // 원칙 4: 견고성 (Robust) - 2개 항목
  R4_1_1_markup_validity: number    // 마크업 오류 방지
  R4_2_1_web_app_access: number     // 웹 애플리케이션 접근성 준수
}

export interface KRDSPrincipleScores {
  perceivable: number      // 인식의 용이성 평균
  operable: number         // 운용의 용이성 평균
  understandable: number   // 이해의 용이성 평균
  robust: number           // 견고성 평균
  overall: number          // 전체 평균
}

export interface KRDSResult {
  scores: KRDSScores
  principles: KRDSPrincipleScores
  compliance_level: 'A' | 'AA' | 'AAA' | 'Fail'  // WCAG 준수 레벨
  convenience_score: number  // 0-100 웹 편의성 점수
  issues: Array<{
    item: string
    severity: 'critical' | 'serious' | 'moderate' | 'minor'
    description: string
    recommendation: string
    affected_pages: string[]  // 문제가 발견된 페이지 URL 목록
  }>
}

/**
 * KRDS 점수 계산 헬퍼
 * @param condition 조건 만족 여부
 * @param weight 가중치 (기본 1.0)
 * @returns Pass(5.0) 또는 Fail(2.0)
 */
function calculateKRDSScore(condition: boolean, weight: number = 1.0): number {
  // KRDS는 Pass/Fail 기준이지만, 부분 점수를 위해 3단계로 구분
  if (condition) {
    return 5.0 * weight  // 완전 준수
  }
  return 2.0 * weight    // 미준수
}

/**
 * KRDS 평가 실행
 */
export function evaluateKRDS(structure: HTMLStructure, pageResults?: Array<{ url: string, structure: HTMLStructure, isMainPage: boolean }>): KRDSResult {
  // 안전한 접근을 위한 기본값 설정
  const visual = structure.visuals || { imageCount: 0, videoCount: 0, iconCount: 0 }
  const accessibility = structure.accessibility || {
    altTextRatio: 0,
    ariaLabelCount: 0,
    headingStructure: false,
    langAttribute: false,
    skipLinkExists: false
  }
  const content = structure.content || {
    headingCount: 0,
    paragraphCount: 0,
    listCount: 0,
    tableCount: 0
  }
  const navigation = structure.navigation || {
    linkCount: 0,
    navDepth: 0
  }
  const html = structure.html || ''
  
  // 페이지별 문제 체크 헬퍼 함수
  const getAffectedPages = (checkFn: (page: any) => boolean): string[] => {
    if (!pageResults || pageResults.length === 0) return []
    return pageResults
      .filter(page => !checkFn(page))
      .map(page => page.url)
  }
  
  // ===========================================
  // 원칙 1: 인식의 용이성 (Perceivable)
  // ===========================================
  
  // 1.1.1 적절한 대체 텍스트 제공
  const P1_1_1_alt_text = calculateKRDSScore(
    accessibility.altTextRatio >= 0.9
  )
  
  // 1.2.1 자막 제공 (비디오가 있으면 track 태그 확인)
  const hasVideo = visual.videoCount > 0
  const hasTrack = html.toLowerCase().includes('<track')
  const P1_2_1_multimedia_caption = calculateKRDSScore(
    !hasVideo || hasTrack,
    hasVideo ? 1.0 : 0.5  // 비디오 없으면 가중치 감소
  )
  
  // 1.3.1 표의 구성 (th, caption 사용)
  const hasTable = content.tableCount > 0
  const hasTableHeaders = html.toLowerCase().includes('<th')
  const P1_3_1_table_structure = calculateKRDSScore(
    !hasTable || hasTableHeaders,
    hasTable ? 1.0 : 0.5
  )
  
  // 1.3.2 콘텐츠의 선형구조 (헤딩 구조)
  const P1_3_2_linear_structure = calculateKRDSScore(
    accessibility.headingStructure === true
  )
  
  // 1.3.3 명확한 지시사항 제공 (aria-label, label)
  const P1_3_3_clear_instructions = calculateKRDSScore(
    accessibility.ariaLabelCount > 0 ||
    html.toLowerCase().includes('<label')
  )
  
  // 1.4.1 색에 무관한 콘텐츠 인식 (텍스트로 정보 제공)
  const P1_4_1_color_independent = calculateKRDSScore(
    content.paragraphCount > 10  // 충분한 텍스트 콘텐츠
  )
  
  // 1.4.2 자동 재생 금지 (autoplay 속성 없음)
  const hasAutoplay = html.toLowerCase().includes('autoplay')
  const P1_4_2_no_auto_play = calculateKRDSScore(!hasAutoplay)
  
  // 1.4.3 텍스트 명도 대비 (기본 4.5:1, 검증 어려우므로 기본 점수)
  const P1_4_3_contrast_ratio = 4.0  // 실제 색상 분석 필요, 현재는 중간 점수
  
  // 1.4.4 콘텐츠 간의 구분 (헤딩, 리스트 사용)
  const P1_4_4_content_distinction = calculateKRDSScore(
    content.headingCount > 3 &&
    content.listCount > 0
  )
  
  // ===========================================
  // 원칙 2: 운용의 용이성 (Operable)
  // ===========================================
  
  // 2.1.1 키보드 사용 보장 (onclick이 아닌 링크/버튼 사용)
  const hasOnClick = (html.match(/onclick=/gi) || []).length
  const O2_1_1_keyboard_access = calculateKRDSScore(
    hasOnClick === 0 || navigation.linkCount > hasOnClick
  )
  
  // 2.1.2 초점 이동과 표시 (tabindex 적절히 사용)
  const hasTabindex = html.toLowerCase().includes('tabindex')
  const O2_1_2_focus_visible = calculateKRDSScore(
    hasTabindex || navigation.linkCount > 5
  )
  
  // 2.1.3 조작 가능 (충분한 클릭 영역, 현재는 링크/버튼 수로 판단)
  const O2_1_3_input_control = calculateKRDSScore(
    navigation.linkCount >= 5
  )
  
  // 2.1.4 문자 단축키 (accesskey 적절히 사용)
  const hasAccesskey = html.toLowerCase().includes('accesskey')
  const O2_1_4_shortcut_key = calculateKRDSScore(
    !hasAccesskey || accessibility.ariaLabelCount > 0,
    hasAccesskey ? 1.0 : 0.5
  )
  
  // 2.2.1 응답시간 조절 (시간제한 없음 또는 연장 가능)
  const hasTimeout = html.toLowerCase().includes('settimeout')
  const O2_2_1_time_control = calculateKRDSScore(
    !hasTimeout,
    hasTimeout ? 1.0 : 0.5
  )
  
  // 2.2.2 정지 기능 제공 (자동 슬라이드에 정지 버튼)
  const hasCarousel = html.toLowerCase().includes('carousel') ||
                      html.toLowerCase().includes('slider')
  const hasPauseButton = html.toLowerCase().includes('pause') ||
                         html.toLowerCase().includes('stop')
  const O2_2_2_pause_control = calculateKRDSScore(
    !hasCarousel || hasPauseButton,
    hasCarousel ? 1.0 : 0.5
  )
  
  // 2.3.1 깜빡임과 번쩍임 사용 제한 (blink, animation 체크)
  const hasBlink = html.toLowerCase().includes('blink') ||
                   html.toLowerCase().includes('@keyframes')
  const O2_3_1_flash_limit = calculateKRDSScore(!hasBlink, 0.7)
  
  // 2.4.1 반복 영역 건너뛰기 (skip navigation)
  const O2_4_1_skip_navigation = calculateKRDSScore(
    accessibility.skipLinkExists === true
  )
  
  // 2.4.2 제목 제공 (title 태그)
  const hasTitle = html.toLowerCase().includes('<title')
  const O2_4_2_page_title = calculateKRDSScore(hasTitle)
  
  // 2.4.3 적절한 링크 텍스트 (aria-label 또는 충분한 텍스트)
  const O2_4_3_link_purpose = calculateKRDSScore(
    navigation.linkCount > 0 &&
    accessibility.ariaLabelCount >= navigation.linkCount * 0.3
  )
  
  // 2.4.4 고정된 참조 위치 정보 (전자출판 관련, 일반 웹은 기본 통과)
  const O2_4_4_page_reference = 4.0
  
  // 2.5.1 단일 포인터 입력 지원 (터치/마우스 모두 지원)
  const O2_5_1_single_pointer = 4.0  // 기본 HTML은 지원
  
  // 2.5.2 포인터 입력 취소 (mouseup/touchend 사용)
  const O2_5_2_pointer_cancel = 4.0
  
  // 2.5.3 레이블과 네임 (label과 input 연결)
  const hasLabel = structure.html.toLowerCase().includes('<label')
  const hasInput = structure.html.toLowerCase().includes('<input')
  const O2_5_3_label_name = calculateKRDSScore(
    !hasInput || hasLabel
  )
  
  // 2.5.4 동작기반 작동 (기울임, 흔들기 등 대체 수단)
  const O2_5_4_motion_operation = 4.0  // 일반 웹은 해당 없음
  
  // ===========================================
  // 원칙 3: 이해의 용이성 (Understandable)
  // ===========================================
  
  // 3.1.1 기본 언어 표시 (lang 속성)
  const U3_1_1_language_attr = calculateKRDSScore(
    structure.accessibility.langAttribute === true
  )
  
  // 3.2.1 사용자 요구에 따른 실행 (target="_blank" 최소화)
  const hasTargetBlank = (structure.html.match(/target="_blank"/gi) || []).length
  const U3_2_1_user_control = calculateKRDSScore(
    hasTargetBlank <= structure.navigation.linkCount * 0.1
  )
  
  // 3.2.2 찾기 쉬운 도움 정보 (도움말 링크)
  const hasHelp = structure.html.toLowerCase().includes('help') ||
                  structure.html.toLowerCase().includes('faq')
  const U3_2_2_help_consistency = calculateKRDSScore(hasHelp, 0.7)
  
  // 3.3.1 오류 정정 (required, pattern 사용)
  const hasValidation = structure.html.toLowerCase().includes('required') ||
                        structure.html.toLowerCase().includes('pattern')
  const U3_3_1_error_correction = calculateKRDSScore(
    !hasInput || hasValidation
  )
  
  // 3.3.2 레이블 제공 (input에 label 또는 placeholder)
  const hasPlaceholder = structure.html.toLowerCase().includes('placeholder')
  const U3_3_2_label_provision = calculateKRDSScore(
    !hasInput || hasLabel || hasPlaceholder
  )
  
  // 3.3.3 접근 가능한 인증 (CAPTCHA 없음)
  const hasCaptcha = structure.html.toLowerCase().includes('captcha')
  const U3_3_3_accessible_auth = calculateKRDSScore(!hasCaptcha)
  
  // 3.3.4 반복 입력 정보 (autocomplete 사용)
  const hasAutocomplete = structure.html.toLowerCase().includes('autocomplete')
  const U3_3_4_auto_fill = calculateKRDSScore(
    !hasInput || hasAutocomplete,
    hasInput ? 1.0 : 0.5
  )
  
  // ===========================================
  // 원칙 4: 견고성 (Robust)
  // ===========================================
  
  // 4.1.1 마크업 오류 방지 (기본 HTML 유효성)
  const hasDoctype = structure.html.toLowerCase().includes('<!doctype')
  const hasHtmlTag = structure.html.toLowerCase().includes('<html')
  const R4_1_1_markup_validity = calculateKRDSScore(
    hasDoctype && hasHtmlTag
  )
  
  // 4.2.1 웹 애플리케이션 접근성 (ARIA 사용)
  const R4_2_1_web_app_access = calculateKRDSScore(
    structure.accessibility.ariaLabelCount > 0 ||
    structure.html.toLowerCase().includes('role=')
  )
  
  // ===========================================
  // 점수 집계
  // ===========================================
  
  const scores: KRDSScores = {
    // 원칙 1
    P1_1_1_alt_text,
    P1_2_1_multimedia_caption,
    P1_3_1_table_structure,
    P1_3_2_linear_structure,
    P1_3_3_clear_instructions,
    P1_4_1_color_independent,
    P1_4_2_no_auto_play,
    P1_4_3_contrast_ratio,
    P1_4_4_content_distinction,
    
    // 원칙 2
    O2_1_1_keyboard_access,
    O2_1_2_focus_visible,
    O2_1_3_input_control,
    O2_1_4_shortcut_key,
    O2_2_1_time_control,
    O2_2_2_pause_control,
    O2_3_1_flash_limit,
    O2_4_1_skip_navigation,
    O2_4_2_page_title,
    O2_4_3_link_purpose,
    O2_4_4_page_reference,
    O2_5_1_single_pointer,
    O2_5_2_pointer_cancel,
    O2_5_3_label_name,
    O2_5_4_motion_operation,
    
    // 원칙 3
    U3_1_1_language_attr,
    U3_2_1_user_control,
    U3_2_2_help_consistency,
    U3_3_1_error_correction,
    U3_3_2_label_provision,
    U3_3_3_accessible_auth,
    U3_3_4_auto_fill,
    
    // 원칙 4
    R4_1_1_markup_validity,
    R4_2_1_web_app_access,
  }
  
  // 원칙별 평균 계산
  const perceivableScores = [
    P1_1_1_alt_text, P1_2_1_multimedia_caption, P1_3_1_table_structure,
    P1_3_2_linear_structure, P1_3_3_clear_instructions, P1_4_1_color_independent,
    P1_4_2_no_auto_play, P1_4_3_contrast_ratio, P1_4_4_content_distinction
  ]
  
  const operableScores = [
    O2_1_1_keyboard_access, O2_1_2_focus_visible, O2_1_3_input_control,
    O2_1_4_shortcut_key, O2_2_1_time_control, O2_2_2_pause_control,
    O2_3_1_flash_limit, O2_4_1_skip_navigation, O2_4_2_page_title,
    O2_4_3_link_purpose, O2_4_4_page_reference, O2_5_1_single_pointer,
    O2_5_2_pointer_cancel, O2_5_3_label_name, O2_5_4_motion_operation
  ]
  
  const understandableScores = [
    U3_1_1_language_attr, U3_2_1_user_control, U3_2_2_help_consistency,
    U3_3_1_error_correction, U3_3_2_label_provision, U3_3_3_accessible_auth,
    U3_3_4_auto_fill
  ]
  
  const robustScores = [
    R4_1_1_markup_validity, R4_2_1_web_app_access
  ]
  
  const perceivable = perceivableScores.reduce((a, b) => a + b, 0) / perceivableScores.length
  const operable = operableScores.reduce((a, b) => a + b, 0) / operableScores.length
  const understandable = understandableScores.reduce((a, b) => a + b, 0) / understandableScores.length
  const robust = robustScores.reduce((a, b) => a + b, 0) / robustScores.length
  const overall = (perceivable + operable + understandable + robust) / 4
  
  const principles: KRDSPrincipleScores = {
    perceivable: Math.round(perceivable * 10) / 10,
    operable: Math.round(operable * 10) / 10,
    understandable: Math.round(understandable * 10) / 10,
    robust: Math.round(robust * 10) / 10,
    overall: Math.round(overall * 10) / 10,
  }
  
  // 웹 편의성 점수 (0-100)
  const convenience_score = Math.round(((overall - 2.0) / 3.0) * 100)
  
  // 준수 레벨 결정
  let compliance_level: 'A' | 'AA' | 'AAA' | 'Fail' = 'Fail'
  if (convenience_score >= 95) compliance_level = 'AAA'
  else if (convenience_score >= 85) compliance_level = 'AA'
  else if (convenience_score >= 70) compliance_level = 'A'
  
  // 이슈 수집: 점수가 낮은 모든 항목을 이슈로 보고
  const issues: KRDSResult['issues'] = []
  
  // 심각도 판단 함수
  const getSeverity = (score: number): 'critical' | 'serious' | 'moderate' | 'minor' => {
    if (score < 2.5) return 'critical'
    if (score < 3.5) return 'serious'
    if (score < 4.5) return 'moderate'
    return 'minor'
  }
  
  // 원칙 1: 인식의 용이성 (9개 항목)
  // 1.1.1 적절한 대체 텍스트: alt 비율이 낮은 페이지만
  if (P1_1_1_alt_text < 4.5) {
    const affectedPages = getAffectedPages(page => {
      const pageAccessibility = page.structure.accessibility || { altTextRatio: 0 }
      // alt 비율이 90% 미만인 페이지만
      return pageAccessibility.altTextRatio < 0.9
    })
    issues.push({
      item: '1.1.1 적절한 대체 텍스트 제공',
      severity: getSeverity(P1_1_1_alt_text),
      description: `이미지 대체 텍스트 비율: ${Math.round(accessibility.altTextRatio * 100)}% (권장: 90% 이상)`,
      recommendation: '모든 의미있는 이미지에 alt 속성을 추가하고, 장식용 이미지는 alt=""를 사용하세요.',
      affected_pages: affectedPages.length > 0 ? affectedPages : ['전체 페이지']
    })
  }
  
  // 1.2.1 자막 제공
  if (P1_2_1_multimedia_caption < 4.5) {
    const affectedPages = getAffectedPages(page => {
      const html = page.structure.html || ''
      const pageVisuals = page.structure.visuals || { videoCount: 0 }
      // 비디오가 있고 track 태그가 없는 페이지만
      return pageVisuals.videoCount > 0 && !html.toLowerCase().includes('<track')
    })
    
    // 비디오 유무와 관계없이 점수가 낮으면 이슈로 표시
    const description = visual.videoCount > 0 
      ? `동영상 ${visual.videoCount}개에 자막(<track> 태그) 누락`
      : '멀티미디어 콘텐츠가 없어 자막 제공 여부를 확인할 수 없습니다. (기본 점수 적용)'
    
    issues.push({
      item: '1.2.1 자막 제공',
      severity: getSeverity(P1_2_1_multimedia_caption),
      description: description,
      recommendation: '동영상 및 오디오 콘텐츠에 자막을 제공하세요. <video> 태그에 <track kind="captions"> 추가 필요.',
      affected_pages: affectedPages.length > 0 ? affectedPages : ['확인 불가 (멀티미디어 없음)']
    })
  }
  
  // 1.3.1 표의 구성
  if (P1_3_1_table_structure < 4.5) {
    const affectedPages = getAffectedPages(page => {
      const html = page.structure.html || ''
      const tableCount = (html.match(/<table[^>]*>/gi) || []).length
      const thCount = (html.match(/<th[^>]*>/gi) || []).length
      // 표가 있고 th 태그가 부족한 페이지만
      return tableCount > 0 && thCount < tableCount
    })
    
    // 표 유무와 관계없이 점수가 낮으면 이슈로 표시
    const description = content.tableCount > 0
      ? `표 ${content.tableCount}개에 <th> 태그 없음 또는 부족`
      : '표가 없어 표 구조를 확인할 수 없습니다. (기본 점수 적용)'
    
    issues.push({
      item: '1.3.1 표의 구성',
      severity: getSeverity(P1_3_1_table_structure),
      description: description,
      recommendation: '표의 제목 셀은 <th> 태그를 사용하고, 복잡한 표는 scope 또는 headers 속성을 활용하세요.',
      affected_pages: affectedPages.length > 0 ? affectedPages : ['확인 불가 (표 없음)']
    })
  }
  
  if (P1_3_2_linear_structure < 4.5) {
    const affectedPages = getAffectedPages(page => page.structure.accessibility?.headingStructure === true)
    issues.push({
      item: '1.3.2 콘텐츠의 선형구조',
      severity: getSeverity(P1_3_2_linear_structure),
      description: '콘텐츠의 논리적 순서가 명확하지 않습니다. 헤딩 구조 확인 필요.',
      recommendation: 'h1~h6 태그를 순서대로 사용하고, 건너뛰지 마세요. (예: h1 → h2 → h3)',
      affected_pages: affectedPages.length > 0 ? affectedPages : ['전체 페이지']
    })
  }
  
  if (P1_3_3_clear_instructions < 4.5) {
    issues.push({
      item: '1.3.3 명확한 지시사항 제공',
      severity: getSeverity(P1_3_3_clear_instructions),
      description: `폼 요소에 레이블 또는 aria-label이 부족합니다. (현재: ${accessibility.ariaLabelCount}개)`,
      recommendation: '모든 입력 필드에 <label> 태그 또는 aria-label 속성을 제공하세요.',
    affected_pages: ['전체 페이지']
    })
  }
  
  if (P1_4_1_color_independent < 4.5) {
    issues.push({
      item: '1.4.1 색에 무관한 콘텐츠 인식',
      severity: getSeverity(P1_4_1_color_independent),
      description: '색상만으로 정보를 전달하고 있을 가능성이 있습니다.',
      recommendation: '색상 외에 텍스트, 아이콘, 패턴 등을 함께 사용하여 정보를 전달하세요.',
    affected_pages: ['전체 페이지']
    })
  }
  
  // 1.4.2 자동 재생 금지: 실제로 autoplay가 있는 페이지만
  if (P1_4_2_no_auto_play < 4.5) {
    const affectedPages = getAffectedPages(page => {
      const html = page.structure.html || ''
      return html.toLowerCase().includes('autoplay')
    })
    
    // autoplay가 실제로 있는 경우에만 이슈로 표시
    if (affectedPages.length > 0) {
      issues.push({
        item: '1.4.2 자동 재생 금지',
        severity: getSeverity(P1_4_2_no_auto_play),
        description: '동영상 또는 오디오가 자동 재생되고 있습니다.',
        recommendation: 'autoplay 속성을 제거하거나, 사용자가 제어할 수 있는 일시정지/정지 버튼을 제공하세요.',
        affected_pages: affectedPages
      })
    }
  }
  
  if (P1_4_3_contrast_ratio < 4.5) {
    issues.push({
      item: '1.4.3 텍스트 콘텐츠의 명도 대비',
      severity: getSeverity(P1_4_3_contrast_ratio),
      description: '텍스트와 배경의 명도 대비가 부족할 수 있습니다.',
      recommendation: '일반 텍스트는 4.5:1 이상, 큰 텍스트(18pt 이상)는 3:1 이상의 명도 대비를 유지하세요.',
    affected_pages: ['전체 페이지']
    })
  }
  
  if (P1_4_4_content_distinction < 4.5) {
    issues.push({
      item: '1.4.4 콘텐츠 간의 구분',
      severity: getSeverity(P1_4_4_content_distinction),
      description: '콘텐츠 영역 구분이 불명확합니다.',
      recommendation: '시각적 구분선, 여백, 제목 등을 사용하여 콘텐츠 영역을 명확히 구분하세요.',
    affected_pages: ['전체 페이지']
    })
  }
  
  // 원칙 2: 운용의 용이성 (15개 항목)
  if (O2_1_1_keyboard_access < 4.5) {
    issues.push({
      item: '2.1.1 키보드 사용 보장',
      severity: getSeverity(O2_1_1_keyboard_access),
      description: '모든 기능이 키보드로 접근 가능한지 확인이 필요합니다.',
      recommendation: 'onclick 이벤트 사용 시 onkeydown/onkeypress도 함께 제공하고, 버튼은 <button> 또는 <a> 태그를 사용하세요.',
    affected_pages: ['전체 페이지']
    })
  }
  
  if (O2_1_2_focus_visible < 4.5) {
    issues.push({
      item: '2.1.2 초점 이동과 표시',
      severity: getSeverity(O2_1_2_focus_visible),
      description: '키보드 포커스 표시가 불명확하거나 누락되었습니다.',
      recommendation: 'CSS에서 :focus 스타일을 제거하지 말고, 명확한 시각적 표시(outline, border 등)를 제공하세요.',
    affected_pages: ['전체 페이지']
    })
  }
  
  if (O2_1_3_input_control < 4.5) {
    issues.push({
      item: '2.1.3 조작 가능',
      severity: getSeverity(O2_1_3_input_control),
      description: '입력 장치 제한으로 일부 사용자가 조작하기 어려울 수 있습니다.',
      recommendation: '마우스, 터치, 키보드 등 다양한 입력 방식을 모두 지원하세요.',
    affected_pages: ['전체 페이지']
    })
  }
  
  if (O2_1_4_shortcut_key < 4.5) {
    issues.push({
      item: '2.1.4 문자 단축키',
      severity: getSeverity(O2_1_4_shortcut_key),
      description: '단축키 충돌 가능성이 있습니다.',
      recommendation: '단일 문자 단축키 사용을 지양하고, Ctrl/Alt/Shift 조합키를 사용하거나 해제 기능을 제공하세요.',
    affected_pages: ['전체 페이지']
    })
  }
  
  if (O2_2_1_time_control < 4.5) {
    issues.push({
      item: '2.2.1 응답시간 조절',
      severity: getSeverity(O2_2_1_time_control),
      description: '시간 제한이 있는 콘텐츠의 제어 기능이 부족합니다.',
      recommendation: '세션 타임아웃 전 경고를 제공하고, 사용자가 시간을 연장할 수 있도록 하세요.',
    affected_pages: ['전체 페이지']
    })
  }
  
  if (O2_2_2_pause_control < 4.5) {
    issues.push({
      item: '2.2.2 정지 기능 제공',
      severity: getSeverity(O2_2_2_pause_control),
      description: '자동으로 움직이는 콘텐츠(슬라이드, 캐러셀)의 일시정지 기능이 없습니다.',
      recommendation: '자동 슬라이드에 일시정지/재생 버튼을 제공하세요.',
    affected_pages: ['전체 페이지']
    })
  }
  
  if (O2_3_1_flash_limit < 4.5) {
    issues.push({
      item: '2.3.1 깜빡임과 번쩍임 사용 제한',
      severity: getSeverity(O2_3_1_flash_limit),
      description: '초당 3~50회 깜빡이는 콘텐츠가 있을 수 있습니다.',
      recommendation: '깜빡임 효과를 제거하거나, 초당 3회 미만으로 제한하세요. (발작 유발 위험)',
    affected_pages: ['전체 페이지']
    })
  }
  
  if (O2_4_1_skip_navigation < 4.5) {
    issues.push({
      item: '2.4.1 반복 영역 건너뛰기',
      severity: getSeverity(O2_4_1_skip_navigation),
      description: '본문 바로가기 링크가 없습니다.',
      recommendation: '페이지 상단에 "본문 바로가기" 링크를 추가하세요. <a href="#content">본문 바로가기</a>',
    affected_pages: ['전체 페이지']
    })
  }
  
  if (O2_4_2_page_title < 4.5) {
    issues.push({
      item: '2.4.2 제목 제공',
      severity: getSeverity(O2_4_2_page_title),
      description: '페이지 제목(<title> 태그)이 없거나 부적절합니다.',
      recommendation: '각 페이지마다 고유하고 설명적인 <title> 태그를 제공하세요.',
    affected_pages: ['전체 페이지']
    })
  }
  
  if (O2_4_3_link_purpose < 4.5) {
    issues.push({
      item: '2.4.3 적절한 링크 텍스트',
      severity: getSeverity(O2_4_3_link_purpose),
      description: `링크 ${navigation.linkCount}개 중 aria-label이 ${accessibility.ariaLabelCount}개로 부족합니다.`,
      recommendation: '"여기 클릭", "more" 같은 모호한 링크 텍스트 대신 명확한 설명을 제공하세요.',
    affected_pages: ['전체 페이지']
    })
  }
  
  if (O2_4_4_page_reference < 4.5) {
    issues.push({
      item: '2.4.4 고정된 참조 위치 정보',
      severity: getSeverity(O2_4_4_page_reference),
      description: '페이지 번호 또는 위치 정보 표시가 부족합니다.',
      recommendation: '긴 문서는 페이지 번호 또는 섹션 제목을 제공하세요. (전자출판 주요 항목)',
    affected_pages: ['전체 페이지']
    })
  }
  
  if (O2_5_1_single_pointer < 4.5) {
    issues.push({
      item: '2.5.1 단일 포인터 입력 지원',
      severity: getSeverity(O2_5_1_single_pointer),
      description: '복잡한 제스처(드래그, 멀티터치)만 지원하고 있을 수 있습니다.',
      recommendation: '단순 클릭/탭으로도 모든 기능을 사용할 수 있도록 대안을 제공하세요.',
    affected_pages: ['전체 페이지']
    })
  }
  
  if (O2_5_2_pointer_cancel < 4.5) {
    issues.push({
      item: '2.5.2 포인터 입력 취소',
      severity: getSeverity(O2_5_2_pointer_cancel),
      description: '클릭/터치 입력 취소 기능이 부족합니다.',
      recommendation: '마우스 다운이 아닌 마우스 업에서 이벤트를 실행하여 실수를 방지하세요.',
    affected_pages: ['전체 페이지']
    })
  }
  
  if (O2_5_3_label_name < 4.5) {
    issues.push({
      item: '2.5.3 레이블과 네임',
      severity: getSeverity(O2_5_3_label_name),
      description: '폼 컨트롤의 시각적 레이블과 접근성 이름이 일치하지 않습니다.',
      recommendation: '<label>의 텍스트와 aria-label/name 속성을 동일하게 유지하세요.',
    affected_pages: ['전체 페이지']
    })
  }
  
  if (O2_5_4_motion_operation < 4.5) {
    issues.push({
      item: '2.5.4 동작기반 작동',
      severity: getSeverity(O2_5_4_motion_operation),
      description: '기기 흔들기 등 동작 기반 기능의 대안이 부족합니다.',
      recommendation: '동작 기반 기능에 버튼 클릭 등의 대안을 제공하고, 비활성화 옵션을 제공하세요.',
    affected_pages: ['전체 페이지']
    })
  }
  
  // 원칙 3: 이해의 용이성 (7개 항목)
  if (U3_1_1_language_attr < 4.5) {
    issues.push({
      item: '3.1.1 기본 언어 표시',
      severity: getSeverity(U3_1_1_language_attr),
      description: 'HTML lang 속성이 없습니다.',
      recommendation: '<html lang="ko"> 또는 <html lang="en">을 추가하여 스크린 리더가 올바른 언어로 읽을 수 있도록 하세요.',
    affected_pages: ['전체 페이지']
    })
  }
  
  if (U3_2_1_user_control < 4.5) {
    issues.push({
      item: '3.2.1 사용자 요구에 따른 실행',
      severity: getSeverity(U3_2_1_user_control),
      description: '사용자 동의 없이 자동으로 실행되는 기능이 있습니다.',
      recommendation: '새 창 열기, 폼 자동 제출 등은 사용자 동의를 받은 후 실행하세요.',
    affected_pages: ['전체 페이지']
    })
  }
  
  if (U3_2_2_help_consistency < 4.5) {
    issues.push({
      item: '3.2.2 찾기 쉬운 도움 정보',
      severity: getSeverity(U3_2_2_help_consistency),
      description: '도움말 또는 고객센터 링크를 찾기 어렵습니다.',
      recommendation: '모든 페이지에서 동일한 위치에 도움말/고객센터 링크를 배치하세요.',
    affected_pages: ['전체 페이지']
    })
  }
  
  if (U3_3_1_error_correction < 4.5) {
    issues.push({
      item: '3.3.1 오류 정정',
      severity: getSeverity(U3_3_1_error_correction),
      description: '폼 입력 오류에 대한 안내가 부족합니다.',
      recommendation: '오류 발생 시 명확한 메시지와 수정 방법을 제공하세요. (예: "이메일 형식이 올바르지 않습니다")',
    affected_pages: ['전체 페이지']
    })
  }
  
  if (U3_3_2_label_provision < 4.5) {
    issues.push({
      item: '3.3.2 레이블 제공',
      severity: getSeverity(U3_3_2_label_provision),
      description: '입력 필드에 레이블이 없거나 불명확합니다.',
      recommendation: '모든 <input>, <select>, <textarea>에 <label> 태그를 연결하세요. (for 속성 사용)',
    affected_pages: ['전체 페이지']
    })
  }
  
  if (U3_3_3_accessible_auth < 4.5) {
    issues.push({
      item: '3.3.3 접근 가능한 인증',
      severity: getSeverity(U3_3_3_accessible_auth),
      description: '인증 과정에서 접근성이 떨어지는 요소가 있습니다.',
      recommendation: 'CAPTCHA는 시각적 이미지 외에 오디오 또는 다른 대안을 제공하세요.',
    affected_pages: ['전체 페이지']
    })
  }
  
  if (U3_3_4_auto_fill < 4.5) {
    issues.push({
      item: '3.3.4 반복 입력 정보',
      severity: getSeverity(U3_3_4_auto_fill),
      description: '자동 완성 기능이 지원되지 않습니다.',
      recommendation: '이름, 이메일, 전화번호 등에 autocomplete 속성을 추가하세요. (예: autocomplete="name")',
    affected_pages: ['전체 페이지']
    })
  }
  
  // 원칙 4: 견고성 (2개 항목)
  if (R4_1_1_markup_validity < 4.5) {
    issues.push({
      item: '4.1.1 마크업 오류 방지',
      severity: getSeverity(R4_1_1_markup_validity),
      description: !hasDoctype || !hasHtmlTag ? 'DOCTYPE 또는 HTML 태그가 누락되었습니다.' : '마크업 검증이 필요합니다.',
      recommendation: 'W3C Markup Validation Service로 HTML 오류를 검증하고 수정하세요.',
    affected_pages: ['전체 페이지']
    })
  }
  
  if (R4_2_1_web_app_access < 4.5) {
    issues.push({
      item: '4.2.1 웹 애플리케이션 접근성',
      severity: getSeverity(R4_2_1_web_app_access),
      description: 'ARIA 속성 사용이 부족하거나 올바르지 않습니다.',
      recommendation: '동적 콘텐츠와 커스텀 컴포넌트에 적절한 ARIA role, state, property를 추가하세요.',
    affected_pages: ['전체 페이지']
    })
  }
  
  return {
    scores,
    principles,
    compliance_level,
    convenience_score,
    issues  // 모든 이슈 반환 (제한 없음)
  }
}
