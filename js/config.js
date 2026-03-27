/**
 * 게임 설정 상수
 */

export const GAME_CONFIG = {
  TYPING: {
    name: '타자 연습',
    icon: '⌨️',
    description: '응원가와 선수 이름을 정확하게 타이핑하세요',
    id: 'typing',
  },
  FILL_IN_BLANK: {
    name: '응원가 블랭크 맞히기',
    icon: '✏️',
    description: '응원가의 빈 자리를 채우세요',
    id: 'fillInBlank',
  },
  TITLE_QUIZ: {
    name: '응원가 제목 맞히기',
    icon: '🎵',
    description: '응원가 구절로 제목을 맞히세요',
    id: 'titleQuiz',
  },
};

export const DIFFICULTY_CONFIG = {
  EASY: {
    name: '쉬움',
    value: 'easy',
    questionCount: { typing: 5, fillInBlank: 10, titleQuiz: 10 },
    timeLimit: { typing: 0, fillInBlank: 0, titleQuiz: 0 },
    multiplier: 1,
  },
  MEDIUM: {
    name: '보통',
    value: 'medium',
    questionCount: { typing: 10, fillInBlank: 15, titleQuiz: 15 },
    timeLimit: { typing: 180, fillInBlank: 120, titleQuiz: 120 },
    multiplier: 1.5,
  },
  HARD: {
    name: '어려움',
    value: 'hard',
    questionCount: { typing: 15, fillInBlank: 20, titleQuiz: 20 },
    timeLimit: { typing: 120, fillInBlank: 90, titleQuiz: 90 },
    multiplier: 2,
  },
};

export const STORAGE_KEY = 'bluewings_games';

export const SCORING = {
  BASE_POINTS: 10,
  SPEED_BONUS: 5,
  PERFECT_BONUS: 20,
  TIME_MULTIPLIER: 1.2,
};
