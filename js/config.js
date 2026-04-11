export const MODES = [
  {
    id: 'words',
    name: '단어 연습',
    description: '20개 단어를 순서대로 입력합니다.',
    targetLabel: '현재 단어',
    inputPlaceholder: '단어를 입력하고 Enter를 누르거나 정확히 입력하세요',
    timeLimit: null,
    completionType: 'count',
  },
  {
    id: 'sentence',
    name: '단문 연습',
    description: '짧은 문장을 하나 정확하게 끝까지 입력합니다.',
    targetLabel: '연습 문장',
    inputPlaceholder: '문장을 그대로 입력하세요',
    timeLimit: null,
    completionType: 'complete',
  },
  {
    id: 'paragraph',
    name: '응원가 연습',
    description: '응원가 제목과 가사를 한 줄씩 순서대로 입력합니다.',
    targetLabel: '응원가',
    inputPlaceholder: '현재 줄을 그대로 입력하세요',
    timeLimit: null,
    completionType: 'complete',
  },
];

export const WORD_ROUND_COUNT = 20;
export const SENTENCE_ROUND_COUNT = 20;
