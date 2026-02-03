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
    
    // 페이지 로드
    await page.goto(options.url, {
      waitUntil: 'networkidle0', // 네트워크가 완전히 idle 될 때까지 대기
      timeout: options.timeout
    })
    
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
