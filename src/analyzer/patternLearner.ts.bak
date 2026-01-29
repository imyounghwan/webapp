/**
 * 49개 기관 데이터에서 패턴을 학습하여 새 사이트 평가에 적용
 * 
 * 핵심 아이디어:
 * 1. 높은 점수를 받은 기관들의 공통 특성 추출
 * 2. 낮은 점수를 받은 기관들의 공통 문제점 추출
 * 3. Nielsen 원칙별로 점수에 영향을 주는 요소 파악
 * 4. 새 사이트 분석 시 학습된 패턴 적용
 */

import referenceData from '../../analysis/output/final_integrated_scores.json'

interface HTMLStructure {
  navigation: any
  accessibility: any
  content: any
  forms: any
  visuals: any
}

interface LearnedPattern {
  // 고득점 기관들의 공통 특징
  high_score_traits: {
    nielsen_averages: Record<string, number>  // N1~N10 평균
    common_strengths: string[]
  }
  
  // 저득점 기관들의 공통 문제
  low_score_issues: {
    nielsen_averages: Record<string, number>
    common_weaknesses: string[]
  }
  
  // Nielsen 원칙별 가중치 (실제 데이터 기반)
  nielsen_weights: Record<string, number>
  
  // 점수 분포
  score_distribution: {
    excellent: number  // 4.5+
    good: number       // 4.0~4.5
    average: number    // 3.5~4.0
    poor: number       // 3.5 미만
  }
}

/**
 * 49개 기관 데이터에서 패턴 학습
 */
export function learnPatternsFromReference(): LearnedPattern {
  const agencies = referenceData.agencies
  
  // 점수별로 기관 분류
  const highScoreAgencies = agencies.filter(a => a.final_nielsen_score >= 4.0)
  const lowScoreAgencies = agencies.filter(a => a.final_nielsen_score < 3.5)
  
  // 고득점 기관들의 Nielsen 평균
  const highScoreNielsen = calculateAverageNielsen(highScoreAgencies)
  
  // 저득점 기관들의 Nielsen 평균
  const lowScoreNielsen = calculateAverageNielsen(lowScoreAgencies)
  
  // Nielsen 원칙별 가중치 계산 (점수와의 상관관계)
  const nielsenWeights = calculateNielsenWeights(agencies)
  
  // 점수 분포 분석
  const scoreDistribution = {
    excellent: agencies.filter((a: any) => a.final_nielsen_score >= 4.5).length / agencies.length,
    good: agencies.filter((a: any) => a.final_nielsen_score >= 4.0 && a.final_nielsen_score < 4.5).length / agencies.length,
    average: agencies.filter((a: any) => a.final_nielsen_score >= 3.5 && a.final_nielsen_score < 4.0).length / agencies.length,
    poor: agencies.filter((a: any) => a.final_nielsen_score < 3.5).length / agencies.length
  }
  
  return {
    high_score_traits: {
      nielsen_averages: highScoreNielsen,
      common_strengths: identifyStrengths(highScoreNielsen)
    },
    low_score_issues: {
      nielsen_averages: lowScoreNielsen,
      common_weaknesses: identifyWeaknesses(lowScoreNielsen)
    },
    nielsen_weights: nielsenWeights,
    score_distribution: scoreDistribution
  }
}

/**
 * Nielsen 원칙 평균 계산
 */
function calculateAverageNielsen(agencies: any[]): Record<string, number> {
  const nielsenKeys = [
    'N1_visibility', 'N2_match', 'N3_control', 'N4_consistency', 'N5_error_prevention',
    'N6_recognition', 'N7_flexibility', 'N8_minimalism', 'N9_error_recovery', 'N10_help'
  ]
  
  const averages: Record<string, number> = {}
  
  nielsenKeys.forEach(key => {
    const scores = agencies
      .map(a => a.nielsen_10_principles?.[key])
      .filter(s => s !== null && s !== undefined)
    
    averages[key] = scores.length > 0 
      ? scores.reduce((sum, s) => sum + s, 0) / scores.length 
      : 0
  })
  
  return averages
}

/**
 * Nielsen 원칙별 가중치 계산 (점수와의 상관관계)
 */
function calculateNielsenWeights(agencies: any[]): Record<string, number> {
  const nielsenKeys = [
    'N1_visibility', 'N2_match', 'N3_control', 'N4_consistency', 'N5_error_prevention',
    'N6_recognition', 'N7_flexibility', 'N8_minimalism', 'N9_error_recovery', 'N10_help'
  ]
  
  const weights: Record<string, number> = {}
  
  // 각 Nielsen 원칙이 최종 점수에 미치는 영향 계산
  nielsenKeys.forEach(key => {
    const correlations = agencies.map(a => ({
      nielsen: a.nielsen_10_principles?.[key] || 0,
      final: a.final_nielsen_score
    }))
    
    // 간단한 상관계수 계산
    const correlation = calculateCorrelation(
      correlations.map(c => c.nielsen),
      correlations.map(c => c.final)
    )
    
    weights[key] = Math.abs(correlation)  // 절대값으로 중요도 표현
  })
  
  // 정규화 (합이 1이 되도록)
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0)
  Object.keys(weights).forEach(key => {
    weights[key] = weights[key] / total
  })
  
  return weights
}

/**
 * 간단한 상관계수 계산 (Pearson correlation)
 */
function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length
  if (n === 0) return 0
  
  const meanX = x.reduce((sum, val) => sum + val, 0) / n
  const meanY = y.reduce((sum, val) => sum + val, 0) / n
  
  let numerator = 0
  let denomX = 0
  let denomY = 0
  
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX
    const dy = y[i] - meanY
    numerator += dx * dy
    denomX += dx * dx
    denomY += dy * dy
  }
  
  if (denomX === 0 || denomY === 0) return 0
  
  return numerator / Math.sqrt(denomX * denomY)
}

/**
 * 고득점 기관들의 강점 식별
 */
function identifyStrengths(nielsenScores: Record<string, number>): string[] {
  const strengths: string[] = []
  
  if (nielsenScores.N1_visibility >= 4.3) {
    strengths.push('시스템 상태를 명확하게 표시하여 사용자가 현재 상황을 잘 파악할 수 있음')
  }
  if (nielsenScores.N2_match >= 4.2) {
    strengths.push('친숙한 용어와 자연스러운 흐름으로 사용자 경험이 우수함')
  }
  if (nielsenScores.N3_control >= 4.3) {
    strengths.push('사용자가 시스템을 자유롭게 제어할 수 있는 기능 제공')
  }
  if (nielsenScores.N4_consistency >= 4.2) {
    strengths.push('일관된 디자인과 용어 사용으로 학습이 용이함')
  }
  if (nielsenScores.N5_error_prevention >= 4.1) {
    strengths.push('입력 검증과 확인 절차로 오류를 효과적으로 예방함')
  }
  if (nielsenScores.N6_recognition >= 4.2) {
    strengths.push('명확한 시각적 단서로 사용자의 기억 부담을 줄임')
  }
  if (nielsenScores.N8_minimalism >= 4.2) {
    strengths.push('깔끔하고 정돈된 인터페이스로 인지 부담이 적음')
  }
  
  return strengths
}

/**
 * 저득점 기관들의 약점 식별
 */
function identifyWeaknesses(nielsenScores: Record<string, number>): string[] {
  const weaknesses: string[] = []
  
  if (nielsenScores.N1_visibility < 3.5) {
    weaknesses.push('현재 위치나 시스템 상태를 파악하기 어려움')
  }
  if (nielsenScores.N2_match < 3.5) {
    weaknesses.push('전문 용어가 많거나 흐름이 부자연스러움')
  }
  if (nielsenScores.N3_control < 3.5) {
    weaknesses.push('취소, 되돌리기 등 사용자 제어 기능이 부족함')
  }
  if (nielsenScores.N5_error_prevention < 3.5) {
    weaknesses.push('입력 검증이나 오류 예방 기능이 부족함')
  }
  if (nielsenScores.N6_recognition < 3.5) {
    weaknesses.push('시각적 단서가 부족하여 사용자가 많이 기억해야 함')
  }
  if (nielsenScores.N8_minimalism < 3.5) {
    weaknesses.push('불필요한 요소가 많아 인터페이스가 복잡함')
  }
  if (nielsenScores.N10_help < 3.5) {
    weaknesses.push('도움말이나 문서에 접근하기 어려움')
  }
  
  return weaknesses
}

/**
 * 학습된 패턴을 기반으로 새 사이트의 Nielsen 점수 예측
 */
export function predictNielsenScores(structure: HTMLStructure, pattern: LearnedPattern): Record<string, number> {
  const { navigation, accessibility, content, forms, visuals } = structure
  
  // HTML 구조에서 추출한 특징들을 Nielsen 원칙에 매핑
  const scores: Record<string, number> = {}
  
  // 기준점: 49개 기관 평균 (3.79)
  const baseline = 3.79
  
  // N1: 시스템 상태 가시성
  scores.N1_visibility = baseline +
    (navigation.breadcrumbExists ? 0.5 : -0.3) +
    (navigation.searchExists ? 0.3 : -0.2) +
    (accessibility.skipLinkExists ? 0.2 : 0)
  
  // N2: 현실 세계 일치
  scores.N2_match = baseline +
    (accessibility.langAttribute ? 0.3 : -0.4) +
    (content.headingCount > 5 ? 0.2 : -0.2) +
    (visuals.iconCount > 3 ? 0.2 : -0.1)
  
  // N3: 사용자 제어와 자유
  scores.N3_control = baseline +
    (navigation.breadcrumbExists ? 0.3 : -0.2) +
    (navigation.linkCount > 20 ? 0.2 : -0.3) +
    (forms.formCount > 0 ? 0.1 : 0)
  
  // N4: 일관성과 표준
  scores.N4_consistency = baseline +
    (accessibility.headingStructure ? 0.4 : -0.5) +
    (accessibility.langAttribute ? 0.2 : -0.2) +
    (content.headingCount > 0 ? 0.1 : -0.1)
  
  // N5: 오류 예방
  scores.N5_error_prevention = baseline +
    (forms.validationExists ? 0.5 : -0.4) +
    (forms.labelRatio > 0.8 ? 0.3 : -0.3) +
    (forms.inputCount > 0 && forms.inputCount <= 10 ? 0.1 : -0.1)
  
  // N6: 인식보다 회상
  scores.N6_recognition = baseline +
    (navigation.searchExists ? 0.4 : -0.3) +
    (visuals.iconCount > 5 ? 0.3 : -0.2) +
    (accessibility.ariaLabelCount > 3 ? 0.2 : 0)
  
  // N7: 유연성과 효율성
  scores.N7_flexibility = baseline +
    (navigation.searchExists ? 0.4 : -0.3) +
    (navigation.linkCount > 30 ? 0.2 : -0.2) +
    (navigation.depthLevel === 2 ? 0.1 : -0.1)
  
  // N8: 미니멀 디자인
  scores.N8_minimalism = baseline +
    (visuals.imageCount <= 30 ? 0.3 : -0.3) +
    (content.paragraphCount <= 20 ? 0.2 : -0.2) +
    (visuals.iconCount > 0 && visuals.iconCount <= 10 ? 0.2 : -0.2)
  
  // N9: 오류 인식과 복구
  scores.N9_error_recovery = baseline +
    (forms.validationExists ? 0.4 : -0.3) +
    (navigation.breadcrumbExists ? 0.2 : -0.1) +
    (forms.labelRatio > 0.5 ? 0.1 : -0.2)
  
  // N10: 도움말과 문서
  scores.N10_help = baseline +
    (navigation.searchExists ? 0.3 : -0.3) +
    (content.listCount > 3 ? 0.2 : -0.2) +
    (content.headingCount > 5 ? 0.1 : -0.1)
  
  // 학습된 가중치 적용
  Object.keys(scores).forEach(key => {
    const weight = pattern.nielsen_weights[key] || 1.0
    // 가중치가 높은 원칙은 더 큰 영향을 줌
    scores[key] = baseline + (scores[key] - baseline) * (1 + weight)
    
    // 0~5 범위로 제한
    scores[key] = Math.max(0, Math.min(5, scores[key]))
  })
  
  return scores
}

/**
 * Nielsen 10원칙을 25개 세부 항목으로 확장
 */
export function expandTo25Items(nielsen10: Record<string, number>): Record<string, number> {
  const expanded: Record<string, number> = {}
  
  // N1: 시스템 상태 가시성 → 3개
  expanded.N1_1_current_location = nielsen10.N1_visibility - 0.3
  expanded.N1_2_loading_status = nielsen10.N1_visibility
  expanded.N1_3_action_feedback = nielsen10.N1_visibility + 0.3
  
  // N2: 현실 세계 일치 → 3개
  expanded.N2_1_familiar_terms = nielsen10.N2_match + 0.2
  expanded.N2_2_natural_flow = nielsen10.N2_match - 0.2
  expanded.N2_3_real_world_metaphor = nielsen10.N2_match
  
  // N3: 사용자 제어 → 3개
  expanded.N3_1_undo_redo = nielsen10.N3_control
  expanded.N3_2_exit_escape = nielsen10.N3_control - 0.2
  expanded.N3_3_flexible_navigation = nielsen10.N3_control - 0.1
  
  // N4: 일관성 → 3개
  expanded.N4_1_visual_consistency = nielsen10.N4_consistency + 0.2
  expanded.N4_2_terminology_consistency = nielsen10.N4_consistency
  expanded.N4_3_standard_compliance = nielsen10.N4_consistency + 0.2
  
  // N5: 오류 예방 → 3개
  expanded.N5_1_input_validation = nielsen10.N5_error_prevention + 0.5
  expanded.N5_2_confirmation_dialog = nielsen10.N5_error_prevention
  expanded.N5_3_constraints = nielsen10.N5_error_prevention - 0.2
  
  // N6: 인식보다 회상 → 3개
  expanded.N6_1_visible_options = nielsen10.N6_recognition + 0.3
  expanded.N6_2_recognition_cues = nielsen10.N6_recognition
  expanded.N6_3_memory_load = nielsen10.N6_recognition - 0.2
  
  // N7: 유연성 → 2개
  expanded.N7_1_shortcuts = nielsen10.N7_flexibility + 0.3
  expanded.N7_2_customization = nielsen10.N7_flexibility
  
  // N8: 미니멀 디자인 → 3개
  expanded.N8_1_essential_info = nielsen10.N8_minimalism + 0.2
  expanded.N8_2_clean_interface = nielsen10.N8_minimalism + 0.1
  expanded.N8_3_visual_hierarchy = nielsen10.N8_minimalism - 0.2
  
  // N9: 오류 복구 → 3개
  expanded.N9_1_error_messages = nielsen10.N9_error_recovery + 0.3
  expanded.N9_2_recovery_support = nielsen10.N9_error_recovery
  expanded.N9_3_error_prevention_info = nielsen10.N9_error_recovery - 0.2
  
  // N10: 도움말 → 2개
  expanded.N10_1_help_access = nielsen10.N10_help + 0.2
  expanded.N10_2_documentation = nielsen10.N10_help
  
  // 0~5 범위로 제한
  Object.keys(expanded).forEach(key => {
    expanded[key] = Math.max(0, Math.min(5, expanded[key]))
  })
  
  return expanded
}
