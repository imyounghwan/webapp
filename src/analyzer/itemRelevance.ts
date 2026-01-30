/**
 * Nielsen 평가 항목별 영향 페이지 추적
 */

import type { HTMLStructure } from './htmlAnalyzer'

export interface ItemEvaluationResult {
  itemId: string
  relevantPages: string[]  // 이 항목 평가에 영향을 준 페이지들
  reason: string  // 왜 이 페이지들이 관련되는지
}

/**
 * 각 페이지에서 특정 항목의 영향도를 평가
 */
export function evaluateItemRelevance(pageResults: any[]): Map<string, string[]> {
  const itemRelevance = new Map<string, string[]>()
  
  // N1.1 - Breadcrumb (서브 페이지에서만 의미있음)
  const breadcrumbPages = pageResults
    .filter(p => !p.isMainPage && p.structure.navigation.breadcrumbExists)
    .map(p => p.url)
  if (breadcrumbPages.length === 0) {
    // Breadcrumb이 없으면 서브 페이지들이 감점 원인
    itemRelevance.set('N1_1', pageResults.filter(p => !p.isMainPage).map(p => p.url))
  } else {
    itemRelevance.set('N1_1', breadcrumbPages)
  }
  
  // N1.2 - ARIA 레이블 (모든 페이지 평균)
  const ariaPages = pageResults
    .filter(p => p.structure.accessibility.ariaLabelCount > 0)
    .map(p => p.url)
  itemRelevance.set('N1_2', ariaPages.length > 0 ? ariaPages : pageResults.map(p => p.url))
  
  // N1.3 - 폼 검증 (폼이 있는 페이지)
  const validationPages = pageResults
    .filter(p => p.structure.forms.validationExists || p.structure.forms.formCount > 0)
    .map(p => p.url)
  itemRelevance.set('N1_3', validationPages.length > 0 ? validationPages : [pageResults[0].url])
  
  // N2.1 - lang 속성 (모든 페이지)
  const langPages = pageResults
    .filter(p => p.structure.accessibility.langAttribute)
    .map(p => p.url)
  itemRelevance.set('N2_1', langPages.length > 0 ? langPages : pageResults.map(p => p.url))
  
  // N2.2 - 헤딩 구조 (모든 페이지)
  itemRelevance.set('N2_2', pageResults.map(p => p.url))
  
  // N2.3 - 아이콘 (모든 페이지)
  itemRelevance.set('N2_3', pageResults.map(p => p.url))
  
  // N3.1 - 폼 (폼이 있는 페이지)
  const formPages = pageResults
    .filter(p => p.structure.forms.formCount > 0)
    .map(p => p.url)
  itemRelevance.set('N3_1', formPages.length > 0 ? formPages : [pageResults[0].url])
  
  // N3.3 - 링크 (모든 페이지)
  itemRelevance.set('N3_3', pageResults.map(p => p.url))
  
  // N4.1, N4.2, N4.3 - 일관성 (모든 페이지)
  itemRelevance.set('N4_1', pageResults.map(p => p.url))
  itemRelevance.set('N4_2', pageResults.map(p => p.url))
  itemRelevance.set('N4_3', pageResults.map(p => p.url))
  
  // N5.1, N5.2, N5.3 - 폼 관련 (폼이 있는 페이지)
  itemRelevance.set('N5_1', formPages.length > 0 ? formPages : [pageResults[0].url])
  itemRelevance.set('N5_2', formPages.length > 0 ? formPages : [pageResults[0].url])
  itemRelevance.set('N5_3', formPages.length > 0 ? formPages : [pageResults[0].url])
  
  // N6.2 - 아이콘 (모든 페이지)
  itemRelevance.set('N6_2', pageResults.map(p => p.url))
  
  // N6.3 - Breadcrumb (서브 페이지)
  itemRelevance.set('N6_3', pageResults.filter(p => !p.isMainPage).map(p => p.url))
  
  // N7.1 - 메뉴 (주로 메인 페이지)
  itemRelevance.set('N7_1', [pageResults[0].url])
  
  // N7.2 - 맞춤설정 (모든 페이지)
  itemRelevance.set('N7_2', pageResults.map(p => p.url))
  
  // N7.3 - 검색 (검색이 있는 페이지)
  const searchPages = pageResults
    .filter(p => p.structure.navigation.searchExists)
    .map(p => p.url)
  itemRelevance.set('N7_3', searchPages.length > 0 ? searchPages : pageResults.map(p => p.url))
  
  // N8.1, N8.2, N8.3 - 미니멀 디자인 (모든 페이지)
  itemRelevance.set('N8_1', pageResults.map(p => p.url))
  itemRelevance.set('N8_2', pageResults.map(p => p.url))
  itemRelevance.set('N8_3', pageResults.map(p => p.url))
  
  // N9.2, N9.4 - 오류 복구 (폼이 있는 페이지)
  itemRelevance.set('N9_2', formPages.length > 0 ? formPages : [pageResults[0].url])
  itemRelevance.set('N9_4', pageResults.map(p => p.url))
  
  // N10.1, N10.2 - 도움말 (모든 페이지)
  itemRelevance.set('N10_1', searchPages.length > 0 ? searchPages : pageResults.map(p => p.url))
  itemRelevance.set('N10_2', pageResults.map(p => p.url))
  
  return itemRelevance
}
