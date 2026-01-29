import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { analyzeHTML } from './analyzer/htmlAnalyzer'
import { findSimilarSites, calculatePredictedScore } from './analyzer/similarityCalculator'

// 49개 기관 통합 데이터 import (정적 데이터로 번들에 포함)
import referenceData from '../analysis/output/final_integrated_scores.json'

const app = new Hono()

// API routes
app.use('/api/*', cors())

app.get('/api/hello', (c) => {
  return c.json({ message: 'AutoAnalyzer API', status: 'ok' })
})

/**
 * 서브 페이지 URL 추출 (메인 페이지에서)
 */
async function extractSubPages(mainUrl: string, html: string, limit: number = 3): Promise<string[]> {
  const baseUrl = new URL(mainUrl).origin
  const subPages: string[] = []
  
  // 내부 링크 찾기 (상대 경로 및 같은 도메인)
  const linkRegex = /<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi
  let match
  
  while ((match = linkRegex.exec(html)) !== null && subPages.length < limit) {
    let href = match[1]
    
    // 상대 경로를 절대 경로로 변환
    if (href.startsWith('/')) {
      href = baseUrl + href
    } else if (!href.startsWith('http')) {
      continue
    }
    
    // 같은 도메인만, 메인 페이지 제외
    if (href.startsWith(baseUrl) && 
        href !== mainUrl && 
        href !== mainUrl + '/' &&
        !href.includes('#') && 
        !href.includes('javascript:') &&
        !href.includes('login') &&
        !href.includes('join') &&
        (href.includes('.do') || href.includes('/sub') || href.includes('/kor/') || href.includes('/eng/'))) {
      if (!subPages.includes(href)) {
        subPages.push(href)
      }
    }
  }
  
  return subPages.slice(0, limit)
}

/**
 * 여러 페이지를 분석하고 종합 평가
 */
async function analyzeMultiplePages(mainUrl: string): Promise<any> {
  const results = []
  
  // 1. 메인 페이지 분석
  const mainResponse = await fetch(mainUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  })
  
  if (!mainResponse.ok) {
    throw new Error('Failed to fetch main page')
  }
  
  const mainHtml = await mainResponse.text()
  const mainStructure = analyzeHTML(mainHtml, mainUrl)
  results.push({ url: mainUrl, structure: mainStructure, isMainPage: true })
  
  // 2. 서브 페이지 추출 및 분석
  const subPages = await extractSubPages(mainUrl, mainHtml, 3)
  
  for (const subUrl of subPages) {
    try {
      const subResponse = await fetch(subUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(5000) // 5초 타임아웃
      })
      
      if (subResponse.ok) {
        const subHtml = await subResponse.text()
        const subStructure = analyzeHTML(subHtml, subUrl)
        results.push({ url: subUrl, structure: subStructure, isMainPage: false })
      }
    } catch (error) {
      console.log(`Failed to analyze ${subUrl}:`, error)
    }
  }
  
  return results
}

/**
 * 여러 페이지 결과를 종합
 */
function aggregateResults(pageResults: any[]): any {
  // 서브 페이지들만 필터링 (Breadcrumb 평가용)
  const subPages = pageResults.filter(p => !p.isMainPage)
  const mainPage = pageResults.find(p => p.isMainPage)
  
  if (!mainPage) return null
  
  // 메인 구조 기반으로 시작
  const aggregated = JSON.parse(JSON.stringify(mainPage.structure))
  
  // 서브 페이지가 있으면 Breadcrumb 존재 여부 확인
  if (subPages.length > 0) {
    const hasBreadcrumbInSub = subPages.some(p => p.structure.navigation.breadcrumbExists)
    
    // 서브 페이지에 Breadcrumb이 있으면 전체적으로 있다고 판단
    if (hasBreadcrumbInSub) {
      aggregated.navigation.breadcrumbExists = true
    }
  }
  
  return aggregated
}

// 실시간 URL 분석 API
app.post('/api/analyze', async (c) => {
  try {
    const { url } = await c.req.json()

    if (!url || !url.startsWith('http')) {
      return c.json({ error: 'Invalid URL' }, 400)
    }

    // 1. 메인 + 서브 페이지 분석
    const pageResults = await analyzeMultiplePages(url)
    
    // 2. 결과 종합
    const structure = aggregateResults(pageResults)

    // 3. 49개 기관과 유사도 계산
    const similarSites = findSimilarSites(structure, referenceData.agencies)

    // 4. 예측 점수 산출
    const predictedScore = calculatePredictedScore(similarSites, structure, url)

    // 5. 개선 제안 생성
    const recommendations = generateRecommendations(structure, predictedScore)

    // 응답 (49개 기관 유사도는 내부적으로만 사용, 외부 노출 안함)
    return c.json({
      url,
      analysis_date: new Date().toISOString(),
      structure: {
        navigation: structure.navigation,
        accessibility: structure.accessibility,
        content: structure.content,
        forms: structure.forms,
        visuals: structure.visuals
      },
      // similar_sites: similarSites,  // 🔒 49개 기관 정보 숨김
      predicted_score: predictedScore,
      recommendations
    })

  } catch (error) {
    console.error('Analysis error:', error)
    return c.json({ 
      error: 'Analysis failed', 
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// 개선 제안 생성 함수
function generateRecommendations(structure: any, score: any): string[] {
  const recommendations: string[] = []

  // 접근성 관련
  if (structure.accessibility.altTextRatio < 0.9) {
    recommendations.push('🔍 모든 이미지에 대체 텍스트(alt)를 추가하세요. (현재: ' + 
      Math.round(structure.accessibility.altTextRatio * 100) + '%)')
  }

  if (!structure.accessibility.skipLinkExists) {
    recommendations.push('⚡ 스크린리더 사용자를 위한 Skip Link를 추가하세요.')
  }

  if (!structure.accessibility.langAttribute) {
    recommendations.push('🌐 HTML 태그에 lang 속성을 추가하세요.')
  }

  // 네비게이션 관련
  if (!structure.navigation.searchExists) {
    recommendations.push('🔎 사이트 내 검색 기능을 추가하세요.')
  }

  if (!structure.navigation.breadcrumbExists) {
    recommendations.push('📍 Breadcrumb 내비게이션을 추가하여 현재 위치를 표시하세요.')
  }

  // 폼 관련
  if (structure.forms.formCount > 0 && structure.forms.labelRatio < 0.9) {
    recommendations.push('🏷️ 모든 입력 필드에 label을 연결하세요.')
  }

  if (structure.forms.formCount > 0 && !structure.forms.validationExists) {
    recommendations.push('✅ 폼 입력 검증 기능을 추가하세요.')
  }

  // 콘텐츠 관련
  if (structure.content.headingCount < 5) {
    recommendations.push('📝 명확한 정보 구조를 위해 제목 태그(h1-h6)를 활용하세요.')
  }

  // Nielsen 점수 기반 제안
  if (score.nielsen_scores.N1_visibility < 3.5) {
    recommendations.push('👁️ 시스템 상태를 더 명확하게 표시하세요. (로딩 상태, 현재 위치 등)')
  }

  if (score.nielsen_scores.N8_minimalism < 3.5) {
    recommendations.push('🎨 불필요한 요소를 제거하고 핵심 콘텐츠에 집중하세요.')
  }

  if (score.nielsen_scores.N10_help < 3.5) {
    recommendations.push('❓ 도움말이나 FAQ 섹션을 추가하세요.')
  }

  return recommendations.slice(0, 5) // 최대 5개만 반환
}

// Catch-all route - wrangler will serve static files from dist/
// This is just a fallback
app.get('/', (c) => {
  return c.text('API is running. Use /api/analyze endpoint.', 200)
})

app.notFound((c) => {
  return c.text('Not Found', 404)
})

export default app
