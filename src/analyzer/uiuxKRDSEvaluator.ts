/**
 * KRDS UI/UX 편의성 평가 체계
 * 디지털정부서비스 UI/UX 가이드라인 43개 항목
 * 
 * 평가 카테고리:
 * 1. 아이덴티티 (Identity) - 5개 항목
 * 2. 탐색 (Navigation) - 5개 항목
 * 3. 방문 (Visit) - 1개 항목
 * 4. 검색 (Search) - 12개 항목
 * 5. 로그인 (Login) - 7개 항목
 * 6. 신청 (Application) - 13개 항목
 * 
 * 점수 계산: (준수 개수 / 전체 개수) × 100
 * 등급: S급(95+), A급(90+), B급(85+), C급(80+), F급(80미만)
 */

import type { HTMLStructure } from './htmlAnalyzer'

export interface UIUXKRDSScores {
  // 1. 아이덴티티 (5개 항목)
  identity_1_1_1_official_banner: number        // 공식배너 제공
  identity_1_2_1_logo_provision: number         // 로고 제공
  identity_1_2_2_home_button: number            // 홈 버튼 제공
  identity_1_2_3_search_function: number        // 검색 기능 제공
  identity_1_3_1_footer_provision: number       // 푸터 제공

  // 2. 탐색 (5개 항목)
  navigation_2_1_1_main_menu: number            // 메인 메뉴 제공
  navigation_2_1_2_menu_structure: number       // 메뉴 구성
  navigation_2_2_1_breadcrumb: number           // 브레드크럼 제공
  navigation_2_2_2_breadcrumb_home: number      // 브레드크럼 홈 링크
  navigation_2_3_1_side_menu: number            // 사이드 메뉴 제공

  // 3. 방문 (1개 항목)
  visit_3_1_1_main_screen: number               // 메인 화면 제공

  // 4. 검색 (12개 항목)
  search_4_1_1_search_function: number          // 검색 기능 제공
  search_4_1_2_search_target: number            // 검색 대상 선택
  search_4_1_3_advanced_search: number          // 상세 검색
  search_4_2_1_search_input: number             // 검색어 입력란
  search_4_2_2_input_placeholder: number        // 입력란 안내
  search_4_2_3_search_history: number           // 최근 검색어
  search_4_2_4_auto_complete: number            // 자동완성
  search_4_3_1_search_button: number            // 검색 버튼
  search_4_3_2_result_count: number             // 검색 결과 개수
  search_4_3_3_result_sort: number              // 결과 정렬
  search_4_3_4_result_filter: number            // 결과 필터
  search_4_3_5_no_result: number                // 결과 없음 안내

  // 5. 로그인 (7개 항목)
  login_5_1_1_login_function: number            // 로그인 기능
  login_5_1_2_login_methods: number             // 로그인 방법
  login_5_1_3_logout_function: number           // 로그아웃 기능
  login_5_2_1_id_input: number                  // 아이디 입력
  login_5_2_2_password_input: number            // 비밀번호 입력
  login_5_2_3_auto_login: number                // 자동 로그인
  login_5_2_4_find_account: number              // 계정 찾기

  // 6. 신청 (13개 항목)
  application_6_1_1_target_check: number        // 신청 대상 확인
  application_6_1_2_eligibility: number         // 신청 자격
  application_6_1_3_required_docs: number       // 구비 서류
  application_6_1_4_application_period: number  // 신청 기간
  application_6_2_1_service_info: number        // 서비스 정보
  application_6_2_2_process_flow: number        // 처리 절차
  application_6_2_3_inquiry_contact: number     // 문의처
  application_6_2_4_fee_info: number            // 수수료
  application_6_2_5_related_services: number    // 관련 서비스
  application_6_3_1_form_provision: number      // 신청서 제공
  application_6_3_2_required_fields: number     // 필수 항목
  application_6_3_3_file_upload: number         // 파일 첨부
  application_6_3_4_submit_button: number       // 제출 버튼
}

export interface UIUXKRDSCategoryScores {
  identity: number       // 아이덴티티 평균
  navigation: number     // 탐색 평균
  visit: number          // 방문 평균
  search: number         // 검색 평균
  login: number          // 로그인 평균
  application: number    // 신청 평균
  overall: number        // 전체 평균
}

export interface UIUXKRDSResult {
  scores: UIUXKRDSScores
  categories: UIUXKRDSCategoryScores
  compliance_level: 'S' | 'A' | 'B' | 'C' | 'F'  // 등급
  convenience_score: number  // 0-100 편의성 점수
  compliant_count: number    // 준수 개수
  total_count: number        // 전체 개수
  compliance_rate: number    // 준수율 (%)
  issues: Array<{
    item: string
    category: string
    code: string
    status: 'compliant' | 'non_compliant' | 'not_applicable'
    description: string
    recommendation: string
    affected_pages: string[]
  }>
}

/**
 * UI/UX KRDS 점수 계산 헬퍼
 * @param condition 조건 만족 여부
 * @returns 준수(5.0) 또는 미준수(2.0)
 */
function calculateUIUXScore(condition: boolean): number {
  return condition ? 5.0 : 2.0
}

/**
 * HTML 구조에서 특정 요소 존재 확인
 */
function hasElement(structure: HTMLStructure, selector: string): boolean {
  // 실제 구현에서는 structure에서 해당 요소를 찾아야 함
  // 현재는 기본 구조로 판단
  return false  // 실제 분석 로직으로 대체 필요
}

/**
 * UI/UX KRDS 평가 실행
 */
export function evaluateUIUXKRDS(
  structure: HTMLStructure,
  pageResults?: Array<{ url: string, structure: HTMLStructure, isMainPage: boolean }>
): UIUXKRDSResult {
  const pages = pageResults || []
  const mainPage = pages.find(p => p.isMainPage) || { url: '', structure, isMainPage: true }

  // ===========================================
  // 1. 아이덴티티 (Identity) - 5개 항목
  // ===========================================
  
  // 1-1-1: 공식배너 제공 (정부 CI 배너)
  const identity_1_1_1 = calculateUIUXScore(
    structure.header?.hasBanner === true
  )

  // 1-2-1: 로고 제공
  const identity_1_2_1 = calculateUIUXScore(
    structure.header?.hasLogo === true ||
    (structure.visuals?.imageCount || 0) > 0
  )

  // 1-2-2: 홈 버튼 제공
  const identity_1_2_2 = calculateUIUXScore(
    structure.navigation?.hasHomeLink === true
  )

  // 1-2-3: 검색 기능 제공
  const identity_1_2_3 = calculateUIUXScore(
    (structure.forms?.hasSearchForm || false)
  )

  // 1-3-1: 푸터 제공
  const identity_1_3_1 = calculateUIUXScore(
    structure.footer?.hasFooter === true
  )

  // ===========================================
  // 2. 탐색 (Navigation) - 5개 항목
  // ===========================================
  
  // 2-1-1: 메인 메뉴 제공
  const navigation_2_1_1 = calculateUIUXScore(
    structure.navigation?.hasMainNav === true
  )

  // 2-1-2: 메뉴 구성 (2depth 이상)
  const navigation_2_1_2 = calculateUIUXScore(
    (structure.navigation?.menuDepth || 0) >= 2
  )

  // 2-2-1: 브레드크럼 제공
  const navigation_2_2_1 = calculateUIUXScore(
    structure.navigation?.hasBreadcrumb === true
  )

  // 2-2-2: 브레드크럼 홈 링크
  const navigation_2_2_2 = calculateUIUXScore(
    structure.navigation?.hasBreadcrumb === true &&
    structure.navigation?.hasHomeLink === true
  )

  // 2-3-1: 사이드 메뉴 제공
  const navigation_2_3_1 = calculateUIUXScore(
    structure.navigation?.hasSideNav === true
  )

  // ===========================================
  // 3. 방문 (Visit) - 1개 항목
  // ===========================================
  
  // 3-1-1: 메인 화면 제공
  const visit_3_1_1 = calculateUIUXScore(
    mainPage.isMainPage === true
  )

  // ===========================================
  // 4. 검색 (Search) - 12개 항목
  // ===========================================
  
  // 4-1-1: 검색 기능 제공
  const search_4_1_1 = calculateUIUXScore(
    (structure.forms?.hasSearchForm || false)
  )

  // 4-1-2: 검색 대상 선택 (통합검색/게시판 등)
  const search_4_1_2 = calculateUIUXScore(
    (structure.forms?.formCount || 0) > 0 &&
    (structure.interactivity?.selectCount || 0) > 0
  )

  // 4-1-3: 상세 검색
  const search_4_1_3 = calculateUIUXScore(
    (structure.forms?.hasSearchForm || false) &&
    (structure.interactivity?.selectCount || 0) > 1
  )

  // 4-2-1: 검색어 입력란
  const search_4_2_1 = calculateUIUXScore(
    (structure.forms?.inputCount || 0) > 0
  )

  // 4-2-2: 입력란 안내 (placeholder)
  const search_4_2_2 = calculateUIUXScore(
    (structure.forms?.hasPlaceholder || false)
  )

  // 4-2-3: 최근 검색어
  const search_4_2_3 = 2.0  // 동적 기능으로 판단 불가

  // 4-2-4: 자동완성
  const search_4_2_4 = 2.0  // 동적 기능으로 판단 불가

  // 4-3-1: 검색 버튼 + 초기화 버튼
  const search_4_3_1 = calculateUIUXScore(
    (structure.interactivity?.buttonCount || 0) >= 2
  )

  // 4-3-2: 검색 결과 개수 표시
  const search_4_3_2 = 2.0  // 결과 페이지에서 판단 필요

  // 4-3-3: 결과 정렬
  const search_4_3_3 = 2.0  // 결과 페이지에서 판단 필요

  // 4-3-4: 결과 필터
  const search_4_3_4 = 2.0  // 결과 페이지에서 판단 필요

  // 4-3-5: 결과 없음 안내
  const search_4_3_5 = 2.0  // 결과 페이지에서 판단 필요

  // ===========================================
  // 5. 로그인 (Login) - 7개 항목
  // ===========================================
  
  // 5-1-1: 로그인 기능
  const login_5_1_1 = calculateUIUXScore(
    (structure.forms?.hasLoginForm || false)
  )

  // 5-1-2: 로그인 방법 (간편 로그인 등)
  const login_5_1_2 = calculateUIUXScore(
    (structure.interactivity?.buttonCount || 0) >= 2
  )

  // 5-1-3: 로그아웃 기능
  const login_5_1_3 = 2.0  // 로그인 후 상태에서만 판단 가능

  // 5-2-1: 아이디 입력
  const login_5_2_1 = calculateUIUXScore(
    (structure.forms?.inputCount || 0) >= 1
  )

  // 5-2-2: 비밀번호 입력
  const login_5_2_2 = calculateUIUXScore(
    (structure.forms?.inputCount || 0) >= 2
  )

  // 5-2-3: 자동 로그인
  const login_5_2_3 = calculateUIUXScore(
    (structure.interactivity?.checkboxCount || 0) > 0
  )

  // 5-2-4: 계정 찾기
  const login_5_2_4 = calculateUIUXScore(
    (structure.navigation?.linkCount || 0) > 5
  )

  // ===========================================
  // 6. 신청 (Application) - 13개 항목
  // ===========================================
  
  // 6-1-1: 신청 대상 확인
  const application_6_1_1 = 2.0  // 콘텐츠 분석 필요

  // 6-1-2: 신청 자격
  const application_6_1_2 = 2.0  // 콘텐츠 분석 필요

  // 6-1-3: 구비 서류
  const application_6_1_3 = 2.0  // 콘텐츠 분석 필요

  // 6-1-4: 신청 기간
  const application_6_1_4 = 2.0  // 콘텐츠 분석 필요

  // 6-2-1: 서비스 정보
  const application_6_2_1 = 2.0  // 콘텐츠 분석 필요

  // 6-2-2: 처리 절차
  const application_6_2_2 = 2.0  // 콘텐츠 분석 필요

  // 6-2-3: 문의처
  const application_6_2_3 = calculateUIUXScore(
    structure.footer?.hasContact === true
  )

  // 6-2-4: 수수료
  const application_6_2_4 = 2.0  // 콘텐츠 분석 필요

  // 6-2-5: 관련 서비스
  const application_6_2_5 = 2.0  // 콘텐츠 분석 필요

  // 6-3-1: 신청서 제공
  const application_6_3_1 = calculateUIUXScore(
    (structure.forms?.formCount || 0) > 0
  )

  // 6-3-2: 필수 항목 표시
  const application_6_3_2 = calculateUIUXScore(
    (structure.forms?.hasRequiredFields || false)
  )

  // 6-3-3: 파일 첨부
  const application_6_3_3 = calculateUIUXScore(
    (structure.forms?.hasFileUpload || false)
  )

  // 6-3-4: 제출 버튼
  const application_6_3_4 = calculateUIUXScore(
    (structure.interactivity?.buttonCount || 0) > 0
  )

  // ===========================================
  // 점수 집계
  // ===========================================
  
  const scores: UIUXKRDSScores = {
    // 1. 아이덴티티
    identity_1_1_1_official_banner: identity_1_1_1,
    identity_1_2_1_logo_provision: identity_1_2_1,
    identity_1_2_2_home_button: identity_1_2_2,
    identity_1_2_3_search_function: identity_1_2_3,
    identity_1_3_1_footer_provision: identity_1_3_1,
    
    // 2. 탐색
    navigation_2_1_1_main_menu: navigation_2_1_1,
    navigation_2_1_2_menu_structure: navigation_2_1_2,
    navigation_2_2_1_breadcrumb: navigation_2_2_1,
    navigation_2_2_2_breadcrumb_home: navigation_2_2_2,
    navigation_2_3_1_side_menu: navigation_2_3_1,
    
    // 3. 방문
    visit_3_1_1_main_screen: visit_3_1_1,
    
    // 4. 검색
    search_4_1_1_search_function: search_4_1_1,
    search_4_1_2_search_target: search_4_1_2,
    search_4_1_3_advanced_search: search_4_1_3,
    search_4_2_1_search_input: search_4_2_1,
    search_4_2_2_input_placeholder: search_4_2_2,
    search_4_2_3_search_history: search_4_2_3,
    search_4_2_4_auto_complete: search_4_2_4,
    search_4_3_1_search_button: search_4_3_1,
    search_4_3_2_result_count: search_4_3_2,
    search_4_3_3_result_sort: search_4_3_3,
    search_4_3_4_result_filter: search_4_3_4,
    search_4_3_5_no_result: search_4_3_5,
    
    // 5. 로그인
    login_5_1_1_login_function: login_5_1_1,
    login_5_1_2_login_methods: login_5_1_2,
    login_5_1_3_logout_function: login_5_1_3,
    login_5_2_1_id_input: login_5_2_1,
    login_5_2_2_password_input: login_5_2_2,
    login_5_2_3_auto_login: login_5_2_3,
    login_5_2_4_find_account: login_5_2_4,
    
    // 6. 신청
    application_6_1_1_target_check: application_6_1_1,
    application_6_1_2_eligibility: application_6_1_2,
    application_6_1_3_required_docs: application_6_1_3,
    application_6_1_4_application_period: application_6_1_4,
    application_6_2_1_service_info: application_6_2_1,
    application_6_2_2_process_flow: application_6_2_2,
    application_6_2_3_inquiry_contact: application_6_2_3,
    application_6_2_4_fee_info: application_6_2_4,
    application_6_2_5_related_services: application_6_2_5,
    application_6_3_1_form_provision: application_6_3_1,
    application_6_3_2_required_fields: application_6_3_2,
    application_6_3_3_file_upload: application_6_3_3,
    application_6_3_4_submit_button: application_6_3_4,
  }

  // 모든 점수를 배열로 변환
  const allScores = Object.values(scores)
  
  // 카테고리별 점수 계산
  const identityScores = [
    scores.identity_1_1_1_official_banner,
    scores.identity_1_2_1_logo_provision,
    scores.identity_1_2_2_home_button,
    scores.identity_1_2_3_search_function,
    scores.identity_1_3_1_footer_provision,
  ]
  
  const navigationScores = [
    scores.navigation_2_1_1_main_menu,
    scores.navigation_2_1_2_menu_structure,
    scores.navigation_2_2_1_breadcrumb,
    scores.navigation_2_2_2_breadcrumb_home,
    scores.navigation_2_3_1_side_menu,
  ]
  
  const visitScores = [
    scores.visit_3_1_1_main_screen,
  ]
  
  const searchScores = [
    scores.search_4_1_1_search_function,
    scores.search_4_1_2_search_target,
    scores.search_4_1_3_advanced_search,
    scores.search_4_2_1_search_input,
    scores.search_4_2_2_input_placeholder,
    scores.search_4_2_3_search_history,
    scores.search_4_2_4_auto_complete,
    scores.search_4_3_1_search_button,
    scores.search_4_3_2_result_count,
    scores.search_4_3_3_result_sort,
    scores.search_4_3_4_result_filter,
    scores.search_4_3_5_no_result,
  ]
  
  const loginScores = [
    scores.login_5_1_1_login_function,
    scores.login_5_1_2_login_methods,
    scores.login_5_1_3_logout_function,
    scores.login_5_2_1_id_input,
    scores.login_5_2_2_password_input,
    scores.login_5_2_3_auto_login,
    scores.login_5_2_4_find_account,
  ]
  
  const applicationScores = [
    scores.application_6_1_1_target_check,
    scores.application_6_1_2_eligibility,
    scores.application_6_1_3_required_docs,
    scores.application_6_1_4_application_period,
    scores.application_6_2_1_service_info,
    scores.application_6_2_2_process_flow,
    scores.application_6_2_3_inquiry_contact,
    scores.application_6_2_4_fee_info,
    scores.application_6_2_5_related_services,
    scores.application_6_3_1_form_provision,
    scores.application_6_3_2_required_fields,
    scores.application_6_3_3_file_upload,
    scores.application_6_3_4_submit_button,
  ]

  // 평균 계산 헬퍼
  const avg = (arr: number[]) => arr.reduce((sum, v) => sum + v, 0) / arr.length

  const categories: UIUXKRDSCategoryScores = {
    identity: avg(identityScores),
    navigation: avg(navigationScores),
    visit: avg(visitScores),
    search: avg(searchScores),
    login: avg(loginScores),
    application: avg(applicationScores),
    overall: avg(allScores),
  }

  // ===========================================
  // 점수 및 등급 계산 (정확한 공식 적용)
  // ===========================================
  
  // 준수 기준: 4.5점 이상 = 준수, 4.5점 미만 = 미준수
  const compliantCount = allScores.filter(s => s >= 4.5).length
  const totalCount = allScores.length  // 43개
  const complianceRate = (compliantCount / totalCount) * 100
  
  // 점수 = 준수율(%)
  const convenience_score = Math.round(complianceRate)
  
  // 등급 계산
  let compliance_level: 'S' | 'A' | 'B' | 'C' | 'F'
  if (convenience_score >= 95) {
    compliance_level = 'S'
  } else if (convenience_score >= 90) {
    compliance_level = 'A'
  } else if (convenience_score >= 85) {
    compliance_level = 'B'
  } else if (convenience_score >= 80) {
    compliance_level = 'C'
  } else {
    compliance_level = 'F'
  }

  // ===========================================
  // 이슈 생성 (미준수 항목)
  // ===========================================
  
  const issues: UIUXKRDSResult['issues'] = []
  
  // 각 항목별 이슈 체크
  Object.entries(scores).forEach(([key, value]) => {
    if (value < 4.5) {
      const itemInfo = getItemInfo(key)
      issues.push({
        item: itemInfo.name,
        category: itemInfo.category,
        code: itemInfo.code,
        status: 'non_compliant',
        description: itemInfo.description,
        recommendation: itemInfo.recommendation,
        affected_pages: pages
          .filter(p => {
            // 해당 항목이 문제가 있는 페이지만 필터링
            return true  // 실제로는 각 항목별로 판단 필요
          })
          .map(p => p.url)
      })
    }
  })

  return {
    scores,
    categories,
    compliance_level,
    convenience_score,
    compliant_count: compliantCount,
    total_count: totalCount,
    compliance_rate: complianceRate,
    issues,
  }
}

/**
 * 항목 정보 조회
 */
function getItemInfo(key: string): {
  name: string
  category: string
  code: string
  description: string
  recommendation: string
} {
  const itemMap: Record<string, any> = {
    // 1. 아이덴티티
    'identity_1_1_1_official_banner': {
      name: '공식배너 제공',
      category: '아이덴티티',
      code: '1-1-1',
      description: '정부 CI 배너가 제공되어야 합니다',
      recommendation: '상단 영역에 정부24 또는 기관 공식 배너를 배치하세요'
    },
    'identity_1_2_1_logo_provision': {
      name: '로고 제공',
      category: '아이덴티티',
      code: '1-2-1',
      description: '기관 로고가 제공되어야 합니다',
      recommendation: '헤더 영역에 기관 로고를 배치하세요'
    },
    'identity_1_2_2_home_button': {
      name: '홈 버튼 제공',
      category: '아이덴티티',
      code: '1-2-2',
      description: '홈으로 이동하는 버튼이 제공되어야 합니다',
      recommendation: '로고 또는 별도 홈 버튼을 제공하세요'
    },
    'identity_1_2_3_search_function': {
      name: '검색 기능 제공',
      category: '아이덴티티',
      code: '1-2-3',
      description: '통합 검색 기능이 제공되어야 합니다',
      recommendation: '헤더 영역에 검색 입력란을 배치하세요'
    },
    'identity_1_3_1_footer_provision': {
      name: '푸터 제공',
      category: '아이덴티티',
      code: '1-3-1',
      description: '푸터 영역이 제공되어야 합니다',
      recommendation: '하단에 기관정보, 저작권 등을 포함한 푸터를 배치하세요'
    },
    
    // 2. 탐색
    'navigation_2_1_1_main_menu': {
      name: '메인 메뉴 제공',
      category: '탐색',
      code: '2-1-1',
      description: '메인 메뉴가 제공되어야 합니다',
      recommendation: '상단 또는 좌측에 주요 메뉴를 배치하세요'
    },
    'navigation_2_1_2_menu_structure': {
      name: '메뉴 구성',
      category: '탐색',
      code: '2-1-2',
      description: '메뉴가 2depth 이상으로 구성되어야 합니다',
      recommendation: '대메뉴와 소메뉴를 계층적으로 구성하세요'
    },
    'navigation_2_2_1_breadcrumb': {
      name: '브레드크럼 제공',
      category: '탐색',
      code: '2-2-1',
      description: '현재 위치를 나타내는 브레드크럼이 제공되어야 합니다',
      recommendation: '페이지 상단에 홈 > 대메뉴 > 소메뉴 형태로 배치하세요'
    },
    'navigation_2_2_2_breadcrumb_home': {
      name: '브레드크럼 홈 링크',
      category: '탐색',
      code: '2-2-2',
      description: '브레드크럼에 홈 링크가 포함되어야 합니다',
      recommendation: '브레드크럼 첫 항목을 홈 링크로 설정하세요'
    },
    'navigation_2_3_1_side_menu': {
      name: '사이드 메뉴 제공',
      category: '탐색',
      code: '2-3-1',
      description: '사이드 메뉴가 제공되어야 합니다',
      recommendation: '좌측 또는 우측에 하위 메뉴를 배치하세요'
    },
    
    // 3. 방문
    'visit_3_1_1_main_screen': {
      name: '메인 화면 제공',
      category: '방문',
      code: '3-1-1',
      description: '메인 화면이 제공되어야 합니다',
      recommendation: '메인 페이지를 구성하세요'
    },
    
    // 4. 검색
    'search_4_1_1_search_function': {
      name: '검색 기능 제공',
      category: '검색',
      code: '4-1-1',
      description: '검색 기능이 제공되어야 합니다',
      recommendation: '통합 검색 기능을 구현하세요'
    },
    'search_4_1_2_search_target': {
      name: '검색 대상 선택',
      category: '검색',
      code: '4-1-2',
      description: '검색 대상을 선택할 수 있어야 합니다',
      recommendation: '통합검색/게시판검색 등 선택 옵션을 제공하세요'
    },
    'search_4_1_3_advanced_search': {
      name: '상세 검색',
      category: '검색',
      code: '4-1-3',
      description: '상세 검색 기능이 제공되어야 합니다',
      recommendation: '검색 옵션(기간, 분류 등)을 제공하세요'
    },
    'search_4_2_1_search_input': {
      name: '검색어 입력란',
      category: '검색',
      code: '4-2-1',
      description: '검색어 입력란이 제공되어야 합니다',
      recommendation: '검색어를 입력할 수 있는 입력란을 제공하세요'
    },
    'search_4_2_2_input_placeholder': {
      name: '입력란 안내',
      category: '검색',
      code: '4-2-2',
      description: '입력란에 안내 문구가 제공되어야 합니다',
      recommendation: 'placeholder로 검색 가이드를 제공하세요'
    },
    'search_4_2_3_search_history': {
      name: '최근 검색어',
      category: '검색',
      code: '4-2-3',
      description: '최근 검색어 기능이 제공되어야 합니다',
      recommendation: '최근 검색어 목록을 표시하세요'
    },
    'search_4_2_4_auto_complete': {
      name: '자동완성',
      category: '검색',
      code: '4-2-4',
      description: '검색어 자동완성 기능이 제공되어야 합니다',
      recommendation: '입력 시 추천 검색어를 표시하세요'
    },
    'search_4_3_1_search_button': {
      name: '검색 버튼',
      category: '검색',
      code: '4-3-1',
      description: '검색 버튼과 초기화 버튼이 제공되어야 합니다',
      recommendation: '검색 버튼과 초기화 버튼을 함께 제공하세요'
    },
    'search_4_3_2_result_count': {
      name: '검색 결과 개수',
      category: '검색',
      code: '4-3-2',
      description: '검색 결과 개수가 표시되어야 합니다',
      recommendation: '검색 결과 상단에 전체 개수를 표시하세요'
    },
    'search_4_3_3_result_sort': {
      name: '결과 정렬',
      category: '검색',
      code: '4-3-3',
      description: '검색 결과 정렬 기능이 제공되어야 합니다',
      recommendation: '최신순/정확도순 등 정렬 옵션을 제공하세요'
    },
    'search_4_3_4_result_filter': {
      name: '결과 필터',
      category: '검색',
      code: '4-3-4',
      description: '검색 결과 필터 기능이 제공되어야 합니다',
      recommendation: '카테고리/기간 등 필터 옵션을 제공하세요'
    },
    'search_4_3_5_no_result': {
      name: '결과 없음 안내',
      category: '검색',
      code: '4-3-5',
      description: '검색 결과가 없을 때 안내 문구가 제공되어야 합니다',
      recommendation: '검색 결과가 없을 때 안내 메시지를 표시하세요'
    },
    
    // 5. 로그인
    'login_5_1_1_login_function': {
      name: '로그인 기능',
      category: '로그인',
      code: '5-1-1',
      description: '로그인 기능이 제공되어야 합니다',
      recommendation: '로그인 페이지 또는 모달을 제공하세요'
    },
    'login_5_1_2_login_methods': {
      name: '로그인 방법',
      category: '로그인',
      code: '5-1-2',
      description: '다양한 로그인 방법이 제공되어야 합니다',
      recommendation: '일반/간편/공동인증서 로그인을 제공하세요'
    },
    'login_5_1_3_logout_function': {
      name: '로그아웃 기능',
      category: '로그인',
      code: '5-1-3',
      description: '로그아웃 기능이 제공되어야 합니다',
      recommendation: '로그인 후 로그아웃 버튼을 제공하세요'
    },
    'login_5_2_1_id_input': {
      name: '아이디 입력',
      category: '로그인',
      code: '5-2-1',
      description: '아이디 입력란이 제공되어야 합니다',
      recommendation: '아이디를 입력할 수 있는 입력란을 제공하세요'
    },
    'login_5_2_2_password_input': {
      name: '비밀번호 입력',
      category: '로그인',
      code: '5-2-2',
      description: '비밀번호 입력란이 제공되어야 합니다',
      recommendation: '비밀번호를 입력할 수 있는 입력란을 제공하세요'
    },
    'login_5_2_3_auto_login': {
      name: '자동 로그인',
      category: '로그인',
      code: '5-2-3',
      description: '자동 로그인 기능이 제공되어야 합니다',
      recommendation: '자동 로그인 체크박스를 제공하세요'
    },
    'login_5_2_4_find_account': {
      name: '계정 찾기',
      category: '로그인',
      code: '5-2-4',
      description: '아이디/비밀번호 찾기 기능이 제공되어야 합니다',
      recommendation: '계정 찾기 링크를 제공하세요'
    },
    
    // 6. 신청
    'application_6_1_1_target_check': {
      name: '신청 대상 확인',
      category: '신청',
      code: '6-1-1',
      description: '신청 대상 확인 기능이 제공되어야 합니다',
      recommendation: '신청 대상 안내 문구를 제공하세요'
    },
    'application_6_1_2_eligibility': {
      name: '신청 자격',
      category: '신청',
      code: '6-1-2',
      description: '신청 자격이 명시되어야 합니다',
      recommendation: '신청 자격 조건을 명확히 안내하세요'
    },
    'application_6_1_3_required_docs': {
      name: '구비 서류',
      category: '신청',
      code: '6-1-3',
      description: '구비 서류 목록이 제공되어야 합니다',
      recommendation: '필요한 서류 목록을 명시하세요'
    },
    'application_6_1_4_application_period': {
      name: '신청 기간',
      category: '신청',
      code: '6-1-4',
      description: '신청 기간이 명시되어야 합니다',
      recommendation: '신청 시작일과 종료일을 명시하세요'
    },
    'application_6_2_1_service_info': {
      name: '서비스 정보',
      category: '신청',
      code: '6-2-1',
      description: '서비스 정보가 제공되어야 합니다',
      recommendation: '서비스 내용을 상세히 안내하세요'
    },
    'application_6_2_2_process_flow': {
      name: '처리 절차',
      category: '신청',
      code: '6-2-2',
      description: '처리 절차가 안내되어야 합니다',
      recommendation: '신청 후 처리 흐름을 단계별로 안내하세요'
    },
    'application_6_2_3_inquiry_contact': {
      name: '문의처',
      category: '신청',
      code: '6-2-3',
      description: '문의처가 제공되어야 합니다',
      recommendation: '전화번호, 이메일 등 문의처를 명시하세요'
    },
    'application_6_2_4_fee_info': {
      name: '수수료',
      category: '신청',
      code: '6-2-4',
      description: '수수료 정보가 제공되어야 합니다',
      recommendation: '필요한 경우 수수료를 명시하세요'
    },
    'application_6_2_5_related_services': {
      name: '관련 서비스',
      category: '신청',
      code: '6-2-5',
      description: '관련 서비스가 안내되어야 합니다',
      recommendation: '유사 서비스나 관련 정보를 제공하세요'
    },
    'application_6_3_1_form_provision': {
      name: '신청서 제공',
      category: '신청',
      code: '6-3-1',
      description: '신청서 양식이 제공되어야 합니다',
      recommendation: '온라인 신청서를 제공하세요'
    },
    'application_6_3_2_required_fields': {
      name: '필수 항목',
      category: '신청',
      code: '6-3-2',
      description: '필수 항목이 표시되어야 합니다',
      recommendation: '필수 입력 항목에 * 표시를 하세요'
    },
    'application_6_3_3_file_upload': {
      name: '파일 첨부',
      category: '신청',
      code: '6-3-3',
      description: '파일 첨부 기능이 제공되어야 합니다',
      recommendation: '서류 첨부를 위한 파일 업로드 기능을 제공하세요'
    },
    'application_6_3_4_submit_button': {
      name: '제출 버튼',
      category: '신청',
      code: '6-3-4',
      description: '제출 버튼이 제공되어야 합니다',
      recommendation: '신청서 제출 버튼을 명확히 제공하세요'
    },
  }

  return itemMap[key] || {
    name: key,
    category: '기타',
    code: '?-?-?',
    description: '항목 설명 없음',
    recommendation: '권고사항 없음'
  }
}
