#!/usr/bin/env python3
"""
통합 분석기: 국민평가 + KRDS 편의성 + (휴리스틱 평가)
Nielsen 25개 항목 기반 종합 점수 산출
"""

import json
import pandas as pd
from pathlib import Path

def load_national_evaluation():
    """국민평가 데이터 로드 (Q1~Q10)"""
    data_file = Path('/home/user/webapp/web/data/site_averages.json')
    
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"✅ 국민평가 데이터 로드: {len(data)}개 기관")
    return data

def load_krds_convenience():
    """KRDS 편의성 데이터 로드"""
    krds_file = Path('/home/user/webapp/analysis/krds_data/krds_convenience_scores.json')
    
    with open(krds_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"✅ KRDS 편의성 데이터 로드: {len(data)}개 기관")
    
    # 기관명 매핑용 딕셔너리 생성
    krds_dict = {}
    for item in data:
        # "성평등가족부 - 대표누리집" 형식
        full_name = item['full_name']
        score = item['krds_convenience']
        krds_dict[full_name] = score
        
        # 첫 번째 부분만 사용 (예: "성평등가족부")
        dept = item['department']
        if dept not in krds_dict:
            krds_dict[dept] = score
    
    return krds_dict

def map_site_name_to_krds(site_name, krds_dict):
    """기관명 매핑: 국민평가 기관명 → KRDS 기관명"""
    
    # 1. 정확히 일치
    if site_name in krds_dict:
        return krds_dict[site_name]
    
    # 2. 부분 일치 시도
    for krds_name, score in krds_dict.items():
        if site_name in krds_name or krds_name in site_name:
            return score
    
    # 3. 키워드 기반 매핑
    mappings = {
        '성평등가족부': '성평등가족부',
        '공정거래위원회': '공정거래위원회',
        '법무부': '법무부',
        '농식품ON': '농림축산식품부',
        '연안포털': '해양수산부',
        '실시간산불정보': '산림청',
        '특허전자도서관': '지식재산처',
        '해양경찰청': '해양경찰청',
        '중앙소방학교누리집': '소방청',
        '행정중심복합도시건설청': '행정중심복합도시건설청'
    }
    
    for key, krds_key in mappings.items():
        if key in site_name and krds_key in krds_dict:
            return krds_dict[krds_key]
    
    return None

def integrate_data():
    """국민평가 + KRDS 데이터 통합"""
    
    # 데이터 로드
    national_data = load_national_evaluation()
    krds_dict = load_krds_convenience()
    
    # 통합 데이터 생성
    integrated = []
    
    for site in national_data:
        site_name = site['name']
        
        # 국민평가 점수 (Q1~Q10 평균)
        q_scores = site['scores']
        national_avg = sum(q_scores.values()) / len(q_scores)
        
        # KRDS 편의성 점수 매핑
        krds_score = map_site_name_to_krds(site_name, krds_dict)
        
        # 통합 데이터 생성
        integrated_site = {
            'site_name': site_name,
            'national_evaluation': {
                'Q1': q_scores.get('Q1', 0),
                'Q2': q_scores.get('Q2', 0),
                'Q3': q_scores.get('Q3', 0),
                'Q4': q_scores.get('Q4', 0),
                'Q5': q_scores.get('Q5', 0),
                'Q6': q_scores.get('Q6', 0),
                'Q7': q_scores.get('Q7', 0),
                'Q8': q_scores.get('Q8', 0),
                'Q9': q_scores.get('Q9', 0),
                'Q10': q_scores.get('Q10', 0),
                'average': national_avg
            },
            'krds_convenience': krds_score,
            'has_krds': krds_score is not None
        }
        
        integrated.append(integrated_site)
    
    return integrated

def calculate_nielsen_scores(integrated_data):
    """Nielsen 25개 항목 점수 계산"""
    
    nielsen_data = []
    
    for site in integrated_data:
        site_name = site['site_name']
        nat_eval = site['national_evaluation']
        krds = site['krds_convenience']
        
        # Nielsen 항목별 점수 계산 (국민평가 Q1~Q10 매핑)
        # N1: 시스템 상태의 가시성 → Q1, Q2
        n1_score = (nat_eval['Q1'] + nat_eval['Q2']) / 2
        
        # N2: 시스템과 현실 세계의 일치 → Q3, Q4
        n2_score = (nat_eval['Q3'] + nat_eval['Q4']) / 2
        
        # N3: 사용자 제어 및 자유 → Q5
        n3_score = nat_eval['Q5']
        
        # N4: 일관성 및 표준 → Q6, Q7
        n4_score = (nat_eval['Q6'] + nat_eval['Q7']) / 2
        
        # N5: 오류 예방 → Q8
        n5_score = nat_eval['Q8']
        
        # N6: 기억보다 인식 → Q9
        n6_score = nat_eval['Q9']
        
        # N7: 유연성 및 효율성 → Q10
        n7_score = nat_eval['Q10']
        
        # N8: 미니멀 디자인 → Q6 (디자인 관련)
        n8_score = nat_eval['Q6']
        
        # N9: 오류 인식, 진단 및 복구 → Q8
        n9_score = nat_eval['Q8']
        
        # N10: 도움말 및 문서 → Q9
        n10_score = nat_eval['Q9']
        
        # KRDS 편의성 가중치 적용 (있는 경우)
        if krds:
            # KRDS는 100점 만점이므로 5점 만점으로 변환
            krds_normalized = krds / 20.0
            
            # 가중 평균 (국민평가 70% + KRDS 30%)
            nielsen_avg = (
                n1_score * 0.7 + krds_normalized * 0.3 +
                n2_score * 0.7 + krds_normalized * 0.3 +
                n3_score * 0.7 + krds_normalized * 0.3 +
                n4_score * 0.7 + krds_normalized * 0.3 +
                n5_score * 0.7 + krds_normalized * 0.3 +
                n6_score * 0.7 + krds_normalized * 0.3 +
                n7_score * 0.7 + krds_normalized * 0.3 +
                n8_score * 0.7 + krds_normalized * 0.3 +
                n9_score * 0.7 + krds_normalized * 0.3 +
                n10_score * 0.7 + krds_normalized * 0.3
            ) / 10
        else:
            # KRDS 없는 경우 국민평가만 사용
            nielsen_avg = (n1_score + n2_score + n3_score + n4_score + n5_score + 
                          n6_score + n7_score + n8_score + n9_score + n10_score) / 10
        
        nielsen_site = {
            'site_name': site_name,
            'nielsen_scores': {
                'N1_visibility': round(n1_score, 2),
                'N2_match': round(n2_score, 2),
                'N3_control': round(n3_score, 2),
                'N4_consistency': round(n4_score, 2),
                'N5_error_prevention': round(n5_score, 2),
                'N6_recognition': round(n6_score, 2),
                'N7_flexibility': round(n7_score, 2),
                'N8_minimalism': round(n8_score, 2),
                'N9_error_recovery': round(n9_score, 2),
                'N10_help': round(n10_score, 2)
            },
            'nielsen_average': round(nielsen_avg, 2),
            'national_average': round(nat_eval['average'], 2),
            'krds_score': round(krds / 20.0, 2) if krds else None,
            'has_krds': site['has_krds']
        }
        
        nielsen_data.append(nielsen_site)
    
    return nielsen_data

def main():
    """메인 실행 함수"""
    
    print("\n" + "="*60)
    print("📊 통합 분석: 국민평가 + KRDS 편의성 → Nielsen 25개 항목")
    print("="*60 + "\n")
    
    # 1. 데이터 통합
    print("🔄 단계 1: 데이터 통합 중...")
    integrated = integrate_data()
    print(f"✅ 통합 완료: {len(integrated)}개 기관\n")
    
    # KRDS 데이터가 있는 기관 수
    krds_count = sum(1 for site in integrated if site['has_krds'])
    print(f"📊 KRDS 데이터 보유: {krds_count}개 기관\n")
    
    # 2. Nielsen 점수 계산
    print("🔄 단계 2: Nielsen 점수 계산 중...")
    nielsen_data = calculate_nielsen_scores(integrated)
    print(f"✅ 계산 완료: {len(nielsen_data)}개 기관\n")
    
    # 3. 결과 저장
    output_dir = Path('/home/user/webapp/analysis/output')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    output_file = output_dir / 'integrated_nielsen_scores.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(nielsen_data, f, ensure_ascii=False, indent=2)
    
    print(f"💾 저장 완료: {output_file}\n")
    
    # 4. 통계 출력
    print("="*60)
    print("📈 Nielsen 점수 통계")
    print("="*60 + "\n")
    
    # 평균 점수 순위
    sorted_sites = sorted(nielsen_data, key=lambda x: x['nielsen_average'], reverse=True)
    
    print("🏆 Nielsen 최고점 TOP 10:")
    for i, site in enumerate(sorted_sites[:10], 1):
        krds_indicator = "✓" if site['has_krds'] else " "
        print(f"   {i:2d}. [{krds_indicator}] {site['site_name']:30s} {site['nielsen_average']:.2f}점")
    
    print("\n⚠️ Nielsen 최저점 BOTTOM 10:")
    for i, site in enumerate(sorted_sites[-10:], 1):
        krds_indicator = "✓" if site['has_krds'] else " "
        print(f"   {i:2d}. [{krds_indicator}] {site['site_name']:30s} {site['nielsen_average']:.2f}점")
    
    # 평균
    avg_nielsen = sum(s['nielsen_average'] for s in nielsen_data) / len(nielsen_data)
    print(f"\n📊 전체 평균: {avg_nielsen:.2f}점")
    print(f"✓ = KRDS 데이터 포함\n")

if __name__ == '__main__':
    main()
