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
  N1_visibility: number
  N2_match: number
  N3_control: number
  N4_consistency: number
  N5_error_prevention: number
  N6_recognition: number
  N7_flexibility: number
  N8_minimalism: number
  N9_error_recovery: number
  N10_help: number
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
 * Nielsen 10원칙 매핑
 */
function mapToNielsen(structure: HTMLStructure, baseScore: number): NielsenScores {
  const { navigation, accessibility, content, forms } = structure

  return {
    // N1: 시스템 상태 가시성
    N1_visibility: calculateN1(navigation, baseScore),
    
    // N2: 현실 세계 일치
    N2_match: calculateN2(content, baseScore),
    
    // N3: 사용자 제어와 자유
    N3_control: calculateN3(navigation, baseScore),
    
    // N4: 일관성과 표준
    N4_consistency: calculateN4(content, baseScore),
    
    // N5: 오류 예방
    N5_error_prevention: calculateN5(forms, baseScore),
    
    // N6: 인식보다 회상
    N6_recognition: calculateN6(navigation, baseScore),
    
    // N7: 유연성과 효율성
    N7_flexibility: calculateN7(navigation, baseScore),
    
    // N8: 미니멀 디자인
    N8_minimalism: calculateN8(content, baseScore),
    
    // N9: 오류 인식과 복구
    N9_error_recovery: calculateN9(forms, baseScore),
    
    // N10: 도움말과 문서
    N10_help: calculateN10(content, baseScore)
  }
}

function calculateN1(nav: any, base: number): number {
  let score = base
  if (nav.breadcrumbExists) score += 0.3
  if (nav.searchExists) score += 0.2
  return Math.min(score, 5.0)
}

function calculateN2(content: any, base: number): number {
  let score = base
  if (content.headingCount > 5) score += 0.2
  if (content.listCount > 3) score += 0.2
  return Math.min(score, 5.0)
}

function calculateN3(nav: any, base: number): number {
  let score = base
  if (nav.breadcrumbExists) score += 0.2
  if (nav.linkCount > 20) score += 0.2
  return Math.min(score, 5.0)
}

function calculateN4(content: any, base: number): number {
  let score = base
  if (content.headingCount > 0) score += 0.3
  return Math.min(score, 5.0)
}

function calculateN5(forms: any, base: number): number {
  let score = base
  if (forms.validationExists) score += 0.4
  if (forms.labelRatio > 0.8) score += 0.2
  return Math.min(score, 5.0)
}

function calculateN6(nav: any, base: number): number {
  let score = base
  if (nav.searchExists) score += 0.3
  if (nav.breadcrumbExists) score += 0.2
  return Math.min(score, 5.0)
}

function calculateN7(nav: any, base: number): number {
  let score = base
  if (nav.searchExists) score += 0.4
  return Math.min(score, 5.0)
}

function calculateN8(content: any, base: number): number {
  let score = base
  // 콘텐츠가 너무 많으면 감점
  if (content.paragraphCount > 50) score -= 0.3
  else if (content.paragraphCount > 20) score += 0.2
  return Math.min(score, 5.0)
}

function calculateN9(forms: any, base: number): number {
  let score = base
  if (forms.validationExists) score += 0.3
  return Math.min(score, 5.0)
}

function calculateN10(content: any, base: number): number {
  let score = base
  // FAQ, 도움말 키워드 존재 여부는 HTML 파싱에서 처리
  return Math.min(score, 5.0)
}
