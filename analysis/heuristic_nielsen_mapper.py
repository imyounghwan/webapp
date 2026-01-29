"""
휴리스틱 14개 항목을 Nielsen 25개 세부 항목에 매핑
- 휴리스틱 평가 항목을 Nielsen 10원칙의 25개 세부 항목에 연결
- 가중치 적용하여 최종 Nielsen 점수 산출
"""

import json
from pathlib import Path
from typing import Dict, List

class HeuristicToNielsenMapper:
    def __init__(self):
        # 휴리스틱 14개 항목 → Nielsen 10원칙 매핑
        self.mapping = {
            # 디자인 관련 (6개 항목)
            "디자인_직관성간결성심미성_프로세스인식": {
                "nielsen": [1, 2, 8],  # 시스템 상태 가시성, 현실 세계 연결, 미니멀 디자인
                "weight": 0.7
            },
            "디자인_간결성심미성_시각적안정감": {
                "nielsen": [8],  # 미니멀 디자인
                "weight": 0.8
            },
            "디자인_직관성간결성심미성_강약조절": {
                "nielsen": [8],  # 미니멀 디자인
                "weight": 0.7
            },
            "디자인_직관성_가독성": {
                "nielsen": [6, 8],  # 인식 용이성, 미니멀 디자인
                "weight": 0.9
            },
            "디자인_직관성_주목성": {
                "nielsen": [1, 6],  # 시스템 상태 가시성, 인식 용이성
                "weight": 0.7
            },
            "디자인_간결성심미성_색상조화": {
                "nielsen": [4, 8],  # 일관성, 미니멀 디자인
                "weight": 0.6
            },
            "디자인_일관성_디자인요소통일": {
                "nielsen": [4],  # 일관성과 표준
                "weight": 1.0
            },
            
            # 사용성 관련 (7개 항목)
            "사용성_일관성_레이아웃일관성": {
                "nielsen": [4],  # 일관성과 표준
                "weight": 1.0
            },
            "사용성_일관성_보편적레이아웃": {
                "nielsen": [2, 4],  # 현실 세계 연결, 일관성
                "weight": 0.8
            },
            "사용성_직관성_서비스분류인지": {
                "nielsen": [6],  # 인식 용이성
                "weight": 0.9
            },
            "사용성_도움말_콘텐츠설명": {
                "nielsen": [10],  # 도움말과 문서
                "weight": 1.0
            },
            "사용성_오류인식_경고메시지": {
                "nielsen": [5, 9],  # 오류 방지, 오류 복구
                "weight": 1.0
            },
            "사용성_유연성효율성_주요기능접근": {
                "nielsen": [7],  # 유연성과 효율성
                "weight": 1.0
            },
            "사용성_직관성_메뉴이동": {
                "nielsen": [3, 6, 7],  # 사용자 통제, 인식 용이성, 유연성
                "weight": 0.8
            }
        }
        
        # Nielsen 10원칙 정의
        self.nielsen_principles = {
            1: "시스템 상태의 가시성",
            2: "시스템과 현실세계의 연결성",
            3: "사용자 통제 및 자유",
            4: "일관성과 표준",
            5: "오류 방지",
            6: "인식 우선 (기억 최소화)",
            7: "유연성과 효율성",
            8: "미학적이고 미니멀한 디자인",
            9: "오류 인식, 진단 및 복구",
            10: "도움말과 문서"
        }
    
    def map_heuristic_to_nielsen(self, heuristic_data: Dict) -> Dict:
        """휴리스틱 점수를 Nielsen 점수로 변환"""
        
        result = {
            "total_agencies": heuristic_data["total_agencies"],
            "agencies": []
        }
        
        for agency in heuristic_data["agencies"]:
            agency_name = agency["agency"]
            heuristic_scores = agency["scores"]
            
            # Nielsen 10원칙별 점수 계산
            nielsen_scores = {i: [] for i in range(1, 11)}
            
            for heuristic_item, score in heuristic_scores.items():
                if heuristic_item in self.mapping:
                    mapping_info = self.mapping[heuristic_item]
                    nielsen_principles = mapping_info["nielsen"]
                    weight = mapping_info["weight"]
                    
                    # 해당하는 Nielsen 원칙들에 점수 분배
                    for nielsen_num in nielsen_principles:
                        nielsen_scores[nielsen_num].append(score * weight)
            
            # 각 Nielsen 원칙의 평균 점수 계산
            nielsen_averages = {}
            for nielsen_num, scores in nielsen_scores.items():
                if scores:
                    nielsen_averages[f"N{nielsen_num}"] = round(sum(scores) / len(scores), 2)
                else:
                    nielsen_averages[f"N{nielsen_num}"] = 0.0
            
            # 전체 Nielsen 평균 계산
            valid_scores = [s for s in nielsen_averages.values() if s > 0]
            overall_nielsen = round(sum(valid_scores) / len(valid_scores), 2) if valid_scores else 0.0
            
            agency_result = {
                "agency": agency_name,
                "url": agency.get("url", ""),
                "heuristic_average": agency["overall_average"],
                "nielsen_scores": nielsen_averages,
                "nielsen_overall": overall_nielsen,
                "data_source": "heuristic_evaluation"
            }
            
            result["agencies"].append(agency_result)
        
        # 통계 계산
        all_nielsen_scores = [a["nielsen_overall"] for a in result["agencies"]]
        result["statistics"] = {
            "average": round(sum(all_nielsen_scores) / len(all_nielsen_scores), 2),
            "highest": max(all_nielsen_scores),
            "lowest": min(all_nielsen_scores),
            "highest_agency": max(result["agencies"], key=lambda x: x["nielsen_overall"])["agency"],
            "lowest_agency": min(result["agencies"], key=lambda x: x["nielsen_overall"])["agency"]
        }
        
        return result
    
    def save_results(self, results: Dict, output_path: Path):
        """결과 저장"""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        print(f"💾 저장 완료: {output_path}")
        print(f"\n📊 Nielsen 매핑 결과:")
        print(f"   총 기관: {results['total_agencies']}개")
        print(f"   Nielsen 평균: {results['statistics']['average']}점")
        print(f"   최고점: {results['statistics']['highest_agency']} ({results['statistics']['highest']}점)")
        print(f"   최저점: {results['statistics']['lowest_agency']} ({results['statistics']['lowest']}점)")


def main():
    # 입력 파일
    heuristic_file = Path("/home/user/webapp/analysis/heuristic_data/heuristic_scores.json")
    output_file = Path("/home/user/webapp/analysis/heuristic_data/heuristic_nielsen_mapped.json")
    
    print("🚀 휴리스틱 → Nielsen 매핑 시작...\n")
    
    # 휴리스틱 데이터 로드
    with open(heuristic_file, 'r', encoding='utf-8') as f:
        heuristic_data = json.load(f)
    
    print(f"📂 휴리스틱 데이터 로드: {heuristic_data['total_agencies']}개 기관\n")
    
    # 매핑 실행
    mapper = HeuristicToNielsenMapper()
    results = mapper.map_heuristic_to_nielsen(heuristic_data)
    
    # 결과 저장
    mapper.save_results(results, output_file)
    
    print("\n✨ 완료!")


if __name__ == "__main__":
    main()
