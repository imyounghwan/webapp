/**
 * 가중치 설정 로더
 * config/weights.json 파일을 읽어서 평가 기준 가중치 제공
 */

import weightsData from '../../config/weights.json'

export interface WeightConfig {
  base_score: number
  has_feature_bonus?: number
  no_feature_penalty?: number
  threshold?: number
  has_form_bonus?: number
  no_form_neutral?: number
  has_validation_bonus?: number
  no_validation_penalty?: number
  
  // N4_1 specific
  image_min?: number
  image_max?: number
  optimal_bonus?: number
  suboptimal_penalty?: number
  
  // N5_3 specific
  label_high_threshold?: number
  label_mid_threshold?: number
  high_bonus?: number
  mid_bonus?: number
  low_penalty?: number
  
  // N6_2 specific
  icon_high_threshold?: number
  icon_low_threshold?: number
  high_bonus?: number
  low_bonus?: number
  
  // N6_3 specific
  breadcrumb_bonus?: number
  depth_threshold?: number
  shallow_bonus?: number
  deep_penalty?: number
  
  // N7_1 specific
  menu_threshold?: number
  
  // N7_2 specific
  responsive_bonus?: number
  
  // N7_3 specific
  has_search_bonus?: number
  no_search_penalty?: number
  
  // N8_1 specific
  paragraph_min?: number
  paragraph_max?: number
  
  // N8_2 specific
  good_bonus?: number
  moderate_bonus?: number
  excessive_penalty?: number
  
  // N8_3 specific
  heading_min?: number
  heading_optimal?: number
  
  // N9_4 specific
  has_validation_bonus?: number
  
  // N10 specific
  link_threshold?: number
  
  description?: string
}

export interface Weights {
  N1_1_current_location: WeightConfig
  N1_2_loading_status: WeightConfig
  N1_3_action_feedback: WeightConfig
  N2_1_familiar_terms: WeightConfig
  N2_2_natural_flow: WeightConfig
  N2_3_real_world_metaphor: WeightConfig
  N3_1_undo_redo: WeightConfig
  N3_3_flexible_navigation: WeightConfig
  N4_1_visual_consistency: WeightConfig
  N4_2_terminology_consistency: WeightConfig
  N4_3_standard_compliance: WeightConfig
  N5_1_input_validation: WeightConfig
  N5_2_confirmation_dialog: WeightConfig
  N5_3_constraints: WeightConfig
  N6_2_recognition_cues: WeightConfig
  N6_3_memory_load: WeightConfig
  N7_1_accelerators: WeightConfig
  N7_2_personalization: WeightConfig
  N7_3_batch_operations: WeightConfig
  N8_1_essential_info: WeightConfig
  N8_2_clean_interface: WeightConfig
  N8_3_visual_hierarchy: WeightConfig
  N9_2_recovery_support: WeightConfig
  N9_4_error_guidance: WeightConfig
  N10_1_help_visibility: WeightConfig
  N10_2_documentation: WeightConfig
}

export interface ReferenceStatistics {
  total_agencies: number
  average_score: number
  highest_score: number
  lowest_score: number
  comment: string
}

/**
 * 가중치 로드 (JSON 파일에서)
 */
export function loadWeights(): Weights {
  return weightsData.weights as Weights
}

/**
 * 참고 통계 로드
 */
export function loadReferenceStatistics(): ReferenceStatistics {
  return weightsData.reference_statistics as ReferenceStatistics
}

/**
 * 가중치 버전 정보
 */
export function getWeightsVersion(): string {
  return weightsData.version
}

/**
 * 가중치 마지막 업데이트 날짜
 */
export function getWeightsLastUpdated(): string {
  return weightsData.last_updated
}

/**
 * 특정 항목의 가중치 가져오기
 */
export function getWeightConfig(itemId: string): WeightConfig | null {
  const weights = loadWeights()
  return (weights as any)[itemId] || null
}

export default {
  loadWeights,
  loadReferenceStatistics,
  getWeightsVersion,
  getWeightsLastUpdated,
  getWeightConfig
}
