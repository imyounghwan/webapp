import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { analyzeHTML } from './analyzer/htmlAnalyzer'
import { findSimilarSites, calculatePredictedScore } from './analyzer/similarityCalculator'
import { calculateImprovedNielsen, generateImprovedDiagnoses } from './analyzer/nielsenImproved'
import { nielsenDescriptions, getItemDescription } from './analyzer/nielsenDescriptions'

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

    // 3. 개선된 Nielsen 평가 (22개 독립 항목)
    const improvedScores = calculateImprovedNielsen(structure)
    const improvedDiagnoses = generateImprovedDiagnoses(structure, improvedScores, url)
    
    // 4. 편의성/디자인 점수 계산 (개선된 항목 기준)
    const convenienceItems = [
      improvedScores.N1_1_current_location,
      improvedScores.N1_2_loading_status,
      improvedScores.N1_3_action_feedback,
      improvedScores.N3_1_undo_redo,
      improvedScores.N3_3_flexible_navigation,
      improvedScores.N5_1_input_validation,
      improvedScores.N5_2_confirmation_dialog,
      improvedScores.N5_3_constraints,
      improvedScores.N6_2_recognition_cues,
      improvedScores.N6_3_memory_load,
      improvedScores.N7_1_quick_access,
      improvedScores.N7_2_customization,
      improvedScores.N7_3_search_filter,
    ]
    
    const designItems = [
      improvedScores.N2_1_familiar_terms,
      improvedScores.N2_2_natural_flow,
      improvedScores.N2_3_real_world_metaphor,
      improvedScores.N4_1_visual_consistency,
      improvedScores.N4_2_terminology_consistency,
      improvedScores.N4_3_standard_compliance,
      improvedScores.N8_1_essential_info,
      improvedScores.N8_2_clean_interface,
      improvedScores.N8_3_visual_hierarchy,
      improvedScores.N9_2_recovery_support,
      improvedScores.N9_4_error_guidance,
      improvedScores.N10_1_help_visibility,
      improvedScores.N10_2_documentation,
    ]
    
    const convenience = convenienceItems.reduce((sum, s) => sum + s, 0) / convenienceItems.length
    const design = designItems.reduce((sum, s) => sum + s, 0) / designItems.length
    const overall = (convenience + design) / 2
    
    // 5. 응답 포맷 (convenience_items, design_items 포함)
    const convenience_items_detail: any[] = []
    const design_items_detail: any[] = []
    
    // 편의성 항목 상세 (ID 매핑 추가)
    const convenienceMapping = [
      { key: 'N1.1_현재_위치', id: 'N1_1' },
      { key: 'N1.2_로딩_상태', id: 'N1_2' },
      { key: 'N1.3_행동_피드백', id: 'N1_3' },
      { key: 'N3.1_실행_취소', id: 'N3_1' },
      { key: 'N3.3_유연한_네비게이션', id: 'N3_3' },
      { key: 'N5.1_입력_검증', id: 'N5_1' },
      { key: 'N5.2_확인_대화상자', id: 'N5_2' },
      { key: 'N5.3_제약_조건_표시', id: 'N5_3' },
      { key: 'N6.2_인식_단서', id: 'N6_2' },
      { key: 'N6.3_기억_부담', id: 'N6_3' },
      { key: 'N7.1_빠른_접근', id: 'N7_1' },
      { key: 'N7.2_맞춤_설정', id: 'N7_2' },
      { key: 'N7.3_검색_필터', id: 'N7_3' },
    ]
    
    const convenienceDiagnosisKeys = [
      'N1_1_current_location', 'N1_2_loading_status', 'N1_3_action_feedback',
      'N3_1_undo_redo', 'N3_3_flexible_navigation',
      'N5_1_input_validation', 'N5_2_confirmation_dialog', 'N5_3_constraints',
      'N6_2_recognition_cues', 'N6_3_memory_load',
      'N7_1_quick_access', 'N7_2_customization', 'N7_3_search_filter',
    ]
    
    convenienceItems.forEach((score, idx) => {
      const { key, id } = convenienceMapping[idx]
      const desc = getItemDescription(id)
      const diagnosisKey = convenienceDiagnosisKeys[idx]
      
      convenience_items_detail.push({
        item: key,
        item_id: id,
        category: '편의성',
        score: Math.round(score * 10) / 10,
        diagnosis: improvedDiagnoses[diagnosisKey] || '',
        description: desc?.description || '',
        principle: desc?.principle || '',
        why_important: desc?.why_important || '',
        evaluation_criteria: desc?.evaluation_criteria || '',
        evaluated_url: url
      })
    })
    
    // 디자인 항목 상세 (ID 매핑 추가)
    const designMapping = [
      { key: 'N2.1_친숙한_용어', id: 'N2_1' },
      { key: 'N2.2_자연스러운_흐름', id: 'N2_2' },
      { key: 'N2.3_현실_세계_은유', id: 'N2_3' },
      { key: 'N4.1_시각적_일관성', id: 'N4_1' },
      { key: 'N4.2_용어_일관성', id: 'N4_2' },
      { key: 'N4.3_표준_준수', id: 'N4_3' },
      { key: 'N8.1_핵심_정보', id: 'N8_1' },
      { key: 'N8.2_깔끔한_인터페이스', id: 'N8_2' },
      { key: 'N8.3_시각적_계층', id: 'N8_3' },
      { key: 'N9.2_복구_지원', id: 'N9_2' },
      { key: 'N9.4_오류_안내', id: 'N9_4' },
      { key: 'N10.1_도움말_가시성', id: 'N10_1' },
      { key: 'N10.2_문서화', id: 'N10_2' },
    ]
    
    const designDiagnosisKeys = [
      'N2_1_familiar_terms', 'N2_2_natural_flow', 'N2_3_real_world_metaphor',
      'N4_1_visual_consistency', 'N4_2_terminology_consistency', 'N4_3_standard_compliance',
      'N8_1_essential_info', 'N8_2_clean_interface', 'N8_3_visual_hierarchy',
      'N9_2_recovery_support', 'N9_4_error_guidance',
      'N10_1_help_visibility', 'N10_2_documentation',
    ]
    
    designItems.forEach((score, idx) => {
      const { key, id } = designMapping[idx]
      const desc = getItemDescription(id)
      const diagnosisKey = designDiagnosisKeys[idx]
      
      design_items_detail.push({
        item: key,
        item_id: id,
        category: '디자인',
        score: Math.round(score * 10) / 10,
        diagnosis: improvedDiagnoses[diagnosisKey] || '',
        description: desc?.description || '',
        principle: desc?.principle || '',
        why_important: desc?.why_important || '',
        evaluation_criteria: desc?.evaluation_criteria || '',
        evaluated_url: url
      })
    })
    
    // 6. 개선 제안 생성
    const recommendations = generateImprovedRecommendations(structure, improvedScores)

    // 응답
    return c.json({
      url,
      analysis_date: new Date().toISOString(),
      version: '3.0-improved',
      structure: {
        navigation: structure.navigation,
        accessibility: structure.accessibility,
        content: structure.content,
        forms: structure.forms,
        visuals: structure.visuals
      },
      predicted_score: {
        overall: Math.round(overall * 100) / 100,
        convenience: Math.round(convenience * 100) / 100,
        design: Math.round(design * 100) / 100,
        convenience_items: convenience_items_detail,
        design_items: design_items_detail,
        nielsen_scores: improvedScores,
        nielsen_diagnoses: improvedDiagnoses
      },
      improvements: {
        total_items: 22,  // 개선: 25 → 22개 독립 항목
        removed_duplicates: 3,  // N3.2, N9.1, N9.3 제거
        new_items: 3,  // N7.3, N9.2, N9.4 추가/강화
        score_levels: 7,  // 2단계 → 7단계 세밀화
        search_detection: 'improved'  // 검색 탐지 개선
      },
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

// 개선된 추천 생성 함수
function generateImprovedRecommendations(structure: any, scores: any): string[] {
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
    recommendations.push('🔎 사이트 내 검색/필터 기능을 추가하세요. (N7.3)')
  }

  if (!structure.navigation.breadcrumbExists) {
    recommendations.push('📍 Breadcrumb 내비게이션을 추가하여 현재 위치를 표시하세요. (N1.1)')
  }

  // 폼 관련
  if (structure.forms.formCount > 0 && structure.forms.labelRatio < 0.9) {
    recommendations.push('🏷️ 모든 입력 필드에 label을 연결하세요. (N5.3)')
  }

  if (structure.forms.formCount > 0 && !structure.forms.validationExists) {
    recommendations.push('✅ 폼 입력 검증 기능을 추가하세요. (N5.1)')
  }

  // 콘텐츠 관련
  if (structure.content.headingCount < 5) {
    recommendations.push('📝 명확한 정보 구조를 위해 제목 태그(h1-h6)를 활용하세요. (N8.3)')
  }

  // 개선된 Nielsen 점수 기반 제안
  if (scores.N1_1_current_location < 3.5) {
    recommendations.push('👁️ Breadcrumb을 추가하여 사용자가 현재 위치를 파악하도록 하세요. (N1.1)')
  }

  if (scores.N7_3_search_filter < 3.5) {
    recommendations.push('🔍 검색 또는 필터 기능을 추가하여 정보 탐색을 쉽게 하세요. (N7.3)')
  }

  if (scores.N8_1_essential_info < 3.5) {
    recommendations.push('✂️ 불필요한 콘텐츠를 제거하고 핵심 정보에 집중하세요. (N8.1)')
  }

  if (scores.N9_2_recovery_support < 3.5 && structure.forms.formCount > 0) {
    recommendations.push('🔄 폼 입력 오류 시 복구 방법을 명확히 안내하세요. (N9.2)')
  }

  if (scores.N10_1_help_visibility < 3.5) {
    recommendations.push('❓ 도움말/FAQ를 찾기 쉽게 배치하세요. (N10.1)')
  }

  return recommendations.slice(0, 8) // 최대 8개 반환
}

// Catch-all route - wrangler will serve static files from dist/
// This is just a fallback
app.get('/', (c) => {
  return c.text('AutoAnalyzer API v3.0 - Improved Nielsen System', 200)
})

app.notFound((c) => {
  return c.text('Not Found', 404)
})

export default app
