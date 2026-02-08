/**
 * Nielsen 26개 항목 상세 설명 (v3.1 - 사용자 친화적 버전)
 * 전문 용어를 최소화하고 구체적인 예시를 포함
 */

export interface ItemDescription {
  id: string
  name: string
  category: string
  description: string
  principle: string
  why_important: string
  evaluation_criteria: string
}

export const nielsenDescriptions: Record<string, ItemDescription> = {
  'N1_1': {
    id: 'N1.1',
    name: '내가 어디있는지 알려주기',
    category: '편의성',
    principle: 'N1: 시스템 상태 가시성',
    description: '홈 > 회사소개 > 연혁 처럼 현재 페이지의 위치를 보여주는 경로(브레드크럼) 표시',
    why_important: '큰 쇼핑몰에서 길을 잃으면 원하는 매장을 찾기 어렵듯이, 웹사이트에서도 내 위치를 모르면 헤매게 됩니다.',
    evaluation_criteria: '상단에 "홈 > 카테고리 > 현재페이지" 같은 경로 표시가 있는지 확인'
  },
  'N1_2': {
    id: 'N1.2',
    name: '로딩중이라고 알려주기',
    category: '편의성',
    principle: 'N1: 시스템 상태 가시성',
    description: '페이지를 불러오는 중이거나 데이터 처리 중일 때 빙글빙글 도는 아이콘이나 "처리중..." 메시지 표시',
    why_important: '아무 반응이 없으면 "고장났나?" 하고 불안해지고, 버튼을 여러 번 누르게 됩니다.',
    evaluation_criteria: '느린 작업 중에 로딩 표시나 진행상황 바가 있는지 확인'
  },
  'N1_3': {
    id: 'N1.3',
    name: '내 행동에 반응하기',
    category: '편의성',
    principle: 'N1: 시스템 상태 가시성',
    description: '버튼을 누르면 색이 바뀌거나, 입력란에 잘못 입력하면 즉시 "올바른 형식이 아닙니다" 같은 피드백 제공',
    why_important: '버튼을 눌렀는데 아무 변화가 없으면 "내가 잘못 눌렀나?" 하고 혼란스럽습니다.',
    evaluation_criteria: '마우스를 올리면 색이 바뀌는지, 입력 오류를 바로 알려주는지 확인'
  },
  'N2_1': {
    id: 'N2.1',
    name: '쉬운 말로 쓰기',
    category: '편의성',
    principle: 'N2: 현실 세계 일치',
    description: '"Submit" 대신 "제출하기", "Authentication Failed" 대신 "로그인 실패" 처럼 일상 언어 사용',
    why_important: '전문 용어나 영어는 일반 사용자가 이해하기 어렵고 불편합니다.',
    evaluation_criteria: '한국 사이트인데 영어나 어려운 전문용어를 많이 쓰는지 확인'
  },
  'N2_2': {
    id: 'N2.2',
    name: '자연스러운 순서로 배치',
    category: '편의성',
    principle: 'N2: 현실 세계 일치',
    description: '회원가입 시 "이름 → 이메일 → 비밀번호" 순서처럼 예상 가능한 흐름으로 정보 배치',
    why_important: '뒤죽박죽 순서는 "왜 이게 여기있지?" 하며 헷갈리게 만듭니다.',
    evaluation_criteria: '정보 순서가 논리적인지, 제목-내용 구조가 명확한지 확인'
  },
  'N2_3': {
    id: 'N2.3',
    name: '직관적인 아이콘 사용',
    category: '디자인',
    principle: 'N2: 현실 세계 일치',
    description: '휴지통 아이콘은 삭제, 돋보기는 검색처럼 현실 물건과 똑같이 생긴 아이콘 사용',
    why_important: '익숙한 모양은 설명 없이도 바로 이해할 수 있어서 편합니다.',
    evaluation_criteria: '아이콘이 많이 사용되는지, 의미가 명확한지 확인'
  },
  'N3_1': {
    id: 'N3.1',
    name: '되돌리기 버튼 제공',
    category: '편의성',
    principle: 'N3: 사용자 제어와 자유',
    description: '긴 폼 작성 중 "초기화" 버튼이나, 잘못 입력한 내용을 "취소" 할 수 있는 기능 제공',
    why_important: '실수를 고칠 방법이 없으면 처음부터 다시 해야 합니다.',
    evaluation_criteria: '폼에 "초기화" 버튼이나 뒤로가기가 잘 작동하는지 확인'
  },
  'N3_3': {
    id: 'N3_3',
    name: '여러 길로 갈 수 있게 하기',
    category: '편의성',
    principle: 'N3: 사용자 제어와 자유',
    description: '고객센터를 상단메뉴, 하단링크, 검색 등 여러 방법으로 찾아갈 수 있도록 구성',
    why_important: '한 가지 길만 있으면 그 길을 놓치면 막막합니다.',
    evaluation_criteria: '중요 페이지로 가는 링크가 여러 곳에 있는지 확인'
  },
  'N4_1': {
    id: 'N4.1',
    name: '통일된 디자인',
    category: '디자인',
    principle: 'N4: 일관성과 표준',
    description: '모든 페이지에서 같은 색상, 같은 폰트, 같은 버튼 스타일 사용',
    why_important: '페이지마다 디자인이 다르면 매번 새로 익혀야 해서 피곤합니다.',
    evaluation_criteria: '페이지별로 색상, 폰트, 레이아웃이 비슷한지 확인'
  },
  'N4_2': {
    id: 'N4.2',
    name: '같은 말로 통일하기',
    category: '편의성',
    principle: 'N4: 일관성과 표준',
    description: '"로그인"을 어떤 페이지에선 "로그인", 다른 페이지에선 "Sign In"으로 부르지 않고 하나로 통일',
    why_important: '같은 기능을 다르게 부르면 "이게 다른 건가?" 하고 사용자는 혼란스럽습니다.',
    evaluation_criteria: '같은 개념을 여러 이름으로 부르지 않는지 확인'
  },
  'N4_3': {
    id: 'N4.3',
    name: '웹 표준 지키기',
    category: '편의성',
    principle: 'N4: 일관성과 표준',
    description: '이미지에 설명글(alt) 추가, 페이지 언어(한국어) 명시 등 웹 기본 규칙 준수',
    why_important: '표준을 안 지키면 시각장애인용 화면낭독기 같은 보조도구가 제대로 작동하지 않습니다.',
    evaluation_criteria: '이미지마다 설명이 있는지, HTML이 올바르게 작성됐는지 확인'
  },
  'N5_1': {
    id: 'N5.1',
    name: '잘못된 입력 미리 막기',
    category: '편의성',
    principle: 'N5: 오류 예방',
    description: '이메일 입력란에 숫자만 입력하면 "올바른 이메일이 아닙니다" 즉시 표시, 필수항목 빈칸 제출 차단',
    why_important: '잘못 입력하고 제출한 뒤 오류를 확인하는 것보다, 입력 중에 미리 알려주는 게 편합니다.',
    evaluation_criteria: '입력란에 형식 검사(이메일, 숫자, 필수 등)가 있는지 확인'
  },
  'N5_2': {
    id: 'N5.2',
    name: '중요한 작업은 재확인',
    category: '편의성',
    principle: 'N5: 오류 예방',
    description: '삭제, 결제 같은 중요한 버튼 누르면 "정말 삭제하시겠습니까?" 재확인 팝업 표시',
    why_important: '실수로 눌러서 돌이킬 수 없는 일이 생길 수 있습니다.',
    evaluation_criteria: '중요한 작업 전에 확인 메시지가 나오는지 확인'
  },
  'N5_3': {
    id: 'N5.3',
    name: '입력 조건 미리 알려주기',
    category: '편의성',
    principle: 'N5: 오류 예방',
    description: '비밀번호 입력란 옆에 "8자 이상, 영문+숫자 조합" 같은 조건을 미리 표시',
    why_important: '규칙을 모르고 입력했다가 오류가 나면 다시 입력해야 해서 번거롭습니다.',
    evaluation_criteria: '입력란마다 무엇을 입력해야 하는지 설명이 있는지 확인'
  },
  'N6_2': {
    id: 'N6.2',
    name: '아이콘으로 기능 표시',
    category: '편의성',
    principle: 'N6: 인식보다 회상',
    description: '프린터 아이콘만 봐도 "인쇄" 기능인 걸 알 수 있도록 시각적 힌트 제공',
    why_important: '"이 버튼이 뭐였지?" 하고 기억해내려 애쓰는 것보다 보고 바로 아는 게 편합니다.',
    evaluation_criteria: '아이콘이나 툴팁으로 기능을 명확히 보여주는지 확인'
  },
  'N6_3': {
    id: 'N6.3',
    name: '기억할 것 최소화',
    category: '편의성',
    principle: 'N6: 인식보다 회상',
    description: '여러 단계 작업 시 이전 단계 정보를 화면에 계속 보여줘서 기억하지 않아도 되게 하기',
    why_important: '머릿속으로 기억하면서 사용하면 실수하기 쉽고 피곤합니다.',
    evaluation_criteria: '페이지 경로나 이전 선택이 계속 보이는지 확인'
  },
  'N7_1': {
    id: 'N7.1',
    name: '가속 장치',
    category: '편의성',
    principle: 'N7: 유연성과 효율성',
    description: '키보드 단축키, 빠른 메뉴, 최근 이용 기록 등 숙련자를 위한 효율적인 작업 수단 제공',
    why_important: '반복 작업이 많은 숙련자는 빠른 접근 수단이 없으면 불편합니다.',
    evaluation_criteria: '키보드 단축키, 빠른 메뉴, 최근 이용 기록이 있는지 확인'
  },
  'N7_2': {
    id: 'N7.2',
    name: '개인화',
    category: '편의성',
    principle: 'N7: 유연성과 효율성',
    description: '설정 개인화, 글자 크기 조절, 다크모드/테마, 언어 선택 등 사용자 맞춤 기능 제공',
    why_important: '사용자마다 선호하는 환경이 다르므로 개인화 기능이 필요합니다.',
    evaluation_criteria: '설정 개인화, 글자 크기 조절, 테마 변경 기능이 있는지 확인'
  },
  'N7_3': {
    id: 'N7.3',
    name: '일괄 처리',
    category: '편의성',
    principle: 'N7: 유연성과 효율성',
    description: '전체 선택, 일괄 삭제/다운로드/수정 등 여러 항목을 한 번에 처리하는 기능 제공',
    why_important: '항목을 하나씩 처리하는 것은 비효율적이고 시간이 오래 걸립니다.',
    evaluation_criteria: '전체 선택 기능과 일괄 작업 버튼이 있는지 확인'
  },
  'N8_1': {
    id: 'N8.1',
    name: '필요한 정보만 보여주기',
    category: '디자인',
    principle: 'N8: 미니멀 디자인',
    description: '한 페이지에 너무 많은 내용을 담지 않고, 핵심만 간결하게 표시',
    why_important: '정보가 너무 많으면 정작 중요한 걸 못 찾고 포기합니다.',
    evaluation_criteria: '한 페이지 글자 수가 적당한지, 군더더기가 없는지 확인'
  },
  'N8_2': {
    id: 'N8.2',
    name: '깔끔하고 여유있게',
    category: '디자인',
    principle: 'N8: 미니멀 디자인',
    description: '이미지, 버튼, 글자 사이에 적당한 여백을 두어 답답하지 않게 구성',
    why_important: '빽빽하게 채우면 눈이 피곤하고 어디를 봐야 할지 모릅니다.',
    evaluation_criteria: '이미지와 텍스트가 너무 많지 않고 여백이 있는지 확인'
  },
  'N8_3': {
    id: 'N8.3',
    name: '중요도 순서대로 배치',
    category: '디자인',
    principle: 'N8: 미니멀 디자인',
    description: '큰 제목 → 중간 제목 → 본문 순서로 크기를 달리해서 중요도 표현',
    why_important: '모든 글자가 똑같은 크기면 무엇이 중요한지 알 수 없습니다.',
    evaluation_criteria: '제목이 본문보다 크고 눈에 띄는지 확인'
  },
  'N9_2': {
    id: 'N9.2',
    name: '오류 발생시 복구 지원',
    category: '편의성',
    principle: 'N9: 오류 인식과 복구',
    description: '오류 나도 입력한 내용이 그대로 남아있어서 처음부터 다시 안 해도 됨',
    why_important: '오류 발생시 데이터가 사라지면 사용자는 아예 사용을 그만하게 됩니다.',
    evaluation_criteria: '폼 제출 실패해도 입력 내용이 유지되는지 확인'
  },
  'N9_4': {
    id: 'N9.4',
    name: '오류 원인 명확하게 설명',
    category: '편의성',
    principle: 'N9: 오류 인식과 복구',
    description: '"오류 발생" 대신 "비밀번호는 8자 이상이어야 합니다" 처럼 구체적인 해결방법 제시',
    why_important: '무슨 문제인지 모르면 어떻게 고쳐야 할지 알 수 없습니다.',
    evaluation_criteria: '오류 메시지가 구체적이고 해결책을 알려주는지 확인'
  },
  'N10_1': {
    id: 'N10.1',
    name: '도움말 찾기 쉽게',
    category: '편의성',
    principle: 'N10: 도움말과 문서',
    description: 'FAQ, 도움말 버튼이 페이지 상단이나 하단에 항상 보이는 위치에 있음',
    why_important: '모를 때 도움말을 못 찾으면 답답해서 포기합니다.',
    evaluation_criteria: '도움말이나 FAQ 링크가 눈에 잘 띄는지 확인'
  },
  'N10_2': {
    id: 'N10.2',
    name: '체계적인 도움말 문서',
    category: '편의성',
    principle: 'N10: 도움말과 문서',
    description: 'FAQ가 주제별로 정리되어 있고, 가이드 문서가 단계별로 잘 설명됨',
    why_important: '도움말이 뒤죽박죽이면 찾기 어렵고 이해하기 힘듭니다.',
    evaluation_criteria: '도움말이 카테고리별로 정리되어 있는지 확인'
  }
}

/**
 * 항목 ID로 설명 가져오기
 */
export function getItemDescription(itemId: string): ItemDescription | null {
  return nielsenDescriptions[itemId] || null
}

/**
 * 모든 항목 설명 가져오기
 */
export function getAllDescriptions(): ItemDescription[] {
  return Object.values(nielsenDescriptions)
}
