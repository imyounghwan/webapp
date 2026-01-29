import requests
import json
import time
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# 100개 한국 웹사이트 (다양한 업종/규모)
sites = [
    # === 기존 35개 (이미 분석 완료) ===
    ("https://www.kasa.go.kr", "KASA", "공공기관", "중형"),
    ("https://www.mois.go.kr", "행정안전부", "공공기관", "대형"),
    ("https://www.naver.com", "네이버", "포털", "대형"),
    ("https://www.daum.net", "다음", "포털", "대형"),
    ("https://www.11st.co.kr", "11번가", "커머스", "대형"),
    ("https://www.chosun.com", "조선일보", "뉴스", "대형"),
    ("https://www.hani.co.kr", "한겨레", "뉴스", "중형"),
    ("https://www.kaist.ac.kr", "KAIST", "교육", "대형"),
    ("https://www.kb.co.kr", "KB국민은행", "금융", "대형"),
    ("https://www.epeople.go.kr", "국민신문고", "공공기관", "대형"),
    ("https://www.gov.kr", "정부24", "공공기관", "대형"),
    ("https://www.law.go.kr", "국가법령정보센터", "공공기관", "대형"),
    ("https://www.nia.or.kr", "한국지능정보사회진흥원", "공공기관", "중형"),
    ("https://www.kisa.or.kr", "한국인터넷진흥원", "공공기관", "중형"),
    ("https://www.customs.go.kr", "관세청", "공공기관", "중형"),
    ("https://www.moe.go.kr", "교육부", "공공기관", "대형"),
    ("https://www.mohw.go.kr", "보건복지부", "공공기관", "대형"),
    ("https://www.nts.go.kr", "국세청", "공공기관", "대형"),
    ("https://www.gmarket.co.kr", "G마켓", "커머스", "대형"),
    ("https://www.auction.co.kr", "옥션", "커머스", "대형"),
    ("https://www.ssg.com", "SSG닷컴", "커머스", "중형"),
    ("https://www.lotte.com", "롯데온", "커머스", "대형"),
    ("https://www.hmall.com", "현대백화점", "커머스", "중형"),
    ("https://www.joongang.co.kr", "중앙일보", "뉴스", "대형"),
    ("https://www.donga.com", "동아일보", "뉴스", "대형"),
    ("https://www.mk.co.kr", "매일경제", "뉴스", "중형"),
    ("https://www.yna.co.kr", "연합뉴스", "뉴스", "대형"),
    ("https://www.khan.co.kr", "경향신문", "뉴스", "중형"),
    ("https://www.shinhan.com", "신한은행", "금융", "대형"),
    ("https://www.wooribank.com", "우리은행", "금융", "대형"),
    ("https://www.ibk.co.kr", "기업은행", "금융", "대형"),
    ("https://www.nhbank.com", "농협은행", "금융", "대형"),
    ("https://www.kbinsure.co.kr", "KB손해보험", "금융", "중형"),
    ("https://www.snu.ac.kr", "서울대학교", "교육", "대형"),
    ("https://www.yonsei.ac.kr", "연세대학교", "교육", "대형"),
    
    # === 신규 65개 (다양한 업종 추가) ===
    
    # 공공기관 15개
    ("https://www.mss.go.kr", "중소벤처기업부", "공공기관", "대형"),
    ("https://www.motie.go.kr", "산업통상자원부", "공공기관", "대형"),
    ("https://www.mof.go.kr", "해양수산부", "공공기관", "대형"),
    ("https://www.me.go.kr", "환경부", "공공기관", "대형"),
    ("https://www.moel.go.kr", "고용노동부", "공공기관", "대형"),
    ("https://www.msit.go.kr", "과학기술정보통신부", "공공기관", "대형"),
    ("https://www.mcst.go.kr", "문화체육관광부", "공공기관", "대형"),
    ("https://www.mafra.go.kr", "농림축산식품부", "공공기관", "대형"),
    ("https://www.kogl.or.kr", "한국저작권위원회", "공공기관", "중형"),
    ("https://www.kipo.go.kr", "특허청", "공공기관", "대형"),
    ("https://www.kcc.go.kr", "방송통신위원회", "공공기관", "중형"),
    ("https://www.acrc.go.kr", "국민권익위원회", "공공기관", "중형"),
    ("https://www.moj.go.kr", "법무부", "공공기관", "대형"),
    ("https://www.mpss.go.kr", "소방청", "공공기관", "중형"),
    ("https://www.kostat.go.kr", "통계청", "공공기관", "중형"),
    
    # 대학 15개
    ("https://www.korea.ac.kr", "고려대학교", "교육", "대형"),
    ("https://www.skku.edu", "성균관대학교", "교육", "대형"),
    ("https://www.hanyang.ac.kr", "한양대학교", "교육", "대형"),
    ("https://www.ewha.ac.kr", "이화여자대학교", "교육", "대형"),
    ("https://www.sogang.ac.kr", "서강대학교", "교육", "대형"),
    ("https://www.cau.ac.kr", "중앙대학교", "교육", "대형"),
    ("https://www.khu.ac.kr", "경희대학교", "교육", "대형"),
    ("https://www.hufs.ac.kr", "한국외국어대학교", "교육", "중형"),
    ("https://www.ssu.ac.kr", "숭실대학교", "교육", "중형"),
    ("https://www.dongguk.edu", "동국대학교", "교육", "중형"),
    ("https://www.kookmin.ac.kr", "국민대학교", "교육", "중형"),
    ("https://www.sejong.ac.kr", "세종대학교", "교육", "중형"),
    ("https://www.smu.ac.kr", "상명대학교", "교육", "중형"),
    ("https://www.uos.ac.kr", "서울시립대학교", "교육", "중형"),
    ("https://www.inha.ac.kr", "인하대학교", "교육", "중형"),
    
    # 대기업 10개
    ("https://www.samsung.com/kr", "삼성전자", "기업", "대형"),
    ("https://www.hyundai.com", "현대자동차", "기업", "대형"),
    ("https://www.lge.co.kr", "LG전자", "기업", "대형"),
    ("https://www.skkorea.com", "SK", "기업", "대형"),
    ("https://www.posco.co.kr", "포스코", "기업", "대형"),
    ("https://www.hanwha.co.kr", "한화그룹", "기업", "대형"),
    ("https://www.lotte.co.kr", "롯데그룹", "기업", "대형"),
    ("https://www.gs.co.kr", "GS그룹", "기업", "대형"),
    ("https://www.cj.net", "CJ그룹", "기업", "대형"),
    ("https://www.hd.co.kr", "HD현대", "기업", "대형"),
    
    # 뉴스/언론 10개
    ("https://www.seoul.co.kr", "서울신문", "뉴스", "중형"),
    ("https://www.hankyung.com", "한국경제", "뉴스", "대형"),
    ("https://www.mt.co.kr", "머니투데이", "뉴스", "중형"),
    ("https://www.edaily.co.kr", "이데일리", "뉴스", "중형"),
    ("https://www.etnews.com", "전자신문", "뉴스", "중형"),
    ("https://www.asiae.co.kr", "아시아경제", "뉴스", "중형"),
    ("https://www.newsis.com", "뉴시스", "뉴스", "중형"),
    ("https://www.news1.kr", "뉴스1", "뉴스", "중형"),
    ("https://www.kbs.co.kr", "KBS", "뉴스", "대형"),
    ("https://www.sbs.co.kr", "SBS", "뉴스", "대형"),
    
    # 금융 10개
    ("https://www.hanabank.com", "하나은행", "금융", "대형"),
    ("https://www.sc.com/kr", "SC제일은행", "금융", "중형"),
    ("https://www.ksure.or.kr", "한국무역보험공사", "금융", "중형"),
    ("https://www.kodit.co.kr", "신용보증기금", "금융", "중형"),
    ("https://www.kfb.or.kr", "은행연합회", "금융", "중형"),
    ("https://www.fss.or.kr", "금융감독원", "금융", "대형"),
    ("https://www.kdb.co.kr", "산업은행", "금융", "대형"),
    ("https://www.kbfg.com", "KB금융지주", "금융", "대형"),
    ("https://www.shinhancapital.co.kr", "신한캐피탈", "금융", "중형"),
    ("https://www.wooricapital.co.kr", "우리금융캐피탈", "금융", "중형"),
    
    # IT/통신 5개
    ("https://www.kakao.com", "카카오", "IT", "대형"),
    ("https://www.linecorp.com", "라인", "IT", "중형"),
    ("https://www.ncsoft.com", "엔씨소프트", "IT", "중형"),
    ("https://www.nexon.com", "넥슨", "IT", "중형"),
    ("https://www.netmarble.com", "넷마블", "IT", "중형"),
]

print(f"=" * 80)
print(f"🚀 대규모 데이터 수집 시작")
print(f"=" * 80)
print(f"총 사이트: {len(sites)}개")
print(f"예상 소요 시간: {len(sites) * 8 / 60:.1f}분")
print(f"병렬 처리: 5개 동시 분석")
print(f"=" * 80)

results = []
success = 0
failed = 0
lock = threading.Lock()

def analyze_site(idx, url, name, category, size):
    """개별 사이트 분석 함수"""
    global success, failed
    
    print(f"\n[{idx}/{len(sites)}] {name} ({category}/{size})")
    print(f"  URL: {url}")
    
    try:
        start_time = time.time()
        response = requests.post(
            'http://localhost:3000/api/analyze',
            json={'url': url},
            timeout=25
        )
        elapsed = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            
            if 'predicted_score' not in data:
                print(f"  ❌ 오류: predicted_score 없음")
                with lock:
                    failed += 1
                return None
            
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
            
            with lock:
                success += 1
            
            print(f"  ✅ 완료 ({elapsed:.1f}초): 종합 {ps['overall']:.2f}")
            return result
            
        else:
            print(f"  ❌ HTTP {response.status_code}")
            with lock:
                failed += 1
            return None
            
    except requests.exceptions.Timeout:
        print(f"  ❌ 타임아웃 (25초 초과)")
        with lock:
            failed += 1
        return None
    except Exception as e:
        print(f"  ❌ 오류: {str(e)[:50]}")
        with lock:
            failed += 1
        return None

# 병렬 처리 (5개 동시)
with ThreadPoolExecutor(max_workers=5) as executor:
    futures = []
    for idx, (url, name, category, size) in enumerate(sites, 1):
        future = executor.submit(analyze_site, idx, url, name, category, size)
        futures.append(future)
        time.sleep(0.5)  # 동시 요청 간격
    
    for future in as_completed(futures):
        result = future.result()
        if result:
            results.append(result)

# 결과 저장
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
output_file = f'/home/user/webapp/validation_large_scale_{timestamp}.json'

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump({
        'metadata': {
            'total_sites': len(sites),
            'success': success,
            'failed': failed,
            'success_rate': f"{success / len(sites) * 100:.1f}%",
            'timestamp': timestamp
        },
        'results': results
    }, f, ensure_ascii=False, indent=2)

print("\n" + "=" * 80)
print(f"🎉 대규모 분석 완료!")
print(f"  성공: {success}개 ({success / len(sites) * 100:.1f}%)")
print(f"  실패: {failed}개 ({failed / len(sites) * 100:.1f}%)")
print(f"  결과 파일: {output_file}")
print("=" * 80)

