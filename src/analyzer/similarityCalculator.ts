/**
 * 49개 기관 데이터 기반 유사도 계산 및 점수 예측
 */

import type { HTMLStructure } from './htmlAnalyzer'

export interface SimilarSite {
  name: string
  similarity: number
  total_score: number
  krds_score?: number
  nielsen_avg?: number
}

export interface PredictedScore {
  overall: number
  convenience: number
  design: number
  nielsen_scores: NielsenScores
  nielsen_diagnoses: NielsenDiagnoses  // 각 항목별 진단 근거
}

export interface NielsenDiagnoses {
  [key: string]: string  // 각 항목의 진단 근거
}

export interface NielsenScores {
  // N1: 시스템 상태 가시성 (3개 항목)
  N1_1_current_location: number      // 현재 페이지 위치 표시
  N1_2_loading_status: number        // 로딩 상태 표시
  N1_3_action_feedback: number       // 사용자 행동 피드백
  
  // N2: 현실 세계 일치 (3개 항목)
  N2_1_familiar_terms: number        // 친숙한 용어 사용
  N2_2_natural_flow: number          // 자연스러운 흐름
  N2_3_real_world_metaphor: number   // 현실 세계 은유
  
  // N3: 사용자 제어와 자유 (3개 항목)
  N3_1_undo_redo: number             // 실행 취소/재실행
  N3_2_exit_escape: number           // 나가기/취소
  N3_3_flexible_navigation: number   // 유연한 네비게이션
  
  // N4: 일관성과 표준 (3개 항목)
  N4_1_visual_consistency: number    // 시각적 일관성
  N4_2_terminology_consistency: number // 용어 일관성
  N4_3_standard_compliance: number   // 표준 준수
  
  // N5: 오류 예방 (3개 항목)
  N5_1_input_validation: number      // 입력 검증
  N5_2_confirmation_dialog: number   // 확인 대화상자
  N5_3_constraints: number           // 제약 조건
  
  // N6: 인식보다 회상 (3개 항목)
  N6_1_visible_options: number       // 보이는 옵션
  N6_2_recognition_cues: number      // 인식 단서
  N6_3_memory_load: number           // 기억 부담 최소화
  
  // N7: 유연성과 효율성 (2개 항목)
  N7_1_shortcuts: number             // 단축키/빠른 접근
  N7_2_customization: number         // 맞춤 설정
  
  // N8: 미니멀 디자인 (3개 항목)
  N8_1_essential_info: number        // 핵심 정보만
  N8_2_clean_interface: number       // 깔끔한 인터페이스
  N8_3_visual_hierarchy: number      // 시각적 계층
  
  // N9: 오류 인식과 복구 (3개 항목)
  N9_1_error_messages: number        // 명확한 오류 메시지
  N9_2_recovery_support: number      // 복구 지원
  N9_3_error_prevention_info: number // 오류 예방 정보
  
  // N10: 도움말과 문서 (2개 항목)
  N10_1_help_access: number          // 도움말 접근성
  N10_2_documentation: number        // 문서화
}

/**
 * 49개 기관 데이터와 유사도 계산
 * Nielsen 10원칙 패턴 기반 유사도 비교
 */
export function findSimilarSites(structure: HTMLStructure, referenceData: any[]): SimilarSite[] {
  // 먼저 새 사이트의 Nielsen 점수 계산
  const newSiteNielsen = calculateNielsenFromStructure(structure)
  
  const similarities = referenceData.map(site => {
    // Nielsen 패턴 유사도 계산
    const similarity = calculateNielsenSimilarity(newSiteNielsen, site.nielsen_10_principles)
    
    return {
      name: site.site_name || site.name,
      similarity,
      total_score: site.final_nielsen_score || site.total_avg || site.final_score || 0,
      krds_score: site.breakdown?.krds_score || site.krds_score,
      nielsen_avg: site.nielsen_average || site.final_nielsen_score
    }
  })

  // 유사도 높은 순으로 정렬 후 상위 5개 반환
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5)
}

/**
 * HTML 구조에서 Nielsen 10원칙 점수 추정
 */
function calculateNielsenFromStructure(structure: HTMLStructure): any {
  const { navigation, accessibility, content, forms, visuals } = structure
  
  // 기본 점수 2.5 (중간값)
  const base = 2.5
  
  return {
    N1_visibility: base + (navigation.breadcrumbExists ? 1.0 : -0.5) + (navigation.searchExists ? 0.5 : 0),
    N2_match: base + (accessibility.langAttribute ? 0.5 : 0) + (content.headingCount > 5 ? 0.8 : -0.3),
    N3_control: base + (navigation.breadcrumbExists ? 0.7 : -0.3) + (navigation.linkCount > 20 ? 0.5 : 0),
    N4_consistency: base + (content.headingCount > 0 ? 0.8 : -0.5) + (accessibility.langAttribute ? 0.4 : 0),
    N5_error_prevention: base + (forms.validationExists ? 1.2 : -0.8) + (forms.labelRatio > 0.8 ? 0.5 : -0.3),
    N6_recognition: base + (navigation.searchExists ? 1.0 : -0.5) + (visuals.iconCount > 3 ? 0.5 : 0),
    N7_flexibility: base + (navigation.searchExists ? 1.0 : -0.6),
    N8_minimalism: base + (content.paragraphCount < 50 ? 0.8 : -0.5) + (visuals.imageCount < 30 ? 0.4 : -0.2),
    N9_error_recovery: base + (forms.validationExists ? 0.8 : -0.4),
    N10_help: base + (content.listCount > 3 ? 0.6 : -0.2) + (navigation.searchExists ? 0.4 : 0)
  }
}

/**
 * Nielsen 10원칙 패턴 유사도 계산
 * 각 원칙의 점수 차이를 기반으로 유사도 측정
 */
function calculateNielsenSimilarity(newNielsen: any, refNielsen: any): number {
  if (!refNielsen) return 0
  
  const principles = ['N1_visibility', 'N2_match', 'N3_control', 'N4_consistency', 
                     'N5_error_prevention', 'N6_recognition', 'N7_flexibility', 
                     'N8_minimalism', 'N9_error_recovery', 'N10_help']
  
  let totalDiff = 0
  let count = 0
  
  principles.forEach(key => {
    const newScore = newNielsen[key] || 0
    const refScore = refNielsen[key] || 0
    
    // 점수 차이 (0~5 범위에서)
    const diff = Math.abs(newScore - refScore)
    totalDiff += diff
    count++
  })
  
  // 평균 차이 계산 (0~5)
  const avgDiff = totalDiff / count
  
  // 유사도로 변환 (차이가 작을수록 유사도 높음)
  // 차이 0 = 100점, 차이 5 = 0점
  const similarity = Math.max(0, 100 - (avgDiff * 20))
  
  return Math.round(similarity)
}

/**
 * 유사도 계산 알고리즘
 * HTML 구조 기반으로 유사도 계산 (49개 기관 데이터에는 HTML 구조 없음)
 */
function calculateSimilarity(newSite: HTMLStructure, referenceSite: any): number {
  let totalScore = 0
  let maxScore = 0

  // 1. 네비게이션 점수 (0~25점)
  const navScore = scoreNavigation(newSite.navigation)
  totalScore += navScore
  maxScore += 25

  // 2. 접근성 점수 (0~35점) - 가장 중요
  const a11yScore = scoreAccessibility(newSite.accessibility)
  totalScore += a11yScore
  maxScore += 35

  // 3. 콘텐츠 점수 (0~20점)
  const contentScore = scoreContent(newSite.content)
  totalScore += contentScore
  maxScore += 20

  // 4. 폼 점수 (0~10점)
  const formScore = scoreForms(newSite.forms)
  totalScore += formScore
  maxScore += 10

  // 5. 시각적 요소 (0~10점)
  const visualScore = scoreVisuals(newSite.visuals)
  totalScore += visualScore
  maxScore += 10

  // 0~100 범위로 정규화
  return Math.round((totalScore / maxScore) * 100)
}

// 개별 점수 계산 함수들
function scoreNavigation(nav: any): number {
  let score = 5 // 기본 점수
  if (nav.searchExists) score += 8
  if (nav.breadcrumbExists) score += 7
  if (nav.linkCount >= 20 && nav.linkCount <= 100) score += 5
  return score
}

function scoreAccessibility(a11y: any): number {
  let score = 5 // 기본 점수
  score += a11y.altTextRatio * 10 // 0~10점
  if (a11y.langAttribute) score += 7
  if (a11y.skipLinkExists) score += 5
  if (a11y.headingStructure) score += 5
  if (a11y.ariaLabelCount > 5) score += 3
  return Math.min(score, 35)
}

function scoreContent(content: any): number {
  let score = 5 // 기본 점수
  if (content.headingCount >= 5 && content.headingCount <= 20) score += 6
  if (content.paragraphCount >= 10) score += 4
  if (content.listCount > 3) score += 3
  if (content.tableCount > 0) score += 2
  return Math.min(score, 20)
}

function scoreForms(forms: any): number {
  if (forms.formCount === 0) return 5 // 폼 없어도 기본 점수
  
  let score = 2
  if (forms.validationExists) score += 4
  score += forms.labelRatio * 4 // 0~4점
  return Math.min(score, 10)
}

function scoreVisuals(visuals: any): number {
  let score = 2 // 기본 점수
  if (visuals.imageCount > 0 && visuals.imageCount <= 30) score += 4
  if (visuals.iconCount > 3) score += 3
  if (visuals.videoCount > 0) score += 1
  return Math.min(score, 10)
}

/**
 * HTML 구조 기반 편의성 점수 (0~5점)
 */
function calculateConvenienceScore(structure: HTMLStructure): number {
  let score = 0
  const { navigation, accessibility, forms } = structure
  
  // 네비게이션 (0~1.5점)
  if (navigation.breadcrumbExists) score += 0.5
  if (navigation.searchExists) score += 0.5
  score += Math.min(navigation.linkCount / 50, 0.5) // 링크 수 (최대 50개 기준)
  
  // 접근성 (0~2.0점)
  score += accessibility.altTextRatio * 0.5 // 대체 텍스트 비율
  if (accessibility.langAttribute) score += 0.3
  if (accessibility.skipLinkExists) score += 0.2
  if (accessibility.headingStructure) score += 0.5
  score += Math.min(accessibility.ariaLabelCount / 10, 0.5) // ARIA 레이블
  
  // 폼 편의성 (0~1.5점)
  if (forms.formCount > 0) {
    if (forms.validationExists) score += 0.5
    score += forms.labelRatio * 1.0 // 라벨 연결 비율
  } else {
    score += 0.75 // 폼이 없어도 중간 점수
  }
  
  return Math.min(score, 5.0)
}

/**
 * HTML 구조 기반 디자인 점수 (0~5점)
 */
function calculateDesignScore(structure: HTMLStructure): number {
  let score = 0
  const { content, visuals, accessibility } = structure
  
  // 콘텐츠 구조 (0~2.0점)
  const headingScore = Math.min(content.headingCount / 10, 1.0) // 제목 개수 (최대 10개 기준)
  score += headingScore
  
  const paragraphScore = content.paragraphCount >= 10 && content.paragraphCount <= 50 
    ? 0.5 
    : content.paragraphCount < 10 
    ? content.paragraphCount * 0.05 
    : 0.3 // 10~50개가 적정
  score += paragraphScore
  
  if (content.listCount > 0) score += Math.min(content.listCount / 10, 0.5)
  
  // 시각적 요소 (0~2.0점)
  const imageScore = visuals.imageCount > 0 && visuals.imageCount <= 30
    ? Math.min(visuals.imageCount / 15, 1.0) // 적정 이미지 수
    : visuals.imageCount > 30
    ? 0.3 // 과다
    : 0.5 // 없어도 중간
  score += imageScore
  
  const iconScore = Math.min(visuals.iconCount / 10, 0.5) // 아이콘
  score += iconScore
  
  if (visuals.videoCount > 0 && visuals.videoCount <= 3) score += 0.5
  
  // 일관성 (0~1.0점)
  if (accessibility.headingStructure) score += 0.5 // 제목 계층 구조
  if (accessibility.langAttribute) score += 0.5 // 언어 속성
  
  return Math.min(score, 5.0)
}

/**
 * 기본 구조 점수 (사용 안함 - 호환성 유지)
 */
function calculateStructureScore(structure: HTMLStructure): number {
  return (calculateConvenienceScore(structure) + calculateDesignScore(structure)) / 2
}

/**
 * 예측 점수 산출
 */
export function calculatePredictedScore(similarSites: SimilarSite[], structure: HTMLStructure, url: string): PredictedScore {
  // HTML 구조 기반 점수 계산 (결정적, 재현 가능)
  const baseScore = calculateStructureScore(structure)
  
  // 편의성: 접근성 + 네비게이션 중심
  const convenience = calculateConvenienceScore(structure)
  
  // 디자인: 시각적 요소 + 콘텐츠 구조 중심
  const design = calculateDesignScore(structure)
  
  // 종합 점수 = (편의성 + 디자인) / 2
  const overall = (convenience + design) / 2

  // Nielsen 점수 매핑
  const nielsenScores = mapToNielsen(structure, overall)
  
  // Nielsen 진단 근거 생성 (URL 포함)
  const nielsenDiagnoses = generateDiagnoses(structure, nielsenScores, url)

  return {
    overall: Math.min(overall, 5.0),
    convenience: Math.min(convenience, 5.0),
    design: Math.min(design, 5.0),
    nielsen_scores: nielsenScores,
    nielsen_diagnoses: nielsenDiagnoses
  }
}

/**
 * Nielsen 25개 전체 항목 매핑 (품질 기반 점수, 0~5점)
 * 조건 충족도에 따라 차등 점수 부여
 */
function mapToNielsen(structure: HTMLStructure, baseScore: number): NielsenScores {
  const { navigation, accessibility, content, forms, visuals } = structure

  return {
    // N1: 시스템 상태 가시성 (3개)
    N1_1_current_location: navigation.breadcrumbExists ? 5.0 : 2.0,
    N1_2_loading_status: 3.0,  // HTML로 확인 불가 → 평가 제외
    N1_3_action_feedback: forms.validationExists ? 5.0 : 2.0,
    
    // N2: 현실 세계 일치 (3개)
    N2_1_familiar_terms: accessibility.langAttribute ? 5.0 : 2.0,
    N2_2_natural_flow: content.headingCount >= 10 ? 5.0 : content.headingCount >= 5 ? 4.0 : content.headingCount > 0 ? 3.0 : 2.0,
    N2_3_real_world_metaphor: visuals.iconCount >= 10 ? 5.0 : visuals.iconCount >= 5 ? 4.0 : visuals.iconCount > 0 ? 3.0 : 2.0,
    
    // N3: 사용자 제어와 자유 (3개)
    N3_1_undo_redo: 3.0,  // HTML로 확인 불가 → 평가 제외
    N3_2_exit_escape: navigation.breadcrumbExists ? 5.0 : 2.0,
    N3_3_flexible_navigation: navigation.linkCount >= 100 ? 5.0 : navigation.linkCount >= 50 ? 4.0 : navigation.linkCount >= 20 ? 3.5 : 2.5,
    
    // N4: 일관성과 표준 (3개)
    N4_1_visual_consistency: accessibility.headingStructure ? 5.0 : 2.0,
    N4_2_terminology_consistency: content.headingCount >= 10 ? 5.0 : content.headingCount >= 5 ? 4.0 : content.headingCount >= 3 ? 3.5 : 2.5,
    N4_3_standard_compliance: 
      (accessibility.langAttribute && accessibility.altTextRatio >= 0.9) ? 5.0 
      : (accessibility.langAttribute && accessibility.altTextRatio >= 0.7) ? 4.0 
      : accessibility.langAttribute ? 3.5 
      : 2.0,
    
    // N5: 오류 예방 (2개)
    N5_1_input_validation: forms.validationExists ? 5.0 : 2.0,
    N5_3_constraints: 
      forms.labelRatio >= 0.9 ? 5.0 
      : forms.labelRatio >= 0.7 ? 4.0 
      : forms.labelRatio >= 0.5 ? 3.0 
      : 2.0,
    
    // N6: 인식보다 회상 (3개)
    N6_1_visible_options: navigation.searchExists ? 5.0 : 2.0,
    N6_2_recognition_cues: 
      visuals.iconCount >= 10 ? 5.0 
      : visuals.iconCount >= 5 ? 4.0 
      : visuals.iconCount > 0 ? 3.0 
      : 2.0,
    N6_3_memory_load: 
      (navigation.breadcrumbExists && navigation.searchExists) ? 5.0 
      : navigation.breadcrumbExists ? 4.0 
      : navigation.searchExists ? 3.0 
      : 2.0,
    
    // N7: 유연성과 효율성 (1개)
    N7_1_shortcuts: navigation.searchExists ? 5.0 : 2.0,
    
    // N8: 미니멀 디자인 (3개) - 과하면 감점
    N8_1_essential_info: 
      content.paragraphCount <= 20 ? 5.0 
      : content.paragraphCount <= 30 ? 4.5 
      : content.paragraphCount <= 50 ? 4.0 
      : content.paragraphCount <= 70 ? 3.0 
      : 2.0,
    N8_2_clean_interface: 
      visuals.imageCount <= 10 ? 5.0 
      : visuals.imageCount <= 20 ? 4.5 
      : visuals.imageCount <= 30 ? 4.0 
      : visuals.imageCount <= 50 ? 3.0 
      : 2.0,
    N8_3_visual_hierarchy: 
      content.headingCount >= 10 ? 5.0 
      : content.headingCount >= 7 ? 4.5 
      : content.headingCount >= 5 ? 4.0 
      : content.headingCount >= 3 ? 3.5 
      : 2.5,
    
    // N9: 오류 인식과 복구 (2개)
    N9_1_error_messages: forms.validationExists ? 5.0 : 2.0,
    N9_3_error_prevention_info: 
      forms.labelRatio >= 0.9 ? 5.0 
      : forms.labelRatio >= 0.7 ? 4.0 
      : forms.labelRatio >= 0.5 ? 3.0 
      : 2.0,
    
    // N10: 도움말과 문서 (2개)
    N10_1_help_access: navigation.searchExists ? 5.0 : 2.0,
    N10_2_documentation: 
      content.listCount >= 10 ? 5.0 
      : content.listCount >= 5 ? 4.0 
      : content.listCount >= 3 ? 3.5 
      : 2.5
  }
}

/**
 * 기본 점수에서 조정값을 더해 최종 점수 계산 (0~5점 범위)
 */
function calculateScore(baseScore: number, adjustment: number): number {
  return Math.max(0, Math.min(5.0, baseScore + adjustment))
}

/**
 * Nielsen 항목별 진단 근거 생성 (URL 포함)
 */
function generateDiagnoses(structure: HTMLStructure, scores: NielsenScores, url: string): NielsenDiagnoses {
  const { navigation, accessibility, content, forms, visuals } = structure
  
  return {
    N1_1_current_location: navigation.breadcrumbExists 
      ? `✅ [${url}] Breadcrumb 네비게이션이 제공되어 현재 위치를 명확히 알 수 있습니다.`
      : `⚠️ [${url}] Breadcrumb이 없어 사용자가 현재 위치를 파악하기 어렵습니다.`,
    
    N1_3_action_feedback: forms.validationExists
      ? `✅ [${url}] 폼 입력 검증이 있어 사용자 행동에 대한 피드백을 제공합니다.`
      : `⚠️ [${url}] 폼 검증이 없어 입력 오류 시 피드백이 부족할 수 있습니다.`,
    
    N2_1_familiar_terms: accessibility.langAttribute
      ? `✅ [${url}] HTML lang="${accessibility.langAttribute ? 'ko' : ''}" 속성이 설정되어 있습니다.`
      : `⚠️ [${url}] HTML lang 속성이 없어 언어 인식에 문제가 있을 수 있습니다.`,
    
    N2_2_natural_flow: content.headingCount > 5
      ? `✅ [${url}] ${content.headingCount}개의 헤딩으로 정보가 체계적으로 구조화되어 있습니다.`
      : `⚠️ [${url}] 헤딩이 ${content.headingCount}개로 부족하여 정보 구조가 불명확합니다.`,
    
    N2_3_real_world_metaphor: visuals.iconCount > 5
      ? `✅ [${url}] ${visuals.iconCount}개의 아이콘을 활용하여 직관적 이해를 돕습니다.`
      : `⚠️ [${url}] 아이콘이 ${visuals.iconCount}개로 부족하여 시각적 단서가 부족합니다.`,
    
    N3_2_exit_escape: navigation.breadcrumbExists
      ? `✅ [${url}] Breadcrumb을 통해 상위 페이지로 쉽게 이동할 수 있습니다.`
      : `⚠️ [${url}] 명확한 나가기/뒤로가기 경로가 부족합니다.`,
    
    N3_3_flexible_navigation: navigation.linkCount > 20
      ? `✅ [${url}] ${navigation.linkCount}개의 링크로 다양한 경로를 제공합니다.`
      : `⚠️ [${url}] 링크가 ${navigation.linkCount}개로 제한적이어서 탐색이 제한적입니다.`,
    
    N4_1_visual_consistency: accessibility.headingStructure
      ? `✅ [${url}] 제목 태그 계층 구조(h1→h2→h3)가 일관되게 형성되어 있습니다.`
      : `⚠️ [${url}] 제목 태그 계층 구조가 불규칙하여 시각적 일관성이 부족합니다.`,
    
    N4_2_terminology_consistency: content.headingCount > 3
      ? `✅ [${url}] ${content.headingCount}개 제목 사용으로 용어 일관성이 유지됩니다.`
      : `⚠️ [${url}] 제목이 ${content.headingCount}개로 부족하여 용어 일관성을 평가하기 어렵습니다.`,
    
    N4_3_standard_compliance: accessibility.langAttribute && accessibility.altTextRatio > 0.8
      ? `✅ [${url}] 웹 표준(lang, alt 속성 ${Math.round(accessibility.altTextRatio * 100)}%)을 준수합니다.`
      : `⚠️ [${url}] 웹 접근성 표준 준수가 부족합니다. (alt: ${Math.round(accessibility.altTextRatio * 100)}%)`,
    
    N5_1_input_validation: forms.validationExists && forms.inputCount > 0
      ? `✅ [${url}] ${forms.inputCount}개 입력 필드에 검증 기능이 있어 오류를 예방합니다.`
      : forms.inputCount > 0
      ? `⚠️ [${url}] ${forms.inputCount}개 입력 필드에 검증이 없어 잘못된 입력이 가능합니다.`
      : `ℹ️ [${url}] 입력 필드가 없어 검증을 평가할 수 없습니다.`,
    
    N5_3_constraints: forms.labelRatio > 0.8
      ? `✅ [${url}] ${Math.round(forms.labelRatio * 100)}%의 입력 필드에 label이 연결되어 제약이 명확합니다.`
      : `⚠️ [${url}] label이 ${Math.round(forms.labelRatio * 100)}%만 있어 입력 제약이 불명확합니다.`,
    
    N6_1_visible_options: navigation.searchExists
      ? `✅ [${url}] 검색 기능이 있어 옵션을 기억하지 않고 찾을 수 있습니다.`
      : `⚠️ [${url}] 검색 기능이 없어 원하는 기능을 찾기 어렵습니다.`,
    
    N6_2_recognition_cues: visuals.iconCount > 3
      ? `✅ [${url}] ${visuals.iconCount}개 아이콘이 인식 단서를 제공합니다.`
      : `⚠️ [${url}] 아이콘이 ${visuals.iconCount}개로 인식 단서가 부족합니다.`,
    
    N6_3_memory_load: navigation.breadcrumbExists && navigation.searchExists
      ? `✅ [${url}] Breadcrumb과 검색 기능으로 사용자의 기억 부담을 줄입니다.`
      : `⚠️ [${url}] 위치 정보나 검색 기능이 부족하여 사용자가 많이 기억해야 합니다.`,
    
    N7_1_shortcuts: navigation.searchExists
      ? `✅ [${url}] 검색 기능으로 빠른 접근이 가능합니다.`
      : `⚠️ [${url}] 빠른 접근 수단이 부족합니다.`,
    
    N8_1_essential_info: content.paragraphCount < 50
      ? `✅ [${url}] ${content.paragraphCount}개 문단으로 핵심 정보에 집중합니다.`
      : `⚠️ [${url}] ${content.paragraphCount}개 문단으로 정보가 과다합니다.`,
    
    N8_2_clean_interface: visuals.imageCount < 30
      ? `✅ [${url}] ${visuals.imageCount}개 이미지로 깔끔한 인터페이스를 유지합니다.`
      : `⚠️ [${url}] ${visuals.imageCount}개 이미지로 시각적 과부하가 있습니다.`,
    
    N8_3_visual_hierarchy: content.headingCount > 3
      ? `✅ [${url}] ${content.headingCount}개 헤딩으로 명확한 시각적 계층을 형성합니다.`
      : `⚠️ [${url}] 헤딩이 ${content.headingCount}개로 시각적 계층이 부족합니다.`,
    
    N9_1_error_messages: forms.validationExists
      ? `✅ [${url}] 입력 검증으로 오류 메시지를 제공합니다.`
      : `⚠️ [${url}] 검증이 없어 오류 메시지가 부족할 수 있습니다.`,
    
    N9_3_error_prevention_info: forms.labelRatio > 0.8
      ? `✅ [${url}] ${Math.round(forms.labelRatio * 100)}%의 필드에 label이 있어 오류를 예방합니다.`
      : `⚠️ [${url}] label이 ${Math.round(forms.labelRatio * 100)}%만 있어 오류 예방 정보가 부족합니다.`,
    
    N10_1_help_access: navigation.searchExists
      ? `✅ [${url}] 검색 기능으로 도움말에 쉽게 접근할 수 있습니다.`
      : `⚠️ [${url}] 도움말 접근 수단이 명확하지 않습니다.`,
    
    N10_2_documentation: content.listCount > 3
      ? `✅ [${url}] ${content.listCount}개 리스트로 정보가 체계적으로 문서화되어 있습니다.`
      : `⚠️ [${url}] 리스트가 ${content.listCount}개로 문서화가 부족합니다.`
  }
}
