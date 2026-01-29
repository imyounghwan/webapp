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

// 실시간 URL 분석 API
app.post('/api/analyze', async (c) => {
  try {
    const { url } = await c.req.json()

    if (!url || !url.startsWith('http')) {
      return c.json({ error: 'Invalid URL' }, 400)
    }

    // 1. URL의 HTML 가져오기
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      return c.json({ error: 'Failed to fetch URL' }, 400)
    }

    const html = await response.text()

    // 2. HTML 구조 분석
    const structure = analyzeHTML(html, url)

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
