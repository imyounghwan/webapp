/**
 * Nielsen 평가 체계 v3.0 (개선판)
 * - 중복 항목 제거 (25개 → 22개 독립 항목)
 * - 검색 의존도 제거
 * - 점수 체계 세밀화 (2단계 → 7단계)
 */

import type { HTMLStructure } from './htmlAnalyzer'

export interface ImprovedNielsenScores {
  // N1: 시스템 상태 가시성 (3개 항목)
  N1_1_current_location: number      // 현재 페이지 위치 표시 (Breadcrumb 등)
  N1_2_loading_status: number        // 로딩 상태 표시
  N1_3_action_feedback: number       // 사용자 행동 피드백
  
  // N2: 현실 세계 일치 (3개 항목)
  N2_1_familiar_terms: number        // 친숙한 용어 사용
  N2_2_natural_flow: number          // 자연스러운 흐름
  N2_3_real_world_metaphor: number   // 현실 세계 은유
  
  // N3: 사용자 제어와 자유 (2개 항목) - N3.2 나가기 제거 (N1.1과 중복)
  N3_1_undo_redo: number             // 실행 취소/재실행
  N3_3_flexible_navigation: number   // 유연한 네비게이션
  
  // N4: 일관성과 표준 (3개 항목)
  N4_1_visual_consistency: number    // 시각적 일관성
  N4_2_terminology_consistency: number // 용어 일관성
  N4_3_standard_compliance: number   // 표준 준수
  
  // N5: 오류 예방 (3개 항목)
  N5_1_input_validation: number      // 입력 검증 (폼 검증 포함)
  N5_2_confirmation_dialog: number   // 확인 대화상자
  N5_3_constraints: number           // 제약 조건 표시 (레이블 등)
  
  // N6: 인식보다 회상 (2개 항목) - N6.1 보이는 옵션 제거 (검색 의존)
  N6_2_recognition_cues: number      // 인식 단서 (아이콘, 시각적 힌트)
  N6_3_memory_load: number           // 기억 부담 최소화
  
  // N7: 유연성과 효율성 (3개 항목) - N7.1 단축키 교체 → N7.1 빠른 접근
  N7_1_quick_access: number          // 빠른 접근 (주요 기능 직접 접근)
  N7_2_customization: number         // 맞춤 설정 (반응형, 크기 조절 등)
  N7_3_search_filter: number         // 검색/필터 기능 (새 항목)
  
  // N8: 미니멀 디자인 (3개 항목)
  N8_1_essential_info: number        // 핵심 정보만
  N8_2_clean_interface: number       // 깔끔한 인터페이스
  N8_3_visual_hierarchy: number      // 시각적 계층
  
  // N9: 오류 인식과 복구 (2개 항목) - N9.1, N9.3 제거 (N5.1, N5.3과 중복)
  N9_2_recovery_support: number      // 복구 지원 (새 항목 강화)
  N9_4_error_guidance: number        // 오류 안내 (새 항목)
  
  // N10: 도움말과 문서 (2개 항목) - N10.1 도움말 접근 교체 → N10.1 도움말 가시성
  N10_1_help_visibility: number      // 도움말 가시성 (찾기 쉬움)
  N10_2_documentation: number        // 문서화 (FAQ, 가이드)
}

/**
 * 개선된 Nielsen 점수 계산 (22개 독립 항목)
 */
export function calculateImprovedNielsen(structure: HTMLStructure): ImprovedNielsenScores {
  const { navigation, accessibility, content, forms, visuals } = structure
  
  // 점수 계산 헬퍼 (7단계 세밀화)
  const calculateScore = (baseScore: number, adjustment: number): number => {
    const score = Math.max(2.0, Math.min(5.0, baseScore + adjustment))
    // 7단계로 라운딩: 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0
    return Math.round(score * 2) / 2
  }
  
  return {
    // N1: 시스템 상태 가시성
    N1_1_current_location: calculateScore(3.5, navigation.breadcrumbExists ? 1.5 : -1.0),
    N1_2_loading_status: calculateScore(3.5, accessibility.ariaLabelCount > 3 ? 1.0 : -0.5),
    N1_3_action_feedback: calculateScore(3.5, forms.validationExists ? 1.0 : navigation.linkCount > 20 ? 0.5 : -0.5),
    
    // N2: 현실 세계 일치
    N2_1_familiar_terms: calculateScore(3.5, accessibility.langAttribute ? 1.0 : -0.5),
    N2_2_natural_flow: calculateScore(3.5, content.headingCount >= 3 ? 1.0 : -0.5),
    N2_3_real_world_metaphor: calculateScore(3.5, visuals.iconCount > 5 ? 0.5 : -0.5),
    
    // N3: 사용자 제어와 자유 (N3.2 제거)
    N3_1_undo_redo: calculateScore(3.0, forms.formCount > 0 ? 0.5 : -0.5),
    N3_3_flexible_navigation: calculateScore(3.5, navigation.linkCount >= 15 ? 1.0 : -1.0),
    
    // N4: 일관성과 표준
    N4_1_visual_consistency: calculateScore(3.5, visuals.imageCount > 3 && visuals.imageCount < 30 ? 1.0 : -0.5),
    N4_2_terminology_consistency: calculateScore(3.5, content.headingCount >= 3 ? 0.5 : -0.5),
    N4_3_standard_compliance: calculateScore(3.5, accessibility.langAttribute ? 1.0 : accessibility.altTextRatio > 0.7 ? 0.5 : -1.0),
    
    // N5: 오류 예방
    N5_1_input_validation: calculateScore(3.5, forms.validationExists ? 1.5 : forms.formCount === 0 ? 0 : -1.5),
    N5_2_confirmation_dialog: calculateScore(3.0, forms.formCount > 0 ? 0.5 : 0),
    N5_3_constraints: calculateScore(3.5, forms.labelRatio > 0.8 ? 1.5 : forms.labelRatio > 0.5 ? 0.5 : forms.formCount === 0 ? 0 : -1.0),
    
    // N6: 인식보다 회상 (N6.1 제거)
    N6_2_recognition_cues: calculateScore(3.5, visuals.iconCount > 5 ? 1.0 : visuals.iconCount > 0 ? 0.5 : -0.5),
    N6_3_memory_load: calculateScore(3.5, navigation.breadcrumbExists ? 1.0 : navigation.depthLevel <= 2 ? 0.5 : -1.0),
    
    // N7: 유연성과 효율성 (N7.1 교체)
    N7_1_quick_access: calculateScore(3.5, navigation.menuCount >= 1 ? 1.0 : navigation.linkCount > 20 ? 0.5 : -0.5),
    N7_2_customization: calculateScore(3.0, visuals.iconCount > 3 ? 0.5 : 0),
    N7_3_search_filter: calculateScore(3.5, navigation.searchExists ? 1.5 : navigation.menuCount > 1 ? 0 : -1.0),
    
    // N8: 미니멀 디자인
    N8_1_essential_info: calculateScore(3.5, 
      content.paragraphCount >= 5 && content.paragraphCount <= 30 ? 1.5 :
      content.paragraphCount > 30 ? 0.5 :
      content.paragraphCount > 0 ? 0 : -1.0
    ),
    N8_2_clean_interface: calculateScore(3.5,
      visuals.imageCount >= 3 && visuals.imageCount <= 20 ? 1.5 :
      visuals.imageCount > 20 && visuals.imageCount <= 40 ? 0.5 :
      visuals.imageCount > 40 ? -0.5 : 0
    ),
    N8_3_visual_hierarchy: calculateScore(3.5,
      content.headingCount >= 5 && content.headingCount <= 15 ? 1.5 :
      content.headingCount > 3 ? 1.0 :
      content.headingCount > 0 ? 0 : -1.0
    ),
    
    // N9: 오류 인식과 복구 (N9.1, N9.3 제거, N9.2, N9.4 강화)
    N9_2_recovery_support: calculateScore(3.0, 
      forms.validationExists ? 1.0 :
      forms.formCount === 0 ? 0 : -1.0
    ),
    N9_4_error_guidance: calculateScore(3.5,
      content.listCount > 3 ? 1.0 :
      content.listCount > 0 ? 0.5 : 0
    ),
    
    // N10: 도움말과 문서 (N10.1 교체)
    N10_1_help_visibility: calculateScore(3.5, 
      navigation.searchExists ? 1.0 :
      navigation.linkCount > 30 ? 0.5 :
      content.listCount > 3 ? 0.5 : -0.5
    ),
    N10_2_documentation: calculateScore(3.5,
      content.listCount > 5 ? 1.5 :
      content.listCount > 3 ? 1.0 :
      content.listCount > 0 ? 0 : -0.5
    ),
  }
}

/**
 * 개선된 진단 근거 생성
 */
export function generateImprovedDiagnoses(structure: HTMLStructure, scores: ImprovedNielsenScores, url: string): Record<string, string> {
  const { navigation, accessibility, content, forms, visuals } = structure
  
  return {
    N1_1_current_location: navigation.breadcrumbExists 
      ? `✅ ${url}에서 Breadcrumb 내비게이션이 발견되어 사용자가 현재 위치를 명확히 알 수 있습니다.`
      : `⚠️ ${url}에서 Breadcrumb이 없어 사용자가 현재 페이지의 위치를 파악하기 어려울 수 있습니다.`,
    
    N1_2_loading_status: accessibility.ariaLabelCount > 3
      ? `✅ ARIA 레이블 ${accessibility.ariaLabelCount}개가 발견되어 접근성과 상태 피드백이 제공됩니다.`
      : `⚠️ ARIA 레이블이 부족하여 스크린 리더 사용자에게 상태 정보가 제한적입니다.`,
    
    N1_3_action_feedback: forms.validationExists
      ? `✅ 폼 검증 기능이 있어 사용자 입력에 대한 즉각적인 피드백을 제공합니다.`
      : `⚠️ 폼 검증이 없어 사용자가 입력 결과를 즉시 확인하기 어렵습니다.`,
    
    N2_1_familiar_terms: accessibility.langAttribute
      ? `✅ HTML lang 속성이 설정되어 언어 친화적 환경을 제공합니다.`
      : `⚠️ lang 속성이 없어 브라우저가 자동 번역 등의 기능을 제공하기 어렵습니다.`,
    
    N2_2_natural_flow: content.headingCount >= 3
      ? `✅ 헤딩 ${content.headingCount}개로 자연스러운 문서 구조를 형성합니다.`
      : `⚠️ 헤딩이 부족하여 콘텐츠 흐름이 명확하지 않습니다.`,
    
    N2_3_real_world_metaphor: visuals.iconCount > 5
      ? `✅ 아이콘 ${visuals.iconCount}개가 실제 세계의 은유를 효과적으로 사용합니다.`
      : `⚠️ 아이콘이 부족하여 시각적 은유가 제한적입니다.`,
    
    N3_1_undo_redo: forms.formCount > 0
      ? `✅ 폼이 있어 사용자가 입력을 수정할 수 있는 제어 기능을 제공합니다.`
      : `⚠️ 인터랙티브 요소가 제한적입니다.`,
    
    N3_3_flexible_navigation: navigation.linkCount >= 15
      ? `✅ ${navigation.linkCount}개의 링크로 다양한 탐색 경로를 제공합니다.`
      : `⚠️ 링크가 ${navigation.linkCount}개로 제한적이어서 탐색 유연성이 부족합니다.`,
    
    N4_1_visual_consistency: visuals.imageCount > 3 && visuals.imageCount < 30
      ? `✅ 이미지 ${visuals.imageCount}개로 적절한 시각적 일관성을 유지합니다.`
      : `⚠️ 이미지 수(${visuals.imageCount})가 시각적 일관성에 영향을 줄 수 있습니다.`,
    
    N4_2_terminology_consistency: content.headingCount >= 3
      ? `✅ 헤딩 구조가 용어 일관성을 지원합니다.`
      : `⚠️ 헤딩이 부족하여 용어 일관성 확인이 어렵습니다.`,
    
    N4_3_standard_compliance: accessibility.langAttribute
      ? `✅ HTML 표준(lang, alt 등)을 준수합니다. (alt 비율: ${(accessibility.altTextRatio * 100).toFixed(0)}%)`
      : `⚠️ 접근성 표준 준수가 미흡합니다. (alt 비율: ${(accessibility.altTextRatio * 100).toFixed(0)}%)`,
    
    N5_1_input_validation: forms.validationExists
      ? `✅ ${url}에서 입력 검증(required, pattern 등)이 구현되어 오류를 사전 예방합니다.`
      : forms.formCount === 0
        ? `ℹ️ 입력 폼이 없어 검증이 필요하지 않습니다.`
        : `⚠️ 입력 검증이 없어 잘못된 데이터 입력 가능성이 있습니다.`,
    
    N5_2_confirmation_dialog: forms.formCount > 0
      ? `✅ 폼이 있어 중요한 작업 전 확인 절차가 가능합니다.`
      : `ℹ️ 폼이 없어 확인 대화상자가 필요하지 않습니다.`,
    
    N5_3_constraints: forms.labelRatio > 0.8
      ? `✅ 폼 레이블 비율 ${(forms.labelRatio * 100).toFixed(0)}%로 입력 제약사항을 명확히 표시합니다.`
      : forms.formCount === 0
        ? `ℹ️ 폼이 없어 제약 조건 표시가 필요하지 않습니다.`
        : `⚠️ 레이블 비율 ${(forms.labelRatio * 100).toFixed(0)}%로 제약 조건이 불명확합니다.`,
    
    N6_2_recognition_cues: visuals.iconCount > 5
      ? `✅ ${visuals.iconCount}개의 아이콘이 인식 단서를 제공합니다.`
      : `⚠️ 아이콘이 부족(${visuals.iconCount}개)하여 인식 단서가 제한적입니다.`,
    
    N6_3_memory_load: navigation.breadcrumbExists
      ? `✅ Breadcrumb으로 사용자의 기억 부담을 줄입니다.`
      : `⚠️ Breadcrumb이 없어 사용자가 현재 위치를 기억해야 합니다.`,
    
    N7_1_quick_access: navigation.menuCount >= 1
      ? `✅ ${navigation.menuCount}개의 메뉴로 주요 기능에 빠르게 접근할 수 있습니다.`
      : `⚠️ 메뉴가 없어 빠른 접근이 제한적입니다.`,
    
    N7_2_customization: visuals.iconCount > 3
      ? `✅ 시각적 요소가 충분하여 맞춤 설정 가능성이 있습니다.`
      : `⚠️ 맞춤 설정 옵션이 제한적으로 보입니다.`,
    
    N7_3_search_filter: navigation.searchExists
      ? `✅ ${url}에서 검색 기능이 발견되어 효율적인 정보 탐색이 가능합니다.`
      : `⚠️ 검색 기능이 없어 정보 탐색 효율성이 낮을 수 있습니다.`,
    
    N8_1_essential_info: content.paragraphCount >= 5 && content.paragraphCount <= 30
      ? `✅ 문단 ${content.paragraphCount}개로 핵심 정보에 집중합니다.`
      : `⚠️ 문단 수(${content.paragraphCount})가 정보 밀도에 영향을 줄 수 있습니다.`,
    
    N8_2_clean_interface: visuals.imageCount >= 3 && visuals.imageCount <= 20
      ? `✅ 이미지 ${visuals.imageCount}개로 깔끔한 인터페이스를 유지합니다.`
      : `⚠️ 이미지 수(${visuals.imageCount})가 인터페이스 깔끔함에 영향을 줍니다.`,
    
    N8_3_visual_hierarchy: content.headingCount >= 5
      ? `✅ 헤딩 ${content.headingCount}개로 명확한 시각적 계층을 형성합니다.`
      : `⚠️ 헤딩이 ${content.headingCount}개로 시각적 계층이 약합니다.`,
    
    N9_2_recovery_support: forms.validationExists
      ? `✅ 폼 검증으로 오류 복구를 지원합니다.`
      : forms.formCount === 0
        ? `ℹ️ 폼이 없어 복구 지원이 필요하지 않습니다.`
        : `⚠️ 오류 복구 지원이 미흡합니다.`,
    
    N9_4_error_guidance: content.listCount > 3
      ? `✅ 리스트 ${content.listCount}개가 체계적인 안내를 제공할 가능성이 높습니다.`
      : `⚠️ 구조화된 안내 정보가 부족합니다.`,
    
    N10_1_help_visibility: navigation.searchExists
      ? `✅ 검색 기능으로 도움말을 쉽게 찾을 수 있습니다.`
      : content.listCount > 3
        ? `✅ 리스트 형태로 도움말 정보가 구조화되어 있습니다.`
        : `⚠️ 도움말 찾기가 어려울 수 있습니다.`,
    
    N10_2_documentation: content.listCount > 5
      ? `✅ ${content.listCount}개의 리스트로 문서화가 잘 되어 있습니다.`
      : `⚠️ 리스트가 ${content.listCount}개로 문서화가 부족합니다.`,
  }
}
