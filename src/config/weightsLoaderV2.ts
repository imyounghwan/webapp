/**
 * 가중치 설정 로더 v2.0
 * 다중 조건 지원 및 복잡한 로직 표현 가능
 */

import weightsDataV2 from '../../config/weights.v2.json'
import type { HTMLStructure } from '../analyzer/htmlAnalyzer'

export interface Condition {
  field: string  // 예: "navigation.breadcrumbExists"
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'between'
  value?: any
  min?: number
  max?: number
  adjustment: number
}

export interface WeightConfigV2 {
  base_score: number
  conditions: Condition[]
  default_adjustment: number
  description?: string
}

export interface WeightsV2 {
  N1_1_current_location: WeightConfigV2
  N1_2_loading_status: WeightConfigV2
  N1_3_action_feedback: WeightConfigV2
  N2_1_familiar_terms: WeightConfigV2
  N2_2_natural_flow: WeightConfigV2
  N2_3_real_world_metaphor: WeightConfigV2
  N3_1_undo_redo: WeightConfigV2
  N3_3_flexible_navigation: WeightConfigV2
  N4_1_visual_consistency: WeightConfigV2
  N4_2_terminology_consistency: WeightConfigV2
  N4_3_standard_compliance: WeightConfigV2
  N5_1_input_validation: WeightConfigV2
  N5_2_confirmation_dialog: WeightConfigV2
  N5_3_constraints: WeightConfigV2
  N6_2_recognition_cues: WeightConfigV2
  N6_3_memory_load: WeightConfigV2
  N7_1_accelerators: WeightConfigV2
  N7_2_personalization: WeightConfigV2
  N7_3_batch_operations: WeightConfigV2
  N8_1_essential_info: WeightConfigV2
  N8_2_clean_interface: WeightConfigV2
  N8_3_visual_hierarchy: WeightConfigV2
  N9_2_recovery_support: WeightConfigV2
  N9_4_error_guidance: WeightConfigV2
  N10_1_help_visibility: WeightConfigV2
  N10_2_documentation: WeightConfigV2
}

/**
 * 필드 값 가져오기 (중첩된 객체 지원)
 * 예: "navigation.breadcrumbExists" → structure.navigation.breadcrumbExists
 */
function getFieldValue(structure: HTMLStructure, field: string): any {
  const parts = field.split('.')
  let value: any = structure
  
  for (const part of parts) {
    if (value === null || value === undefined) return undefined
    value = value[part]
  }
  
  return value
}

/**
 * 조건 평가
 */
function evaluateCondition(structure: HTMLStructure, condition: Condition): boolean {
  const fieldValue = getFieldValue(structure, condition.field)
  
  if (fieldValue === undefined) return false
  
  switch (condition.operator) {
    case '==':
      return fieldValue === condition.value
    case '!=':
      return fieldValue !== condition.value
    case '>':
      return fieldValue > condition.value!
    case '<':
      return fieldValue < condition.value!
    case '>=':
      return fieldValue >= condition.value!
    case '<=':
      return fieldValue <= condition.value!
    case 'between':
      return fieldValue >= condition.min! && fieldValue <= condition.max!
    default:
      return false
  }
}

/**
 * 가중치 설정에서 적절한 adjustment 찾기
 * 조건을 순서대로 평가하고 첫 번째로 매칭되는 것 반환
 */
export function calculateAdjustment(
  structure: HTMLStructure,
  config: WeightConfigV2
): number {
  for (const condition of config.conditions) {
    if (evaluateCondition(structure, condition)) {
      return condition.adjustment
    }
  }
  
  return config.default_adjustment
}

/**
 * 가중치 로드 v2
 */
export function loadWeightsV2(): WeightsV2 {
  return weightsDataV2.weights as WeightsV2
}

/**
 * 참고 통계 로드
 */
export function loadReferenceStatisticsV2() {
  return weightsDataV2.reference_statistics
}

/**
 * 가중치 버전 정보
 */
export function getWeightsVersionV2(): string {
  return weightsDataV2.version
}

/**
 * 특정 항목의 가중치 설정 가져오기
 */
export function getWeightConfigV2(itemId: string): WeightConfigV2 | null {
  const weights = loadWeightsV2()
  return (weights as any)[itemId] || null
}

export default {
  loadWeightsV2,
  loadReferenceStatisticsV2,
  getWeightsVersionV2,
  getWeightConfigV2,
  calculateAdjustment
}
