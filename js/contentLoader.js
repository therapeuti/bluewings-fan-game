/**
 * 콘텐츠 로더 모듈
 */

export async function loadContent(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error('Failed to load ' + filePath);
    }
    return await response.json();
  } catch (error) {
    console.error('Content loading error:', error);
    return null;
  }
}

export async function loadAllContent() {
  const [songs, players, staff, typing, blanks, titles] = await Promise.all([
    loadContent('./data/songs.json'),
    loadContent('./data/players.json'),
    loadContent('./data/staff.json'),
    loadContent('./data/typing-questions.json'),
    loadContent('./data/blank-questions.json'),
    loadContent('./data/title-questions.json'),
  ]);

  return {
    songs: songs?.songs || [],
    players: players?.players || [],
    staff: staff?.staff || [],
    typingQuestions: typing?.questions || [],
    blankQuestions: blanks?.questions || [],
    titleQuestions: titles?.questions || [],
  };
}

export function getQuestionsByDifficulty(questions, difficulty, count) {
  const filtered = questions.filter((q) => q.difficulty === difficulty);
  return filtered.slice(0, count);
}

class ContentCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value) {
    this.cache.set(key, value);
  }

  get(key) {
    return this.cache.get(key);
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }
}

export const contentCache = new ContentCache();
