/**
 * KRDS (KWCAG 2.2) 평가 체계
 * 한국형 웹 콘텐츠 접근성 지침 2.2
 * - 4원칙 (Perceivable, Operable, Understandable, Robust)
 * - 14지침
 * - 33검사 항목
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
  accessibility_score: number  // 0-100 점수
  issues: Array<{
    item: string
    severity: 'critical' | 'serious' | 'moderate' | 'minor'
    description: string
    recommendation: string
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
export function evaluateKRDS(structure: HTMLStructure): KRDSResult {
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
  
  // 접근성 점수 (0-100)
  const accessibility_score = Math.round(((overall - 2.0) / 3.0) * 100)
  
  // 준수 레벨 결정
  let compliance_level: 'A' | 'AA' | 'AAA' | 'Fail' = 'Fail'
  if (accessibility_score >= 95) compliance_level = 'AAA'
  else if (accessibility_score >= 85) compliance_level = 'AA'
  else if (accessibility_score >= 70) compliance_level = 'A'
  
  // 이슈 수집
  const issues: KRDSResult['issues'] = []
  
  if (P1_1_1_alt_text < 4.0) {
    issues.push({
      item: '1.1.1 적절한 대체 텍스트 제공',
      severity: 'critical',
      description: `이미지 대체 텍스트 비율이 낮습니다 (${Math.round(structure.accessibility.altTextRatio * 100)}%)`,
      recommendation: '모든 이미지에 의미있는 alt 속성을 추가하세요.'
    })
  }
  
  if (!structure.accessibility.skipLinkExists) {
    issues.push({
      item: '2.4.1 반복 영역 건너뛰기',
      severity: 'serious',
      description: '본문 바로가기 링크가 없습니다.',
      recommendation: '페이지 상단에 Skip Navigation 링크를 추가하세요.'
    })
  }
  
  if (!structure.accessibility.langAttribute) {
    issues.push({
      item: '3.1.1 기본 언어 표시',
      severity: 'serious',
      description: 'HTML lang 속성이 없습니다.',
      recommendation: '<html lang="ko"> 또는 <html lang="en">을 추가하세요.'
    })
  }
  
  if (!hasDoctype || !hasHtmlTag) {
    issues.push({
      item: '4.1.1 마크업 오류 방지',
      severity: 'critical',
      description: '기본 HTML 구조가 올바르지 않습니다.',
      recommendation: '<!DOCTYPE html>과 <html> 태그를 올바르게 사용하세요.'
    })
  }
  
  return {
    scores,
    principles,
    compliance_level,
    accessibility_score,
    issues: issues.slice(0, 10)  // 상위 10개 이슈만
  }
}
