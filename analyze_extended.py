import requests
import json
import time
from datetime import datetime

# 기존 9개 + 새로운 30개 = 총 39개 사이트
sites = [
    # === 기존 9개 ===
    ("https://www.kasa.go.kr", "KASA", "공공기관", "중형"),
    ("https://www.mois.go.kr", "행정안전부", "공공기관", "대형"),
    ("https://www.naver.com", "네이버", "포털", "대형"),
    ("https://www.daum.net", "다음", "포털", "대형"),
    ("https://www.11st.co.kr", "11번가", "커머스", "대형"),
    ("https://www.chosun.com", "조선일보", "뉴스", "대형"),
    ("https://www.hani.co.kr", "한겨레", "뉴스", "중형"),
    ("https://www.kaist.ac.kr", "KAIST", "교육", "대형"),
    ("https://www.kb.co.kr", "KB국민은행", "금융", "대형"),
    
    # === 공공기관 10개 ===
    ("https://www.epeople.go.kr", "국민신문고", "공공기관", "대형"),
    ("https://www.gov.kr", "정부24", "공공기관", "대형"),
    ("https://www.law.go.kr", "국가법령정보센터", "공공기관", "대형"),
    ("https://www.nia.or.kr", "한국지능정보사회진흥원", "공공기관", "중형"),
    ("https://www.kisa.or.kr", "한국인터넷진흥원", "공공기관", "중형"),
    ("https://www.customs.go.kr", "관세청", "공공기관", "중형"),
    ("https://www.molit.go.kr", "국토교통부", "공공기관", "대형"),
    ("https://www.moe.go.kr", "교육부", "공공기관", "대형"),
    ("https://www.mohw.go.kr", "보건복지부", "공공기관", "대형"),
    ("https://www.nts.go.kr", "국세청", "공공기관", "대형"),
    
    # === 커머스 5개 ===
    ("https://www.gmarket.co.kr", "G마켓", "커머스", "대형"),
    ("https://www.auction.co.kr", "옥션", "커머스", "대형"),
    ("https://www.ssg.com", "SSG닷컴", "커머스", "중형"),
    ("https://www.lotte.com", "롯데온", "커머스", "대형"),
    ("https://www.hmall.com", "현대백화점", "커머스", "중형"),
    
    # === 뉴스/미디어 5개 ===
    ("https://www.joongang.co.kr", "중앙일보", "뉴스", "대형"),
    ("https://www.donga.com", "동아일보", "뉴스", "대형"),
    ("https://www.mk.co.kr", "매일경제", "뉴스", "중형"),
    ("https://www.yna.co.kr", "연합뉴스", "뉴스", "대형"),
    ("https://www.khan.co.kr", "경향신문", "뉴스", "중형"),
    
    # === 금융 5개 ===
    ("https://www.shinhan.com", "신한은행", "금융", "대형"),
    ("https://www.wooribank.com", "우리은행", "금융", "대형"),
    ("https://www.ibk.co.kr", "기업은행", "금융", "대형"),
    ("https://www.nhbank.com", "농협은행", "금융", "대형"),
    ("https://www.kbinsure.co.kr", "KB손해보험", "금융", "중형"),
    
    # === 교육 5개 ===
    ("https://www.snu.ac.kr", "서울대학교", "교육", "대형"),
    ("https://www.yonsei.ac.kr", "연세대학교", "교육", "대형"),
    ("https://www.korea.ac.kr", "고려대학교", "교육", "대형"),
    ("https://www.skku.edu", "성균관대학교", "교육", "대형"),
    ("https://www.hanyang.ac.kr", "한양대학교", "교육", "대형"),
]

print(f"총 {len(sites)}개 사이트 분석 시작...")
print(f"예상 소요 시간: {len(sites) * 10 / 60:.1f}분")
print("="*80)

results = []
success = 0
failed = 0

for idx, (url, name, category, size) in enumerate(sites, 1):
    print(f"\n[{idx}/{len(sites)}] {name} ({category}/{size})")
    print(f"  URL: {url}")
    
    try:
        start_time = time.time()
        response = requests.post(
            'http://localhost:3000/api/analyze',
            json={'url': url},
            timeout=20
        )
        elapsed = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            
            # predicted_score가 있는지 확인
            if 'predicted_score' not in data:
                print(f"  ❌ 오류: predicted_score 없음")
                failed += 1
                continue
            
            ps = data['predicted_score']
            ci = ps['convenience_items']
            di = ps['design_items']
            
            result = {
                'name': name,
                'url': url,
                'category': category,
                'size': size,
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
                'N10_1': ci['N10.1_도움말_접근성']['score'],
                'analysis_time': elapsed
            }
            results.append(result)
            success += 1
            
            print(f"  ✅ 완료 ({elapsed:.1f}초): 종합 {ps['overall']:.2f}")
            
        else:
            print(f"  ❌ HTTP {response.status_code}")
            failed += 1
            
    except requests.exceptions.Timeout:
        print(f"  ❌ 타임아웃 (20초 초과)")
        failed += 1
    except Exception as e:
        print(f"  ❌ 오류: {str(e)[:50]}")
        failed += 1
    
    # API 부하 방지
    time.sleep(2)

# 결과 저장
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
output_file = f'/home/user/webapp/validation_extended_{timestamp}.json'

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump({
        'metadata': {
            'total_sites': len(sites),
            'success': success,
            'failed': failed,
            'timestamp': timestamp
        },
        'results': results
    }, f, ensure_ascii=False, indent=2)

print("\n" + "="*80)
print(f"분석 완료!")
print(f"  성공: {success}개")
print(f"  실패: {failed}개")
print(f"  결과 파일: {output_file}")
print("="*80)

