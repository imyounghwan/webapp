"""
휴리스틱 평가 49개 Excel 파일에서 14개 항목 점수 추출
- 파일 구조: 행 2~15가 평가 항목
- 컬럼 8: 평균 점수
- 14개 항목을 Nielsen 원칙에 매핑 준비
"""

import os
import json
import pandas as pd
from pathlib import Path
from typing import Dict, List

class HeuristicEvaluationExtractor:
    def __init__(self, excel_dir: str, output_dir: str):
        self.excel_dir = Path(excel_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # 휴리스틱 14개 항목 정의 (행 인덱스 기준)
        self.heuristic_items = {
            2: "디자인_직관성간결성심미성_프로세스인식",
            3: "디자인_간결성심미성_시각적안정감",
            4: "디자인_직관성간결성심미성_강약조절",
            5: "디자인_직관성_가독성",
            6: "디자인_직관성_주목성",
            7: "디자인_간결성심미성_색상조화",
            8: "디자인_일관성_디자인요소통일",
            9: "사용성_일관성_레이아웃일관성",
            10: "사용성_일관성_보편적레이아웃",
            11: "사용성_직관성_서비스분류인지",
            12: "사용성_도움말_콘텐츠설명",
            13: "사용성_오류인식_경고메시지",
            14: "사용성_유연성효율성_주요기능접근",
            15: "사용성_직관성_메뉴이동"
        }
    
    def extract_agency_name(self, filename: str) -> str:
        """파일명에서 기관명 추출"""
        # 예: "2고용노동부_휴리스틱평가.xlsx" → "고용노동부"
        name = filename.replace("_휴리스틱평가.xlsx", "")
        # 숫자 제거
        import re
        name = re.sub(r'^\d+', '', name)
        return name.strip()
    
    def extract_scores_from_excel(self, excel_path: Path) -> Dict:
        """Excel 파일에서 점수 추출"""
        try:
            # header=None으로 읽기
            df = pd.read_excel(excel_path, header=None)
            
            agency_name = self.extract_agency_name(excel_path.name)
            
            # URL 추출 (행 0, 컬럼 0에서)
            url = ""
            if not pd.isna(df.iloc[0, 0]):
                text = str(df.iloc[0, 0])
                if "http" in text:
                    import re
                    url_match = re.search(r'https?://[^\s]+', text)
                    if url_match:
                        url = url_match.group(0)
            
            # 점수 추출
            scores = {}
            for row_idx, item_name in self.heuristic_items.items():
                try:
                    # 컬럼 8이 평균 점수
                    score = df.iloc[row_idx, 8]
                    if pd.notna(score) and isinstance(score, (int, float)):
                        scores[item_name] = float(score)
                    else:
                        scores[item_name] = 0.0
                except Exception as e:
                    print(f"   ⚠️  행 {row_idx} 점수 추출 실패: {e}")
                    scores[item_name] = 0.0
            
            # 전체 평균 계산
            valid_scores = [s for s in scores.values() if s > 0]
            overall_avg = sum(valid_scores) / len(valid_scores) if valid_scores else 0.0
            
            return {
                "agency": agency_name,
                "url": url,
                "scores": scores,
                "overall_average": round(overall_avg, 2),
                "total_items": len(self.heuristic_items),
                "valid_items": len(valid_scores)
            }
            
        except Exception as e:
            print(f"   ❌ 파일 처리 실패: {e}")
            return None
    
    def process_all_files(self) -> Dict:
        """모든 Excel 파일 처리"""
        excel_files = sorted(self.excel_dir.glob("*_휴리스틱평가.xlsx"))
        
        print(f"📂 휴리스틱 평가 파일 발견: {len(excel_files)}개\n")
        
        all_results = {
            "total_agencies": 0,
            "agencies": [],
            "statistics": {
                "highest_score": {"agency": "", "score": 0},
                "lowest_score": {"agency": "", "score": 5},
                "average_score": 0
            }
        }
        
        all_scores = []
        
        for excel_file in excel_files:
            print(f"🔍 처리 중: {excel_file.name}")
            
            result = self.extract_scores_from_excel(excel_file)
            
            if result:
                all_results["agencies"].append(result)
                all_results["total_agencies"] += 1
                
                # 통계 업데이트
                score = result["overall_average"]
                all_scores.append(score)
                
                if score > all_results["statistics"]["highest_score"]["score"]:
                    all_results["statistics"]["highest_score"] = {
                        "agency": result["agency"],
                        "score": score
                    }
                
                if score < all_results["statistics"]["lowest_score"]["score"]:
                    all_results["statistics"]["lowest_score"] = {
                        "agency": result["agency"],
                        "score": score
                    }
                
                print(f"   ✅ {result['agency']}: 평균 {score}점 ({result['valid_items']}/{result['total_items']}개 항목)")
        
        # 전체 평균 계산
        if all_scores:
            all_results["statistics"]["average_score"] = round(sum(all_scores) / len(all_scores), 2)
        
        return all_results
    
    def save_results(self, results: Dict):
        """결과 저장"""
        output_file = self.output_dir / "heuristic_scores.json"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 저장 완료: {output_file}")
        print(f"\n📊 휴리스틱 평가 요약:")
        print(f"   총 기관: {results['total_agencies']}개")
        print(f"   전체 평균: {results['statistics']['average_score']}점")
        print(f"   최고점: {results['statistics']['highest_score']['agency']} ({results['statistics']['highest_score']['score']}점)")
        print(f"   최저점: {results['statistics']['lowest_score']['agency']} ({results['statistics']['lowest_score']['score']}점)")


def main():
    excel_dir = "/home/user/uploaded_files"
    output_dir = "/home/user/webapp/analysis/heuristic_data"
    
    print("🚀 휴리스틱 평가 점수 추출 시작...\n")
    
    extractor = HeuristicEvaluationExtractor(excel_dir, output_dir)
    results = extractor.process_all_files()
    extractor.save_results(results)
    
    print("\n✨ 완료!")


if __name__ == "__main__":
    main()
