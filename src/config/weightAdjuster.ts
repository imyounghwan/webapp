/**
 * 가중치 자동 조정 제안 생성기
 * 관리자 수정 데이터를 분석하여 가중치 조정을 제안합니다.
 */

import type { LearningDataSummary } from '../types/database'
import { loadWeights } from './weightsLoader'

export interface WeightAdjustmentSuggestion {
  item_id: string
  item_name: string
  current_weights: any
  suggested_weights: any
  reason: string
  evidence: {
    correction_count: number
    avg_score_diff: number
    avg_original_score: number
    avg_corrected_score: number
  }
  adjustment_type: 'increase' | 'decrease' | 'neutral'
  confidence: 'high' | 'medium' | 'low'
}

/**
 * 학습 데이터를 기반으로 가중치 조정 제안 생성
 */
export function generateWeightAdjustments(
  learningData: LearningDataSummary[]
): WeightAdjustmentSuggestion[] {
  const suggestions: WeightAdjustmentSuggestion[] = []
  const currentWeights = loadWeights()
  
  for (const data of learningData) {
    // 최소 데이터 요구사항: 5건 이상
    if (data.correction_count < 5) {
      continue
    }
    
    const itemWeights = currentWeights[data.item_id]
    if (!itemWeights) {
      continue
    }
    
    // 평균 점수 차이 분석
    const avgDiff = data.avg_score_diff
    
    // 조정 임계값
    const SIGNIFICANT_DIFF = 0.3  // 0.3점 이상 차이면 유의미
    const VERY_SIGNIFICANT_DIFF = 0.5  // 0.5점 이상 차이면 매우 유의미
    
    let adjustmentType: 'increase' | 'decrease' | 'neutral' = 'neutral'
    let confidence: 'high' | 'medium' | 'low' = 'low'
    let suggestedWeights = { ...itemWeights }
    let reason = ''
    
    if (Math.abs(avgDiff) < SIGNIFICANT_DIFF) {
      continue // 차이가 작으면 제안하지 않음
    }
    
    // 하향 조정 필요 (관리자가 자주 점수를 낮춤)
    if (avgDiff < -SIGNIFICANT_DIFF) {
      adjustmentType = 'decrease'
      confidence = Math.abs(avgDiff) >= VERY_SIGNIFICANT_DIFF ? 'high' : 'medium'
      
      // 가중치 감소 제안
      if (itemWeights.has_feature_bonus !== undefined) {
        const reduction = Math.abs(avgDiff) * 0.5
        suggestedWeights.has_feature_bonus = Math.max(0.5, itemWeights.has_feature_bonus - reduction)
      }
      
      if (itemWeights.no_feature_penalty !== undefined) {
        const increase = Math.abs(avgDiff) * 0.3
        suggestedWeights.no_feature_penalty = Math.min(-0.5, itemWeights.no_feature_penalty - increase)
      }
      
      reason = `관리자가 평균 ${Math.abs(avgDiff).toFixed(2)}점 하향 조정함. ${data.correction_count}건의 수정 데이터 분석 결과, 현재 자동 평가가 과대평가되고 있습니다.`
    }
    
    // 상향 조정 필요 (관리자가 자주 점수를 높임)
    else if (avgDiff > SIGNIFICANT_DIFF) {
      adjustmentType = 'increase'
      confidence = avgDiff >= VERY_SIGNIFICANT_DIFF ? 'high' : 'medium'
      
      // 가중치 증가 제안
      if (itemWeights.has_feature_bonus !== undefined) {
        const increase = avgDiff * 0.5
        suggestedWeights.has_feature_bonus = Math.min(2.0, itemWeights.has_feature_bonus + increase)
      }
      
      if (itemWeights.no_feature_penalty !== undefined) {
        const reduction = avgDiff * 0.3
        suggestedWeights.no_feature_penalty = Math.max(-2.0, itemWeights.no_feature_penalty + reduction)
      }
      
      reason = `관리자가 평균 ${avgDiff.toFixed(2)}점 상향 조정함. ${data.correction_count}건의 수정 데이터 분석 결과, 현재 자동 평가가 과소평가되고 있습니다.`
    }
    
    // 데이터 수가 많으면 신뢰도 상승
    if (data.correction_count >= 20) {
      confidence = 'high'
    }
    
    suggestions.push({
      item_id: data.item_id,
      item_name: data.item_name,
      current_weights: itemWeights,
      suggested_weights: suggestedWeights,
      reason,
      evidence: {
        correction_count: data.correction_count,
        avg_score_diff: data.avg_score_diff,
        avg_original_score: data.avg_original_score,
        avg_corrected_score: data.avg_corrected_score
      },
      adjustment_type: adjustmentType,
      confidence
    })
  }
  
  // 신뢰도와 영향도 순으로 정렬
  return suggestions.sort((a, b) => {
    // 신뢰도 우선
    const confidenceOrder = { high: 3, medium: 2, low: 1 }
    const confidenceDiff = confidenceOrder[b.confidence] - confidenceOrder[a.confidence]
    if (confidenceDiff !== 0) return confidenceDiff
    
    // 영향도(수정 건수) 순
    return b.evidence.correction_count - a.evidence.correction_count
  })
}

/**
 * 가중치 조정을 자동으로 적용 (config/weights.json 업데이트)
 */
export function applyWeightAdjustments(
  suggestions: WeightAdjustmentSuggestion[],
  minConfidence: 'high' | 'medium' | 'low' = 'medium'
): { updated: string[], skipped: string[] } {
  const updated: string[] = []
  const skipped: string[] = []
  
  const confidenceOrder = { high: 3, medium: 2, low: 1 }
  const minLevel = confidenceOrder[minConfidence]
  
  const currentWeights = loadWeights()
  const updatedWeights = { ...currentWeights }
  
  for (const suggestion of suggestions) {
    if (confidenceOrder[suggestion.confidence] < minLevel) {
      skipped.push(suggestion.item_id)
      continue
    }
    
    updatedWeights[suggestion.item_id] = suggestion.suggested_weights
    updated.push(suggestion.item_id)
  }
  
  return { updated, skipped }
}
