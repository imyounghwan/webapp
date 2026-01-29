import requests
import json
import time

sites = [
    ("https://www.kasa.go.kr", "KASA (공공기관)"),
    ("https://www.mois.go.kr", "행안부 (공공기관)"),
    ("https://www.naver.com", "네이버 (포털)"),
    ("https://www.daum.net", "다음 (포털)"),
    ("https://www.coupang.com", "쿠팡 (커머스)"),
    ("https://www.11st.co.kr", "11번가 (커머스)"),
    ("https://www.chosun.com", "조선일보 (뉴스)"),
    ("https://www.hani.co.kr", "한겨레 (뉴스)"),
    ("https://www.kaist.ac.kr", "KAIST (교육)"),
    ("https://www.kb.co.kr", "KB은행 (금융)")
]

results = []

for url, name in sites:
    print(f"\n분석 중: {name}")
    try:
        response = requests.post(
            'http://localhost:3000/api/analyze',
            json={'url': url},
            timeout=15
        )
        data = response.json()
        ps = data['predicted_score']
        ci = ps['convenience_items']
        di = ps['design_items']
        
        result = {
            'name': name,
            'url': url,
            'overall': ps['overall'],
            'convenience': ps['convenience'],
            'design': ps['design'],
            'N1_1': ci['N1.1_현재_위치']['score'],
            'N3_2': ci['N3.2_나가기']['score'],
            'N5_1': ci['N5.1_입력_검증']['score'],
            'N9_1': di['N9.1_오류_메시지']['score'],
            'N5_3': ci['N5.3_제약_조건']['score'],
            'N9_3': di['N9.3_오류_예방']['score'],
            'N6_1': ci['N6.1_보이는_옵션']['score'],
            'N6_3': ci['N6.3_기억_부담']['score'],
            'N7_1': ci['N7.1_단축키']['score'],
            'N10_1': ci['N10.1_도움말_접근성']['score']
        }
        results.append(result)
        print(f"  완료: 종합 {ps['overall']}")
        
    except Exception as e:
        print(f"  오류: {str(e)}")
    
    time.sleep(2)  # API 부하 방지

# 결과 저장
with open('/home/user/webapp/validation_results.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("\n" + "="*60)
print("분석 완료! 결과:")
print("="*60)

for r in results:
    print(f"\n{r['name']}")
    print(f"  종합: {r['overall']}, 편의성: {r['convenience']}, 디자인: {r['design']}")
    print(f"  중복검증 1: N1.1={r['N1_1']} vs N3.2={r['N3_2']} (차이: {abs(r['N1_1']-r['N3_2'])})")
    print(f"  중복검증 2: N5.1={r['N5_1']} vs N9.1={r['N9_1']} (차이: {abs(r['N5_1']-r['N9_1'])})")
    print(f"  중복검증 3: N5.3={r['N5_3']} vs N9.3={r['N9_3']} (차이: {abs(r['N5_3']-r['N9_3'])})")
    print(f"  검색의존: N6.1={r['N6_1']}, N6.3={r['N6_3']}, N7.1={r['N7_1']}, N10.1={r['N10_1']}")

