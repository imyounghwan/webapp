"""
3개 데이터 소스 완전 통합
- 국민평가 (Q1~Q10, 49개 기관)
- KRDS 편의성 (10개 기관)
- 휴리스틱 평가 (49개 기관, 14개 항목)

최종 Nielsen 점수 계산:
- 국민평가만: 100% 국민평가
- 국민평가 + KRDS: 60% 국민평가 + 40% KRDS
- 국민평가 + 휴리스틱: 50% 국민평가 + 50% 휴리스틱
- 국민평가 + KRDS + 휴리스틱: 40% 국민평가 + 30% KRDS + 30% 휴리스틱
"""

import json
from pathlib import Path
from typing import Dict, List, Optional

class FinalIntegrator:
    def __init__(self):
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
    
    def load_data_sources(self) -> Dict:
        """모든 데이터 소스 로드"""
        print("📂 데이터 로드 중...\n")
        
        # 1. 국민평가 (기존 integrated_nielsen_scores.json)
        citizen_file = Path("/home/user/webapp/analysis/output/integrated_nielsen_scores.json")
        with open(citizen_file, 'r', encoding='utf-8') as f:
            citizen_data = json.load(f)
        print(f"   ✅ 국민평가: {len(citizen_data)}개 기관")
        
        # 2. KRDS 편의성
        krds_file = Path("/home/user/webapp/analysis/krds_data/krds_convenience_scores.json")
        with open(krds_file, 'r', encoding='utf-8') as f:
            krds_data = json.load(f)
        # KRDS 데이터가 리스트 형식
        if isinstance(krds_data, list):
            krds_data = {"agencies": krds_data}
        print(f"   ✅ KRDS 편의성: {len(krds_data['agencies'])}개 기관")
        
        # 3. 휴리스틱 평가
        heuristic_file = Path("/home/user/webapp/analysis/heuristic_data/heuristic_nielsen_mapped.json")
        with open(heuristic_file, 'r', encoding='utf-8') as f:
            heuristic_data = json.load(f)
        print(f"   ✅ 휴리스틱 평가: {len(heuristic_data['agencies'])}개 기관\n")
        
        return {
            "citizen": citizen_data,
            "krds": krds_data,
            "heuristic": heuristic_data
        }
    
    def normalize_agency_name(self, name: str) -> str:
        """기관명 정규화 (매칭용)"""
        # 공백 제거, 괄호 내용 제거
        import re
        name = name.strip()
        # 괄호 제거
        name = re.sub(r'\([^)]*\)', '', name)
        # " - " 기준으로 첫번째 부분만 (부서명)
        if " - " in name:
            name = name.split(" - ")[0].strip()
        # 공백 제거
        name = name.replace(" ", "")
        
        # 특수한 매칭
        mappings = {
            "개인정보포털": "개인정보보호위원회",
            "농식품ON": "농림축산식품부",
            "농업ON": "농림축산식품부",
            "인터넷우체국": "우정사업본부",
            "국고보조금통합관리": "행정안전부",
            "범죄경력회보서발급시스템": "법무부",
            "수출입무역통계": "관세청",
            "국세청대표누리집": "국세청",
            "대검찰청": "법무부",
            "정부입법지원센터": "법제처",
            "병무청대표누리집": "병무청",
            "실시간산불정보": "산림청",
            "중앙소방학교누리집": "소방청",
            "인재개발원누리집": "인사혁신처",
            "나라장터종합쇼핑몰": "조달청",
            "특허전자도서관": "특허청",
            "행정안전부_대한민국전자관보": "행정안전부",
            "성평등가족부": "여성가족부",
            "행정도시건설청": "행정중심복합도시건설청",
            "연안포털": "해양수산부"
        }
        return mappings.get(name, name)
    
    def integrate_all_sources(self, data_sources: Dict) -> Dict:
        """3개 데이터 소스 통합"""
        print("🔗 데이터 통합 중...\n")
        
        citizen_data = data_sources["citizen"]
        krds_data = data_sources["krds"]
        heuristic_data = data_sources["heuristic"]
        
        # KRDS 딕셔너리 생성 (빠른 검색용)
        krds_dict = {}
        for agency in krds_data["agencies"]:
            # KRDS는 "full_name" 필드 사용
            full_name = agency.get("full_name", "")
            # krds_convenience 점수를 5점 만점으로 변환
            krds_score_100 = agency.get("krds_convenience", 0)
            krds_score_5 = krds_score_100 / 20.0  # 100점 → 5점 변환
            
            normalized_name = self.normalize_agency_name(full_name)
            krds_dict[normalized_name] = krds_score_5
        
        # 휴리스틱 딕셔너리 생성
        heuristic_dict = {}
        for agency in heuristic_data["agencies"]:
            normalized_name = self.normalize_agency_name(agency["agency"])
            heuristic_dict[normalized_name] = {
                "nielsen_overall": agency["nielsen_overall"],
                "nielsen_scores": agency["nielsen_scores"]
            }
        
        # 통합 결과
        integrated_results = []
        
        for citizen_item in citizen_data:
            site_name = citizen_item["site_name"]
            normalized_name = self.normalize_agency_name(site_name)
            
            # 기본: 국민평가 Nielsen 점수
            citizen_nielsen = citizen_item["nielsen_average"]
            
            # KRDS 점수 찾기
            krds_score = krds_dict.get(normalized_name, None)
            
            # 휴리스틱 점수 찾기
            heuristic_score = heuristic_dict.get(normalized_name, None)
            
            # 최종 점수 계산
            if krds_score and heuristic_score:
                # 3개 모두 있음: 40% + 30% + 30%
                final_score = (
                    citizen_nielsen * 0.4 +
                    krds_score * 0.3 +
                    heuristic_score["nielsen_overall"] * 0.3
                )
                data_sources_used = ["citizen", "krds", "heuristic"]
            elif krds_score:
                # 국민평가 + KRDS: 60% + 40%
                final_score = citizen_nielsen * 0.6 + krds_score * 0.4
                data_sources_used = ["citizen", "krds"]
            elif heuristic_score:
                # 국민평가 + 휴리스틱: 50% + 50%
                final_score = citizen_nielsen * 0.5 + heuristic_score["nielsen_overall"] * 0.5
                data_sources_used = ["citizen", "heuristic"]
            else:
                # 국민평가만: 100%
                final_score = citizen_nielsen
                data_sources_used = ["citizen"]
            
            integrated_item = {
                "site_name": site_name,
                "url": citizen_item.get("url", ""),
                "final_nielsen_score": round(final_score, 2),
                "data_sources": data_sources_used,
                "breakdown": {
                    "citizen_nielsen": round(citizen_nielsen, 2),
                    "krds_score": round(krds_score, 2) if krds_score else None,
                    "heuristic_nielsen": round(heuristic_score["nielsen_overall"], 2) if heuristic_score else None
                },
                "nielsen_10_principles": citizen_item.get("nielsen_scores", {}),
                "has_krds": krds_score is not None,
                "has_heuristic": heuristic_score is not None
            }
            
            integrated_results.append(integrated_item)
        
        # 정렬: 최종 점수 기준
        integrated_results.sort(key=lambda x: x["final_nielsen_score"], reverse=True)
        
        # 통계 계산
        all_scores = [item["final_nielsen_score"] for item in integrated_results]
        statistics = {
            "total_agencies": len(integrated_results),
            "average_score": round(sum(all_scores) / len(all_scores), 2),
            "highest_score": max(all_scores),
            "lowest_score": min(all_scores),
            "with_krds": len([i for i in integrated_results if i["has_krds"]]),
            "with_heuristic": len([i for i in integrated_results if i["has_heuristic"]]),
            "with_all_three": len([i for i in integrated_results if len(i["data_sources"]) == 3])
        }
        
        return {
            "statistics": statistics,
            "agencies": integrated_results
        }
    
    def save_results(self, results: Dict, output_path: Path):
        """결과 저장"""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        stats = results["statistics"]
        print(f"💾 저장 완료: {output_path}\n")
        print(f"📊 최종 통합 결과:")
        print(f"   총 기관: {stats['total_agencies']}개")
        print(f"   평균 점수: {stats['average_score']}점")
        print(f"   최고점: {stats['highest_score']}점")
        print(f"   최저점: {stats['lowest_score']}점")
        print(f"\n   데이터 소스 분포:")
        print(f"   - 3개 모두: {stats['with_all_three']}개")
        print(f"   - KRDS 포함: {stats['with_krds']}개")
        print(f"   - 휴리스틱 포함: {stats['with_heuristic']}개")


def main():
    output_path = Path("/home/user/webapp/analysis/output/final_integrated_scores.json")
    
    print("🚀 3개 데이터 소스 완전 통합 시작...\n")
    
    integrator = FinalIntegrator()
    
    # 데이터 로드
    data_sources = integrator.load_data_sources()
    
    # 통합 실행
    results = integrator.integrate_all_sources(data_sources)
    
    # 결과 저장
    integrator.save_results(results, output_path)
    
    # TOP 10 출력
    print(f"\n🏆 TOP 10 (최종 통합 점수):")
    for i, agency in enumerate(results["agencies"][:10], 1):
        sources_str = " + ".join([
            "국민" if "citizen" in agency["data_sources"] else "",
            "KRDS" if "krds" in agency["data_sources"] else "",
            "휴리스틱" if "heuristic" in agency["data_sources"] else ""
        ]).replace("  ", " ").strip(" +")
        print(f"   {i:2d}. {agency['site_name']:20s} {agency['final_nielsen_score']:.2f}점 [{sources_str}]")
    
    print("\n✨ 완료!")


if __name__ == "__main__":
    main()
