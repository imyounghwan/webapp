import type { Browser, Page } from '@cloudflare/puppeteer'
import puppeteer from '@cloudflare/puppeteer'

export interface PuppeteerCrawlerOptions {
  url: string
  maxSubPages?: number
  timeout?: number
  followRedirects?: boolean
  waitForSelector?: string
  userAgent?: string
}

export interface CrawledPage {
  url: string
  html: string
  screenshot?: string // Base64 encoded screenshot
  isMainPage: boolean
  loadTime: number
  error?: string
  loadingUIDetection?: {  // 동적 로딩 UI 탐지 결과
    loadingScreenFound: boolean
    loadingDuration: number
    loadingElements: string[]
  }
}

export interface PuppeteerCrawlerResult {
  mainPage: CrawledPage
  subPages: CrawledPage[]
  totalPages: number
  totalTime: number
  success: boolean
  errors: string[]
}

/**
 * Puppeteer 기반 크롤러
 * - JavaScript 렌더링 지원
 * - 스크린샷 촬영
 * - 멀티페이지 크롤링 (메인 + 서브페이지)
 */
export async function crawlWebsiteWithPuppeteer(
  browser: Browser,
  options: PuppeteerCrawlerOptions
): Promise<PuppeteerCrawlerResult> {
  const startTime = Date.now()
  const maxSubPages = options.maxSubPages || 10
  const timeout = options.timeout || 30000
  const errors: string[] = []
  
  let mainPage: CrawledPage | null = null
  const subPages: CrawledPage[] = []
  const visitedUrls = new Set<string>()
  
  try {
    // 1️⃣ 메인 페이지 크롤링
    console.log(`[Puppeteer] Crawling main page: ${options.url}`)
    mainPage = await crawlSinglePage(browser, {
      url: options.url,
      isMainPage: true,
      timeout,
      waitForSelector: options.waitForSelector,
      userAgent: options.userAgent
    })
    
    visitedUrls.add(normalizeUrl(options.url))
    
    // 2️⃣ 메인 페이지에서 서브페이지 링크 추출
    const subPageUrls = await extractSubPageUrls(mainPage.html, options.url, maxSubPages)
    console.log(`[Puppeteer] Found ${subPageUrls.length} sub-pages to crawl`)
    
    // 3️⃣ 서브페이지 크롤링 (병렬 처리, 최대 3개씩)
    const batchSize = 3
    for (let i = 0; i < subPageUrls.length; i += batchSize) {
      const batch = subPageUrls.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map(async (subUrl) => {
          try {
            if (visitedUrls.has(normalizeUrl(subUrl))) {
              return null
            }
            
            console.log(`[Puppeteer] Crawling sub-page: ${subUrl}`)
            const result = await crawlSinglePage(browser, {
              url: subUrl,
              isMainPage: false,
              timeout: timeout / 2, // 서브페이지는 타임아웃 절반
              userAgent: options.userAgent
            })
            
            visitedUrls.add(normalizeUrl(subUrl))
            return result
          } catch (err) {
            const errorMsg = `Sub-page crawl failed (${subUrl}): ${err instanceof Error ? err.message : String(err)}`
            console.error(`[Puppeteer] ${errorMsg}`)
            errors.push(errorMsg)
            return null
          }
        })
      )
      
      subPages.push(...batchResults.filter(r => r !== null) as CrawledPage[])
    }
    
    return {
      mainPage: mainPage!,
      subPages,
      totalPages: 1 + subPages.length,
      totalTime: Date.now() - startTime,
      success: true,
      errors
    }
    
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error(`[Puppeteer] Fatal error: ${errorMsg}`)
    errors.push(errorMsg)
    
    return {
      mainPage: mainPage || {
        url: options.url,
        html: '',
        isMainPage: true,
        loadTime: 0,
        error: errorMsg
      },
      subPages,
      totalPages: mainPage ? 1 + subPages.length : 0,
      totalTime: Date.now() - startTime,
      success: false,
      errors
    }
  }
}

/**
 * 동적 로딩 UI 탐지 (Puppeteer 실행 중)
 * 
 * 페이지 로드 과정에서 나타났다가 사라지는 로딩 UI를 감지합니다.
 * 전략:
 * 1. 페이지 로드 시작 직후 로딩 관련 요소 찾기
 * 2. 일정 시간 후 해당 요소가 사라졌는지 확인
 * 3. 로딩 UI 특성 (클래스명, 애니메이션, opacity 변화 등) 감지
 */
async function detectDynamicLoadingUI(page: Page): Promise<{
  loadingScreenFound: boolean
  loadingDuration: number
  loadingElements: string[]
}> {
  const loadingElements: string[] = []
  let loadingScreenFound = false
  let loadingDuration = 0
  
  try {
    const startTime = Date.now()
    
    // 로딩 UI 감지 스크립트를 페이지에 주입
    const detectionResult = await page.evaluate(() => {
      const found: string[] = []
      
      // 1. 현재 보이는 로딩 관련 요소 찾기
      const loadingSelectors = [
        '[class*="loading"]',
        '[class*="spinner"]',
        '[class*="loader"]',
        '[class*="skeleton"]',
        '[id*="loading"]',
        '[id*="spinner"]',
        '[aria-busy="true"]',
        '[role="progressbar"]',
        '.loading-overlay',
        '.loading-screen',
        '.preloader'
      ]
      
      for (const selector of loadingSelectors) {
        const elements = document.querySelectorAll(selector)
        elements.forEach((el) => {
          const computed = window.getComputedStyle(el as HTMLElement)
          const isVisible = computed.display !== 'none' && 
                           computed.visibility !== 'hidden' &&
                           parseFloat(computed.opacity) > 0
          
          if (isVisible) {
            found.push(selector)
          }
        })
      }
      
      return found
    })
    
    if (detectionResult.length > 0) {
      loadingScreenFound = true
      loadingElements.push(...detectionResult)
      
      // 로딩 UI가 사라질 때까지 대기 (최대 5초)
      const maxWaitTime = 5000
      const checkInterval = 500
      let elapsed = 0
      
      while (elapsed < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, checkInterval))
        elapsed += checkInterval
        
        // 로딩 요소가 여전히 보이는지 확인
        const stillVisible = await page.evaluate((selectors) => {
          for (const selector of selectors) {
            const elements = document.querySelectorAll(selector)
            for (const el of elements) {
              const computed = window.getComputedStyle(el as HTMLElement)
              const isVisible = computed.display !== 'none' && 
                               computed.visibility !== 'hidden' &&
                               parseFloat(computed.opacity) > 0
              if (isVisible) {
                return true
              }
            }
          }
          return false
        }, detectionResult)
        
        if (!stillVisible) {
          loadingDuration = elapsed
          break
        }
      }
      
      // 만약 5초 후에도 여전히 보이면 전체 시간 기록
      if (elapsed >= maxWaitTime) {
        loadingDuration = maxWaitTime
      }
    }
    
  } catch (err) {
    console.error('[Puppeteer] Error detecting loading UI:', err)
  }
  
  return {
    loadingScreenFound,
    loadingDuration,
    loadingElements
  }
}

/**
 * 단일 페이지 크롤링 (Puppeteer)
 */
async function crawlSinglePage(
  browser: Browser,
  options: {
    url: string
    isMainPage: boolean
    timeout: number
    waitForSelector?: string
    userAgent?: string
  }
): Promise<CrawledPage> {
  const startTime = Date.now()
  const page = await browser.newPage()
  
  try {
    // User-Agent 설정
    if (options.userAgent) {
      await page.setUserAgent(options.userAgent)
    }
    
    // 동적 로딩 UI 탐지 준비 (페이지 로드 전)
    let loadingUIDetection: {
      loadingScreenFound: boolean
      loadingDuration: number
      loadingElements: string[]
    } | undefined
    
    // 페이지 로드
    await page.goto(options.url, {
      waitUntil: 'domcontentloaded', // DOM 로드 완료 시점에 체크 (더 빠른 감지)
      timeout: options.timeout
    })
    
    // 로딩 UI 동적 탐지 (DOM 로드 직후)
    loadingUIDetection = await detectDynamicLoadingUI(page)
    
    // 네트워크가 완전히 idle 될 때까지 추가 대기
    try {
      await page.waitForNetworkIdle({ timeout: 5000 })
    } catch {
      console.warn('[Puppeteer] Network idle timeout')
    }
    
    // 특정 선택자 대기 (옵션)
    if (options.waitForSelector) {
      await page.waitForSelector(options.waitForSelector, {
        timeout: 5000
      }).catch(() => {
        console.warn(`[Puppeteer] Selector not found: ${options.waitForSelector}`)
      })
    }
    
    // 추가 대기 (동적 콘텐츠 로딩 대기)
    await page.waitForTimeout(2000)
    
    // HTML 추출
    const html = await page.content()
    
    // 스크린샷 촬영 (메인 페이지만)
    let screenshot: string | undefined
    if (options.isMainPage) {
      const screenshotBuffer = await page.screenshot({
        type: 'jpeg',
        quality: 80,
        fullPage: false // 뷰포트만 촬영 (전체 페이지는 너무 커서 제외)
      })
      
      screenshot = arrayBufferToBase64(screenshotBuffer)
    }
    
    await page.close()
    
    return {
      url: options.url,
      html,
      screenshot,
      isMainPage: options.isMainPage,
      loadTime: Date.now() - startTime,
      loadingUIDetection
    }
    
  } catch (err) {
    await page.close()
    throw err
  }
}

/**
 * 서브페이지 URL 추출
 */
async function extractSubPageUrls(html: string, baseUrl: string, maxUrls: number): Promise<string[]> {
  const urls: string[] = []
  const urlSet = new Set<string>()
  
  try {
    const baseDomain = new URL(baseUrl).hostname
    
    // 링크 추출 (정규식)
    const linkRegex = /href=["']([^"']+)["']/gi
    let match: RegExpExecArray | null
    
    while ((match = linkRegex.exec(html)) !== null && urls.length < maxUrls) {
      const href = match[1]
      
      // 절대 URL로 변환
      let absoluteUrl: string
      if (href.startsWith('http')) {
        absoluteUrl = href
      } else if (href.startsWith('/')) {
        absoluteUrl = new URL(href, baseUrl).toString()
      } else if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) {
        continue
      } else {
        absoluteUrl = new URL(href, baseUrl).toString()
      }
      
      // 같은 도메인인지 확인
      const urlDomain = new URL(absoluteUrl).hostname
      if (urlDomain !== baseDomain) {
        continue
      }
      
      // 중복 제거
      const normalized = normalizeUrl(absoluteUrl)
      if (!urlSet.has(normalized) && normalized !== normalizeUrl(baseUrl)) {
        urlSet.add(normalized)
        urls.push(absoluteUrl)
      }
    }
    
    console.log(`[Puppeteer] Extracted ${urls.length} unique sub-page URLs`)
    return urls
    
  } catch (err) {
    console.error(`[Puppeteer] Error extracting sub-page URLs: ${err}`)
    return []
  }
}

/**
 * URL 정규화 (쿼리 파라미터 제거, 트레일링 슬래시 제거)
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    // 쿼리 파라미터 제거
    parsed.search = ''
    // 트레일링 슬래시 제거
    parsed.pathname = parsed.pathname.replace(/\/$/, '')
    return parsed.toString()
  } catch {
    return url
  }
}

/**
 * ArrayBuffer를 Base64로 변환
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
