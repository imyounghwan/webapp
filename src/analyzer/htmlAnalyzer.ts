/**
 * HTML 구조 분석 모듈
 * 49개 기관 데이터 기반 유사도 분석
 */

export interface HTMLStructure {
  url: string
  navigation: NavigationStructure
  accessibility: AccessibilityScore
  content: ContentStructure
  forms: FormStructure
  visuals: VisualStructure
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
}

export interface VisualStructure {
  imageCount: number
  videoCount: number
  iconCount: number
}

/**
 * HTML 텍스트를 파싱하여 구조 분석
 */
export function analyzeHTML(html: string, url: string): HTMLStructure {
  // 간단한 정규식 기반 파싱 (Cloudflare Workers에서 DOM 파서 없이 작동)
  
  const navigation = analyzeNavigation(html)
  const accessibility = analyzeAccessibility(html)
  const content = analyzeContent(html)
  const forms = analyzeForms(html)
  const visuals = analyzeVisuals(html)

  return {
    url,
    navigation,
    accessibility,
    content,
    forms,
    visuals
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
  
  const searchExists = /type\s*=\s*["']search["']/i.test(html) || /role\s*=\s*["']search["']/i.test(html)
  
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

function analyzeAccessibility(html: string): AccessibilityScore {
  const imgMatches = html.match(/<img[^>]*>/gi) || []
  const imgWithAltMatches = html.match(/<img[^>]*alt\s*=/gi) || []
  const ariaLabelMatches = html.match(/aria-label\s*=/gi) || []
  const headings = html.match(/<h[1-6][^>]*>/gi) || []
  const langAttribute = /<html[^>]*lang\s*=/i.test(html)
  const skipLinkExists = /skip[\s-]*(to[\s-]*)?content|skip[\s-]*navigation/i.test(html)

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
    skipLinkExists
  }
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

  const labelRatio = inputMatches.length > 0 
    ? labelMatches.length / inputMatches.length 
    : 1

  return {
    formCount: formMatches.length,
    inputCount: inputMatches.length,
    labelRatio,
    validationExists
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
