#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AutoAnalyzer - 연령별 국민평가 데이터 통합 분석
20대, 30대, 40대, 50대, 60대이상, 디지털취약계층 데이터를 분석하여 JSON 생성
"""

import pandas as pd
import numpy as np
import json
from pathlib import Path
from datetime import datetime

class AgeGroupAnalyzer:
    def __init__(self):
        self.base_dir = Path(__file__).parent
        self.data_dir = self.base_dir / 'data'
        self.output_dir = self.base_dir / 'output'
        self.output_dir.mkdir(exist_ok=True)
        
        self.age_groups = [
            '20대', '30대', '40대', '50대', '60대이상', '디지털취약계층'
        ]
        
        # Q1~Q10 컬럼 매핑
        self.q_columns_map = {
            'Q1': '1.원하는 목적을 달성할 수 있었나요?',
            'Q2': '2.서비스 이용이 편리 했나요?',
            'Q3': '3. 전문성 없이도 쉽게 이해할 수 있었나요?',
            'Q4': '4. 어떤 페이지에서 든 메뉴 이동이 쉬웠나요?',
            'Q5': '5. 잘못 입력했을 경우 경고 메시지가 표시되나요?',
            'Q6': '6. 당신이 원하는 서비스(신청, 조회 콘텐츠 상세 등) 이용에 대해 친절하게 설명해 주었나요?',
            'Q7': '7. 시각적으로 서비스의 내용이 잘 구분되어 있나요?',
            'Q8': '8. 제목, 글머리표, 아이콘, 이미지 등이 일관성 있게 배치되어 통일감 있게 느끼셨나요?',
            'Q9': '9. 보편적이고 익숙한 구조를 사용하고 있나요?',
            'Q10': '10. 색상간의 조화가 잘 이루어지고 있나요?'
        }
        
    def load_age_group_data(self, age_group):
        """연령대별 데이터 로드"""
        filename = f'UI_UX 평가시스템_{age_group}.xlsx'
        filepath = self.data_dir / filename
        
        if not filepath.exists():
            print(f"⚠️  파일을 찾을 수 없습니다: {filename}")
            return None
        
        df = pd.read_excel(filepath)
        print(f"✅ {age_group} 데이터 로드: {df.shape[0]}개 기관")
        return df
    
    def process_age_group(self, df, age_group):
        """연령대별 데이터 처리"""
        results = []
        
        for idx, row in df.iterrows():
            site_name = str(row['기관명'])
            site_url = str(row['사이트주소']) if pd.notna(row['사이트주소']) else ''
            
            # Q1~Q10 점수 추출
            scores = {}
            for q_key, col_name in self.q_columns_map.items():
                if col_name in df.columns:
                    score = row[col_name]
                    if pd.isna(score):
                        score = 0.0
                    scores[q_key] = round(float(score), 2)
                else:
                    scores[q_key] = 0.0
            
            # 평균 점수
            convenience_avg = row['편의성평균'] if '편의성평균' in df.columns else 0.0
            design_avg = row['디자인평균'] if '디자인평균' in df.columns else 0.0
            total_avg = row['총합평균'] if '총합평균' in df.columns else 0.0
            
            result = {
                'name': site_name,
                'url': site_url,
                'age_group': age_group,
                'scores': scores,
                'convenience_avg': round(float(convenience_avg), 2),
                'design_avg': round(float(design_avg), 2),
                'total_avg': round(float(total_avg), 2)
            }
            
            results.append(result)
        
        return results
    
    def analyze_all_age_groups(self):
        """전체 연령대 데이터 분석"""
        print("=" * 60)
        print("📊 연령별 국민평가 데이터 분석 시작")
        print("=" * 60)
        
        all_data = []
        age_group_summary = {}
        
        # 각 연령대 데이터 처리
        for age_group in self.age_groups:
            print(f"\n🔍 {age_group} 데이터 처리 중...")
            df = self.load_age_group_data(age_group)
            
            if df is None:
                continue
            
            results = self.process_age_group(df, age_group)
            all_data.extend(results)
            
            # 연령대별 통계
            total_scores = [r['total_avg'] for r in results]
            convenience_scores = [r['convenience_avg'] for r in results]
            design_scores = [r['design_avg'] for r in results]
            
            age_group_summary[age_group] = {
                'count': len(results),
                'total_avg': round(float(np.mean(total_scores)), 2),
                'convenience_avg': round(float(np.mean(convenience_scores)), 2),
                'design_avg': round(float(np.mean(design_scores)), 2),
                'total_max': round(float(np.max(total_scores)), 2),
                'total_min': round(float(np.min(total_scores)), 2)
            }
            
            print(f"   평균 점수: {age_group_summary[age_group]['total_avg']}")
            print(f"   최고: {age_group_summary[age_group]['total_max']}")
            print(f"   최저: {age_group_summary[age_group]['total_min']}")
        
        return all_data, age_group_summary
    
    def calculate_site_averages(self, all_data):
        """기관별 전체 연령대 평균 계산"""
        print("\n📈 기관별 연령대 통합 점수 계산 중...")
        
        site_data = {}
        
        # 기관명별로 그룹화
        for item in all_data:
            site_name = item['name']
            
            if site_name not in site_data:
                site_data[site_name] = {
                    'name': site_name,
                    'url': item['url'],
                    'age_groups': {},
                    'scores_by_age': {}
                }
            
            age_group = item['age_group']
            site_data[site_name]['age_groups'][age_group] = {
                'total_avg': item['total_avg'],
                'convenience_avg': item['convenience_avg'],
                'design_avg': item['design_avg'],
                'scores': item['scores']
            }
        
        # 전체 연령대 평균 계산
        site_averages = []
        for site_name, data in site_data.items():
            age_totals = [v['total_avg'] for v in data['age_groups'].values()]
            age_convenience = [v['convenience_avg'] for v in data['age_groups'].values()]
            age_design = [v['design_avg'] for v in data['age_groups'].values()]
            
            # Q1~Q10 평균 계산
            q_averages = {}
            for q in ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10']:
                q_scores = []
                for age_data in data['age_groups'].values():
                    if q in age_data['scores']:
                        q_scores.append(age_data['scores'][q])
                q_averages[q] = round(float(np.mean(q_scores)), 2) if q_scores else 0.0
            
            site_avg = {
                'name': site_name,
                'url': data['url'],
                'total_avg': round(float(np.mean(age_totals)), 2),
                'convenience_avg': round(float(np.mean(age_convenience)), 2),
                'design_avg': round(float(np.mean(age_design)), 2),
                'scores': q_averages,
                'age_groups': data['age_groups']
            }
            
            site_averages.append(site_avg)
        
        # 총합 평균으로 정렬
        site_averages.sort(key=lambda x: x['total_avg'], reverse=True)
        
        print(f"✅ {len(site_averages)}개 기관 통합 점수 계산 완료")
        
        return site_averages
    
    def get_rankings(self, site_averages, n=5):
        """상위/하위 N개 기관"""
        return {
            'top_5': site_averages[:n],
            'bottom_5': site_averages[-n:]
        }
    
    def save_results(self, all_data, age_group_summary, site_averages, rankings):
        """결과 저장"""
        print("\n💾 결과 저장 중...")
        
        # 전체 데이터
        final_data = {
            'generated_at': datetime.now().isoformat(),
            'total_count': len(site_averages),
            'age_groups': list(self.age_groups),
            'age_group_summary': age_group_summary,
            'site_averages': site_averages,
            'rankings': rankings,
            'all_data': all_data
        }
        
        # JSON 파일 저장
        files_saved = []
        
        # 1. 전체 데이터
        filepath = self.output_dir / 'analysis_results.json'
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(final_data, f, ensure_ascii=False, indent=2)
        files_saved.append(filepath)
        print(f"   ✅ {filepath.name}")
        
        # 2. 기관별 평균 (간소화)
        filepath = self.output_dir / 'site_averages.json'
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(site_averages, f, ensure_ascii=False, indent=2)
        files_saved.append(filepath)
        print(f"   ✅ {filepath.name}")
        
        # 3. 순위
        filepath = self.output_dir / 'rankings.json'
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(rankings, f, ensure_ascii=False, indent=2)
        files_saved.append(filepath)
        print(f"   ✅ {filepath.name}")
        
        # 4. 연령대별 요약
        filepath = self.output_dir / 'age_group_summary.json'
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(age_group_summary, f, ensure_ascii=False, indent=2)
        files_saved.append(filepath)
        print(f"   ✅ {filepath.name}")
        
        return files_saved
    
    def run(self):
        """전체 분석 실행"""
        print("\n🚀 AutoAnalyzer - 연령별 분석 시작\n")
        
        # 전체 연령대 데이터 분석
        all_data, age_group_summary = self.analyze_all_age_groups()
        
        if not all_data:
            print("\n❌ 분석할 데이터가 없습니다")
            return False
        
        # 기관별 통합 점수 계산
        site_averages = self.calculate_site_averages(all_data)
        
        # 순위 추출
        rankings = self.get_rankings(site_averages)
        
        # 결과 저장
        files = self.save_results(all_data, age_group_summary, site_averages, rankings)
        
        print("\n" + "=" * 60)
        print("✅ 분석 완료!")
        print("=" * 60)
        print(f"\n📊 분석 결과:")
        print(f"   - 총 {len(site_averages)}개 기관")
        print(f"   - {len(self.age_groups)}개 연령대")
        print(f"   - 평균 점수: {np.mean([s['total_avg'] for s in site_averages]):.2f}")
        
        print(f"\n📋 다음 단계:")
        print(f"   1. output/ 폴더의 JSON 파일 확인")
        print(f"   2. 이 파일들을 웹 서버의 web/data/ 폴더로 복사")
        print(f"   3. FTP로 웹 서버에 업로드")
        
        return True

def main():
    analyzer = AgeGroupAnalyzer()
    analyzer.run()

if __name__ == '__main__':
    main()
