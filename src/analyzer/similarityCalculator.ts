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
 */
export function findSimilarSites(structure: HTMLStructure, referenceData: any[]): SimilarSite[] {
  const similarities = referenceData.map(site => {
    const similarity = calculateSimilarity(structure, site)
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
 * 유사도 계산 알고리즘
 */
function calculateSimilarity(newSite: HTMLStructure, referenceSite: any): number {
  let score = 0

  // 1. 네비게이션 구조 유사도 (20%)
  score += compareNavigation(newSite.navigation, referenceSite) * 0.2

  // 2. 접근성 점수 (30%) - 가장 중요
  score += compareAccessibility(newSite.accessibility, referenceSite) * 0.3

  // 3. 콘텐츠 구조 유사도 (20%)
  score += compareContent(newSite.content, referenceSite) * 0.2

  // 4. 폼 구조 유사도 (15%)
  score += compareForms(newSite.forms, referenceSite) * 0.15

  // 5. 시각적 요소 (15%)
  score += compareVisuals(newSite.visuals, referenceSite) * 0.15

  return Math.min(score * 100, 100)
}

function compareNavigation(nav: any, ref: any): number {
  let score = 0
  
  // 검색 기능 존재 여부 (중요)
  if (nav.searchExists) score += 0.3
  
  // Breadcrumb 존재 여부
  if (nav.breadcrumbExists) score += 0.2
  
  // 링크 개수 적정성 (20~100개가 적정)
  const linkScore = nav.linkCount >= 20 && nav.linkCount <= 100 ? 0.3 : 0.1
  score += linkScore
  
  // 메뉴 깊이 적정성 (2단계가 적정)
  const depthScore = nav.depthLevel === 2 ? 0.2 : 0.1
  score += depthScore

  return score
}

function compareAccessibility(a11y: any, ref: any): number {
  let score = 0
  
  // Alt 텍스트 비율 (가장 중요)
  score += a11y.altTextRatio * 0.4
  
  // ARIA 레이블 존재 여부
  if (a11y.ariaLabelCount > 5) score += 0.2
  else if (a11y.ariaLabelCount > 0) score += 0.1
  
  // 헤딩 구조 존재 여부
  if (a11y.headingStructure) score += 0.2
  
  // Lang 속성 존재 여부
  if (a11y.langAttribute) score += 0.1
  
  // Skip link 존재 여부
  if (a11y.skipLinkExists) score += 0.1

  return score
}

function compareContent(content: any, ref: any): number {
  let score = 0
  
  // 헤딩 개수 적정성 (5~20개가 적정)
  if (content.headingCount >= 5 && content.headingCount <= 20) score += 0.3
  else if (content.headingCount > 0) score += 0.1
  
  // 문단 개수 적정성
  if (content.paragraphCount >= 10) score += 0.3
  else if (content.paragraphCount > 0) score += 0.1
  
  // 리스트 활용
  if (content.listCount > 3) score += 0.2
  else if (content.listCount > 0) score += 0.1
  
  // 테이블 활용
  if (content.tableCount > 0) score += 0.2

  return score
}

function compareForms(forms: any, ref: any): number {
  let score = 0
  
  // 폼이 있는 경우
  if (forms.formCount > 0) {
    // Label 비율 (가장 중요)
    score += forms.labelRatio * 0.5
    
    // Validation 존재 여부
    if (forms.validationExists) score += 0.3
    
    // 적정한 Input 개수 (1~10개)
    if (forms.inputCount >= 1 && forms.inputCount <= 10) score += 0.2
  } else {
    // 폼이 없어도 기본 점수
    score = 0.5
  }

  return score
}

function compareVisuals(visuals: any, ref: any): number {
  let score = 0
  
  // 이미지 존재 여부
  if (visuals.imageCount > 0 && visuals.imageCount <= 50) score += 0.4
  else if (visuals.imageCount > 0) score += 0.2
  
  // 아이콘 활용
  if (visuals.iconCount > 5) score += 0.3
  else if (visuals.iconCount > 0) score += 0.1
  
  // 비디오 활용
  if (visuals.videoCount > 0) score += 0.3

  return score
}

/**
 * 예측 점수 산출
 */
export function calculatePredictedScore(similarSites: SimilarSite[], structure: HTMLStructure): PredictedScore {
  // 유사한 사이트들의 가중 평균 (유사도가 높을수록 가중치 큼)
  const totalWeight = similarSites.reduce((sum, site) => sum + site.similarity, 0)
  
  const weightedAvg = similarSites.reduce((sum, site) => {
    return sum + (site.total_score * site.similarity)
  }, 0) / totalWeight

  // 편의성/디자인 점수는 약간의 변동
  const convenience = weightedAvg * (0.9 + Math.random() * 0.2)
  const design = weightedAvg * (0.9 + Math.random() * 0.2)

  // Nielsen 점수 매핑
  const nielsenScores = mapToNielsen(structure, weightedAvg)

  return {
    overall: Math.min(weightedAvg, 5.0),
    convenience: Math.min(convenience, 5.0),
    design: Math.min(design, 5.0),
    nielsen_scores: nielsenScores
  }
}

/**
 * Nielsen 25개 세부 항목 매핑
 */
function mapToNielsen(structure: HTMLStructure, baseScore: number): NielsenScores {
  const { navigation, accessibility, content, forms, visuals } = structure

  return {
    // N1: 시스템 상태 가시성 (3개)
    N1_1_current_location: calculateScore(baseScore, navigation.breadcrumbExists ? 0.4 : -0.3),
    N1_2_loading_status: calculateScore(baseScore, 0), // HTML 분석 한계
    N1_3_action_feedback: calculateScore(baseScore, forms.validationExists ? 0.3 : -0.2),
    
    // N2: 현실 세계 일치 (3개)
    N2_1_familiar_terms: calculateScore(baseScore, accessibility.langAttribute ? 0.2 : -0.1),
    N2_2_natural_flow: calculateScore(baseScore, content.headingCount > 5 ? 0.3 : -0.2),
    N2_3_real_world_metaphor: calculateScore(baseScore, visuals.iconCount > 5 ? 0.2 : 0),
    
    // N3: 사용자 제어와 자유 (3개)
    N3_1_undo_redo: calculateScore(baseScore, 0), // HTML 분석 한계
    N3_2_exit_escape: calculateScore(baseScore, navigation.breadcrumbExists ? 0.3 : -0.2),
    N3_3_flexible_navigation: calculateScore(baseScore, navigation.linkCount > 20 ? 0.3 : -0.1),
    
    // N4: 일관성과 표준 (3개)
    N4_1_visual_consistency: calculateScore(baseScore, content.headingCount > 0 ? 0.3 : -0.2),
    N4_2_terminology_consistency: calculateScore(baseScore, 0.1),
    N4_3_standard_compliance: calculateScore(baseScore, accessibility.langAttribute ? 0.3 : -0.2),
    
    // N5: 오류 예방 (3개)
    N5_1_input_validation: calculateScore(baseScore, forms.validationExists ? 0.5 : -0.3),
    N5_2_confirmation_dialog: calculateScore(baseScore, 0), // HTML 분석 한계
    N5_3_constraints: calculateScore(baseScore, forms.labelRatio > 0.8 ? 0.3 : -0.2),
    
    // N6: 인식보다 회상 (3개)
    N6_1_visible_options: calculateScore(baseScore, navigation.searchExists ? 0.4 : -0.2),
    N6_2_recognition_cues: calculateScore(baseScore, visuals.iconCount > 3 ? 0.3 : 0),
    N6_3_memory_load: calculateScore(baseScore, navigation.breadcrumbExists ? 0.3 : -0.1),
    
    // N7: 유연성과 효율성 (2개)
    N7_1_shortcuts: calculateScore(baseScore, navigation.searchExists ? 0.4 : -0.3),
    N7_2_customization: calculateScore(baseScore, 0), // HTML 분석 한계
    
    // N8: 미니멀 디자인 (3개)
    N8_1_essential_info: calculateScore(baseScore, content.paragraphCount < 50 ? 0.3 : -0.3),
    N8_2_clean_interface: calculateScore(baseScore, visuals.imageCount < 30 ? 0.2 : -0.2),
    N8_3_visual_hierarchy: calculateScore(baseScore, content.headingCount > 3 ? 0.3 : -0.2),
    
    // N9: 오류 인식과 복구 (3개)
    N9_1_error_messages: calculateScore(baseScore, forms.validationExists ? 0.4 : -0.2),
    N9_2_recovery_support: calculateScore(baseScore, 0), // HTML 분석 한계
    N9_3_error_prevention_info: calculateScore(baseScore, forms.labelRatio > 0.8 ? 0.2 : -0.1),
    
    // N10: 도움말과 문서 (2개)
    N10_1_help_access: calculateScore(baseScore, navigation.searchExists ? 0.2 : -0.2),
    N10_2_documentation: calculateScore(baseScore, content.listCount > 3 ? 0.2 : 0)
  }
}

/**
 * 기본 점수에서 조정값을 더해 최종 점수 계산 (0~5점 범위)
 */
function calculateScore(baseScore: number, adjustment: number): number {
  return Math.max(0, Math.min(5.0, baseScore + adjustment))
}
