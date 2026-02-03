import OpenAI from 'openai'

/**
 * AI 기반 KRDS 평가 (HTML 분석)
 * - HTML 구조를 AI가 이해하고 주관적 항목 평가
 * - 객관적 항목은 기존 HTML 파서 사용
 */
export async function evaluateKRDSWithAI(html: string, url: string): Promise<any> {
  console.log('[AI] Evaluating KRDS items with AI...')
  
  // OpenAI API 키 확인
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured. Please set up LLM API key in GenSpark.')
  }
  
  // OpenAI 클라이언트 초기화 (조건부)
  const openai = new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || 'https://www.genspark.ai/api/llm_proxy/v1',
  })
  
  try {
    // HTML을 간단하게 요약 (토큰 절약)
    const simplifiedHTML = simplifyHTML(html)
    
    const prompt = `당신은 한국 디지털정부서비스 UI/UX 전문가입니다.

다음 웹사이트의 HTML을 분석하고, KRDS 가이드라인 43개 항목을 평가하세요.

**웹사이트 URL**: ${url}

**HTML 구조** (간략화됨):
\`\`\`html
${simplifiedHTML.substring(0, 8000)}
\`\`\`

**평가 항목 (43개)**:

**1. 아이덴티티 (5개)**
1-1-1. 공식 배너 제공 (정부24 또는 기관 CI)
1-2-1. 로고 제공
1-2-2. 홈 버튼 제공
1-3-1. 기관명 명시
1-3-2. 슬로건 제공

**2. 탐색 (5개)**
2-1-1. GNB 메뉴 제공
2-1-2. LNB 메뉴 제공 (서브페이지)
2-2-1. Breadcrumb 제공 (서브페이지)
2-3-1. 사이트맵 제공
2-4-1. 푸터 링크 제공

**3. 방문 (1개)**
3-1-1. 최근 업데이트 정보 제공

**4. 검색 (12개)**
4-1-1. 검색 영역 명확성
4-1-2. 검색창 위치 (상단 오른쪽)
4-1-3. 검색 버튼 제공
4-2-1. 검색어 입력란 레이블
4-2-2. 자동완성 기능
4-2-3. 최근 검색어
4-3-1. 검색 결과 정렬 옵션
4-3-2. 검색 결과 필터
4-3-3. 검색 결과 개수 표시
4-4-1. 검색 결과 없음 안내
4-4-2. 추천 검색어
4-5-1. 통합 검색 제공

**5. 로그인 (7개)**
5-1-1. 로그인 버튼 명확성
5-1-2. 로그인 버튼 위치 (상단 오른쪽)
5-2-1. 아이디 입력란 레이블
5-2-2. 비밀번호 입력란 레이블
5-3-1. 로그인 유지 옵션
5-4-1. 아이디/비밀번호 찾기
5-5-1. 회원가입 링크

**6. 신청 (13개)**
6-1-1. 신청 버튼 명확성
6-1-2. 신청 절차 안내
6-1-3. 필수/선택 항목 구분
6-2-1. 입력란 레이블 명확성
6-2-2. 입력 형식 안내
6-2-3. 입력 오류 메시지
6-2-4. 실시간 입력 검증
6-3-1. 파일 첨부 안내
6-3-2. 약관 동의 체크박스
6-3-3. 개인정보 수집 동의
6-3-4. 제출 버튼 명확성
6-4-1. 제출 완료 안내
6-4-2. 진행 상황 확인

**평가 기준**:
- **5점**: 완벽하게 준수
- **4점**: 대체로 준수 (일부 미흡)
- **3점**: 보통 (개선 필요)
- **2점**: 미흡 (심각한 문제)
- **1점**: 매우 미흡
- **0점**: 해당 없음 (예: 로그인 기능 없음)

**응답 형식 (JSON)**:
\`\`\`json
{
  "identity_1_1_1": 5,
  "identity_1_2_1": 5,
  ...
  "application_6_4_2": 0,
  "reasoning": "간단한 평가 근거 (각 카테고리별)"
}
\`\`\`

**중요**: 
- HTML 구조를 신중히 분석하세요
- 존재하지 않는 기능은 0점 처리
- 로그인/신청 기능이 없으면 해당 항목은 모두 0점`

    const response = await openai.chat.completions.create({
      model: 'gpt-5',
      messages: [
        {
          role: 'system',
          content: '당신은 한국 디지털정부서비스 UI/UX 전문가입니다. KRDS 가이드라인을 완벽히 이해하고 있으며, HTML 구조를 분석해 정확한 평가를 제공합니다.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // 일관성을 위해 낮은 temperature
      max_tokens: 2000
    })

    const content = response.choices[0].message.content || '{}'
    
    // JSON 추출 (```json ... ``` 형식)
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/)
    const jsonStr = jsonMatch ? jsonMatch[1] : content
    
    const aiScores = JSON.parse(jsonStr)
    
    console.log('[AI] AI evaluation completed')
    console.log('[AI] Sample scores:', Object.entries(aiScores).slice(0, 5))
    
    return aiScores
    
  } catch (error) {
    console.error('[AI] Error during AI evaluation:', error)
    throw new Error(`AI evaluation failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * HTML 간략화 (토큰 절약)
 */
function simplifyHTML(html: string): string {
  // 스크립트 태그 제거
  let simplified = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // 스타일 태그 제거
  simplified = simplified.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  
  // 주석 제거
  simplified = simplified.replace(/<!--[\s\S]*?-->/g, '')
  
  // 연속된 공백 제거
  simplified = simplified.replace(/\s+/g, ' ')
  
  // 너무 긴 속성값 제거
  simplified = simplified.replace(/(\w+)="[^"]{200,}"/g, '$1="..."')
  
  return simplified.trim()
}
