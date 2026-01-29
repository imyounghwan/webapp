"""
KRDS 이미지 AI 분석
- 이미지별 UI/UX 문제점 자동 분석
- 잘한 점/못한 점 자동 분류
- Nielsen 10원칙 매핑
"""

import os
import json
from pathlib import Path

class KRDSImageAnalyzer:
    def __init__(self, metadata_path: str, output_dir: str):
        self.metadata_path = Path(metadata_path)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # 메타데이터 로드
        with open(self.metadata_path, 'r', encoding='utf-8') as f:
            self.metadata = json.load(f)
    
    def analyze_images_batch(self) -> dict:
        """배치로 이미지 분석 (샘플링)"""
        print("🤖 AI 이미지 분석 시작...\n")
        
        analysis_results = {
            "total_analyzed": 0,
            "agencies": []
        }
        
        for agency_data in self.metadata["agencies"]:
            agency_name = agency_data["agency"]
            images = agency_data["images"]
            
            print(f"🔍 분석 중: {agency_name} ({len(images)}개 이미지)")
            
            # 샘플링: 각 기관에서 대표 이미지만 분석 (처음 5개)
            sample_images = images[:5]
            
            agency_analysis = {
                "agency": agency_name,
                "total_images": len(images),
                "analyzed_count": len(sample_images),
                "findings": {
                    "good_points": [],
                    "bad_points": [],
                    "nielsen_mapping": {}
                }
            }
            
            # 이미지별 분석 (실제 분석은 understand_images 도구로 수행)
            # 여기서는 구조만 준비
            for img in sample_images:
                agency_analysis["findings"]["good_points"].append({
                    "image": img["filename"],
                    "description": "분석 대기 중 (understand_images 도구 필요)"
                })
            
            analysis_results["agencies"].append(agency_analysis)
            analysis_results["total_analyzed"] += len(sample_images)
        
        return analysis_results
    
    def save_analysis_structure(self, results: dict):
        """분석 구조 저장"""
        output_file = self.output_dir / "krds_image_analysis_structure.json"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 분석 구조 저장: {output_file}")
        print(f"📊 총 {results['total_analyzed']}개 이미지 분석 준비 완료")
        
        return output_file


def main():
    metadata_path = "/home/user/webapp/analysis/krds_images/krds_images_metadata.json"
    output_dir = "/home/user/webapp/analysis/krds_images"
    
    analyzer = KRDSImageAnalyzer(metadata_path, output_dir)
    results = analyzer.analyze_images_batch()
    analyzer.save_analysis_structure(results)
    
    print("\n✨ Step 2-1 완료: 분석 구조 생성")
    print("📌 다음 단계: understand_images 도구로 실제 이미지 분석 수행")


if __name__ == "__main__":
    main()
