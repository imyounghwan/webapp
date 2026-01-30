/**
 * Nielsen 22개 항목 상세 설명 (v3.0)
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
    name: '현재 위치 표시',
    category: '편의성',
    principle: 'N1: 시스템 상태 가시성',
    description: 'Breadcrumb 네비게이션 등을 통해 사용자가 웹사이트 내에서 현재 어디에 있는지 명확하게 보여줍니다.',
    why_important: '사용자가 자신의 위치를 모르면 길을 잃고 목표를 달성하기 어렵습니다.',
    evaluation_criteria: 'Breadcrumb 존재 여부, 경로 표시의 명확성'
  },
  'N1_2': {
    id: 'N1.2',
    name: '로딩 상태 표시',
    category: '편의성',
    principle: 'N1: 시스템 상태 가시성',
    description: 'ARIA 레이블 등으로 페이지 로딩이나 처리 중임을 사용자에게 알립니다.',
    why_important: '시스템이 응답하는지 사용자가 모르면 혼란과 불안을 느낍니다.',
    evaluation_criteria: 'ARIA 레이블 수, 로딩 인디케이터 존재 여부'
  },
  'N1_3': {
    id: 'N1.3',
    name: '행동 피드백',
    category: '편의성',
    principle: 'N1: 시스템 상태 가시성',
    description: '사용자 행동(클릭, 입력 등)에 대한 즉각적인 반응을 제공합니다.',
    why_important: '피드백이 없으면 사용자는 자신의 행동이 받아들여졌는지 알 수 없습니다.',
    evaluation_criteria: '폼 검증, 호버 효과, 클릭 피드백 존재'
  },
  'N2_1': {
    id: 'N2.1',
    name: '친숙한 용어',
    category: '디자인',
    principle: 'N2: 현실 세계 일치',
    description: '사용자가 이해하기 쉬운 일상 언어와 표현을 사용합니다.',
    why_important: '전문 용어나 시스템 중심 언어는 사용자를 혼란스럽게 합니다.',
    evaluation_criteria: 'HTML lang 속성, 한국어/영어 명확성'
  },
  'N2_2': {
    id: 'N2.2',
    name: '자연스러운 흐름',
    category: '디자인',
    principle: 'N2: 현실 세계 일치',
    description: '정보가 논리적이고 예측 가능한 순서로 배치되어 있습니다.',
    why_important: '예상치 못한 순서는 사용자의 멘탈 모델과 충돌합니다.',
    evaluation_criteria: '헤딩 구조, 콘텐츠 흐름의 논리성'
  },
  'N2_3': {
    id: 'N2.3',
    name: '현실 세계 은유',
    category: '디자인',
    principle: 'N2: 현실 세계 일치',
    description: '아이콘, 버튼 등이 현실 세계 객체를 시각적으로 표현합니다.',
    why_important: '친숙한 은유는 학습 비용을 줄이고 직관성을 높입니다.',
    evaluation_criteria: '아이콘 사용 수, 시각적 메타포의 적절성'
  },
  'N3_1': {
    id: 'N3.1',
    name: '실행 취소',
    category: '편의성',
    principle: 'N3: 사용자 제어와 자유',
    description: '사용자가 실수를 되돌릴 수 있는 기능을 제공합니다 (폼 리셋 등).',
    why_important: '실수를 복구할 수 없으면 사용자는 시스템을 신뢰하지 않습니다.',
    evaluation_criteria: '폼 리셋 버튼, 뒤로 가기 지원'
  },
  'N3_3': {
    id: 'N3.3',
    name: '유연한 탐색',
    category: '편의성',
    principle: 'N3: 사용자 제어와 자유',
    description: '다양한 경로와 방법으로 원하는 정보에 도달할 수 있습니다.',
    why_important: '단일 경로만 제공하면 사용자가 막혔을 때 대안이 없습니다.',
    evaluation_criteria: '링크 수, 다양한 탐색 옵션'
  },
  'N4_1': {
    id: 'N4.1',
    name: '시각적 일관성',
    category: '디자인',
    principle: 'N4: 일관성과 표준',
    description: '색상, 폰트, 레이아웃이 페이지 전체에서 통일되어 있습니다.',
    why_important: '일관성이 없으면 사용자는 매번 새로 학습해야 합니다.',
    evaluation_criteria: '이미지 수와 분포, 시각적 스타일 통일성'
  },
  'N4_2': {
    id: 'N4.2',
    name: '용어 일관성',
    category: '디자인',
    principle: 'N4: 일관성과 표준',
    description: '같은 개념을 같은 단어로 일관되게 표현합니다.',
    why_important: '같은 것을 다르게 부르면 사용자가 혼란스럽습니다.',
    evaluation_criteria: '헤딩 구조, 용어 사용의 일관성'
  },
  'N4_3': {
    id: 'N4.3',
    name: '표준 준수',
    category: '디자인',
    principle: 'N4: 일관성과 표준',
    description: 'HTML, 접근성 등 웹 표준을 따릅니다 (lang, alt, ARIA 등).',
    why_important: '표준을 따르지 않으면 보조 기술이 제대로 작동하지 않습니다.',
    evaluation_criteria: 'HTML lang, alt text 비율, ARIA 사용'
  },
  'N5_1': {
    id: 'N5.1',
    name: '입력 검증',
    category: '편의성',
    principle: 'N5: 오류 예방',
    description: '잘못된 형식의 데이터 입력을 사전에 차단합니다 (required, pattern 등).',
    why_important: '오류가 발생한 후 수정하는 것보다 예방이 효율적입니다.',
    evaluation_criteria: 'HTML5 validation 속성 (required, pattern, min, max 등)'
  },
  'N5_2': {
    id: 'N5.2',
    name: '확인 대화상자',
    category: '편의성',
    principle: 'N5: 오류 예방',
    description: '중요한 작업 전 사용자에게 재확인을 요청합니다.',
    why_important: '되돌릴 수 없는 작업은 확인 절차가 필수입니다.',
    evaluation_criteria: '폼 존재 여부 (확인 가능성)'
  },
  'N5_3': {
    id: 'N5.3',
    name: '제약 조건 표시',
    category: '편의성',
    principle: 'N5: 오류 예방',
    description: '입력 필드에 레이블로 제약사항을 명확히 안내합니다.',
    why_important: '제약을 모르면 오류를 피할 수 없습니다.',
    evaluation_criteria: 'Label-input 연결 비율, placeholder 사용'
  },
  'N6_2': {
    id: 'N6.2',
    name: '인식 단서',
    category: '편의성',
    principle: 'N6: 인식보다 회상',
    description: '아이콘, 툴팁 등으로 사용자가 기억하지 않아도 기능을 인식할 수 있습니다.',
    why_important: '기억에 의존하면 인지 부담이 증가합니다.',
    evaluation_criteria: '아이콘 수, 시각적 힌트'
  },
  'N6_3': {
    id: 'N6.3',
    name: '기억 부담 최소화',
    category: '편의성',
    principle: 'N6: 인식보다 회상',
    description: 'Breadcrumb, 명확한 레이블로 정보를 기억할 부담을 줄입니다.',
    why_important: '작업 기억은 제한적이므로 최소화해야 합니다.',
    evaluation_criteria: 'Breadcrumb, 탐색 깊이'
  },
  'N7_1': {
    id: 'N7.1',
    name: '빠른 접근',
    category: '편의성',
    principle: 'N7: 유연성과 효율성',
    description: '메인 메뉴, GNB 등으로 주요 기능에 클릭 1~2회로 도달할 수 있습니다.',
    why_important: '깊은 계층 구조는 효율성을 떨어뜨립니다.',
    evaluation_criteria: '메뉴 수, 링크 접근성'
  },
  'N7_2': {
    id: 'N7.2',
    name: '맞춤 설정',
    category: '편의성',
    principle: 'N7: 유연성과 효율성',
    description: '반응형 디자인, 글자 크기 조절 등 사용자 환경에 맞게 조정할 수 있습니다.',
    why_important: '사용자마다 선호와 필요가 다릅니다.',
    evaluation_criteria: '반응형 디자인, 접근성 옵션'
  },
  'N7_3': {
    id: 'N7.3',
    name: '검색/필터',
    category: '편의성',
    principle: 'N7: 유연성과 효율성',
    description: '사이트 내 검색으로 원하는 정보를 빠르게 찾을 수 있습니다.',
    why_important: '대량의 정보를 브라우징만으로 찾기는 비효율적입니다.',
    evaluation_criteria: '검색 기능 존재 여부'
  },
  'N8_1': {
    id: 'N8.1',
    name: '핵심 정보',
    category: '디자인',
    principle: 'N8: 미니멀 디자인',
    description: '불필요한 내용 없이 꼭 필요한 정보만 간결하게 제공합니다.',
    why_important: '과도한 정보는 중요한 것을 가립니다.',
    evaluation_criteria: '문단 수, 정보 밀도'
  },
  'N8_2': {
    id: 'N8.2',
    name: '깔끔한 인터페이스',
    category: '디자인',
    principle: 'N8: 미니멀 디자인',
    description: '여백, 정렬, 이미지 수를 적절히 유지해 시각적 부담을 줄입니다.',
    why_important: '복잡한 인터페이스는 사용자를 압도합니다.',
    evaluation_criteria: '이미지 수, 시각적 복잡도'
  },
  'N8_3': {
    id: 'N8.3',
    name: '시각적 계층',
    category: '디자인',
    principle: 'N8: 미니멀 디자인',
    description: '헤딩 구조로 중요도에 따라 정보를 계층적으로 배치합니다.',
    why_important: '평평한 구조는 무엇이 중요한지 알기 어렵습니다.',
    evaluation_criteria: '헤딩 수, 계층 구조 명확성'
  },
  'N9_2': {
    id: 'N9.2',
    name: '복구 지원',
    category: '디자인',
    principle: 'N9: 오류 인식과 복구',
    description: '오류 발생 시 사용자가 쉽게 이전 상태로 돌아가거나 재시도할 수 있습니다.',
    why_important: '오류에서 벗어날 방법이 없으면 사용자는 포기합니다.',
    evaluation_criteria: '폼 검증, 오류 복구 메커니즘'
  },
  'N9_4': {
    id: 'N9.4',
    name: '오류 안내',
    category: '디자인',
    principle: 'N9: 오류 인식과 복구',
    description: '오류 메시지가 명확하고 해결 방법을 구체적으로 제시합니다.',
    why_important: '모호한 오류 메시지는 사용자를 더 혼란스럽게 합니다.',
    evaluation_criteria: '리스트 구조, 안내 정보의 명확성'
  },
  'N10_1': {
    id: 'N10.1',
    name: '도움말 가시성',
    category: '디자인',
    principle: 'N10: 도움말과 문서',
    description: '도움말, FAQ를 찾기 쉬운 위치에 배치합니다.',
    why_important: '도움이 필요할 때 찾을 수 없으면 의미가 없습니다.',
    evaluation_criteria: '검색 기능, 리스트 구조, 링크 수'
  },
  'N10_2': {
    id: 'N10.2',
    name: '문서화',
    category: '디자인',
    principle: 'N10: 도움말과 문서',
    description: 'FAQ, 가이드 등이 체계적으로 정리되어 있습니다.',
    why_important: '산발적인 정보는 찾고 이해하기 어렵습니다.',
    evaluation_criteria: '리스트 수, 문서 구조화 수준'
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
