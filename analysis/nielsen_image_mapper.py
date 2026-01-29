"""
KRDS 이미지 분석 결과를 Nielsen 25항목에 매핑
- 이미지에서 발견된 문제점을 Nielsen 세부 항목에 연결
- KRDS 점수와 이미지 진단을 종합
"""

import json
from pathlib import Path

class NielsenImageMapper:
    def __init__(self):
        self.nielsen_mapping = {
            "1": {
                "principle": "시스템 상태의 가시성",
                "items": [
                    "1.1 현재 위치와 진행 상태 표시",
                    "1.2 로딩 상태 피드백",
                    "1.3 시스템 응답 확인"
                ]
            },
            "2": {
                "principle": "시스템과 현실세계의 연결성",
                "items": [
                    "2.1 사용자 언어 사용",
                    "2.2 현실 세계 메타포 활용",
                    "2.3 논리적 정보 구조"
                ]
            },
            "3": {
                "principle": "사용자 통제 및 자유",
                "items": [
                    "3.1 실행 취소/다시 실행",
                    "3.2 명확한 탈출구",
                    "3.3 작업 중단 기능"
                ]
            },
            "4": {
                "principle": "일관성과 표준",
                "items": [
                    "4.1 UI 요소 일관성",
                    "4.2 플랫폼 표준 준수",
                    "4.3 용어 통일"
                ]
            },
            "5": {
                "principle": "오류 방지",
                "items": [
                    "5.1 제약 조건 사전 표시",
                    "5.2 확인 메시지",
                    "5.3 입력 검증"
                ]
            },
            "6": {
                "principle": "인식 우선 (기억 최소화)",
                "items": [
                    "6.1 명확한 레이블과 아이콘",
                    "6.2 도구 설명 제공",
                    "6.3 자동 완성"
                ]
            },
            "7": {
                "principle": "유연성과 효율성",
                "items": [
                    "7.1 단축키 제공",
                    "7.2 개인화 옵션",
                    "7.3 빠른 작업 경로"
                ]
            },
            "8": {
                "principle": "미학적이고 미니멀한 디자인",
                "items": [
                    "8.1 불필요한 정보 제거",
                    "8.2 시각적 계층 구조",
                    "8.3 여백과 그루핑"
                ]
            },
            "9": {
                "principle": "오류 인식, 진단 및 복구",
                "items": [
                    "9.1 명확한 오류 메시지",
                    "9.2 복구 방법 제시",
                    "9.3 사용자 친화적 표현"
                ]
            },
            "10": {
                "principle": "도움말과 문서",
                "items": [
                    "10.1 상황별 도움말",
                    "10.2 검색 가능한 문서",
                    "10.3 간결한 튜토리얼"
                ]
            }
        }
    
    def map_image_findings_to_nielsen(self, image_analysis_path: str, output_path: str):
        """이미지 분석 결과를 Nielsen 항목에 매핑"""
        
        # 이미지 분석 결과 로드
        with open(image_analysis_path, 'r', encoding='utf-8') as f:
            image_data = json.load(f)
        
        # 매핑 결과
        mapped_results = {
            "summary": {
                "total_agencies": len(image_data["findings"]),
                "good_practices": 0,
                "bad_practices": 0
            },
            "agencies": []
        }
        
        for finding in image_data["findings"]:
            agency_name = finding["agency"]
            classification = finding["classification"]
            nielsen_principles = finding["nielsen_principles"]
            
            # 통계 업데이트
            if classification == "good_practice":
                mapped_results["summary"]["good_practices"] += 1
            elif classification == "bad_practice":
                mapped_results["summary"]["bad_practices"] += 1
            
            # Nielsen 세부 항목 매핑
            nielsen_items_affected = []
            for principle_num in nielsen_principles:
                principle_key = str(principle_num)
                if principle_key in self.nielsen_mapping:
                    principle_info = self.nielsen_mapping[principle_key]
                    nielsen_items_affected.append({
                        "principle": f"{principle_num}. {principle_info['principle']}",
                        "items": principle_info["items"],
                        "impact": finding["severity"]
                    })
            
            agency_result = {
                "agency": agency_name,
                "krds_score": finding["krds_score"],
                "classification": classification,
                "nielsen_principles_affected": nielsen_items_affected,
                "ui_ux_findings": finding["ui_ux_findings"],
                "recommendation": finding.get("recommendation", "")
            }
            
            mapped_results["agencies"].append(agency_result)
        
        # 결과 저장
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(mapped_results, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Nielsen 매핑 완료: {output_path}")
        print(f"📊 총 {mapped_results['summary']['total_agencies']}개 기관 분석")
        print(f"   - 잘한 점: {mapped_results['summary']['good_practices']}개")
        print(f"   - 못한 점: {mapped_results['summary']['bad_practices']}개")
        
        return mapped_results


def main():
    image_analysis = "/home/user/webapp/analysis/krds_images/image_analysis_results.json"
    output = "/home/user/webapp/analysis/krds_images/nielsen_mapped_results.json"
    
    mapper = NielsenImageMapper()
    results = mapper.map_image_findings_to_nielsen(image_analysis, output)
    
    print("\n✨ Step 3 완료: Nielsen 매핑")


if __name__ == "__main__":
    main()
