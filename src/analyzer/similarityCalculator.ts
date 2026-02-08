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
  convenience_items: {  // 편의성 항목 (13개)
    [key: string]: { score: number; category: string; diagnosis: string }
  }
  design_items: {  // 디자인 항목 (12개)
    [key: string]: { score: number; category: string; diagnosis: string }
  }
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
  
  // N7: 유연성과 효율성 (2개 항목) - 구버전
  N7_1_shortcuts: number             // 단축키/빠른 접근
  N7_2_customization: number         // 맞춤 설정 (현재는 N7_2_personalization으로 변경됨)
  
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
 * 예측 점수 산출 (Nielsen 25개 항목 기반)
 */
export function calculatePredictedScore(similarSites: SimilarSite[], structure: HTMLStructure, url: string): PredictedScore {
  // Nielsen 25개 항목 점수 계산
  const nielsenScores = mapToNielsen(structure, 0)
  
  // 편의성 항목 (13개): N1, N3, N5, N6, N7, N10.1
  const convenienceItems = [
    nielsenScores.N1_1_current_location,    // N1.1 현재 위치
    nielsenScores.N1_2_loading_status,      // N1.2 로딩 상태
    nielsenScores.N1_3_action_feedback,     // N1.3 행동 피드백
    nielsenScores.N3_1_undo_redo,           // N3.1 실행 취소
    nielsenScores.N3_2_exit_escape,         // N3.2 나가기
    nielsenScores.N3_3_flexible_navigation, // N3.3 유연한 네비
    nielsenScores.N5_1_input_validation,    // N5.1 입력 검증
    nielsenScores.N5_3_constraints,         // N5.3 제약 조건
    nielsenScores.N6_1_visible_options,     // N6.1 보이는 옵션
    nielsenScores.N6_2_recognition_cues,    // N6.2 인식 단서
    nielsenScores.N6_3_memory_load,         // N6.3 기억 부담
    nielsenScores.N7_1_shortcuts,           // N7.1 단축키
    nielsenScores.N10_1_help_access         // N10.1 도움말 접근성
  ]
  
  // 디자인 항목 (12개): N2, N4, N8, N9, N10.2
  const designItems = [
    nielsenScores.N2_1_familiar_terms,       // N2.1 친숙한 용어
    nielsenScores.N2_2_natural_flow,         // N2.2 자연스러운 흐름
    nielsenScores.N2_3_real_world_metaphor,  // N2.3 현실 세계 은유
    nielsenScores.N4_1_visual_consistency,   // N4.1 시각적 일관성
    nielsenScores.N4_2_terminology_consistency, // N4.2 용어 일관성
    nielsenScores.N4_3_standard_compliance,  // N4.3 표준 준수
    nielsenScores.N8_1_essential_info,       // N8.1 핵심 정보
    nielsenScores.N8_2_clean_interface,      // N8.2 깔끔한 인터페이스
    nielsenScores.N8_3_visual_hierarchy,     // N8.3 시각적 계층
    nielsenScores.N9_1_error_messages,       // N9.1 오류 메시지
    nielsenScores.N9_3_error_prevention_info,// N9.3 오류 예방
    nielsenScores.N10_2_documentation        // N10.2 문서화
  ]
  
  // 편의성 = 편의성 항목들의 평균
  const convenience = convenienceItems.reduce((sum, score) => sum + score, 0) / convenienceItems.length
  
  // 디자인 = 디자인 항목들의 평균
  const design = designItems.reduce((sum, score) => sum + score, 0) / designItems.length
  
  // 종합 = Nielsen 25개 항목 전체 평균 (편의성 13개 + 디자인 12개)
  const allItems = [...convenienceItems, ...designItems]
  const overall = allItems.reduce((sum, score) => sum + score, 0) / allItems.length
  
  // Nielsen 진단 근거 생성 (URL 포함)
  const nielsenDiagnoses = generateDiagnoses(structure, nielsenScores, url)

  // 편의성 항목 상세 정보
  const convenienceItemsDetail = {
    'N1.1_현재_위치': { score: nielsenScores.N1_1_current_location, category: 'N1_시스템_상태_가시성', diagnosis: nielsenDiagnoses.N1_1_current_location },
    'N1.2_로딩_상태': { score: nielsenScores.N1_2_loading_status, category: 'N1_시스템_상태_가시성', diagnosis: nielsenDiagnoses.N1_2_loading_status },
    'N1.3_행동_피드백': { score: nielsenScores.N1_3_action_feedback, category: 'N1_시스템_상태_가시성', diagnosis: nielsenDiagnoses.N1_3_action_feedback },
    'N3.1_실행_취소': { score: nielsenScores.N3_1_undo_redo, category: 'N3_사용자_제어와_자유', diagnosis: nielsenDiagnoses.N3_1_undo_redo },
    'N3.2_나가기': { score: nielsenScores.N3_2_exit_escape, category: 'N3_사용자_제어와_자유', diagnosis: nielsenDiagnoses.N3_2_exit_escape },
    'N3.3_유연한_네비게이션': { score: nielsenScores.N3_3_flexible_navigation, category: 'N3_사용자_제어와_자유', diagnosis: nielsenDiagnoses.N3_3_flexible_navigation },
    'N5.1_입력_검증': { score: nielsenScores.N5_1_input_validation, category: 'N5_오류_예방', diagnosis: nielsenDiagnoses.N5_1_input_validation },
    'N5.3_제약_조건': { score: nielsenScores.N5_3_constraints, category: 'N5_오류_예방', diagnosis: nielsenDiagnoses.N5_3_constraints },
    'N6.1_보이는_옵션': { score: nielsenScores.N6_1_visible_options, category: 'N6_인식보다_기억_최소화', diagnosis: nielsenDiagnoses.N6_1_visible_options },
    'N6.2_인식_단서': { score: nielsenScores.N6_2_recognition_cues, category: 'N6_인식보다_기억_최소화', diagnosis: nielsenDiagnoses.N6_2_recognition_cues },
    'N6.3_기억_부담': { score: nielsenScores.N6_3_memory_load, category: 'N6_인식보다_기억_최소화', diagnosis: nielsenDiagnoses.N6_3_memory_load },
    'N7.1_단축키': { score: nielsenScores.N7_1_shortcuts, category: 'N7_유연성과_효율성', diagnosis: nielsenDiagnoses.N7_1_shortcuts },
    'N10.1_도움말_접근성': { score: nielsenScores.N10_1_help_access, category: 'N10_도움말과_문서', diagnosis: nielsenDiagnoses.N10_1_help_access }
  }

  // 디자인 항목 상세 정보
  const designItemsDetail = {
    'N2.1_친숙한_용어': { score: nielsenScores.N2_1_familiar_terms, category: 'N2_현실_세계와의_일치', diagnosis: nielsenDiagnoses.N2_1_familiar_terms },
    'N2.2_자연스러운_흐름': { score: nielsenScores.N2_2_natural_flow, category: 'N2_현실_세계와의_일치', diagnosis: nielsenDiagnoses.N2_2_natural_flow },
    'N2.3_현실_세계_은유': { score: nielsenScores.N2_3_real_world_metaphor, category: 'N2_현실_세계와의_일치', diagnosis: nielsenDiagnoses.N2_3_real_world_metaphor },
    'N4.1_시각적_일관성': { score: nielsenScores.N4_1_visual_consistency, category: 'N4_일관성과_표준', diagnosis: nielsenDiagnoses.N4_1_visual_consistency },
    'N4.2_용어_일관성': { score: nielsenScores.N4_2_terminology_consistency, category: 'N4_일관성과_표준', diagnosis: nielsenDiagnoses.N4_2_terminology_consistency },
    'N4.3_표준_준수': { score: nielsenScores.N4_3_standard_compliance, category: 'N4_일관성과_표준', diagnosis: nielsenDiagnoses.N4_3_standard_compliance },
    'N8.1_핵심_정보': { score: nielsenScores.N8_1_essential_info, category: 'N8_미니멀_디자인', diagnosis: nielsenDiagnoses.N8_1_essential_info },
    'N8.2_깔끔한_인터페이스': { score: nielsenScores.N8_2_clean_interface, category: 'N8_미니멀_디자인', diagnosis: nielsenDiagnoses.N8_2_clean_interface },
    'N8.3_시각적_계층': { score: nielsenScores.N8_3_visual_hierarchy, category: 'N8_미니멀_디자인', diagnosis: nielsenDiagnoses.N8_3_visual_hierarchy },
    'N9.1_오류_메시지': { score: nielsenScores.N9_1_error_messages, category: 'N9_오류_인식과_복구', diagnosis: nielsenDiagnoses.N9_1_error_messages },
    'N9.3_오류_예방': { score: nielsenScores.N9_3_error_prevention_info, category: 'N9_오류_인식과_복구', diagnosis: nielsenDiagnoses.N9_3_error_prevention_info },
    'N10.2_문서화': { score: nielsenScores.N10_2_documentation, category: 'N10_도움말과_문서', diagnosis: nielsenDiagnoses.N10_2_documentation }
  }

  return {
    overall: Math.round(overall * 100) / 100,      // 소수점 2자리
    convenience: Math.round(convenience * 100) / 100,
    design: Math.round(design * 100) / 100,
    convenience_items: convenienceItemsDetail,      // 편의성 13개 항목
    design_items: designItemsDetail,                // 디자인 12개 항목
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
