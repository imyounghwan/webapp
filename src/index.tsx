import { Hono } from 'hono'
import { cors } from 'hono/cors'
import puppeteer from '@cloudflare/puppeteer'
import { analyzeHTML } from './analyzer/htmlAnalyzer'
import { findSimilarSites, calculatePredictedScore } from './analyzer/similarityCalculator'
import { calculateImprovedNielsen, generateImprovedDiagnoses } from './analyzer/nielsenImproved'
import { nielsenDescriptions, getItemDescription } from './analyzer/nielsenDescriptions'
import { evaluateItemRelevance } from './analyzer/itemRelevance'
import { evaluateKRDS } from './analyzer/krdsEvaluator'
import { evaluateUIUXKRDS } from './analyzer/uiuxKRDSEvaluator'
import { crawlWebsiteWithPuppeteer } from './analyzer/puppeteerCrawler'
import { evaluateKRDSWithAI } from './analyzer/aiEvaluator'
import { loadWeights, getWeightsVersion, getWeightsLastUpdated, loadReferenceStatistics } from './config/weightsLoader'
import { generateWeightAdjustments, applyWeightAdjustments } from './config/weightAdjuster'
import type { Env, CorrectionRequest, AdminCorrection, LearningDataSummary } from './types/database'
import { hashPassword, verifyPassword, generateSessionId, authMiddleware, adminMiddleware, validateEmail, validatePassword } from './auth'
import type { SignupRequest, LoginRequest } from './types'

// 49개 기관 통합 데이터 import (정적 데이터로 번들에 포함)
import referenceData from '../analysis/output/final_integrated_scores.json'
import indexHTML from '../public/index.html?raw'
import landingHTML from '../public/landing.html?raw'
import loginHTML from '../public/login.html?raw'
import adminHTML from '../public/admin.html?raw'
import testFeedbackHTML from '../public/test_feedback.html?raw'

const app = new Hono<{ Bindings: Env }>()

// 피드백 데이터 저장소 (메모리 기반 - 추후 D1/KV로 이전)
// key: item_id, value: 피드백 데이터 배열
const feedbackStore: Map<string, Array<{
  url: string;
  original_score: number;
  new_score: number;
  score_delta: number;
  new_description?: string;
  new_recommendation?: string;
  timestamp: string;
}>> = new Map()

// 피드백 데이터 기반 점수 조정 함수
function applyFeedbackAdjustment(itemId: string, baseScore: number, url: string): number {
  const feedbacks = feedbackStore.get(itemId)
  if (!feedbacks || feedbacks.length === 0) {
    return baseScore
  }
  
  // 동일 URL의 피드백이 있으면 그대로 사용
  const exactMatch = feedbacks.find(f => f.url === url)
  if (exactMatch) {
    console.log(`[Feedback] Exact match found for ${itemId} on ${url}: ${baseScore} → ${exactMatch.new_score}`)
    return exactMatch.new_score
  }
  
  // 다른 URL들의 평균 조정값 적용
  const avgDelta = feedbacks.reduce((sum, f) => sum + f.score_delta, 0) / feedbacks.length
  const adjustedScore = Math.max(0, Math.min(5, baseScore + avgDelta))
  
  console.log(`[Feedback] Applying avg adjustment for ${itemId}: ${baseScore} + ${avgDelta.toFixed(2)} = ${adjustedScore.toFixed(2)}`)
  return adjustedScore
}

// API routes
app.use('/api/*', cors())

app.get('/api/hello', (c) => {
  return c.json({ message: 'AutoAnalyzer API', status: 'ok' })
})

/**
 * 서브 페이지 URL 추출 (메인 페이지에서) - 10개까지 확장
 */
async function extractSubPages(mainUrl: string, html: string, limit: number = 10): Promise<string[]> {
  const baseUrl = new URL(mainUrl).origin
  const mainUrlObj = new URL(mainUrl)
  const basePath = mainUrlObj.pathname.substring(0, mainUrlObj.pathname.lastIndexOf('/') + 1)
  const subPages: string[] = []
  
  // 내부 링크 찾기 (상대 경로 및 같은 도메인)
  const linkRegex = /<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi
  let match
  
  console.log(`Extracting sub-pages from ${mainUrl}...`)
  console.log(`Base URL: ${baseUrl}, Base Path: ${basePath}`)
  
  while ((match = linkRegex.exec(html)) !== null && subPages.length < limit) {
    let href = match[1]
    const originalHref = href
    
    // #으로 시작하는 순수 앵커는 스킵
    if (href.startsWith('#')) {
      continue
    }
    
    // #이 있으면 제거 (예: _about.html#section → _about.html)
    if (href.includes('#')) {
      href = href.split('#')[0]
    }
    
    // javascript:, mailto: 등은 스킵
    if (href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      continue
    }
    
    // 절대 경로로 변환
    if (href.startsWith('/')) {
      // /로 시작하는 절대 경로
      href = baseUrl + href
    } else if (href.startsWith('http://') || href.startsWith('https://')) {
      // 이미 완전한 URL - 같은 도메인만 허용
      if (!href.startsWith(baseUrl)) {
        continue
      }
    } else if (href && !href.startsWith('void(')) {
      // 상대 경로 (예: _about.html, sub/page.html)
      href = baseUrl + basePath + href
    } else {
      continue
    }
    
    // 필터링
    if (href && 
        href.startsWith(baseUrl) && 
        href !== mainUrl && 
        href !== mainUrl + '/' &&
        !href.includes('javascript:') &&
        !href.includes('void(0)') &&
        !href.includes('login') &&
        !href.includes('join') &&
        !href.includes('member') &&
        !href.includes('mypage') &&
        !href.endsWith('.pdf') &&
        !href.endsWith('.zip') &&
        !href.endsWith('.jpg') &&
        !href.endsWith('.jpeg') &&
        !href.endsWith('.png') &&
        !href.endsWith('.gif') &&
        !href.endsWith('.css') &&
        !href.endsWith('.js') &&
        href.length < 200) {  // 너무 긴 URL 제외
      if (!subPages.includes(href)) {
        subPages.push(href)
        console.log(`Found sub-page: ${href}`)
      }
    }
  }
  
  console.log(`Total ${subPages.length} sub-pages found`)
  return subPages.slice(0, limit)
}

/**
 * 여러 페이지를 분석하고 종합 평가
 */
async function analyzeMultiplePages(mainUrl: string): Promise<any> {
  const results = []
  const allFoundPages = new Set<string>()
  
  try {
    // 1. 메인 페이지 분석
    console.log(`Fetching main page: ${mainUrl}`)
    let currentUrl = mainUrl
    let mainHtml = ''
    let redirectAttempts = 0
    const maxRedirects = 3
    
    // JavaScript 리다이렉트를 자동으로 따라가기
    const visitedUrls = new Set<string>()  // 무한 루프 방지
    while (redirectAttempts < maxRedirects) {
      // 이미 방문한 URL이면 무한 루프 - 중단
      if (visitedUrls.has(currentUrl)) {
        console.log(`Redirect loop detected at ${currentUrl}, stopping`)
        break
      }
      visitedUrls.add(currentUrl)
      
      const mainResponse = await fetch(currentUrl, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        redirect: 'manual'  // HTTP 리다이렉트를 수동으로 처리 (무한 루프 방지)
      })
      
      // HTTP 리다이렉트 처리 (3xx)
      if (mainResponse.status >= 300 && mainResponse.status < 400) {
        const location = mainResponse.headers.get('Location')
        if (location) {
          let redirectUrl = location
          // 상대 경로를 절대 경로로 변환
          if (!redirectUrl.startsWith('http')) {
            redirectUrl = new URL(redirectUrl, currentUrl).href
          }
          
          // 리다이렉트 URL이 현재 URL과 같으면 무한 루프 - 중단
          if (redirectUrl === currentUrl) {
            console.log(`HTTP redirect loop detected at ${currentUrl}, stopping`)
            break
          }
          
          console.log(`HTTP redirect detected: ${currentUrl} -> ${redirectUrl}`)
          currentUrl = redirectUrl
          redirectAttempts++
          continue
        }
      }
      
      if (!mainResponse.ok && mainResponse.status !== 304) {
        throw new Error(`Failed to fetch main page: ${mainResponse.status} ${mainResponse.statusText}`)
      }
      
      mainHtml = await mainResponse.text()
      
      // JavaScript 리다이렉트 감지 (location.href = "...")
      const jsRedirectMatch = mainHtml.match(/location\.href\s*=\s*["']([^"']+)["']/i)
      if (jsRedirectMatch && mainHtml.length < 500) {  // 작은 HTML은 리다이렉트 페이지일 가능성
        let redirectUrl = jsRedirectMatch[1]
        // 상대 경로를 절대 경로로 변환
        if (redirectUrl.startsWith('/')) {
          const baseUrlObj = new URL(currentUrl)
          redirectUrl = baseUrlObj.origin + redirectUrl
        } else if (!redirectUrl.startsWith('http')) {
          redirectUrl = new URL(redirectUrl, currentUrl).href
        }
        
        // 리다이렉트 URL이 현재 URL과 같으면 무한 루프 - 중단
        if (redirectUrl === currentUrl) {
          console.log(`JS redirect loop detected at ${currentUrl}, stopping`)
          break
        }
        
        console.log(`JavaScript redirect detected: ${currentUrl} -> ${redirectUrl}`)
        currentUrl = redirectUrl
        redirectAttempts++
      } else {
        // 리다이렉트가 없으면 중단
        break
      }
    }
    
    console.log(`Final URL after redirects: ${currentUrl}`)
    const mainStructure = analyzeHTML(mainHtml, currentUrl)
    results.push({ url: currentUrl, structure: mainStructure, isMainPage: true })
    allFoundPages.add(currentUrl)
  
  // 2. 메인 페이지에서 서브 페이지 추출
  const subPagesFromMain = await extractSubPages(mainUrl, mainHtml, 20)
  subPagesFromMain.forEach(page => allFoundPages.add(page))
  
  // 3. 일반적인 페이지 패턴 체크 (링크되지 않은 페이지 발견)
  const baseUrlObj = new URL(mainUrl)
  const baseUrl = baseUrlObj.origin
  const basePath = baseUrlObj.pathname.substring(0, baseUrlObj.pathname.lastIndexOf('/') + 1)
  
  const commonPages = [
    '_about.html',
    '_contact.html', 
    '_portfolio.html',
    '_consulting.html',
    '_service.html',
    '_news.html',
    'about.html',
    'contact.html',
    'portfolio.html',
    'consulting.html',
    'service.html',
    'news.html'
  ]
  
  for (const pageName of commonPages) {
    const pageUrl = baseUrl + basePath + pageName
    if (!allFoundPages.has(pageUrl)) {
      try {
        const response = await fetch(pageUrl, {
          method: 'GET',
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          signal: AbortSignal.timeout(3000)
        })
        if (response.ok && response.status === 200) {
          allFoundPages.add(pageUrl)
          console.log(`✅ Found additional page by pattern: ${pageUrl}`)
        }
      } catch (error) {
        // 페이지 없음 - 무시
        console.log(`❌ Page not found: ${pageUrl}`)
      }
    }
  }
  
  // 4. 서브 페이지 분석 및 추가 링크 수집 (최대 9개 = 총 10페이지)
  const pagesToAnalyze = Array.from(allFoundPages).slice(1, 10) // 메인 제외, 최대 9개
  
  for (const subUrl of pagesToAnalyze) {
    try {
      const subResponse = await fetch(subUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(5000) // 5초 타임아웃
      })
      
      if (subResponse.ok) {
        const subHtml = await subResponse.text()
        const subStructure = analyzeHTML(subHtml, subUrl)
        results.push({ url: subUrl, structure: subStructure, isMainPage: false })
        
        // 이 서브 페이지에서도 추가 링크 찾기 (부족하면)
        if (results.length < 10) {
          const morePagesFromSub = await extractSubPages(subUrl, subHtml, 5)
          morePagesFromSub.forEach(page => {
            if (!allFoundPages.has(page) && allFoundPages.size < 20) {
              allFoundPages.add(page)
            }
          })
        }
      }
    } catch (error) {
      console.log(`Failed to analyze ${subUrl}:`, error)
    }
  }
  
  // 5. 아직 부족하면 추가로 수집된 페이지들 분석
  if (results.length < 10) {
    const remainingPages = Array.from(allFoundPages).slice(results.length, 10)
    for (const pageUrl of remainingPages) {
      try {
        const response = await fetch(pageUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          signal: AbortSignal.timeout(5000)
        })
        
        if (response.ok) {
          const html = await response.text()
          const structure = analyzeHTML(html, pageUrl)
          results.push({ url: pageUrl, structure, isMainPage: false })
        }
      } catch (error) {
        console.log(`Failed to analyze additional page ${pageUrl}:`, error)
      }
    }
  }
  
  console.log(`Total analyzed pages: ${results.length}`)
  return results
  
  } catch (error) {
    console.error('Error in analyzeMultiplePages:', error)
    // 최소한 메인 페이지라도 분석 시도
    if (results.length === 0) {
      throw new Error(`분석 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    }
    return results
  }
}

/**
 * 26개 항목 평가를 기반으로 총평 생성
 */
function generateEvaluationSummary(
  convenienceItems: any[], 
  designItems: any[], 
  overall: number, 
  convenience: number, 
  design: number
): string {
  const allItems = [...convenienceItems, ...designItems]
  const totalItems = allItems.length
  
  // 점수대별 개수
  const excellent = allItems.filter(item => item.score >= 4.5).length
  const good = allItems.filter(item => item.score >= 3.5 && item.score < 4.5).length
  const average = allItems.filter(item => item.score >= 2.5 && item.score < 3.5).length
  const poor = allItems.filter(item => item.score < 2.5).length
  
  // 강점 찾기 (4.5점 이상)
  const strengths = allItems.filter(item => item.score >= 4.5)
    .map(item => item.item)
    .slice(0, 3)
  
  // 개선 필요 항목 (3.0점 미만)
  const weaknesses = allItems.filter(item => item.score < 3.0)
    .map(item => item.item)
    .slice(0, 3)
  
  // ===== 1. Nielsen 심각도 기반 등급 (학술적 근거) =====
  // 출처: Jakob Nielsen's Severity Ratings (1994)
  // Nielsen Norman Group - Usability Heuristics
  let nielsenGrade = ''
  let nielsenDescription = ''
  
  if (overall >= 4.5) {
    nielsenGrade = 'S등급 (탁월)'
    nielsenDescription = '사용성 문제가 거의 없음. 최상위 수준의 사용자 경험을 제공합니다.'
  } else if (overall >= 4.0) {
    nielsenGrade = 'A등급 (우수)'
    nielsenDescription = '미용상 개선만 필요. 전반적으로 우수한 사용성을 보여줍니다.'
  } else if (overall >= 3.0) {
    nielsenGrade = 'B등급 (양호)'
    nielsenDescription = '경미한 사용성 개선 필요. 기본적인 사용에는 문제가 없습니다.'
  } else if (overall >= 2.0) {
    nielsenGrade = 'C등급 (보통)'
    nielsenDescription = '중대한 사용성 개선 필요. 여러 항목에서 불편함이 예상됩니다.'
  } else {
    nielsenGrade = 'D등급 (미흡)'
    nielsenDescription = '치명적 사용성 문제 존재. 즉각적인 개선이 시급합니다.'
  }
  
  // ===== 2. 데이터 기반 상대 평가 (49개 한국 정부기관 사이트 대비) =====
  // 출처: 국민신문고 공공서비스 49개 기관 분석 데이터
  // 평균: 3.79점, 최고: 4.29점, 최저: 2.7점
  const referenceAverage = 3.79
  const referenceMax = 4.29
  const referenceMin = 2.7
  
  let relativeGrade = ''
  let relativeDescription = ''
  let percentile = 0
  
  // 백분위 계산 (선형 보간)
  if (overall >= referenceMax) {
    percentile = 100
  } else if (overall <= referenceMin) {
    percentile = 0
  } else {
    // 정규화: (현재점수 - 최저) / (최고 - 최저) * 100
    percentile = Math.round(((overall - referenceMin) / (referenceMax - referenceMin)) * 100)
  }
  
  if (percentile >= 90) {
    relativeGrade = 'S등급 (최상위권)'
    relativeDescription = `상위 ${100-percentile}% 이내. 한국 주요 공공기관 중 최고 수준입니다.`
  } else if (percentile >= 70) {
    relativeGrade = 'A등급 (상위권)'
    relativeDescription = `상위 ${100-percentile}% 이내. 평균(${referenceAverage}점)을 크게 상회하는 우수한 수준입니다.`
  } else if (percentile >= 50) {
    relativeGrade = 'B등급 (중상위권)'
    relativeDescription = `상위 ${100-percentile}% 이내. 평균(${referenceAverage}점) 수준입니다.`
  } else if (percentile >= 30) {
    relativeGrade = 'C등급 (중하위권)'
    relativeDescription = `하위 ${100-percentile}%. 평균(${referenceAverage}점)에 미치지 못합니다.`
  } else {
    relativeGrade = 'D등급 (하위권)'
    relativeDescription = `하위 ${100-percentile}%. 주요 공공기관 대비 개선이 필요합니다.`
  }
  
  // 우수 항목 비율
  const excellentRatio = excellent / totalItems
  
  // 편의성 vs 디자인 비교
  const convenienceLevel = convenience >= 4.0 ? '우수' : convenience >= 3.0 ? '양호' : '보통'
  const designLevel = design >= 4.0 ? '우수' : design >= 3.0 ? '양호' : '보통'
  
  let summary = `
📊 **총평 (26개 항목 종합 평가)**

**종합 점수: ${overall.toFixed(2)}점 / 5.0점**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**📋 등급 평가 (2가지 기준)**

**1️⃣ Nielsen 심각도 기반 (학술적 근거)**
   ${nielsenGrade}
   ${nielsenDescription}
   
   📚 근거: Jakob Nielsen's Severity Ratings (1994)
   출처: Nielsen Norman Group

**2️⃣ 데이터 기반 상대 평가 (비교 대상: 49개 한국 공공기관)**
   ${relativeGrade} - 백분위 ${percentile}%
   ${relativeDescription}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**점수 분포:**
- 우수 (4.5점 이상): ${excellent}개 항목 (${Math.round(excellentRatio*100)}%)
- 양호 (3.5~4.4점): ${good}개 항목 (${Math.round(good/totalItems*100)}%)
- 보통 (2.5~3.4점): ${average}개 항목 (${Math.round(average/totalItems*100)}%)
- 미흡 (2.5점 미만): ${poor}개 항목 (${Math.round(poor/totalItems*100)}%)

**편의성 평가: ${convenienceLevel} (${convenience.toFixed(1)}점)**
- 총 ${convenienceItems.length}개 항목 평가
- 사용자가 목표를 얼마나 쉽고 효율적으로 달성할 수 있는지를 평가합니다.

**디자인 평가: ${designLevel} (${design.toFixed(1)}점)**
- 총 ${designItems.length}개 항목 평가
- 시각적 일관성, 미니멀 디자인, 정보 계층 구조를 평가합니다.
`

  if (strengths.length > 0) {
    summary += `\n**✅ 주요 강점:**\n`
    strengths.forEach(s => summary += `- ${s}\n`)
  }
  
  if (weaknesses.length > 0) {
    summary += `\n**⚠️ 개선 필요:**\n`
    weaknesses.forEach(w => summary += `- ${w}\n`)
  }
  
  summary += `\n**💡 권고사항:**\n`
  if (poor > 0) {
    summary += `- 미흡 항목 ${poor}개에 대한 즉각적인 개선이 필요합니다.\n`
  }
  if (average > totalItems / 2) {
    summary += `- 보통 수준 항목들을 우선적으로 개선하여 전체 품질을 향상시키세요.\n`
  }
  if (convenience < design) {
    summary += `- 편의성 항목이 디자인보다 낮습니다. 사용자 경험 개선에 집중하세요.\n`
  } else if (design < convenience) {
    summary += `- 디자인 항목이 편의성보다 낮습니다. 시각적 일관성과 정보 구조 개선이 필요합니다.\n`
  }
  
  return summary
}

/**
 * AI 점수를 KRDS 포맷으로 변환
 */
function convertAIScoresToKRDSFormat(aiScores: any): any {
  // AI 점수 매핑 (identity_1_1_1 형식)
  const scores: any = {}
  
  // 모든 키를 변환
  for (const [key, value] of Object.entries(aiScores)) {
    if (key === 'reasoning') continue
    
    // identity_1_1_1 → identity_1_1_1_official_banner
    const mappedKey = mapAIKeyToKRDSKey(key)
    scores[mappedKey] = typeof value === 'number' ? value : 0
  }
  
  // 유효한 점수만 추출 (0 이상)
  const validScores = Object.values(scores).filter((s: any) => s >= 0) as number[]
  const compliantCount = validScores.filter(s => s >= 4.5).length
  const totalCount = validScores.length
  const complianceRate = totalCount > 0 ? (compliantCount / totalCount) * 100 : 0
  const convenience_score = Math.round(complianceRate)
  
  // 등급 계산
  let compliance_level = 'F'
  if (convenience_score >= 95) compliance_level = 'S'
  else if (convenience_score >= 90) compliance_level = 'A'
  else if (convenience_score >= 85) compliance_level = 'B'
  else if (convenience_score >= 80) compliance_level = 'C'
  
  // 카테고리 점수 계산
  const categories = {
    identity: calculateCategoryScore(scores, 'identity'),
    navigation: calculateCategoryScore(scores, 'navigation'),
    visit: calculateCategoryScore(scores, 'visit'),
    search: calculateCategoryScore(scores, 'search'),
    login: calculateCategoryScore(scores, 'login'),
    application: calculateCategoryScore(scores, 'application'),
    overall: convenience_score
  }
  
  return {
    scores,
    categories,
    compliance_level,
    convenience_score,
    compliant_count: compliantCount,
    total_count: totalCount,
    not_applicable_count: Object.values(scores).filter((s: any) => s < 0).length,
    compliance_rate: complianceRate,
    issues: [] // AI는 issues를 생성하지 않음 (추후 구현 가능)
  }
}

/**
 * AI 키를 KRDS 키로 매핑
 */
function mapAIKeyToKRDSKey(aiKey: string): string {
  // identity_1_1_1 → identity_1_1_1_official_banner
  const keyMap: Record<string, string> = {
    'identity_1_1_1': 'identity_1_1_1_official_banner',
    'identity_1_2_1': 'identity_1_2_1_logo',
    'identity_1_2_2': 'identity_1_2_2_home_button',
    // ... (나머지 43개 항목 매핑)
    // 간단하게 기본값 사용
  }
  
  return keyMap[aiKey] || aiKey
}

/**
 * 카테고리별 평균 점수 계산
 */
function calculateCategoryScore(scores: any, category: string): number {
  const categoryScores = Object.entries(scores)
    .filter(([key]) => key.startsWith(category))
    .map(([, value]) => value as number)
    .filter(s => s >= 0)
  
  if (categoryScores.length === 0) return 0
  return categoryScores.reduce((sum, s) => sum + s, 0) / categoryScores.length
}

/**
 * 여러 페이지 결과를 종합 (10페이지 평균)
 */
function aggregateResults(pageResults: any[]): any {
  if (pageResults.length === 0) return null
  
  const mainPage = pageResults.find(p => p.isMainPage)
  const subPages = pageResults.filter(p => !p.isMainPage)
  
  if (!mainPage) return null
  
  // 모든 페이지의 구조를 평균화
  const allPages = pageResults.map(p => p.structure)
  
  // Navigation 종합 (평균 + 특수 처리)
  const avgNavigation = {
    menuCount: Math.round(allPages.reduce((sum, s) => sum + s.navigation.menuCount, 0) / allPages.length),
    linkCount: Math.round(allPages.reduce((sum, s) => sum + s.navigation.linkCount, 0) / allPages.length),
    breadcrumbExists: subPages.some(p => p.structure.navigation.breadcrumbExists) || mainPage.structure.navigation.breadcrumbExists,
    searchExists: allPages.some(s => s.navigation.searchExists),
    depthLevel: Math.round(allPages.reduce((sum, s) => sum + s.navigation.depthLevel, 0) / allPages.length)
  }
  
  // Accessibility 종합 (평균)
  const avgAccessibility = {
    altTextRatio: allPages.reduce((sum, s) => sum + s.accessibility.altTextRatio, 0) / allPages.length,
    ariaLabelCount: Math.round(allPages.reduce((sum, s) => sum + s.accessibility.ariaLabelCount, 0) / allPages.length),
    headingStructure: allPages.filter(s => s.accessibility.headingStructure).length > allPages.length / 2,
    langAttribute: allPages.some(s => s.accessibility.langAttribute),
    skipLinkExists: allPages.some(s => s.accessibility.skipLinkExists)
  }
  
  // Content 종합 (평균)
  const avgContent = {
    headingCount: Math.round(allPages.reduce((sum, s) => sum + s.content.headingCount, 0) / allPages.length),
    paragraphCount: Math.round(allPages.reduce((sum, s) => sum + s.content.paragraphCount, 0) / allPages.length),
    listCount: Math.round(allPages.reduce((sum, s) => sum + s.content.listCount, 0) / allPages.length),
    tableCount: Math.round(allPages.reduce((sum, s) => sum + s.content.tableCount, 0) / allPages.length)
  }
  
  // Forms 종합 (평균)
  const avgForms = {
    formCount: Math.round(allPages.reduce((sum, s) => sum + s.forms.formCount, 0) / allPages.length),
    inputCount: Math.round(allPages.reduce((sum, s) => sum + s.forms.inputCount, 0) / allPages.length),
    labelRatio: allPages.reduce((sum, s) => sum + s.forms.labelRatio, 0) / allPages.length,
    validationExists: allPages.filter(s => s.forms.validationExists).length > allPages.length / 3
  }
  
  // Visuals 종합 (평균)
  const avgVisuals = {
    imageCount: Math.round(allPages.reduce((sum, s) => sum + s.visuals.imageCount, 0) / allPages.length),
    videoCount: Math.round(allPages.reduce((sum, s) => sum + s.visuals.videoCount, 0) / allPages.length),
    iconCount: Math.round(allPages.reduce((sum, s) => sum + s.visuals.iconCount, 0) / allPages.length)
  }
  
  return {
    html: mainPage.structure.html || '',  // 메인 페이지 HTML 사용 (KRDS 평가용)
    navigation: avgNavigation,
    accessibility: avgAccessibility,
    content: avgContent,
    forms: avgForms,
    visuals: avgVisuals
  }
}

// 관리자 평가 피드백 API - AI 학습 데이터로 저장
app.post('/api/feedback', authMiddleware, async (c) => {
  try {
    const { url, item_id, item_name, original_score, new_score, new_description, new_recommendation, category } = await c.req.json()
    
    // 유효성 검사
    if (!url || !item_id || new_score === undefined) {
      return c.json({ error: 'Missing required fields: url, item_id, new_score' }, 400)
    }
    
    // 피드백 데이터 구조
    const feedbackData = {
      url,
      item_id,
      item_name,
      category,
      original_score,
      new_score,
      score_delta: new_score - (original_score || 0),
      new_description,
      new_recommendation,
      timestamp: new Date().toISOString(),
      session_id: c.get('sessionId') || 'anonymous'
    }
    
    console.log('[Feedback] Received admin correction:', feedbackData)
    
    // 메모리에 피드백 데이터 저장
    if (!feedbackStore.has(item_id)) {
      feedbackStore.set(item_id, [])
    }
    const itemFeedbacks = feedbackStore.get(item_id)!
    itemFeedbacks.push({
      url,
      original_score,
      new_score,
      score_delta: new_score - (original_score || 0),
      new_description,
      new_recommendation,
      timestamp: new Date().toISOString()
    })
    
    console.log(`[Feedback] Stored in memory: ${item_id} now has ${itemFeedbacks.length} feedback(s)`)
    
    // TODO: Cloudflare D1 또는 KV에 저장
    // await c.env.DB.prepare('INSERT INTO feedback ...').bind(...).run()
    
    // 피드백 저장 성공 응답
    return c.json({ 
      success: true, 
      message: 'Feedback saved successfully and will be applied to future evaluations',
      feedback: feedbackData,
      total_feedbacks: itemFeedbacks.length
    })
    
  } catch (error: any) {
    console.error('[Feedback] Error:', error)
    return c.json({ error: 'Failed to save feedback', details: error.message }, 500)
  }
})

// 실시간 URL 분석 API
app.post('/api/analyze', authMiddleware, async (c) => {
  try {
    const { url, urls, mode = 'mgine', usePuppeteer = false, useAI = false } = await c.req.json()

    // urls 배열이 제공된 경우 (사용자 직접 선별)
    if (urls && Array.isArray(urls) && urls.length > 0) {
      console.log('[Manual Selection] User provided', urls.length, 'URLs')
      
      // URL 유효성 검사
      const validUrls = urls.filter((u: string) => u && u.startsWith('http'))
      if (validUrls.length === 0) {
        return c.json({ error: 'No valid URLs provided' }, 400)
      }
      
      // 평가 모드 검증
      if (mode !== 'mgine' && mode !== 'public') {
        return c.json({ error: 'Invalid mode. Must be "mgine" or "public"' }, 400)
      }
      
      // 1. 사용자 제공 URL들을 분석
      let pageResults: any[] = []
      
      if (usePuppeteer && c.env.MYBROWSER) {
        // Puppeteer로 각 URL 분석
        console.log('[Puppeteer] Analyzing user-provided URLs')
        const browser = await puppeteer.launch(c.env.MYBROWSER)
        
        try {
          for (const pageUrl of validUrls) {
            try {
              const page = await browser.newPage()
              await page.goto(pageUrl, { waitUntil: 'networkidle0', timeout: 30000 })
              const html = await page.content()
              await page.close()
              
              pageResults.push({
                url: pageUrl,
                structure: analyzeHTML(html, pageUrl),
                isMainPage: pageUrl === validUrls[0]
              })
            } catch (error) {
              console.error(`Failed to analyze ${pageUrl}:`, error)
            }
          }
        } finally {
          await browser.close()
        }
      } else {
        // Fetch로 각 URL 분석
        console.log('[Fetch] Analyzing user-provided URLs')
        for (const pageUrl of validUrls) {
          try {
            const response = await fetch(pageUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
              signal: AbortSignal.timeout(10000)
            })
            
            if (response.ok) {
              const html = await response.text()
              pageResults.push({
                url: pageUrl,
                structure: analyzeHTML(html, pageUrl),
                isMainPage: pageUrl === validUrls[0]
              })
            }
          } catch (error) {
            console.error(`Failed to analyze ${pageUrl}:`, error)
          }
        }
      }
      
      if (pageResults.length === 0) {
        return c.json({ error: 'Failed to analyze any provided URLs' }, 400)
      }
      
      console.log(`[Manual Selection] Successfully analyzed ${pageResults.length}/${validUrls.length} URLs`)
      
      // 2. 결과 종합 및 평가로 진행
      const structure = aggregateResults(pageResults)
      const itemRelevance = evaluateItemRelevance(pageResults)
      
      // === 이후 기존 평가 로직과 동일하게 진행 ===
      if (mode === 'public') {
        let uiuxResult
        
        if (useAI) {
          console.log('[AI] Using AI-based evaluation')
          try {
            const aiScores = await evaluateKRDSWithAI(structure.html, validUrls[0])
            uiuxResult = convertAIScoresToKRDSFormat(aiScores)
            uiuxResult.evaluation_method = 'AI (GPT-5)'
          } catch (error) {
            console.error('[AI] AI evaluation failed, falling back to HTML analysis:', error)
            uiuxResult = evaluateUIUXKRDS(structure, pageResults)
            uiuxResult.evaluation_method = 'HTML (AI failed)'
          }
        } else {
          uiuxResult = evaluateUIUXKRDS(structure, pageResults)
          uiuxResult.evaluation_method = 'HTML'
        }
        
        return c.json({
          mode: 'public',
          mode_name: '공공 UI/UX 분석 (KRDS)',
          evaluation_standard: '디지털정부서비스 UI/UX 가이드라인 43개 항목',
          url: validUrls[0],
          analyzed_at: new Date().toISOString(),
          total_pages: pageResults.length,
          analyzed_pages: pageResults.map(p => p.url),
          manual_selection: true,
          
          krds: {
            categories: uiuxResult.categories,
            compliance_level: uiuxResult.compliance_level,
            convenience_score: uiuxResult.convenience_score,
            compliant_count: uiuxResult.compliant_count,
            total_count: uiuxResult.total_count,
            not_applicable_count: uiuxResult.not_applicable_count,
            compliance_rate: uiuxResult.compliance_rate,
            scores: uiuxResult.scores,
            issues: uiuxResult.issues,
          },
          
          structure: {
            navigation: structure.navigation,
            breadcrumb: structure.breadcrumb,
            search: structure.search,
            accessibility: structure.accessibility,
            content: structure.content,
            visual: structure.visual,
          },
          
          metadata: {
            category_count: 6,
            item_count: 43,
            evaluation_method: 'KRDS UI/UX (디지털정부서비스 가이드라인)',
            categories: ['아이덴티티(5)', '탐색(5)', '방문(1)', '검색(12)', '로그인(7)', '신청(13)']
          }
        })
      }
      
      // MGINE 모드 평가 계속 (아래 기존 로직으로)
      const improvedScores = calculateImprovedNielsen(structure)
      const improvedDiagnoses = generateImprovedDiagnoses(structure, improvedScores, validUrls[0])
      
      const convenienceItems = [
        improvedScores.N1_1_current_location,
        improvedScores.N1_2_loading_status,
        improvedScores.N1_3_action_feedback,
        improvedScores.N2_1_familiar_terms,
        improvedScores.N2_2_natural_flow,
        improvedScores.N3_1_undo_redo,
        improvedScores.N3_3_flexible_navigation,
        improvedScores.N4_2_terminology_consistency,
        improvedScores.N4_3_standard_compliance,
        improvedScores.N5_1_input_validation,
        improvedScores.N5_2_confirmation_dialog,
        improvedScores.N5_3_constraints,
        improvedScores.N6_2_recognition_cues,
        improvedScores.N6_3_memory_load,
        improvedScores.N7_1_quick_access,
        improvedScores.N7_2_customization,
        improvedScores.N7_3_search_filter,
        improvedScores.N9_2_recovery_support,
        improvedScores.N9_4_error_guidance,
        improvedScores.N10_1_help_visibility,
        improvedScores.N10_2_documentation,
      ]
      
      const designItems = [
        improvedScores.N2_3_real_world_metaphor,
        improvedScores.N4_1_visual_consistency,
        improvedScores.N8_1_essential_info,
        improvedScores.N8_2_clean_interface,
        improvedScores.N8_3_visual_hierarchy,
      ]
      
      const convenience = convenienceItems.reduce((sum, s) => sum + s, 0) / convenienceItems.length
      const design = designItems.reduce((sum, s) => sum + s, 0) / designItems.length
      const allItems = [...convenienceItems, ...designItems]
      const overall = allItems.reduce((sum, s) => sum + s, 0) / allItems.length
      
      const convenience_items_detail: any[] = []
      const design_items_detail: any[] = []
      
      const convenienceMapping = [
        { key: 'N1.1_현재_위치', id: 'N1_1' },
        { key: 'N1.2_로딩_상태', id: 'N1_2' },
        { key: 'N1.3_행동_피드백', id: 'N1_3' },
        { key: 'N2.1_친숙한_용어', id: 'N2_1' },
        { key: 'N2.2_자연스러운_흐름', id: 'N2_2' },
        { key: 'N3.1_실행_취소', id: 'N3_1' },
        { key: 'N3.3_유연한_네비게이션', id: 'N3_3' },
        { key: 'N4.2_용어_일관성', id: 'N4_2' },
        { key: 'N4.3_표준_준수', id: 'N4_3' },
        { key: 'N5.1_입력_검증', id: 'N5_1' },
        { key: 'N5.2_확인_대화상자', id: 'N5_2' },
        { key: 'N5.3_제약_조건_표시', id: 'N5_3' },
        { key: 'N6.2_인식_단서', id: 'N6_2' },
        { key: 'N6.3_기억_부담', id: 'N6_3' },
        { key: 'N7.1_빠른_접근', id: 'N7_1' },
        { key: 'N7.2_맞춤_설정', id: 'N7_2' },
        { key: 'N7.3_검색_필터', id: 'N7_3' },
        { key: 'N9.2_복구_지원', id: 'N9_2' },
        { key: 'N9.4_오류_안내', id: 'N9_4' },
        { key: 'N10.1_도움말_가시성', id: 'N10_1' },
        { key: 'N10.2_문서화', id: 'N10_2' }
      ]
      
      const convenienceDiagnosisKeys = [
        'N1_1_current_location', 'N1_2_loading_status', 'N1_3_action_feedback',
        'N2_1_familiar_terms', 'N2_2_natural_flow',
        'N3_1_undo_redo', 'N3_3_flexible_navigation',
        'N4_2_terminology_consistency', 'N4_3_standard_compliance',
        'N5_1_input_validation', 'N5_2_confirmation_dialog', 'N5_3_constraints',
        'N6_2_recognition_cues', 'N6_3_memory_load',
        'N7_1_quick_access', 'N7_2_customization', 'N7_3_search_filter',
        'N9_2_recovery_support', 'N9_4_error_guidance',
        'N10_1_help_visibility', 'N10_2_documentation'
      ]
      
      convenienceMapping.forEach((mapping, idx) => {
        const id = mapping.id
        const desc = getItemDescription(id)
        const diagnosisKey = convenienceDiagnosisKeys[idx]
        const relevantPages = itemRelevance.get(id) || [validUrls[0]]
        
        // 기본 점수 계산
        let baseScore = (improvedScores as any)[diagnosisKey] || 0
        
        // 피드백 데이터 적용 (AI 학습 반영)
        const adjustedScore = applyFeedbackAdjustment(id, baseScore, validUrls[0])
        
        convenience_items_detail.push({
          item: desc?.name || mapping.key,
          item_id: id,
          category: '편의성',
          score: adjustedScore,  // 피드백 반영된 점수 사용
          description: (improvedDiagnoses as any)[diagnosisKey]?.description || desc?.description || '진단 정보가 없습니다.',
          recommendation: (improvedDiagnoses as any)[diagnosisKey]?.recommendation || '추가 권장사항이 없습니다.',
          principle: desc?.principle || '',
          why_important: desc?.why_important || '',
          evaluation_criteria: desc?.evaluation_criteria || '',
          affected_pages: relevantPages
        })
      })
      
      const designMapping = [
        { key: 'N2.3_현실_은유', id: 'N2_3' },
        { key: 'N4.1_시각_일관성', id: 'N4_1' },
        { key: 'N8.1_핵심_정보', id: 'N8_1' },
        { key: 'N8.2_깔끔한_인터페이스', id: 'N8_2' },
        { key: 'N8.3_시각_계층', id: 'N8_3' }
      ]
      
      const designDiagnosisKeys = [
        'N2_3_real_world_metaphor',
        'N4_1_visual_consistency',
        'N8_1_essential_info',
        'N8_2_clean_interface',
        'N8_3_visual_hierarchy'
      ]
      
      designMapping.forEach((mapping, idx) => {
        const id = mapping.id
        const desc = getItemDescription(id)
        const diagnosisKey = designDiagnosisKeys[idx]
        const relevantPages = itemRelevance.get(id) || [validUrls[0]]
        
        // 기본 점수 계산
        let baseScore = (improvedScores as any)[diagnosisKey] || 0
        
        // 피드백 데이터 적용 (AI 학습 반영)
        const adjustedScore = applyFeedbackAdjustment(id, baseScore, validUrls[0])
        
        design_items_detail.push({
          item: desc?.name || mapping.key,
          item_id: id,
          category: '디자인',
          score: adjustedScore,  // 피드백 반영된 점수 사용
          description: (improvedDiagnoses as any)[diagnosisKey]?.description || desc?.description || '진단 정보가 없습니다.',
          recommendation: (improvedDiagnoses as any)[diagnosisKey]?.recommendation || '추가 권장사항이 없습니다.',
          principle: desc?.principle || '',
          why_important: desc?.why_important || '',
          evaluation_criteria: desc?.evaluation_criteria || '',
          affected_pages: relevantPages
        })
      })
      
      const summary = generateEvaluationSummary(convenience_items_detail, design_items_detail, overall, convenience, design)
      
      return c.json({
        mode: 'mgine',
        mode_name: 'MGINE UI/UX 분석',
        evaluation_standard: 'Nielsen 10 Heuristics (26개 세부 항목)',
        url: validUrls[0],
        analysis_date: new Date().toISOString(),
        version: '2.1',
        manual_selection: true,
        analyzed_pages: {
          total_count: pageResults.length,
          main_page: validUrls[0],
          sub_pages: validUrls.slice(1),
          note: `${pageResults.length}개 페이지를 종합 분석하여 평가했습니다.`
        },
        structure,
        predicted_score: {
          overall: Math.round(overall * 100) / 100,
          convenience: Math.round(convenience * 100) / 100,
          design: Math.round(design * 100) / 100
        },
        convenience_items: convenience_items_detail,
        design_items: design_items_detail,
        summary,
        recommendations: improvedDiagnoses.recommendations || []
      })
    }
    
    // === 기존 로직: 단일 URL로 자동 수집 ===
    if (!url || !url.startsWith('http')) {
      return c.json({ error: 'Invalid URL' }, 400)
    }
    
    // 평가 모드 검증
    if (mode !== 'mgine' && mode !== 'public') {
      return c.json({ error: 'Invalid mode. Must be "mgine" or "public"' }, 400)
    }

    // 1. 메인 + 서브 페이지 분석
    let pageResults: any[]
    let screenshots: string[] = []
    
    if (usePuppeteer && c.env.MYBROWSER) {
      // Puppeteer 기반 크롤링 (JavaScript 렌더링 지원)
      console.log('[Puppeteer] Using Puppeteer crawler')
      const browser = await puppeteer.launch(c.env.MYBROWSER)
      
      try {
        const crawlResult = await crawlWebsiteWithPuppeteer(browser, {
          url,
          maxSubPages: 9, // 메인 + 9 서브페이지 = 10개
          timeout: 30000,
          followRedirects: true
        })
        
        // Puppeteer 결과를 기존 포맷으로 변환
        pageResults = [
          {
            url: crawlResult.mainPage.url,
            structure: analyzeHTML(
              crawlResult.mainPage.html, 
              crawlResult.mainPage.url,
              crawlResult.mainPage.loadingUIDetection  // 동적 로딩 UI 탐지 결과 전달
            ),
            isMainPage: true
          },
          ...crawlResult.subPages.map(page => ({
            url: page.url,
            structure: analyzeHTML(
              page.html, 
              page.url,
              page.loadingUIDetection  // 서브페이지도 전달
            ),
            isMainPage: false
          }))
        ]
        
        // 스크린샷 저장 (메인 페이지만)
        if (crawlResult.mainPage.screenshot) {
          screenshots.push(crawlResult.mainPage.screenshot)
        }
        
        console.log(`[Puppeteer] Crawled ${pageResults.length} pages (${crawlResult.totalTime}ms)`)
        if (crawlResult.errors.length > 0) {
          console.warn(`[Puppeteer] Errors: ${crawlResult.errors.join(', ')}`)
        }
        
      } finally {
        await browser.close()
      }
    } else {
      // 기존 fetch 기반 크롤링
      console.log('[Fetch] Using traditional crawler')
      pageResults = await analyzeMultiplePages(url)
    }
    
    // 2. 결과 종합
    const structure = aggregateResults(pageResults)
    
    // 2.5. 항목별 영향 페이지 추적
    const itemRelevance = evaluateItemRelevance(pageResults)
    
    // 평가 모드에 따라 다른 로직 실행
    if (mode === 'public') {
      // ========================================
      // 공공 UI/UX 분석 (KRDS 기반)
      // 디지털정부서비스 UI/UX 가이드라인 43개 항목
      // ========================================
      
      let uiuxResult
      
      if (useAI) {
        // AI 기반 평가 (GPT-5)
        console.log('[AI] Using AI-based evaluation')
        try {
          const aiScores = await evaluateKRDSWithAI(structure.html, url)
          
          // AI 점수를 기존 포맷으로 변환
          uiuxResult = convertAIScoresToKRDSFormat(aiScores)
          uiuxResult.evaluation_method = 'AI (GPT-5)'
          
        } catch (error) {
          console.error('[AI] AI evaluation failed, falling back to HTML analysis:', error)
          // AI 실패 시 기존 HTML 분석으로 폴백
          uiuxResult = evaluateUIUXKRDS(structure, pageResults)
          uiuxResult.evaluation_method = 'HTML (AI failed)'
        }
      } else {
        // 기존 HTML 분석
        uiuxResult = evaluateUIUXKRDS(structure, pageResults)
        uiuxResult.evaluation_method = 'HTML'
      }
      
      return c.json({
        mode: 'public',
        mode_name: '공공 UI/UX 분석 (KRDS)',
        evaluation_standard: '디지털정부서비스 UI/UX 가이드라인 43개 항목',
        url,
        analyzed_at: new Date().toISOString(),
        total_pages: pageResults.length,
        analyzed_pages: pageResults.map(p => p.url),
        
        // UI/UX KRDS 평가 결과
        krds: {
          categories: uiuxResult.categories,
          compliance_level: uiuxResult.compliance_level,
          convenience_score: uiuxResult.convenience_score,
          compliant_count: uiuxResult.compliant_count,
          total_count: uiuxResult.total_count,
          not_applicable_count: uiuxResult.not_applicable_count,
          compliance_rate: uiuxResult.compliance_rate,
          scores: uiuxResult.scores,
          issues: uiuxResult.issues,
        },
        
        // HTML 구조 정보
        structure: {
          navigation: structure.navigation,
          breadcrumb: structure.breadcrumb,
          search: structure.search,
          accessibility: structure.accessibility,
          content: structure.content,
          visual: structure.visual,
        },
        
        metadata: {
          category_count: 6,
          item_count: 43,
          evaluation_method: 'KRDS UI/UX (디지털정부서비스 가이드라인)',
          categories: ['아이덴티티(5)', '탐색(5)', '방문(1)', '검색(12)', '로그인(7)', '신청(13)']
        }
      })
    }

    // ========================================
    // MGINE UI/UX 분석 (Nielsen 기반) - 기존 로직
    // ========================================

    // 3. 개선된 Nielsen 평가 (22개 독립 항목)
    const improvedScores = calculateImprovedNielsen(structure)
    const improvedDiagnoses = generateImprovedDiagnoses(structure, improvedScores, url)
    
    // 4. 편의성/디자인 점수 계산 (개선된 항목 기준)
    const convenienceItems = [
      improvedScores.N1_1_current_location,
      improvedScores.N1_2_loading_status,
      improvedScores.N1_3_action_feedback,
      improvedScores.N2_1_familiar_terms,
      improvedScores.N2_2_natural_flow,
      improvedScores.N3_1_undo_redo,
      improvedScores.N3_3_flexible_navigation,
      improvedScores.N4_2_terminology_consistency,  // N4.2 편의성으로 이동
      improvedScores.N4_3_standard_compliance,      // N4.3 편의성으로 이동
      improvedScores.N5_1_input_validation,
      improvedScores.N5_2_confirmation_dialog,
      improvedScores.N5_3_constraints,
      improvedScores.N6_2_recognition_cues,
      improvedScores.N6_3_memory_load,
      improvedScores.N7_1_quick_access,
      improvedScores.N7_2_customization,
      improvedScores.N7_3_search_filter,
      improvedScores.N9_2_recovery_support,
      improvedScores.N9_4_error_guidance,
      improvedScores.N10_1_help_visibility,
      improvedScores.N10_2_documentation,
    ]
    
    const designItems = [
      improvedScores.N2_3_real_world_metaphor,
      improvedScores.N4_1_visual_consistency,
      improvedScores.N8_1_essential_info,
      improvedScores.N8_2_clean_interface,
      improvedScores.N8_3_visual_hierarchy,
    ]
    
    const convenience = convenienceItems.reduce((sum, s) => sum + s, 0) / convenienceItems.length
    const design = designItems.reduce((sum, s) => sum + s, 0) / designItems.length
    
    // 전체 점수 = 26개 항목의 평균
    const allItems = [...convenienceItems, ...designItems]
    const overall = allItems.reduce((sum, s) => sum + s, 0) / allItems.length
    
    // 5. 응답 포맷 (convenience_items, design_items 포함)
    const convenience_items_detail: any[] = []
    const design_items_detail: any[] = []
    
    // 편의성 항목 상세 (ID 매핑 추가)
    const convenienceMapping = [
      { key: 'N1.1_현재_위치', id: 'N1_1' },
      { key: 'N1.2_로딩_상태', id: 'N1_2' },
      { key: 'N1.3_행동_피드백', id: 'N1_3' },
      { key: 'N2.1_친숙한_용어', id: 'N2_1' },
      { key: 'N2.2_자연스러운_흐름', id: 'N2_2' },
      { key: 'N3.1_실행_취소', id: 'N3_1' },
      { key: 'N3.3_유연한_네비게이션', id: 'N3_3' },
      { key: 'N4.2_용어_일관성', id: 'N4_2' },
      { key: 'N4.3_표준_준수', id: 'N4_3' },
      { key: 'N5.1_입력_검증', id: 'N5_1' },
      { key: 'N5.2_확인_대화상자', id: 'N5_2' },
      { key: 'N5.3_제약_조건_표시', id: 'N5_3' },
      { key: 'N6.2_인식_단서', id: 'N6_2' },
      { key: 'N6.3_기억_부담', id: 'N6_3' },
      { key: 'N7.1_빠른_접근', id: 'N7_1' },
      { key: 'N7.2_맞춤_설정', id: 'N7_2' },
      { key: 'N7.3_검색_필터', id: 'N7_3' },
      { key: 'N9.2_복구_지원', id: 'N9_2' },
      { key: 'N9.4_오류_안내', id: 'N9_4' },
      { key: 'N10.1_도움말_가시성', id: 'N10_1' },
      { key: 'N10.2_문서화', id: 'N10_2' },
    ]
    
    const convenienceDiagnosisKeys = [
      'N1_1_current_location', 'N1_2_loading_status', 'N1_3_action_feedback',
      'N2_1_familiar_terms', 'N2_2_natural_flow',
      'N3_1_undo_redo', 'N3_3_flexible_navigation',
      'N4_2_terminology_consistency', 'N4_3_standard_compliance',
      'N5_1_input_validation', 'N5_2_confirmation_dialog', 'N5_3_constraints',
      'N6_2_recognition_cues', 'N6_3_memory_load',
      'N7_1_quick_access', 'N7_2_customization', 'N7_3_search_filter',
      'N9_2_recovery_support', 'N9_4_error_guidance',
      'N10_1_help_visibility', 'N10_2_documentation',
    ]
    
    convenienceItems.forEach((score, idx) => {
      const { key, id } = convenienceMapping[idx]
      const desc = getItemDescription(id)
      const diagnosisKey = convenienceDiagnosisKeys[idx]
      const relevantPages = itemRelevance.get(id) || [url]
      
      // 기본 점수
      let baseScore = Math.round(score * 10) / 10
      
      // 피드백 데이터 적용 (AI 학습 반영)
      const adjustedScore = applyFeedbackAdjustment(id, baseScore, url)
      
      convenience_items_detail.push({
        item: desc?.name || key,
        item_id: id,
        category: '편의성',
        score: adjustedScore,  // 피드백 반영된 점수 사용
        description: (improvedDiagnoses as any)[diagnosisKey]?.description || desc?.description || '',
        recommendation: (improvedDiagnoses as any)[diagnosisKey]?.recommendation || '',
        principle: desc?.principle || '',
        why_important: desc?.why_important || '',
        evaluation_criteria: desc?.evaluation_criteria || '',
        affected_pages: relevantPages
      })
    })
    
    // 디자인 항목 상세 (ID 매핑 추가)
    const designMapping = [
      { key: 'N2.3_현실_세계_은유', id: 'N2_3' },
      { key: 'N4.1_시각적_일관성', id: 'N4_1' },
      { key: 'N8.1_핵심_정보', id: 'N8_1' },
      { key: 'N8.2_깔끔한_인터페이스', id: 'N8_2' },
      { key: 'N8.3_시각적_계층', id: 'N8_3' },
    ]
    
    const designDiagnosisKeys = [
      'N2_3_real_world_metaphor',
      'N4_1_visual_consistency',
      'N8_1_essential_info', 'N8_2_clean_interface', 'N8_3_visual_hierarchy',
    ]
    
    designItems.forEach((score, idx) => {
      const { key, id } = designMapping[idx]
      const desc = getItemDescription(id)
      const diagnosisKey = designDiagnosisKeys[idx]
      const relevantPages = itemRelevance.get(id) || [url]
      
      // 기본 점수
      let baseScore = Math.round(score * 10) / 10
      
      // 피드백 데이터 적용 (AI 학습 반영)
      const adjustedScore = applyFeedbackAdjustment(id, baseScore, url)
      
      design_items_detail.push({
        item: desc?.name || key,
        item_id: id,
        category: '디자인',
        score: adjustedScore,  // 피드백 반영된 점수 사용
        description: (improvedDiagnoses as any)[diagnosisKey]?.description || desc?.description || '',
        recommendation: (improvedDiagnoses as any)[diagnosisKey]?.recommendation || '',
        principle: desc?.principle || '',
        why_important: desc?.why_important || '',
        evaluation_criteria: desc?.evaluation_criteria || '',
        affected_pages: relevantPages
      })
    })
    
    // 6. 개선 제안 생성
    const recommendations = generateImprovedRecommendations(structure, improvedScores)

    // 응답
    return c.json({
      mode: 'mgine',
      mode_name: 'MGINE UI/UX 분석',
      evaluation_standard: 'Nielsen 10 Heuristics (22개 세부 항목)',
      url,
      analysis_date: new Date().toISOString(),
      version: '3.0-improved',
      analyzed_pages: {
        total_count: pageResults.length,
        main_page: pageResults.find(p => p.isMainPage)?.url || url,
        sub_pages: pageResults.filter(p => !p.isMainPage).map(p => p.url),
        note: `${pageResults.length}개 페이지를 종합 분석하여 평가했습니다.`
      },
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
        nielsen_scores: improvedScores,
        nielsen_diagnoses: improvedDiagnoses
      },
      convenience_items: convenience_items_detail,
      design_items: design_items_detail,
      improvements: {
        total_items: 26,  // 총 26개 평가 항목 (편의성 21개 + 디자인 5개)
        removed_duplicates: 3,  // N3.2, N9.1, N9.3 제거
        new_items: 3,  // N7.3, N9.2, N9.4 추가/강화
        score_levels: 7  // 2단계 → 7단계 세밀화
      },
      summary: generateEvaluationSummary(convenience_items_detail, design_items_detail, overall, convenience, design),
      recommendations
    })

  } catch (error) {
    console.error('Analysis error:', error)
    
    // 에러 타입별 상세 메시지
    let errorMessage = 'Unknown error'
    let errorDetails = ''
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      // CORS 에러
      if (errorMessage.includes('CORS') || errorMessage.includes('cross-origin')) {
        errorDetails = '해당 웹사이트가 외부 접근을 차단하고 있습니다. CORS 정책으로 인해 분석이 불가능합니다.'
      }
      // 네트워크 에러
      else if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        errorDetails = '웹사이트에 접속할 수 없습니다. URL을 확인하거나 나중에 다시 시도해주세요.'
      }
      // 타임아웃
      else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        errorDetails = '웹사이트 응답 시간이 너무 깁니다. 나중에 다시 시도해주세요.'
      }
      // 404 등 상태 코드
      else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        errorDetails = '해당 웹사이트를 찾을 수 없습니다. URL을 확인해주세요.'
      }
      // 500 서버 에러
      else if (errorMessage.includes('500') || errorMessage.includes('503')) {
        errorDetails = '웹사이트 서버에 문제가 있습니다. 나중에 다시 시도해주세요.'
      }
    }
    
    return c.json({ 
      error: '분석 실패',
      message: errorMessage,
      details: errorDetails || '웹사이트 분석 중 오류가 발생했습니다.',
      suggestion: 'URL이 올바른지 확인하고, 웹사이트가 정상적으로 작동하는지 확인해주세요.'
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

/**
 * 가중치 정보 조회 API
 */
app.get('/api/weights', (c) => {
  return c.json({
    version: getWeightsVersion(),
    last_updated: getWeightsLastUpdated(),
    reference_statistics: loadReferenceStatistics(),
    weights: loadWeights(),
    usage_guide: {
      description: "가중치 조정 방법: config/weights.json 파일을 수정한 후 서비스를 재시작하세요.",
      example: "N1_1_current_location.has_feature_bonus를 1.5에서 2.0으로 변경하면 Breadcrumb의 중요도가 높아집니다."
    }
  })
})

/**
 * 참고 데이터 통계 조회 API
 */
app.get('/api/reference-stats', (c) => {
  return c.json({
    statistics: referenceData.statistics,
    agencies_count: referenceData.agencies.length,
    sample_agencies: referenceData.agencies.slice(0, 5).map(a => ({
      site_name: a.site_name,
      score: a.final_nielsen_score
    })),
    usage_note: "새로운 국민평가 데이터가 나오면 analysis/output/final_integrated_scores.json 파일을 교체하고 서비스를 재시작하세요."
  })
})

/**
 * 관리자 점수 수정 저장 API
 * POST /api/corrections
 */
app.post('/api/corrections', async (c) => {
  const db = c.env.DB
  
  if (!db) {
    return c.json({ error: 'Database not configured' }, 500)
  }
  
  try {
    const body = await c.req.json<CorrectionRequest>()
    
    // 필수 필드 검증
    if (!body.url || !body.item_id || !body.item_name || 
        body.original_score === undefined || body.corrected_score === undefined) {
      return c.json({ error: 'Missing required fields' }, 400)
    }
    
    // 점수 범위 검증 (2.0 ~ 5.0)
    if (body.corrected_score < 2.0 || body.corrected_score > 5.0) {
      return c.json({ error: 'Corrected score must be between 2.0 and 5.0' }, 400)
    }
    
    const score_diff = body.corrected_score - body.original_score
    
    // 데이터베이스에 저장
    const result = await db.prepare(`
      INSERT INTO admin_corrections (
        url, evaluated_at, item_id, item_name,
        original_score, corrected_score, score_diff,
        html_structure, correction_reason, admin_comment, corrected_diagnosis, corrected_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.url,
      body.evaluated_at,
      body.item_id,
      body.item_name,
      body.original_score,
      body.corrected_score,
      score_diff,
      body.html_structure || null,
      body.correction_reason || null,
      body.admin_comment || null,
      body.corrected_diagnosis || null,
      body.corrected_by || 'admin'
    ).run()
    
    return c.json({
      success: true,
      correction_id: result.meta.last_row_id,
      message: '점수 수정이 저장되었습니다. 학습 데이터로 활용됩니다.',
      score_diff
    })
    
  } catch (error) {
    console.error('Error saving correction:', error)
    return c.json({ error: 'Failed to save correction' }, 500)
  }
})



/**
 * 특정 URL의 수정 이력 조회 API
 * GET /api/corrections/:url
 */
app.get('/api/corrections/:url', async (c) => {
  const db = c.env.DB
  
  if (!db) {
    return c.json({ error: 'Database not configured' }, 500)
  }
  
  try {
    const url = decodeURIComponent(c.req.param('url'))
    
    const results = await db.prepare(`
      SELECT * FROM admin_corrections
      WHERE url = ?
      ORDER BY corrected_at DESC
    `).bind(url).all<AdminCorrection>()
    
    return c.json({
      url,
      corrections: results.results,
      count: results.results.length
    })
    
  } catch (error) {
    console.error('Error fetching corrections:', error)
    return c.json({ error: 'Failed to fetch corrections' }, 500)
  }
})

/**
 * 관리자 평가 수정 저장 API
 * POST /api/admin/corrections
 */
app.post('/api/admin/corrections', authMiddleware, adminMiddleware, async (c) => {
  const { DB } = c.env
  const user = c.get('user')
  
  try {
    const correction: CorrectionRequest = await c.req.json()
    
    // 검증
    if (!correction.url || !correction.item_id || !correction.item_name) {
      return c.json({ success: false, error: '필수 정보가 누락되었습니다.' }, 400)
    }
    
    if (correction.corrected_score < 0 || correction.corrected_score > 5) {
      return c.json({ success: false, error: '점수는 0~5 사이여야 합니다.' }, 400)
    }
    
    const score_diff = correction.corrected_score - correction.original_score
    
    // 보정 데이터 저장
    const result = await DB.prepare(`
      INSERT INTO admin_corrections (
        url, evaluated_at, item_id, item_name,
        original_score, corrected_score, score_diff,
        html_structure, correction_reason, admin_comment,
        corrected_diagnosis, corrected_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      correction.url,
      correction.evaluated_at,
      correction.item_id,
      correction.item_name,
      correction.original_score,
      correction.corrected_score,
      score_diff,
      correction.html_structure || null,
      correction.correction_reason || null,
      correction.admin_comment || null,
      correction.corrected_diagnosis || null,
      user.id
    ).run()
    
    // 학습 데이터 요약 업데이트
    await updateLearningDataSummary(DB, correction.item_id, correction.item_name)
    
    return c.json({
      success: true,
      message: '평가 수정이 저장되었습니다.',
      correction_id: result.meta.last_row_id
    })
  } catch (error) {
    console.error('Error saving correction:', error)
    return c.json({ success: false, error: '평가 수정 저장 중 오류가 발생했습니다.' }, 500)
  }
})

/**
 * 학습 데이터 요약 업데이트 함수
 */
async function updateLearningDataSummary(db: D1Database, itemId: string, itemName: string) {
  try {
    // 해당 항목의 모든 보정 데이터 집계
    const stats = await db.prepare(`
      SELECT 
        COUNT(*) as correction_count,
        AVG(score_diff) as avg_score_diff,
        AVG(original_score) as avg_original_score,
        AVG(corrected_score) as avg_corrected_score
      FROM admin_corrections
      WHERE item_id = ?
    `).bind(itemId).first() as any
    
    if (!stats || stats.correction_count === 0) return
    
    // learning_data_summary 업데이트 또는 삽입
    await db.prepare(`
      INSERT INTO learning_data_summary (
        item_id, item_name, correction_count,
        avg_score_diff, avg_original_score, avg_corrected_score,
        last_updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(item_id) DO UPDATE SET
        correction_count = excluded.correction_count,
        avg_score_diff = excluded.avg_score_diff,
        avg_original_score = excluded.avg_original_score,
        avg_corrected_score = excluded.avg_corrected_score,
        last_updated_at = datetime('now')
    `).bind(
      itemId,
      itemName,
      stats.correction_count,
      stats.avg_score_diff,
      stats.avg_original_score,
      stats.avg_corrected_score
    ).run()
    
  } catch (error) {
    console.error('Error updating learning data summary:', error)
  }
}

/**
 * 관리자 - 모든 보정 데이터 조회 API
 * GET /api/admin/corrections
 */
app.get('/api/admin/corrections', authMiddleware, adminMiddleware, async (c) => {
  const { DB } = c.env
  const limit = parseInt(c.req.query('limit') || '50')
  const offset = parseInt(c.req.query('offset') || '0')
  
  try {
    const results = await DB.prepare(`
      SELECT ac.*, u.name as admin_name, u.email as admin_email
      FROM admin_corrections ac
      LEFT JOIN users u ON ac.corrected_by = u.id
      ORDER BY ac.corrected_at DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all()
    
    const countResult = await DB.prepare(`
      SELECT COUNT(*) as total FROM admin_corrections
    `).first() as any
    
    return c.json({
      success: true,
      corrections: results.results,
      total: countResult?.total || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error fetching corrections:', error)
    return c.json({ success: false, error: '보정 데이터 조회 중 오류가 발생했습니다.' }, 500)
  }
})

/**
 * 관리자 - 특정 보정 데이터 삭제 API
 * DELETE /api/admin/corrections/:id
 */
app.delete('/api/admin/corrections/:id', authMiddleware, adminMiddleware, async (c) => {
  const { DB } = c.env
  const id = parseInt(c.req.param('id'))
  
  try {
    await DB.prepare('DELETE FROM admin_corrections WHERE id = ?').bind(id).run()
    
    return c.json({
      success: true,
      message: '보정 데이터가 삭제되었습니다.'
    })
  } catch (error) {
    console.error('Error deleting correction:', error)
    return c.json({ success: false, error: '보정 데이터 삭제 중 오류가 발생했습니다.' }, 500)
  }
})

/**
 * 학습 데이터 인사이트 조회 API
 * GET /api/learning-insights
 */
app.get('/api/learning-insights', async (c) => {
  const db = c.env.DB
  
  if (!db) {
    return c.json({ error: 'Database not configured' }, 500)
  }
  
  try {
    // 학습 데이터 요약 뷰 조회
    const summary = await db.prepare(`
      SELECT * FROM learning_data_summary
      ORDER BY correction_count DESC
    `).all<LearningDataSummary>()
    
    // 전체 수정 통계
    const stats = await db.prepare(`
      SELECT 
        COUNT(*) as total_corrections,
        COUNT(DISTINCT url) as unique_urls,
        COUNT(DISTINCT item_id) as corrected_items,
        AVG(score_diff) as avg_score_diff,
        COUNT(CASE WHEN used_for_learning = 0 THEN 1 END) as pending_learning
      FROM admin_corrections
    `).first()
    
    // 가장 많이 수정된 항목 Top 5
    const topItems = await db.prepare(`
      SELECT 
        item_id, item_name,
        COUNT(*) as correction_count,
        AVG(score_diff) as avg_adjustment
      FROM admin_corrections
      GROUP BY item_id, item_name
      ORDER BY correction_count DESC
      LIMIT 5
    `).all()
    
    return c.json({
      summary: summary.results,
      statistics: stats,
      top_corrected_items: topItems.results,
      recommendations: summary.results
        .filter(s => s.adjustment_suggestion !== '적정')
        .map(s => ({
          item_id: s.item_id,
          item_name: s.item_name,
          suggestion: s.adjustment_suggestion,
          evidence: `${s.correction_count}건의 수정 데이터, 평균 ${s.avg_score_diff.toFixed(2)}점 차이`
        }))
    })
    
  } catch (error) {
    console.error('Error fetching learning insights:', error)
    return c.json({ error: 'Failed to fetch learning insights' }, 500)
  }
})

/**
 * 가중치 자동 조정 제안 API
 * GET /api/weight-suggestions
 */
app.get('/api/weight-suggestions', async (c) => {
  const db = c.env.DB
  
  if (!db) {
    return c.json({ error: 'Database not configured' }, 500)
  }
  
  try {
    // 학습 데이터 요약 조회
    const summary = await db.prepare(`
      SELECT * FROM learning_data_summary
      ORDER BY correction_count DESC
    `).all<LearningDataSummary>()
    
    // 가중치 조정 제안 생성
    const suggestions = generateWeightAdjustments(summary.results)
    
    return c.json({
      suggestions,
      total_suggestions: suggestions.length,
      high_confidence: suggestions.filter(s => s.confidence === 'high').length,
      medium_confidence: suggestions.filter(s => s.confidence === 'medium').length,
      usage: {
        description: "가중치 조정 제안을 자동으로 적용하려면 POST /api/weight-suggestions/apply 를 호출하세요.",
        parameters: {
          min_confidence: "적용할 최소 신뢰도 ('high', 'medium', 'low')"
        }
      }
    })
    
  } catch (error) {
    console.error('Error generating weight suggestions:', error)
    return c.json({ error: 'Failed to generate weight suggestions' }, 500)
  }
})

/**
 * 가중치 자동 조정 적용 API (미구현 - 추후 자동화)
 * POST /api/weight-suggestions/apply
 */
app.post('/api/weight-suggestions/apply', async (c) => {
  return c.json({
    message: '가중치 자동 적용 기능은 추후 구현 예정입니다.',
    current_approach: 'config/weights.json 파일을 수동으로 수정한 후 서비스를 재시작하세요.',
    note: '학습 데이터가 충분히 쌓이면 (100건 이상) 자동 적용을 권장합니다.'
  })
})

// ==================== 인증 API ====================

/**
 * 회원가입 API
 * POST /api/auth/signup
 */
/**
 * 로그인 API
 * POST /api/auth/login
 */
app.post('/api/auth/login', async (c) => {
  try {
    const { DB } = c.env
    const { email, password } = await c.req.json() as LoginRequest

    // 사용자 조회
    const user = await DB.prepare(
      'SELECT * FROM users WHERE email = ? AND is_active = 1'
    ).bind(email).first() as any

    if (!user) {
      return c.json({ success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401)
    }

    // 비밀번호 검증
    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      return c.json({ success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401)
    }

    // 세션 생성 (24시간 유효)
    const sessionId = generateSessionId()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    await DB.prepare(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
    ).bind(sessionId, user.id, expiresAt).run()

    // 마지막 로그인 시간 업데이트
    await DB.prepare(
      'UPDATE users SET last_login_at = datetime("now") WHERE id = ?'
    ).bind(user.id).run()

    return c.json({
      success: true,
      session_id: sessionId,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ success: false, error: '로그인 처리 중 오류가 발생했습니다.' }, 500)
  }
})

/**
 * 로그아웃 API
 * POST /api/auth/logout
 */
app.post('/api/auth/logout', authMiddleware, async (c) => {
  try {
    const { DB } = c.env
    const sessionId = c.req.header('X-Session-ID') || c.req.query('session_id')

    if (sessionId) {
      await DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run()
    }

    return c.json({ success: true, message: '로그아웃되었습니다.' })
  } catch (error) {
    console.error('Logout error:', error)
    return c.json({ success: false, error: '로그아웃 처리 중 오류가 발생했습니다.' }, 500)
  }
})

/**
 * 세션 검증 API
 * GET /api/auth/me
 */
app.get('/api/auth/me', authMiddleware, async (c) => {
  const user = c.get('user')
  return c.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  })
})

/**
 * 관리자 전용 - 모든 사용자 조회 API
 * GET /api/admin/users
 */
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (c) => {
  try {
    const { DB } = c.env
    const result = await DB.prepare(
      'SELECT id, email, name, role, created_at, last_login_at, is_active FROM users ORDER BY created_at DESC'
    ).all()

    return c.json({
      success: true,
      users: result.results
    })
  } catch (error) {
    console.error('Get users error:', error)
    return c.json({ success: false, error: '사용자 목록 조회 중 오류가 발생했습니다.' }, 500)
  }
})

/**
 * KRDS Corrections API
 * POST /api/krds/corrections - KRDS 평가 결과 수정 저장
 */
app.post('/api/krds/corrections', async (c) => {
  const db = c.env.DB
  
  if (!db) {
    return c.json({ error: 'Database not configured' }, 500)
  }
  
  try {
    const body = await c.req.json()
    
    // 필수 필드 검증
    if (!body.url || !body.item_id || !body.item_name || 
        body.original_score === undefined || body.corrected_score === undefined) {
      return c.json({ error: 'Missing required fields' }, 400)
    }
    
    // 점수 범위 검증 (2.0 ~ 5.0)
    if (body.corrected_score < 2.0 || body.corrected_score > 5.0) {
      return c.json({ error: 'Corrected score must be between 2.0 and 5.0' }, 400)
    }
    
    const score_diff = body.corrected_score - body.original_score
    
    // 데이터베이스에 저장
    const result = await db.prepare(`
      INSERT INTO krds_corrections (
        url, evaluated_at, item_id, item_name,
        original_score, corrected_score, score_diff,
        html_structure, affected_pages, correction_reason, admin_comment, corrected_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.url,
      body.evaluated_at,
      body.item_id,
      body.item_name,
      body.original_score,
      body.corrected_score,
      score_diff,
      body.html_structure || null,
      body.affected_pages ? JSON.stringify(body.affected_pages) : null,
      body.correction_reason || null,
      body.admin_comment || null,
      body.corrected_by || 'admin'
    ).run()
    
    return c.json({
      success: true,
      correction_id: result.meta.last_row_id,
      message: 'KRDS 수정 사항이 저장되었습니다. 이 데이터는 향후 평가 로직 개선에 활용됩니다.'
    })
  } catch (error: any) {
    console.error('KRDS Correction save error:', error)
    return c.json({ 
      error: 'Failed to save correction',
      details: error.message 
    }, 500)
  }
})

/**
 * GET /api/krds/corrections/:url - 특정 URL의 KRDS 수정 이력 조회
 */
app.get('/api/krds/corrections/:url', async (c) => {
  const db = c.env.DB
  const url = c.req.param('url')
  
  if (!db) {
    return c.json({ error: 'Database not configured' }, 500)
  }
  
  try {
    const results = await db.prepare(`
      SELECT * FROM krds_corrections
      WHERE url = ?
      ORDER BY corrected_at DESC
    `).bind(decodeURIComponent(url)).all()
    
    return c.json({
      url: decodeURIComponent(url),
      corrections: results.results,
      count: results.results.length
    })
  } catch (error: any) {
    console.error('Error fetching KRDS corrections:', error)
    return c.json({ error: 'Failed to fetch corrections' }, 500)
  }
})

/**
 * GET /api/krds/learning-summary - KRDS 학습 데이터 요약
 */
app.get('/api/krds/learning-summary', async (c) => {
  const db = c.env.DB
  
  if (!db) {
    return c.json({ error: 'Database not configured' }, 500)
  }
  
  try {
    const summary = await db.prepare(`
      SELECT * FROM krds_learning_data_summary
      ORDER BY correction_count DESC
    `).all()
    
    return c.json({
      learning_data: summary.results,
      total_items: summary.results.length,
      message: '이 데이터는 KRDS 평가 로직 개선에 활용됩니다.'
    })
  } catch (error: any) {
    console.error('Error fetching KRDS learning summary:', error)
    return c.json({ error: 'Failed to fetch learning summary' }, 500)
  }
})

// ==================== Contact Form API ====================
// 문의하기 폼 제출
app.post('/api/contact', async (c) => {
  const db = c.env.DB
  
  if (!db) {
    return c.json({ success: false, error: 'Database not configured' }, 500)
  }
  
  try {
    const body = await c.req.json()
    const {
      company,
      position,
      name,
      phone,
      email,
      url,
      project_type, // 배열
      message,
      budget,
      schedule,
      privacy_agreed
    } = body
    
    // 필수 항목 검증
    if (!company || !name || !phone || !email || !message || !privacy_agreed) {
      return c.json({ 
        success: false, 
        error: '필수 항목을 모두 입력해주세요.' 
      }, 400)
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return c.json({ 
        success: false, 
        error: '올바른 이메일 형식이 아닙니다.' 
      }, 400)
    }
    
    // 전화번호 검증 (숫자와 하이픈만)
    const phoneRegex = /^[0-9-]+$/
    if (!phoneRegex.test(phone)) {
      return c.json({ 
        success: false, 
        error: '올바른 전화번호 형식이 아닙니다.' 
      }, 400)
    }
    
    // 프로젝트 타입 배열을 문자열로 변환
    const projectTypeStr = Array.isArray(project_type) 
      ? project_type.join(', ') 
      : project_type || ''
    
    // 데이터베이스에 저장
    await db.prepare(`
      INSERT INTO contact_inquiries (
        company, position, name, phone, email, url,
        project_type, message, budget, schedule,
        privacy_agreed, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
    `).bind(
      company,
      position || null,
      name,
      phone,
      email,
      url || null,
      projectTypeStr,
      message,
      budget || null,
      schedule || null,
      privacy_agreed ? 1 : 0
    ).run()
    
    return c.json({ 
      success: true, 
      message: '문의가 성공적으로 접수되었습니다.' 
    })
    
  } catch (error: any) {
    console.error('Contact form error:', error)
    return c.json({ 
      success: false, 
      error: '문의 접수 중 오류가 발생했습니다.' 
    }, 500)
  }
})

// 문의 목록 조회 (관리자 전용)
app.get('/api/admin/contacts', adminMiddleware, async (c) => {
  const db = c.env.DB
  
  if (!db) {
    return c.json({ error: 'Database not configured' }, 500)
  }
  
  try {
    const { page = '1', limit = '20', status = 'all' } = c.req.query()
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum
    
    let query = `SELECT * FROM contact_inquiries`
    let countQuery = `SELECT COUNT(*) as total FROM contact_inquiries`
    
    if (status !== 'all') {
      query += ` WHERE status = ?`
      countQuery += ` WHERE status = ?`
    }
    
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
    
    // 데이터 조회
    const stmt = status !== 'all' 
      ? db.prepare(query).bind(status, limitNum, offset)
      : db.prepare(query).bind(limitNum, offset)
    
    const countStmt = status !== 'all'
      ? db.prepare(countQuery).bind(status)
      : db.prepare(countQuery)
    
    const [contactsResult, countResult] = await Promise.all([
      stmt.all(),
      countStmt.first()
    ])
    
    return c.json({
      contacts: contactsResult.results,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: countResult?.total || 0,
        totalPages: Math.ceil((countResult?.total || 0) / limitNum)
      }
    })
    
  } catch (error: any) {
    console.error('Error fetching contacts:', error)
    return c.json({ error: 'Failed to fetch contacts' }, 500)
  }
})

// 문의 상세 조회 (관리자 전용)
app.get('/api/admin/contacts/:id', adminMiddleware, async (c) => {
  const db = c.env.DB
  const { id } = c.req.param()
  
  if (!db) {
    return c.json({ error: 'Database not configured' }, 500)
  }
  
  try {
    const contact = await db.prepare(`
      SELECT * FROM contact_inquiries WHERE id = ?
    `).bind(id).first()
    
    if (!contact) {
      return c.json({ error: 'Contact not found' }, 404)
    }
    
    return c.json({ contact })
    
  } catch (error: any) {
    console.error('Error fetching contact:', error)
    return c.json({ error: 'Failed to fetch contact' }, 500)
  }
})

// 문의 상태 업데이트 (관리자 전용)
app.patch('/api/admin/contacts/:id', adminMiddleware, async (c) => {
  const db = c.env.DB
  const { id } = c.req.param()
  
  if (!db) {
    return c.json({ error: 'Database not configured' }, 500)
  }
  
  try {
    const { status, admin_note } = await c.req.json()
    
    if (!['pending', 'processing', 'completed', 'rejected'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400)
    }
    
    await db.prepare(`
      UPDATE contact_inquiries 
      SET status = ?, admin_note = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(status, admin_note || null, id).run()
    
    return c.json({ success: true, message: 'Contact status updated' })
    
  } catch (error: any) {
    console.error('Error updating contact:', error)
    return c.json({ error: 'Failed to update contact' }, 500)
  }
})

// ==================== Admin Account Management API ====================
// 관리자 계정 목록 조회
app.get('/api/admin/accounts', adminMiddleware, async (c) => {
  const db = c.env.DB
  
  if (!db) {
    return c.json({ error: 'Database not configured' }, 500)
  }
  
  try {
    const result = await db.prepare(`
      SELECT id, email, name, role, is_active, created_at, last_login_at
      FROM users
      ORDER BY created_at DESC
    `).all()
    
    return c.json({ accounts: result.results })
    
  } catch (error: any) {
    console.error('Error fetching accounts:', error)
    return c.json({ error: 'Failed to fetch accounts' }, 500)
  }
})

// 관리자 계정 생성
app.post('/api/admin/accounts', adminMiddleware, async (c) => {
  const db = c.env.DB
  
  if (!db) {
    return c.json({ error: 'Database not configured' }, 500)
  }
  
  try {
    const { email, password, name, role } = await c.req.json()
    
    // 유효성 검증
    if (!email || !password || !name || !role) {
      return c.json({ error: 'All fields are required' }, 400)
    }
    
    if (!validateEmail(email)) {
      return c.json({ error: 'Invalid email format' }, 400)
    }
    
    if (!validatePassword(password)) {
      return c.json({ 
        error: 'Password must be at least 8 characters with uppercase, lowercase, and number' 
      }, 400)
    }
    
    if (!['user', 'admin'].includes(role)) {
      return c.json({ error: 'Invalid role' }, 400)
    }
    
    // 이메일 중복 확인
    const existing = await db.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(email).first()
    
    if (existing) {
      return c.json({ error: 'Email already exists' }, 400)
    }
    
    // 비밀번호 해시
    const passwordHash = await hashPassword(password)
    
    // 계정 생성
    await db.prepare(`
      INSERT INTO users (email, password_hash, name, role, is_active, created_at)
      VALUES (?, ?, ?, ?, 1, datetime('now'))
    `).bind(email, passwordHash, name, role).run()
    
    return c.json({ 
      success: true, 
      message: 'Account created successfully' 
    })
    
  } catch (error: any) {
    console.error('Error creating account:', error)
    return c.json({ error: 'Failed to create account' }, 500)
  }
})

// 관리자 계정 수정
app.patch('/api/admin/accounts/:id', adminMiddleware, async (c) => {
  const db = c.env.DB
  const { id } = c.req.param()
  
  if (!db) {
    return c.json({ error: 'Database not configured' }, 500)
  }
  
  try {
    const { name, role, is_active, password } = await c.req.json()
    
    // 기본 정보 업데이트
    if (name || role !== undefined || is_active !== undefined) {
      const updates: string[] = []
      const bindings: any[] = []
      
      if (name) {
        updates.push('name = ?')
        bindings.push(name)
      }
      if (role && ['user', 'admin'].includes(role)) {
        updates.push('role = ?')
        bindings.push(role)
      }
      if (is_active !== undefined) {
        updates.push('is_active = ?')
        bindings.push(is_active ? 1 : 0)
      }
      
      bindings.push(id)
      
      await db.prepare(`
        UPDATE users SET ${updates.join(', ')} WHERE id = ?
      `).bind(...bindings).run()
    }
    
    // 비밀번호 변경
    if (password) {
      if (!validatePassword(password)) {
        return c.json({ 
          error: 'Password must be at least 8 characters with uppercase, lowercase, and number' 
        }, 400)
      }
      
      const passwordHash = await hashPassword(password)
      await db.prepare(`
        UPDATE users SET password_hash = ? WHERE id = ?
      `).bind(passwordHash, id).run()
    }
    
    return c.json({ 
      success: true, 
      message: 'Account updated successfully' 
    })
    
  } catch (error: any) {
    console.error('Error updating account:', error)
    return c.json({ error: 'Failed to update account' }, 500)
  }
})

// 관리자 계정 삭제
app.delete('/api/admin/accounts/:id', adminMiddleware, async (c) => {
  const db = c.env.DB
  const { id } = c.req.param()
  const sessionId = c.req.header('X-Session-ID')
  
  if (!db || !sessionId) {
    return c.json({ error: 'Database not configured or session missing' }, 500)
  }
  
  try {
    // 현재 로그인한 사용자 확인
    const session = await db.prepare(`
      SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime('now')
    `).bind(sessionId).first()
    
    if (!session) {
      return c.json({ error: 'Invalid session' }, 401)
    }
    
    // 자기 자신을 삭제하려는지 확인
    if (session.user_id.toString() === id) {
      return c.json({ error: 'Cannot delete your own account' }, 400)
    }
    
    // 계정 삭제 (세션도 함께 삭제됨 - CASCADE)
    await db.prepare(`
      DELETE FROM users WHERE id = ?
    `).bind(id).run()
    
    return c.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    })
    
  } catch (error: any) {
    console.error('Error deleting account:', error)
    return c.json({ error: 'Failed to delete account' }, 500)
  }
})

// Serve landing page for root path
app.get('/', (c) => {
  return c.html(landingHTML)
})

// Serve login page
app.get('/login', (c) => {
  return c.html(loginHTML)
})

// Serve test feedback page
app.get('/test-feedback', (c) => {
  return c.html(testFeedbackHTML)
})

// Serve admin dashboard
app.get('/admin', (c) => {
  return c.html(adminHTML)
})

// Serve analyzer page
app.get('/analyzer', (c) => {
  return c.html(indexHTML)
})

app.notFound((c) => {
  return c.text('Not Found', 404)
})

export default app
