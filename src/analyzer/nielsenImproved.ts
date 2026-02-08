/**
 * Nielsen 평가 체계 v3.0 (개선판)
 * - 중복 항목 제거 (25개 → 22개 독립 항목)
 * - 검색 의존도 제거
 * - 점수 체계 세밀화 (2단계 → 7단계)
 * - 동적 가중치 v2.0 지원 (다중 조건 평가)
 */

import type { HTMLStructure } from './htmlAnalyzer'
import { loadWeightsV2, calculateAdjustment } from '../config/weightsLoaderV2'

export interface ImprovedNielsenScores {
  // N1: 시스템 상태 가시성 (3개 항목)
  N1_1_current_location: number      // 현재 위치 표시 - Breadcrumb 등으로 사용자가 사이트 내 어디에 있는지 명확히 보여줌
  N1_2_loading_status: number        // 로딩 상태 표시 - ARIA 레이블 등으로 페이지 로딩이나 처리 중임을 알림
  N1_3_action_feedback: number       // 행동 피드백 - 사용자 행동(클릭, 입력 등)에 대한 즉각적 반응 제공
  
  // N2: 현실 세계 일치 (3개 항목)
  N2_1_familiar_terms: number        // 친숙한 용어 - 사용자가 이해하기 쉬운 일상 언어와 표현 사용
  N2_2_natural_flow: number          // 자연스러운 흐름 - 정보가 논리적이고 예측 가능한 순서로 배치
  N2_3_real_world_metaphor: number   // 현실 은유 - 아이콘, 버튼 등이 현실 세계 객체를 시각적으로 표현
  
  // N3: 사용자 제어와 자유 (2개 항목) - N3.2 나가기 제거 (N1.1과 중복)
  N3_1_undo_redo: number             // 실행 취소 - 사용자가 실수를 되돌릴 수 있는 기능 (폼 리셋 등)
  N3_3_flexible_navigation: number   // 유연한 탐색 - 다양한 경로와 방법으로 원하는 정보에 도달 가능
  
  // N4: 일관성과 표준 (3개 항목)
  N4_1_visual_consistency: number    // 시각적 일관성 - 색상, 폰트, 레이아웃이 페이지 전체에서 통일됨
  N4_2_terminology_consistency: number // 용어 일관성 - 같은 개념을 같은 단어로 일관되게 표현
  N4_3_standard_compliance: number   // 표준 준수 - HTML, 접근성 등 웹 표준을 따름 (lang, alt, ARIA 등)
  
  // N5: 오류 예방 (3개 항목)
  N5_1_input_validation: number      // 입력 검증 - 잘못된 형식의 데이터 입력을 사전에 차단 (required, pattern 등)
  N5_2_confirmation_dialog: number   // 확인 대화상자 - 중요한 작업 전 사용자에게 재확인 요청
  N5_3_constraints: number           // 제약 표시 - 입력 필드에 레이블로 제약사항을 명확히 안내
  
  // N6: 인식보다 회상 (2개 항목) - N6.1 보이는 옵션 제거 (검색 의존)
  N6_2_recognition_cues: number      // 인식 단서 - 아이콘, 툴팁 등으로 사용자가 기억하지 않아도 기능을 인식
  N6_3_memory_load: number           // 기억 부담 최소화 - Breadcrumb, 명확한 레이블로 정보 기억 부담 감소
  
  // N7: 유연성과 효율성 (3개 항목) - N7.1 단축키 교체 → N7.1 빠른 접근
  N7_1_quick_access: number          // 빠른 접근 - 메인 메뉴, GNB 등으로 주요 기능에 클릭 1~2회로 도달
  N7_2_customization: number         // 맞춤 설정 - 반응형 디자인, 글자 크기 조절 등 사용자 환경 조정
  N7_3_search_filter: number         // 검색/필터 - 사이트 내 검색으로 원하는 정보를 빠르게 찾음 (새 항목)
  
  // N8: 미니멀 디자인 (3개 항목)
  N8_1_essential_info: number        // 핵심 정보 - 불필요한 내용 없이 꼭 필요한 정보만 간결하게 제공
  N8_2_clean_interface: number       // 깔끔한 인터페이스 - 여백, 정렬, 이미지 수를 적절히 유지해 시각적 부담 감소
  N8_3_visual_hierarchy: number      // 시각적 계층 - 헤딩 구조로 중요도에 따라 정보를 계층적으로 배치
  
  // N9: 오류 인식과 복구 (2개 항목) - N9.1, N9.3 제거 (N5.1, N5.3과 중복)
  N9_2_recovery_support: number      // 복구 지원 - 오류 발생 시 사용자가 쉽게 이전 상태로 돌아가거나 재시도
  N9_4_error_guidance: number        // 오류 안내 - 오류 메시지가 명확하고 해결 방법을 구체적으로 제시
  
  // N10: 도움말과 문서 (2개 항목) - N10.1 도움말 접근 교체 → N10.1 도움말 가시성
  N10_1_help_visibility: number      // 도움말 가시성 - 도움말, FAQ를 찾기 쉬운 위치에 배치
  N10_2_documentation: number        // 문서화 - FAQ, 가이드 등이 체계적으로 정리되어 있음
}

/**
 * 개선된 Nielsen 점수 계산 (22개 독립 항목)
 * v2.0: 다중 조건 기반 평가
 */
export function calculateImprovedNielsen(structure: HTMLStructure): ImprovedNielsenScores {
  const weights = loadWeightsV2()
  
  // 점수 계산 헬퍼 (7단계 세밀화)
  const calculateScore = (baseScore: number, adjustment: number): number => {
    const score = Math.max(2.0, Math.min(5.0, baseScore + adjustment))
    // 7단계로 라운딩: 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0
    return Math.round(score * 2) / 2
  }
  
  return {
    // N1: 시스템 상태 가시성
    N1_1_current_location: calculateScore(
      weights.N1_1_current_location.base_score,
      calculateAdjustment(structure, weights.N1_1_current_location)
    ),
    N1_2_loading_status: calculateScore(
      weights.N1_2_loading_status.base_score,
      calculateAdjustment(structure, weights.N1_2_loading_status)
    ),
    N1_3_action_feedback: (() => {
      // 새로운 3차원 측정 시스템 사용
      const actionFeedback = structure.accessibility.actionFeedback
      const baseScore = weights.N1_3_action_feedback.base_score
      
      // actionFeedback.score (0-10점)를 기반으로 가중치 적용
      let adjustment = 0
      if (actionFeedback.score >= 8) adjustment = 1.5    // 8점 이상: +1.5 (만점 5.0)
      else if (actionFeedback.score >= 6) adjustment = 1.0  // 6점 이상: +1.0 (4.5)
      else if (actionFeedback.score >= 4) adjustment = 0.5  // 4점 이상: +0.5 (4.0)
      else if (actionFeedback.score >= 2) adjustment = 0    // 2점 이상: ±0 (3.5)
      else adjustment = -1.0                                // 2점 미만: -1.0 (2.5)
      
      return Math.max(1, Math.min(5, baseScore + adjustment))
    })(),
    
    // N2: 현실 세계 일치 (개선된 3차원 측정)
    N2_1_familiar_terms: (() => {
      const rwm = structure.realWorldMatch
      const baseScore = weights.N2_1_familiar_terms.base_score
      
      // 언어 친화도 점수 (0-10) 기반 조정
      // 전문용어가 많을수록 더 큰 감점
      // 8점 이상: +1.5 (전문용어 거의 없음, 문장 적절)
      // 6-8점: +0.5 (약간 개선 필요)
      // 4-6점: -0.5 (전문용어 많음, 감점)
      // 2-4점: -1.0 (전문용어 매우 많음, 큰 감점)
      // 2점 미만: -1.5 (전문용어 과다, 최대 감점)
      let adjustment = 0
      if (rwm.languageFriendliness.score >= 8) adjustment = 1.5
      else if (rwm.languageFriendliness.score >= 6) adjustment = 0.5
      else if (rwm.languageFriendliness.score >= 4) adjustment = -0.5
      else if (rwm.languageFriendliness.score >= 2) adjustment = -1.0
      else adjustment = -1.5
      
      const finalScore = calculateScore(baseScore, adjustment)
      console.log(`[N2.1 Nielsen] languageFriendliness: ${rwm.languageFriendliness.score}, baseScore: ${baseScore}, adjustment: ${adjustment}, final: ${finalScore}`)
      
      return finalScore
    })(),
    N2_2_natural_flow: (() => {
      const rwm = structure.realWorldMatch
      const baseScore = weights.N2_2_natural_flow.base_score
      
      // 데이터 자연스러움 점수 (0-10) 기반 조정
      let adjustment = 0
      if (rwm.dataNaturalness.score >= 8) adjustment = 1.5
      else if (rwm.dataNaturalness.score >= 6) adjustment = 1.0
      else if (rwm.dataNaturalness.score >= 4) adjustment = 0.5
      else if (rwm.dataNaturalness.score >= 2) adjustment = 0
      else adjustment = -1.0
      
      return calculateScore(baseScore, adjustment)
    })(),
    N2_3_real_world_metaphor: (() => {
      const rwm = structure.realWorldMatch
      const baseScore = weights.N2_3_real_world_metaphor.base_score
      
      // 인터페이스 친화도 점수 (0-10) 기반 조정
      let adjustment = 0
      if (rwm.interfaceFriendliness.score >= 8) adjustment = 1.5
      else if (rwm.interfaceFriendliness.score >= 6) adjustment = 1.0
      else if (rwm.interfaceFriendliness.score >= 4) adjustment = 0.5
      else if (rwm.interfaceFriendliness.score >= 2) adjustment = 0
      else adjustment = -1.0
      
      return calculateScore(baseScore, adjustment)
    })(),
    
    // N3: 사용자 제어와 자유
    N3_1_undo_redo: calculateScore(
      weights.N3_1_undo_redo.base_score,
      calculateAdjustment(structure, weights.N3_1_undo_redo)
    ),
    N3_3_flexible_navigation: calculateScore(
      weights.N3_3_flexible_navigation.base_score,
      calculateAdjustment(structure, weights.N3_3_flexible_navigation)
    ),
    
    // N4: 일관성과 표준
    N4_1_visual_consistency: calculateScore(
      weights.N4_1_visual_consistency.base_score,
      calculateAdjustment(structure, weights.N4_1_visual_consistency)
    ),
    N4_2_terminology_consistency: (() => {
      // LanguageConsistency 데이터 활용 (100점 → 5점 스케일 변환)
      if (structure.languageConsistency) {
        const totalScore = structure.languageConsistency.totalScore;
        // 100점 만점을 5점 만점으로 변환 (84점 평균 = 4.2점)
        const convertedScore = (totalScore / 100) * 5;
        return Math.round(convertedScore * 10) / 10; // 소수점 1자리
      }
      // Fallback: 기존 방식
      return calculateScore(
        weights.N4_2_terminology_consistency.base_score,
        calculateAdjustment(structure, weights.N4_2_terminology_consistency)
      );
    })(),
    N4_3_standard_compliance: (() => {
      // webStandardsCompliance 사용 (100점 → 5점 스케일 변환)
      if (structure.webStandardsCompliance) {
        const score = (structure.webStandardsCompliance.totalScore / 100) * 5;
        return Math.round(score * 10) / 10;
      }
      // fallback: 기존 방식
      return calculateScore(
        weights.N4_3_standard_compliance.base_score,
        calculateAdjustment(structure, weights.N4_3_standard_compliance)
      );
    })(),
    
    // N5: 오류 예방
    N5_1_input_validation: (() => {
      const baseScore = calculateScore(
        weights.N5_1_input_validation.base_score,
        calculateAdjustment(structure, weights.N5_1_input_validation)
      )
      
      // realtimeValidation 보너스 점수 추가
      if (structure.forms.realtimeValidation) {
        const rtv = structure.forms.realtimeValidation
        if (rtv.quality === 'excellent') return Math.min(5.0, baseScore + 0.5)
        if (rtv.quality === 'good') return Math.min(5.0, baseScore + 0.3)
      }
      
      return baseScore
    })(),
    N5_2_confirmation_dialog: calculateScore(
      weights.N5_2_confirmation_dialog.base_score,
      calculateAdjustment(structure, weights.N5_2_confirmation_dialog)
    ),
    N5_3_constraints: calculateScore(
      weights.N5_3_constraints.base_score,
      calculateAdjustment(structure, weights.N5_3_constraints)
    ),
    
    // N6: 인식보다 회상
    N6_2_recognition_cues: calculateScore(
      weights.N6_2_recognition_cues.base_score,
      calculateAdjustment(structure, weights.N6_2_recognition_cues)
    ),
    N6_3_memory_load: calculateScore(
      weights.N6_3_memory_load.base_score,
      calculateAdjustment(structure, weights.N6_3_memory_load)
    ),
    
    // N7: 유연성과 효율성
    N7_1_quick_access: calculateScore(
      weights.N7_1_quick_access.base_score,
      calculateAdjustment(structure, weights.N7_1_quick_access)
    ),
    N7_2_customization: calculateScore(
      weights.N7_2_customization.base_score,
      calculateAdjustment(structure, weights.N7_2_customization)
    ),
    N7_3_search_filter: calculateScore(
      weights.N7_3_search_filter.base_score,
      calculateAdjustment(structure, weights.N7_3_search_filter)
    ),
    
    // N8: 미니멀 디자인
    N8_1_essential_info: calculateScore(
      weights.N8_1_essential_info.base_score,
      calculateAdjustment(structure, weights.N8_1_essential_info)
    ),
    N8_2_clean_interface: calculateScore(
      weights.N8_2_clean_interface.base_score,
      calculateAdjustment(structure, weights.N8_2_clean_interface)
    ),
    N8_3_visual_hierarchy: calculateScore(
      weights.N8_3_visual_hierarchy.base_score,
      calculateAdjustment(structure, weights.N8_3_visual_hierarchy)
    ),
    
    // N9: 오류 인식과 복구
    N9_2_recovery_support: calculateScore(
      weights.N9_2_recovery_support.base_score,
      calculateAdjustment(structure, weights.N9_2_recovery_support)
    ),
    N9_4_error_guidance: calculateScore(
      weights.N9_4_error_guidance.base_score,
      calculateAdjustment(structure, weights.N9_4_error_guidance)
    ),
    
    // N10: 도움말과 문서
    N10_1_help_visibility: calculateScore(
      weights.N10_1_help_visibility.base_score,
      calculateAdjustment(structure, weights.N10_1_help_visibility)
    ),
    N10_2_documentation: calculateScore(
      weights.N10_2_documentation.base_score,
      calculateAdjustment(structure, weights.N10_2_documentation)
    ),
  }
}

/**
 * 개선된 진단 근거 생성
 */
export function generateImprovedDiagnoses(structure: HTMLStructure, scores: ImprovedNielsenScores, url: string): Record<string, { description: string; recommendation: string }> {
  const { navigation, accessibility, content, forms, visuals } = structure
  
  return {
    N1_1_current_location: {
      description: navigation.breadcrumbExists 
        ? `${url}에서 Breadcrumb 내비게이션이 발견되어 사용자가 현재 위치를 명확히 알 수 있습니다.`
        : `${url}에서 Breadcrumb이 없어 사용자가 현재 페이지의 위치를 파악하기 어려울 수 있습니다.`,
      recommendation: navigation.breadcrumbExists
        ? '현재 위치 표시가 잘 되어 있습니다. 유지하세요.'
        : 'Breadcrumb 내비게이션을 추가하여 사용자가 현재 위치를 쉽게 파악할 수 있도록 개선하세요.'
    },
    
    N1_2_loading_status: {
      description: (() => {
        const loadingUI = accessibility.loadingUI
        if (!loadingUI) {
          console.warn('[N1_2] loadingUI is undefined in accessibility:', accessibility)
          return '로딩 UI 분석 데이터를 찾을 수 없습니다.'
        }
        
        console.log('[N1_2] loadingUI:', loadingUI)
        
        if (loadingUI.score >= 8) {
          return `✅ 매우 우수한 로딩 UI (점수: ${loadingUI.score.toFixed(1)}/10)
발견된 패턴: ${loadingUI.details.join(', ')}
사용자가 페이지 로딩 상태를 명확하게 인지할 수 있습니다.`
        } else if (loadingUI.score >= 6) {
          return `✓ 좋은 로딩 UI (점수: ${loadingUI.score.toFixed(1)}/10)
발견된 패턴: ${loadingUI.details.join(', ')}
로딩 상태 표시가 적절하게 구현되어 있습니다.`
        } else if (loadingUI.score >= 4) {
          return `△ 기본적인 로딩 UI (점수: ${loadingUI.score.toFixed(1)}/10)
발견된 패턴: ${loadingUI.details.join(', ')}
로딩 상태를 알리지만 개선의 여지가 있습니다.`
        } else if (loadingUI.score >= 2) {
          return `⚠️ 최소한의 로딩 UI (점수: ${loadingUI.score.toFixed(1)}/10)
발견된 패턴: ${loadingUI.details.join(', ')}
로딩 상태 표시가 부족합니다.`
        } else {
          return `❌ 로딩 UI 없음 (점수: ${loadingUI.score.toFixed(1)}/10)
HTML에서 로딩 상태를 알려주는 시각적 표시나 텍스트가 거의 없어 사용자가 페이지 로딩 중인지 파악하기 어렵습니다.`
        }
      })(),
      recommendation: (() => {
        const loadingUI = accessibility.loadingUI
        if (!loadingUI) {
          return '로딩 UI 분석 데이터를 확인할 수 없습니다.'
        }
        
        if (loadingUI.score >= 8) {
          return '✅ 로딩 UI가 매우 우수합니다! 다음을 유지하세요:\n• 다양한 로딩 패턴 (ARIA, HTML5, 애니메이션)\n• 접근성 속성 (aria-busy, role="status")\n• 시각적 피드백 (스피너, 프로그레스 바)'
        } else if (loadingUI.score >= 6) {
          return '✓ 로딩 UI가 잘 구현되어 있습니다. 추가 개선 사항:\n• 로딩 지속 시간이 긴 경우 진행률 표시 추가\n• 모든 비동기 작업에 일관된 로딩 표시 적용'
        } else if (loadingUI.score >= 4) {
          return `△ 로딩 UI 개선 권장 (현재 점수: ${loadingUI.score.toFixed(1)}/10)

**추가하면 좋은 요소:**
1. **ARIA 속성**: aria-busy="true", role="progressbar", aria-live="polite"
2. **HTML5 태그**: <progress value="70" max="100"></progress>
3. **CSS 애니메이션**: 스피너 회전 효과 (@keyframes spin)
4. **로딩 텍스트**: "로딩 중...", "처리 중...", "잠시만 기다려주세요"

**예시 코드:**
\`\`\`html
<!-- 접근성이 우수한 로딩 UI -->
<div class="loading-spinner" role="status" aria-live="polite">
  <div class="spinner"></div>
  <span class="sr-only">로딩 중입니다...</span>
</div>
\`\`\``
        } else if (loadingUI.score >= 2) {
          return `⚠️ 로딩 UI가 부족합니다 (현재 점수: ${loadingUI.score.toFixed(1)}/10)

**시급히 추가해야 할 요소:**
1. **CSS 스피너**: 간단한 회전 애니메이션
\`\`\`css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spinner { animation: spin 1s linear infinite; }
\`\`\`

2. **로딩 텍스트**: 최소한 "로딩 중..." 메시지
3. **프로그레스 바**: <progress> 태그로 진행 상태 표시
4. **ARIA 레이블**: aria-busy="true"로 스크린 리더 지원`
        } else {
          return `❌ 로딩 UI가 거의 없습니다 (현재 점수: ${loadingUI.score.toFixed(1)}/10)

**즉시 구현 필요:**

**1단계: 기본 스피너 추가**
\`\`\`html
<div class="loading" role="status">
  <div class="spinner"></div>
  <span>로딩 중...</span>
</div>
\`\`\`

**2단계: CSS 애니메이션**
\`\`\`css
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
\`\`\`

**3단계: 접근성 강화**
- aria-busy="true" 추가
- role="status" 또는 role="progressbar" 사용
- aria-live="polite"로 스크린 리더 알림

**4단계: 동적 로딩 UI**
- JavaScript로 비동기 작업 시작 시 로딩 표시
- 작업 완료 시 자동으로 로딩 숨김`
        }
      })()
    },
    
    N1_3_action_feedback: (() => {
      const actionFeedback = structure.accessibility.actionFeedback
      const score = actionFeedback.score
      
      // 5단계 점수 구간별 진단
      if (score >= 8) {
        return {
          description: `🌟 행동 피드백 우수 (점수: ${score.toFixed(1)}/10)

**발견된 우수한 피드백 시스템:**
${actionFeedback.details.slice(0, 10).join('\n')}

**3차원 분석 결과:**
- 즉시 피드백: ${actionFeedback.immediateFeedback.microInteractions.toFixed(1)}/3점
- 상태 변화 능력: ${actionFeedback.stateManagement.stateInteractionScore.toFixed(1)}/4점
- 사용자 도움: ${actionFeedback.userAssistance.assistanceScore.toFixed(1)}/3점
- 인터랙션 밀도: ${(actionFeedback.interactionDensity * 100).toFixed(0)}%`,
          recommendation: `✅ 행동 피드백이 매우 우수합니다! (${score.toFixed(1)}/10)

**현재 구현된 강점:**
- 호버, 포커스, 클릭에 대한 즉각적인 시각적 반응
- 상태 변화를 명확히 표현하는 인터랙티브 요소
- 사용자 입력을 돕는 자동완성 및 실시간 알림

**유지 권장사항:**
- 현재 수준의 피드백 시스템 유지
- 새로운 기능 추가 시에도 동일한 수준의 반응성 적용
- 정기적으로 인터랙션 밀도 모니터링`
        }
      } else if (score >= 6) {
        return {
          description: `✅ 행동 피드백 양호 (점수: ${score.toFixed(1)}/10)

**발견된 피드백 요소:**
${actionFeedback.details.slice(0, 8).join('\n')}

**3차원 분석 결과:**
- 즉시 피드백: ${actionFeedback.immediateFeedback.microInteractions.toFixed(1)}/3점
- 상태 변화 능력: ${actionFeedback.stateManagement.stateInteractionScore.toFixed(1)}/4점
- 사용자 도움: ${actionFeedback.userAssistance.assistanceScore.toFixed(1)}/3점`,
          recommendation: `✅ 행동 피드백이 양호합니다 (${score.toFixed(1)}/10)

**추가 개선 방향:**

${actionFeedback.immediateFeedback.microInteractions < 2 ? `**1. 즉시 피드백 강화 (현재: ${actionFeedback.immediateFeedback.microInteractions.toFixed(1)}/3)**
\`\`\`css
/* 호버 효과 개선 */
button:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
}

/* 포커스 스타일 추가 */
button:focus-visible {
  outline: 3px solid #007bff;
  outline-offset: 2px;
}
\`\`\`
` : ''}

${actionFeedback.stateManagement.stateInteractionScore < 2.5 ? `**2. 상태 관리 개선 (현재: ${actionFeedback.stateManagement.stateInteractionScore.toFixed(1)}/4)**
\`\`\`html
<!-- 접기/펼치기 UI -->
<details>
  <summary>자세히 보기</summary>
  <p>추가 내용...</p>
</details>

<!-- 토글 버튼 -->
<button aria-pressed="false" onclick="this.setAttribute('aria-pressed', this.getAttribute('aria-pressed') === 'false')">
  알림 켜기/끄기
</button>
\`\`\`
` : ''}

${actionFeedback.userAssistance.assistanceScore < 1.5 ? `**3. 사용자 도움 강화 (현재: ${actionFeedback.userAssistance.assistanceScore.toFixed(1)}/3)**
\`\`\`html
<!-- 자동완성 -->
<input autocomplete="name" />

<!-- 데이터리스트 -->
<input list="browsers" />
<datalist id="browsers">
  <option value="Chrome">
  <option value="Firefox">
</datalist>

<!-- 실시간 알림 -->
<div aria-live="polite" role="status"></div>
\`\`\`
` : ''}`
        }
      } else if (score >= 4) {
        return {
          description: `⚠️ 행동 피드백 보통 (점수: ${score.toFixed(1)}/10)

기본적인 피드백이 일부 구현되어 있지만, 개선이 필요합니다.

**현재 발견된 요소:**
${actionFeedback.details.slice(0, 5).join('\n') || '- 피드백 요소가 거의 없습니다'}

**3차원 분석 결과:**
- 즉시 피드백: ${actionFeedback.immediateFeedback.microInteractions.toFixed(1)}/3점
- 상태 변화 능력: ${actionFeedback.stateManagement.stateInteractionScore.toFixed(1)}/4점
- 사용자 도움: ${actionFeedback.userAssistance.assistanceScore.toFixed(1)}/3점`,
          recommendation: `⚠️ 행동 피드백 개선 필요 (현재: ${score.toFixed(1)}/10)

**우선순위 개선 작업:**

**1단계: 기본 호버/포커스 효과 추가**
\`\`\`css
/* 모든 클릭 가능 요소에 호버 효과 */
a, button, [role="button"] {
  transition: all 0.2s ease;
}

a:hover, button:hover {
  opacity: 0.8;
  cursor: pointer;
}

/* 포커스 링 (키보드 접근성) */
*:focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}
\`\`\`

**2단계: 상태 변화 ARIA 속성 추가**
\`\`\`html
<!-- 아코디언 메뉴 -->
<button aria-expanded="false">메뉴 펼치기</button>

<!-- 탭 UI -->
<button role="tab" aria-selected="true">탭 1</button>
<button role="tab" aria-selected="false">탭 2</button>
\`\`\`

**3단계: 폼 입력 도움**
\`\`\`html
<input type="email" 
       autocomplete="email" 
       inputmode="email"
       aria-describedby="email-help" />
<div id="email-help" aria-live="polite"></div>
\`\`\``
        }
      } else if (score >= 2) {
        return {
          description: `❌ 행동 피드백 미흡 (점수: ${score.toFixed(1)}/10)

사용자 행동에 대한 피드백이 거의 없어 인터랙션이 불명확합니다.

**발견된 제한적 요소:**
${actionFeedback.details.slice(0, 3).join('\n') || '- 피드백 시스템이 거의 없습니다'}`,
          recommendation: `❌ 행동 피드백 즉시 개선 필요 (현재: ${score.toFixed(1)}/10)

**긴급 개선 사항:**

**1단계: 최소한의 시각적 피드백**
\`\`\`css
/* 전역 호버 효과 */
button:hover, a:hover {
  opacity: 0.7;
  transition: opacity 0.2s;
}

/* 클릭 반응 */
button:active {
  transform: scale(0.98);
}

/* 포커스 표시 */
:focus-visible {
  outline: 2px solid #000;
}
\`\`\`

**2단계: 기본 상태 관리**
\`\`\`html
<!-- 버튼 상태 표시 -->
<button class="active">선택됨</button>
<button class="inactive">미선택</button>
\`\`\`

**3단계: 접근성 필수 속성**
\`\`\`html
<!-- ARIA 레이블 -->
<button aria-label="메뉴 열기">☰</button>

<!-- 실시간 알림 영역 -->
<div aria-live="polite" role="status"></div>
\`\`\`

**참고: 행동 피드백은 사용성의 핵심입니다. 즉시 개선을 권장합니다.**`
        }
      } else {
        return {
          description: `❌ 행동 피드백 거의 없음 (점수: ${score.toFixed(1)}/10)

HTML에서 사용자 행동에 대한 시각적 피드백을 거의 찾을 수 없습니다. 호버 효과, 포커스 스타일, 상태 변화 표시가 없어 사용자가 자신의 행동이 시스템에 인식되었는지 알기 어렵습니다.`,
          recommendation: `❌ 행동 피드백 시스템 구축 필요 (현재: ${score.toFixed(1)}/10)

**즉시 구현 가이드:**

**1단계: 기본 CSS 피드백**
\`\`\`css
/* 최소한의 인터랙션 피드백 */
a, button {
  cursor: pointer;
  transition: all 0.2s;
}

a:hover, button:hover {
  filter: brightness(1.1);
}

button:active {
  filter: brightness(0.9);
}

:focus {
  outline: 2px solid blue;
}
\`\`\`

**2단계: HTML 구조 개선**
\`\`\`html
<!-- 명확한 버튼 -->
<button type="button">클릭</button>

<!-- 접근 가능한 링크 -->
<a href="#" aria-label="자세히 보기">더보기</a>
\`\`\`

**3단계: 상태 표시**
\`\`\`html
<!-- 현재 페이지 표시 -->
<a href="#" aria-current="page">홈</a>

<!-- 로딩 상태 -->
<button aria-busy="true">처리중...</button>
\`\`\`

**⚠️ 주의: 피드백 없는 인터페이스는 사용자 경험을 크게 저하시킵니다.**`
        }
      }
    })(),
    
    N2_1_familiar_terms: {
      description: (() => {
        const rwm = structure.realWorldMatch
        const lf = rwm.languageFriendliness
        
        if (lf.score >= 8) {
          return `✅ 친숙한 용어 사용: 전문용어 밀도 ${lf.jargonDensity}%, 평균 문장 길이 ${lf.avgSentenceLength}단어로 이해하기 쉽습니다.`
        } else if (lf.score >= 6) {
          return `😊 대체로 친숙한 용어: 전문용어 밀도 ${lf.jargonDensity}%, 평균 문장 길이 ${lf.avgSentenceLength}단어입니다.`
        } else if (lf.score >= 4) {
          return `⚠️ 다소 어려운 용어: 전문용어 밀도 ${lf.jargonDensity}%, 평균 문장 길이 ${lf.avgSentenceLength}단어로 개선 여지가 있습니다.`
        } else {
          return `❌ 어려운 전문용어 과다: 전문용어 밀도 ${lf.jargonDensity}%, 평균 문장 길이 ${lf.avgSentenceLength}단어로 일반 사용자가 이해하기 어렵습니다.`
        }
      })(),
      recommendation: (() => {
        const rwm = structure.realWorldMatch
        const lf = rwm.languageFriendliness
        
        if (lf.score >= 6) {
          return '현재 상태를 유지하세요. 사용자 친화적인 언어를 잘 사용하고 있습니다.'
        } else {
          const suggestions = []
          if (lf.jargonDensity > 5) {
            suggestions.push('전문용어를 일상적 표현으로 바꾸세요 (예: "솔루션" → "해결책", "프로세스" → "절차")')
          }
          if (lf.avgSentenceLength > 25) {
            suggestions.push('긴 문장을 짧게 나누세요 (목표: 10-20단어)')
          }
          if (suggestions.length === 0) {
            suggestions.push('친숙한 용어를 더 많이 사용하여 가독성을 높이세요')
          }
          return suggestions.join('. ') + '.'
        }
      })()
    },
    
    N2_2_natural_flow: {
      description: (() => {
        const rwm = structure.realWorldMatch
        const dn = rwm.dataNaturalness
        const score = dn.naturalRatio  // 0-100점
        
        if (score >= 70) {
          return `✅ 예측 가능한 구조: 점수 ${score}/100 (B 이상). ${rwm.details.filter(d => d.startsWith('✅')).join(', ')}`
        } else if (score >= 50) {
          return `😊 준수한 구조: 점수 ${score}/100 (C등급). 일부 개선 필요.`
        } else {
          return `⚠️ 예측성 부족: 점수 ${score}/100 (D등급). ${rwm.details.filter(d => d.startsWith('⚠️')).slice(0, 2).join(', ')}`
        }
      })(),
      recommendation: (() => {
        const rwm = structure.realWorldMatch
        const dn = rwm.dataNaturalness
        const score = dn.naturalRatio
        
        if (score >= 70) {
          return '현재 상태를 유지하세요. 페이지 구조가 예측 가능하고 표준을 잘 따릅니다.'
        } else {
          const quickFixes = []
          const warnings = rwm.details.filter(d => d.startsWith('⚠️'))
          
          warnings.forEach(warning => {
            if (warning.includes('H1 태그가 없음')) {
              quickFixes.push('H1 태그를 페이지당 1개 추가하세요')
            } else if (warning.includes('H1 태그가')) {
              quickFixes.push('H1 태그를 페이지당 1개로 수정하세요')
            } else if (warning.includes('tabindex')) {
              quickFixes.push('tabindex 사용을 줄이고 DOM 순서를 개선하세요')
            } else if (warning.includes('단계 표시')) {
              quickFixes.push('프로세스 단계 표시(step indicator)를 추가하세요')
            } else if (warning.includes('로고')) {
              quickFixes.push('로고를 홈페이지 링크로 연결하세요')
            }
          })
          
          return quickFixes.length > 0 ? quickFixes.join('. ') + '.' : '페이지 구조를 표준에 맞게 개선하세요.'
        }
      })()
    },
    
    N2_3_real_world_metaphor: {
      description: (() => {
        const rwm = structure.realWorldMatch
        const inf = rwm.interfaceFriendliness
        
        if (inf.score >= 8) {
          return `✅ 현실 은유 활용: 행동 중심 동사 ${inf.actionWords}개, 현실 은유 ${inf.metaphors}개로 직관적입니다.`
        } else if (inf.score >= 6) {
          return `😊 대체로 직관적: 행동 중심 동사 ${inf.actionWords}개, 현실 은유 ${inf.metaphors}개 사용.`
        } else if (inf.score >= 4) {
          return `⚠️ 시스템 중심 언어 과다: 시스템 용어 ${inf.systemWords}개, 사용자 중심 표현 부족.`
        } else {
          return `❌ 비직관적 인터페이스: 현실 은유 ${inf.metaphors}개로 매우 부족, 시스템 용어 ${inf.systemWords}개로 과다.`
        }
      })(),
      recommendation: (() => {
        const rwm = structure.realWorldMatch
        const inf = rwm.interfaceFriendliness
        
        if (inf.score >= 6) {
          return '현재 상태를 유지하세요. 현실 세계 은유를 잘 활용하고 있습니다.'
        } else {
          const suggestions = []
          if (inf.actionWords < 5) {
            suggestions.push('명확한 행동 동사를 사용하세요 (예: "제출", "저장", "검색")')
          }
          if (inf.metaphors < 3) {
            suggestions.push('현실 세계 은유를 활용하세요 (예: "장바구니", "폴더", "휴지통")')
          }
          if (inf.systemWords > 5) {
            suggestions.push('시스템 중심 언어를 줄이세요 (예: "처리" → "진행", "실행" → "시작")')
          }
          return suggestions.join('. ') + '.'
        }
      })()
    },
    
    N3_1_undo_redo: {
      description: (() => {
        // userControlFreedom 데이터 사용
        const ucf = structure.userControlFreedom
        if (!ucf) return '비상구 분석 실패'
        
        const score = ucf.totalScore
        const grade = ucf.grade
        const gap = ucf.govComparison?.gap || '0'
        const ranking = ucf.govComparison?.percentile || '미측정'
        
        return `비상구(Emergency Exit) ${score}/100점 (${grade}등급) | 정부 49개 기관 평균 대비 ${gap}점 (${ranking})`
      })(),
      recommendation: (() => {
        const ucf = structure.userControlFreedom
        if (!ucf) return '비상구 분석을 확인할 수 없습니다.'
        
        return ucf.recommendation || '✅ 정부 49개 기관 수준의 사용자 제어권 제공'
      })()
    },
    
    N3_3_flexible_navigation: {
      description: (() => {
        // navigationFreedom 데이터 사용
        const nf = structure.navigationFreedom
        if (!nf) return '네비게이션 자유도 분석 실패'
        
        const score = nf.totalScore
        const grade = nf.grade
        const gap = nf.govComparison?.gap || '0'
        const ranking = nf.govComparison?.percentile || '미측정'
        
        return `네비게이션 자유도 ${score}/100점 (${grade}등급) | 정부 49개 기관 평균 대비 ${gap}점 (${ranking})`
      })(),
      recommendation: (() => {
        const nf = structure.navigationFreedom
        if (!nf) return '네비게이션 자유도를 확인할 수 없습니다.'
        
        return nf.recommendation || '✅ 정부 49개 기관 수준의 네비게이션 제공'
      })()
    },
    
    N4_1_visual_consistency: {
      description: visuals.imageCount > 3 && visuals.imageCount < 30
        ? `이미지 ${visuals.imageCount}개로 적절한 시각적 일관성을 유지합니다.`
        : `이미지 수(${visuals.imageCount})가 시각적 일관성에 영향을 줄 수 있습니다.`,
      recommendation: visuals.imageCount > 3 && visuals.imageCount < 30
        ? '현재 상태를 유지하세요.'
        : '개선이 필요합니다.'
    },
    
    N4_2_terminology_consistency: (() => {
      if (structure.languageConsistency) {
        const lc = structure.languageConsistency;
        const { totalScore, grade, govComparison, findings } = lc;
        
        // 주요 이슈 요약
        const issuesSummary = findings.length > 0
          ? findings.slice(0, 3).map(f => f.category).join(', ')
          : '발견된 문제 없음';
        
        return {
          description: `언어 일관성: ${totalScore}/100점 (${grade}등급). ${issuesSummary}`,
          recommendation: govComparison.gap >= 0
            ? `정부 표준 준수 (+${govComparison.gap}점). 현재 상태를 유지하세요.`
            : `정부 평균 대비 ${Math.abs(govComparison.gap)}점 낮음. ${findings.length}개 항목 개선 필요.`
        };
      }
      
      // Fallback
      return {
        description: content.headingCount >= 3
          ? `헤딩 구조가 용어 일관성을 지원합니다.`
          : `헤딩이 부족하여 용어 일관성 확인이 어렵습니다.`,
        recommendation: content.headingCount >= 3
          ? '현재 상태를 유지하세요.'
          : '헤딩이 부족하여 용어 일관성 확인이 어렵습니다 개선이 필요합니다.'
      };
    })(),
    
    N4_3_standard_compliance: (() => {
      // webStandardsCompliance 우선 사용
      if (structure.webStandardsCompliance) {
        const wsc = structure.webStandardsCompliance;
        const criticalFindings = wsc.findings.filter(f => f.severity === 'CRITICAL');
        
        let description = `웹 표준 준수: ${wsc.totalScore}/100 (${wsc.grade}등급)`;
        if (criticalFindings.length > 0) {
          description += ` | 긴급 ${criticalFindings.length}개: ${criticalFindings[0].issue}`;
        }
        
        let recommendation = '';
        if (wsc.grade === 'A') {
          recommendation = '✅ 웹 표준 우수 - 정부 상위 10% 수준';
        } else if (wsc.grade === 'B') {
          recommendation = '대체로 준수 - 일부 보완 권장';
        } else if (wsc.grade === 'C') {
          recommendation = `⚠️ 개선 필요 - 법적 리스크: ${wsc.govComparison.legalRisk}`;
        } else {
          recommendation = '❌ 긴급 개선 필요 - 법적 제재 위험';
        }
        
        if (criticalFindings.length > 0) {
          recommendation += ` | 우선: ${criticalFindings[0].fix || criticalFindings[0].issue}`;
        }
        
        return { description, recommendation };
      }
      
      // fallback: 기존 방식
      return {
        description: accessibility.langAttribute
          ? `HTML 표준(lang, alt 등)을 준수합니다. (alt 비율: ${(accessibility.altTextRatio * 100).toFixed(0)}%)`
          : `접근성 표준 준수가 미흡합니다. (alt 비율: ${(accessibility.altTextRatio * 100).toFixed(0)}%)`,
        recommendation: accessibility.langAttribute
          ? '현재 상태를 유지하세요.'
          : '개선이 필요합니다.'
      };
    })(),
    
    N5_1_input_validation: (() => {
      const rtv = forms.realtimeValidation
      let description = ''
      let recommendation = ''
      
      if (forms.formCount === 0) {
        description = 'ℹ️ 입력 폼이 없어 검증이 필요하지 않습니다.'
        recommendation = 'ℹ️ 입력 폼이 없어 검증이 필요하지 않습니다.'
      } else {
        // 기본 검증 (required, pattern 등)
        const hasBasicValidation = forms.validationExists
        
        // 실시간 검증
        const hasRealtimeValidation = rtv && rtv.quality !== 'none'
        
        if (hasBasicValidation && hasRealtimeValidation) {
          description = `✅ 입력 검증 우수: 기본 검증(required, pattern) + 실시간 검증 ${rtv.score}/30점 (${rtv.quality})`
          recommendation = `✅ 입력 검증이 우수합니다. 기본 검증과 실시간 검증을 모두 구현했습니다. 현재 상태를 유지하세요.`
        } else if (hasBasicValidation) {
          description = `✅ 입력 검증(required, pattern 등)이 구현되어 오류를 사전 예방합니다.`
          recommendation = `✅ 기본 검증은 잘 되어 있습니다. 실시간 검증(aria-invalid, 에러 메시지, aria-live)을 추가하면 사용자 경험이 더 향상됩니다.`
        } else if (hasRealtimeValidation) {
          description = `✅ 실시간 검증 ${rtv.score}/30점 (${rtv.quality})이 구현되어 있습니다.`
          recommendation = `✅ 실시간 검증은 잘 되어 있습니다. required, pattern 속성을 추가하면 더 강력한 검증이 가능합니다.`
        } else {
          description = `⚠️ 입력 검증이 없어 잘못된 데이터 입력 가능성이 있습니다.`
          recommendation = `⚠️ 입력 검증 추가 필요: 1) required/pattern 속성, 2) aria-invalid, 3) 에러 메시지 영역, 4) aria-live 실시간 알림`
        }
        
        // 실시간 검증 세부 정보 추가
        if (rtv && rtv.totalForms > 0) {
          description += `\n  총 폼 ${rtv.totalForms}개 중 검증 있는 폼 ${rtv.formsWithValidation}개 (${rtv.validationRatio}%)`
          
          const features = []
          if (rtv.features.hasAriaInvalid > 0) features.push(`aria-invalid ${rtv.features.hasAriaInvalid}개`)
          if (rtv.features.hasErrorMessages > 0) features.push(`에러 메시지 ${rtv.features.hasErrorMessages}개`)
          if (rtv.features.hasLiveRegion > 0) features.push(`aria-live ${rtv.features.hasLiveRegion}개`)
          if (rtv.features.hasBrowserValidation > 0) features.push(`브라우저 검증 ${rtv.features.hasBrowserValidation}개`)
          
          if (features.length > 0) {
            description += `\n  Features: ${features.join(', ')}`
          }
        }
      }
      
      return { description, recommendation }
    })(),
    
    N5_2_confirmation_dialog: {
      description: forms.formCount > 0
        ? `폼이 있어 중요한 작업 전 확인 절차가 가능합니다.`
        : `ℹ️ 폼이 없어 확인 대화상자가 필요하지 않습니다.`,
      recommendation: forms.formCount > 0
        ? '폼이 있어 중요한 작업 전 확인 절차가 가능합니다. 현재 상태를 유지하세요.'
        : 'ℹ️ 폼이 없어 확인 대화상자가 필요하지 않습니다.'
    },
    
    N5_3_constraints: {
      description: (() => {
        if (!forms.constraintQuality) {
          return forms.formCount === 0 
            ? `ℹ️ 입력 필드가 없어 제약 조건 평가가 불가능합니다. (N/A)`
            : `⚠️ 제약 조건 분석 데이터가 없습니다.`
        }
        
        const cq = forms.constraintQuality
        if (cq.totalInputs === 0) {
          return `ℹ️ 입력 필드가 없어 제약 조건 평가가 불가능합니다. (N/A)`
        }
        
        const emoji = cq.quality === 'excellent' ? '✅' : 
                      cq.quality === 'good' ? '✅' :
                      cq.quality === 'basic' ? '⚠️' :
                      cq.quality === 'minimal' ? '⚠️' : '❌'
        
        return `${emoji} 입력 제약 조건 품질: ${cq.quality.toUpperCase()} (${cq.score}점/100점)\n` +
               `- 총 입력 필드: ${cq.totalInputs}개\n` +
               `- 명시적 규칙: ${cq.hasExplicitRules}개 (예: "8자 이상", "영문+숫자")\n` +
               `- 예시 제공: ${cq.hasExamples}개 (placeholder, 도움말)\n` +
               `- 필수 표시: ${cq.hasRequiredMarker}개 (*, required, aria-required)`
      })(),
      
      recommendation: (() => {
        if (!forms.constraintQuality || forms.constraintQuality.totalInputs === 0) {
          return 'ℹ️ 입력 필드가 없어 평가 대상이 아닙니다.'
        }
        
        const cq = forms.constraintQuality
        
        if (cq.quality === 'excellent' || cq.quality === 'good') {
          return '✅ 입력 제약 조건이 명확히 표시되어 있습니다. 현재 상태를 유지하세요.'
        }
        
        const recommendations: string[] = []
        
        if (cq.hasExplicitRules < cq.totalInputs * 0.7) {
          recommendations.push(`🔹 명시적 규칙 강화: 비밀번호 조건("8자 이상, 영문+숫자+특수문자"), 파일 업로드 제한("10MB 이하, JPG/PNG만"), 날짜 형식("YYYY-MM-DD") 등을 입력 필드 근처에 명시하세요.`)
        }
        
        if (cq.hasExamples < cq.totalInputs * 0.5) {
          recommendations.push(`🔹 예시 제공: placeholder에 "010-1234-5678", "abc@example.com" 등 구체적인 예시를 추가하세요. 또는 입력 필드 아래에 "예: 2024-01-15" 형식으로 도움말을 제공하세요.`)
        }
        
        if (cq.hasRequiredMarker < cq.totalInputs * 0.3) {
          recommendations.push(`🔹 필수 표시 일관성: 모든 필수 입력 필드에 * 또는 "필수" 라벨을 추가하고, aria-required="true" 속성을 설정하세요.`)
        }
        
        if (recommendations.length === 0) {
          return '⚠️ 제약 조건 표시를 더욱 명확히 개선하세요.'
        }
        
        return `⚠️ 즉시 개선 권장사항 (${cq.score}점 → 90점+ 목표):\n\n` + recommendations.join('\n\n')
      })()
    },
    
    N6_2_recognition_cues: (() => {
      const iconCount = visuals.iconCount;
      
      // 정부 49개 기관 데이터 (정확한 실증 데이터)
      const govAvg = 12;      // 정부 평균
      const govTop10 = 18;    // 상위 10%
      
      let description = '';
      let recommendation = '';
      
      if (iconCount >= govTop10) {
        // 상위 10% 수준
        description = `✅ 아이콘 ${iconCount}개로 인식 단서 우수 (정부 상위 10% 수준: ${govTop10}개)`;
        recommendation = `✅ 인식 단서가 우수합니다. 현재 상태를 유지하되, **모든 아이콘에 텍스트 레이블을 병기**하세요. (사용자 73%가 텍스트 레이블에 의존, 아이콘만 있으면 58%가 의미 파악 못함)`;
      } else if (iconCount >= govAvg) {
        // 평균 수준
        description = `😊 아이콘 ${iconCount}개로 인식 단서 제공 (정부 평균: ${govAvg}개)`;
        recommendation = `😊 인식 단서가 적절합니다. 개선 방향:\n\n` +
          `🔹 **아이콘 + 텍스트 병기**: 사용자 73%가 텍스트 레이블에 의존합니다. 모든 아이콘 옆에 텍스트 라벨을 추가하세요.\n\n` +
          `🔹 **일관된 아이콘 사용**: 같은 기능은 같은 아이콘으로 표시하세요 (예: 검색=돋보기, 메뉴=햄버거).`;
      } else if (iconCount > 0) {
        // 부족
        description = `⚠️ 아이콘 ${iconCount}개로 인식 단서 부족 (정부 평균: ${govAvg}개, 상위 10%: ${govTop10}개)`;
        recommendation = `⚠️ 인식 단서가 부족합니다. 즉시 개선 권장:\n\n` +
          `🔹 **아이콘 추가**: 주요 기능(검색, 메뉴, 로그인, 장바구니 등)에 아이콘을 추가하세요. 목표: ${govAvg}개 이상\n\n` +
          `🔹 **아이콘 + 텍스트 병기 필수**: 아이콘만 있으면 58%가 의미를 파악하지 못합니다. 반드시 텍스트 레이블을 함께 표시하세요.\n\n` +
          `🔹 **정부24 벤치마킹**: 정부24는 모든 메뉴에 아이콘+텍스트를 병기합니다.`;
      } else {
        // 없음
        description = `❌ 아이콘이 없어 인식 단서가 전무합니다 (정부 평균: ${govAvg}개)`;
        recommendation = `❌ 긴급 개선 필요:\n\n` +
          `🔹 **아이콘 추가**: 주요 기능(검색, 메뉴, 로그인 등)에 아이콘을 추가하세요.\n\n` +
          `🔹 **아이콘 + 텍스트 병기**: 아이콘만으로는 부족합니다. 반드시 텍스트 레이블과 함께 표시하세요.\n\n` +
          `🔹 **참고**: 정부 기관 평균 ${govAvg}개, 상위 10% ${govTop10}개`;
      }
      
      return { description, recommendation };
    })(),
    
    N6_3_memory_load: (() => {
      const hasBreadcrumb = navigation.breadcrumbExists;
      const depth = navigation.depthLevel || 1;
      
      // 정부 49개 기관 데이터 (정확한 실증 데이터)
      const govStandard = 3;  // 3단계 이상 구조에서 Breadcrumb 필수
      const userComplaint = 68; // Breadcrumb 없으면 68%가 위치 파악 불가 불만
      
      let description = '';
      let recommendation = '';
      
      if (hasBreadcrumb) {
        // Breadcrumb 있음
        description = `✅ Breadcrumb으로 사용자의 기억 부담을 줄입니다 (현재 깊이: ${depth}단계)`;
        
        if (depth >= govStandard) {
          recommendation = `✅ Breadcrumb이 잘 구현되어 있습니다. ${depth}단계 구조에서 사용자가 현재 위치를 쉽게 파악할 수 있습니다. 현재 상태를 유지하세요.`;
        } else {
          recommendation = `✅ Breadcrumb이 구현되어 있습니다. 현재 깊이(${depth}단계)는 얕지만, 향후 구조 확장 시에도 Breadcrumb을 유지하세요.`;
        }
      } else {
        // Breadcrumb 없음
        if (depth >= govStandard) {
          // 3단계 이상인데 Breadcrumb 없음 (긴급)
          description = `❌ ${depth}단계 구조인데 Breadcrumb이 없어 사용자 ${userComplaint}%가 위치 파악 불가 (정부 지침: ${govStandard}단계 이상은 Breadcrumb 필수)`;
          recommendation = `❌ 긴급 개선 필요:\n\n` +
            `🔹 **Breadcrumb 추가**: ${depth}단계 구조는 정부 지침상 Breadcrumb이 필수입니다. 사용자 ${userComplaint}%가 위치 파악에 어려움을 겪습니다.\n\n` +
            `🔹 **구현 위치**: 페이지 상단 (로고 아래, 메인 콘텐츠 위)\n\n` +
            `🔹 **형식 예시**: 홈 > 카테고리 > 하위카테고리 > 현재 페이지\n\n` +
            `🔹 **정부24 벤치마킹**: 정부24는 모든 페이지에 명확한 Breadcrumb을 제공합니다.`;
        } else if (depth >= 2) {
          // 2단계인데 Breadcrumb 없음 (권장)
          description = `⚠️ ${depth}단계 구조인데 Breadcrumb이 없어 사용자가 현재 위치를 기억해야 합니다`;
          recommendation = `⚠️ 개선 권장:\n\n` +
            `🔹 **Breadcrumb 추가 권장**: 현재는 ${depth}단계이지만, Breadcrumb 추가 시 사용자 경험이 개선됩니다.\n\n` +
            `🔹 **참고**: 정부 지침은 ${govStandard}단계 이상에서 Breadcrumb을 필수로 권장하며, 사용자 ${userComplaint}%가 Breadcrumb 부재 시 위치 파악에 어려움을 겪습니다.`;
        } else {
          // 1단계 (단순 구조)
          description = `ℹ️ ${depth}단계 단순 구조로 Breadcrumb이 필요하지 않습니다`;
          recommendation = `ℹ️ 현재 단순 구조(${depth}단계)는 Breadcrumb이 필요하지 않습니다. 향후 구조 확장 시(${govStandard}단계 이상) Breadcrumb을 추가하세요.`;
        }
      }
      
      return { description, recommendation };
    })(),
    
    N7_1_quick_access: {
      description: navigation.menuCount >= 1
        ? `${navigation.menuCount}개의 메뉴로 주요 기능에 빠르게 접근할 수 있습니다.`
        : `메뉴가 없어 빠른 접근이 제한적입니다.`,
      recommendation: navigation.menuCount >= 1
        ? '현재 상태를 유지하세요.'
        : '메뉴가 없어 빠른 접근이 제한적입니다 개선이 필요합니다.'
    },
    
    N7_2_customization: {
      description: visuals.iconCount > 3
        ? `시각적 요소가 충분하여 맞춤 설정 가능성이 있습니다.`
        : `맞춤 설정 옵션이 제한적으로 보입니다.`,
      recommendation: visuals.iconCount > 3
        ? '현재 상태를 유지하세요.'
        : '맞춤 설정 옵션이 제한적으로 보입니다 개선이 필요합니다.'
    },
    
    N7_3_search_filter: {
      description: navigation.searchExists
        ? `${url}에서 검색 기능이 발견되어 효율적인 정보 탐색이 가능합니다.`
        : `검색 기능이 없어 정보 탐색 효율성이 낮을 수 있습니다.`,
      recommendation: navigation.searchExists
        ? '${url}에서 검색 기능이 발견되어 효율적인 정보 탐색이 가능합니다. 현재 상태를 유지하세요.'
        : '검색 기능이 없어 정보 탐색 효율성이 낮을 수 있습니다 개선이 필요합니다.'
    },
    
    N8_1_essential_info: {
      description: content.paragraphCount >= 5 && content.paragraphCount <= 30
        ? `문단 ${content.paragraphCount}개로 핵심 정보에 집중합니다.`
        : `문단 수(${content.paragraphCount})가 정보 밀도에 영향을 줄 수 있습니다.`,
      recommendation: content.paragraphCount >= 5 && content.paragraphCount <= 30
        ? '현재 상태를 유지하세요.'
        : '개선이 필요합니다.'
    },
    
    N8_2_clean_interface: {
      description: visuals.imageCount >= 3 && visuals.imageCount <= 20
        ? `이미지 ${visuals.imageCount}개로 깔끔한 인터페이스를 유지합니다.`
        : `이미지 수(${visuals.imageCount})가 인터페이스 깔끔함에 영향을 줍니다.`,
      recommendation: visuals.imageCount >= 3 && visuals.imageCount <= 20
        ? '현재 상태를 유지하세요.'
        : '개선이 필요합니다.'
    },
    
    N8_3_visual_hierarchy: {
      description: content.headingCount >= 5
        ? `헤딩 ${content.headingCount}개로 명확한 시각적 계층을 형성합니다.`
        : `헤딩이 ${content.headingCount}개로 시각적 계층이 약합니다.`,
      recommendation: content.headingCount >= 5
        ? '현재 상태를 유지하세요.'
        : '개선이 필요합니다.'
    },
    
    N9_2_recovery_support: {
      description: forms.validationExists
      ? `✅ 폼 검증으로 오류 복구를 지원합니다.`
      : forms.formCount === 0
        ? `ℹ️ 폼이 없어 복구 지원이 필요하지 않습니다.`
        : `⚠️ 오류 복구 지원이 미흡합니다.`,
      recommendation: forms.validationExists
        ? `✅ 폼 검증으로 오류 복구를 지원합니다.`
        : forms.formCount === 0
          ? `ℹ️ 폼이 없어 복구 지원이 필요하지 않습니다.`
          : `⚠️ 오류 복구 지원이 미흡합니다.`
    },
    
    N9_4_error_guidance: {
      description: content.listCount > 3
        ? `리스트 ${content.listCount}개가 체계적인 안내를 제공할 가능성이 높습니다.`
        : `구조화된 안내 정보가 부족합니다.`,
      recommendation: content.listCount > 3
        ? '현재 상태를 유지하세요.'
        : '구조화된 안내 정보가 부족합니다. 개선이 필요합니다.'
    },
    
    N10_1_help_visibility: {
      description: navigation.searchExists
        ? `✅ 검색 기능으로 도움말을 쉽게 찾을 수 있습니다.`
        : content.listCount > 3
          ? `✅ 리스트 형태로 도움말 정보가 구조화되어 있습니다.`
          : `⚠️ 도움말 찾기가 어려울 수 있습니다.`,
      recommendation: navigation.searchExists
        ? `✅ 검색 기능으로 도움말을 쉽게 찾을 수 있습니다.`
        : content.listCount > 3
          ? `✅ 리스트 형태로 도움말 정보가 구조화되어 있습니다.`
          : `⚠️ 도움말 찾기가 어려울 수 있습니다.`
    },
    
    N10_2_documentation: {
      description: content.listCount > 5
        ? `${content.listCount}개의 리스트로 문서화가 잘 되어 있습니다.`
        : `리스트가 ${content.listCount}개로 문서화가 부족합니다.`,
      recommendation: content.listCount > 5
        ? '현재 상태를 유지하세요.'
        : '문서화 개선이 필요합니다.'
    }
  }
}
