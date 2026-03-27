/**
 * 부족한 파일들을 자동으로 생성하는 스크립트
 * 사용법: node populate-files.js
 */

const fs = require('fs');
const path = require('path');

// 색상 정의
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createFile(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
    log(`✓ ${filePath}`, 'green');
    return true;
  } catch (error) {
    log(`✗ ${filePath} - ${error.message}`, 'red');
    return false;
  }
}

console.log('\n');
log('================================', 'blue');
log('블루윙스 팬 게임 - 파일 자동 생성', 'blue');
log('================================', 'blue');
console.log('');

let successCount = 0;
let totalCount = 0;

// ============================================================
// 1. JS 파일들
// ============================================================

log('📝 JavaScript 파일 생성 중...', 'yellow');

// config.js
const configJS = `/**
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
`;

totalCount++;
if (createFile('js/config.js', configJS)) successCount++;

// utils.js
const utilsJS = `/**
 * 공용 유틸리티 함수 모음
 */

/**
 * 두 문자열을 비교하여 정확도를 반환
 */
export function calculateAccuracy(typed, original) {
  const minLength = Math.min(typed.length, original.length);
  let correctCount = 0;

  for (let i = 0; i < minLength; i++) {
    if (typed[i] === original[i]) {
      correctCount++;
    }
  }

  if (original.length === 0) return 100;
  return Math.round((correctCount / original.length) * 100);
}

/**
 * 타자 속도 (WPM) 계산
 */
export function calculateWPM(correctChars, elapsedSeconds) {
  if (elapsedSeconds === 0) return 0;
  const words = correctChars / 5;
  const minutes = elapsedSeconds / 60;
  return Math.round(words / minutes);
}

/**
 * 점수 계산
 */
export function calculateScore(accuracy, wpm, multiplier = 1) {
  const baseScore = Math.round((accuracy / 100) * 100);
  const speedBonus = Math.max(0, Math.round((wpm - 30) / 10));
  return Math.round((baseScore + speedBonus) * multiplier);
}

/**
 * 시간을 mm:ss 형식으로 포맷
 */
export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return String(minutes).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

/**
 * 배열을 무작위로 섞기
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 배열에서 무작위 요소 선택
 */
export function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * 배열에서 n개의 무작위 요소 선택
 */
export function getRandomElements(array, n) {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, Math.min(n, array.length));
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * 현재 타임스탬프 반환
 */
export function getCurrentTimestamp() {
  return new Date().toISOString();
}
`;

totalCount++;
if (createFile('js/utils.js', utilsJS)) successCount++;

// storage.js
const storageJS = `/**
 * LocalStorage 관리 모듈
 */

import { STORAGE_KEY } from './config.js';

function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    const initialData = {
      gameRecords: [],
      highScores: {
        typing: { easy: 0, medium: 0, hard: 0 },
        fillInBlank: { easy: 0, medium: 0, hard: 0 },
        titleQuiz: { easy: 0, medium: 0, hard: 0 },
      },
      userStats: {
        totalGamesPlayed: 0,
        totalPlayTime: 0,
        lastPlayedDate: null,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  }
}

export function getAllData() {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEY);
  return JSON.parse(data);
}

export function saveGameResult(result) {
  const data = getAllData();
  data.gameRecords.push({
    ...result,
    timestamp: new Date().toISOString(),
  });

  if (data.gameRecords.length > 100) {
    data.gameRecords = data.gameRecords.slice(-100);
  }

  if (result.score > (data.highScores[result.gameType]?.[result.difficulty] || 0)) {
    data.highScores[result.gameType][result.difficulty] = result.score;
  }

  data.userStats.totalGamesPlayed++;
  data.userStats.lastPlayedDate = new Date().toISOString();

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export function getHighScore(gameType, difficulty) {
  const data = getAllData();
  return data.highScores[gameType]?.[difficulty] || 0;
}

export function getGameHighScores(gameType) {
  const data = getAllData();
  return data.highScores[gameType] || { easy: 0, medium: 0, hard: 0 };
}

export function getGameRecords() {
  const data = getAllData();
  return data.gameRecords || [];
}

export function getGameRecordsByType(gameType) {
  const records = getGameRecords();
  return records.filter((record) => record.gameType === gameType);
}

export function getUserStats() {
  const data = getAllData();
  return data.userStats;
}

export function clearAllRecords() {
  if (confirm('정말로 모든 게임 기록을 삭제하시겠습니까?')) {
    localStorage.removeItem(STORAGE_KEY);
    initializeStorage();
    return true;
  }
  return false;
}

export function clearGameRecords(gameType) {
  const data = getAllData();
  data.gameRecords = data.gameRecords.filter((record) => record.gameType !== gameType);
  data.highScores[gameType] = { easy: 0, medium: 0, hard: 0 };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

initializeStorage();
`;

totalCount++;
if (createFile('js/storage.js', storageJS)) successCount++;

// contentLoader.js
const contentLoaderJS = `/**
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
`;

totalCount++;
if (createFile('js/contentLoader.js', contentLoaderJS)) successCount++;

// game-select.js
const gameSelectJS = `/**
 * 난이도 선택 페이지 로직
 */

import { GAME_CONFIG, DIFFICULTY_CONFIG } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  initializeDifficultySelect();
});

function initializeDifficultySelect() {
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get('game');

  if (!gameId) {
    window.location.href = '../index.html';
    return;
  }

  const game = Object.values(GAME_CONFIG).find((g) => g.id === gameId);
  if (game) {
    document.getElementById('game-title').textContent = game.icon + ' ' + game.name;
  }

  renderDifficultyCards(gameId);
}

function renderDifficultyCards(gameId) {
  const container = document.getElementById('difficulty-container');
  container.innerHTML = '';

  Object.values(DIFFICULTY_CONFIG).forEach((difficulty) => {
    const card = createDifficultyCard(gameId, difficulty);
    container.appendChild(card);
  });
}

function createDifficultyCard(gameId, difficulty) {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1 slide-in';

  const colorMap = {
    easy: 'green',
    medium: 'yellow',
    hard: 'red',
  };

  const color = colorMap[difficulty.value];
  const questionCount = difficulty.questionCount[gameId] || 10;
  const timeLimit = difficulty.timeLimit[gameId];
  const timeLimitText = timeLimit > 0 ? timeLimit + '초' : '제한 없음';

  card.innerHTML = '<div class="text-center">' +
    '<div class="text-4xl mb-4">' +
    (difficulty.value === 'easy' ? '✅' : difficulty.value === 'medium' ? '⭐' : '🔥') +
    '</div>' +
    '<h3 class="text-xl font-bold text-gray-800 mb-2">' + difficulty.name + '</h3>' +
    '<div class="text-gray-600 text-sm mb-4 space-y-1">' +
    '<p>📝 ' + questionCount + '개 문제</p>' +
    '<p>⏱️ ' + timeLimitText + '</p>' +
    '<p>💰 ' + difficulty.multiplier + '배 점수</p>' +
    '</div>' +
    '<div class="inline-block bg-' + color + '-100 text-' + color + '-700 px-4 py-2 rounded-full font-bold">' +
    '시작하기' +
    '</div>' +
    '</div>';

  card.addEventListener('click', () => {
    handleDifficultySelect(gameId, difficulty.value);
  });

  return card;
}

function handleDifficultySelect(gameId, difficulty) {
  sessionStorage.setItem('selectedGame', gameId);
  sessionStorage.setItem('selectedDifficulty', difficulty);

  const gamePageMap = {
    typing: '../html/typing-game.html',
    fillInBlank: '../html/blank-game.html',
    titleQuiz: '../html/title-game.html',
  };

  window.location.href = gamePageMap[gameId];
}
`;

totalCount++;
if (createFile('js/game-select.js', gameSelectJS)) successCount++;

// results.js
const resultsJS = `/**
 * 게임 결과 페이지 로직
 */

import { getHighScore } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
  displayResults();
  attachEventListeners();
});

function displayResults() {
  const gameResult = JSON.parse(sessionStorage.getItem('gameResult') || '{}');

  if (!gameResult.score) {
    window.location.href = '../index.html';
    return;
  }

  const score = gameResult.score;
  const eva = getEvaluation(score);

  document.getElementById('evaluation-emoji').textContent = eva.emoji;
  document.getElementById('evaluation-text').textContent = eva.message;
  document.getElementById('final-score').textContent = Math.round(score);

  document.getElementById('accuracy-stat').textContent = gameResult.accuracy + '%';
  document.getElementById('wpm-stat').textContent = (gameResult.wpm || 0) + ' WPM';
  document.getElementById('time-stat').textContent = formatTime(gameResult.elapsedTime || 0);
  document.getElementById('difficulty-stat').textContent = getDifficultyName(gameResult.difficulty);

  if (gameResult.totalQuestions) {
    document.getElementById('additional-stats').classList.remove('hidden');
    document.getElementById('total-questions').textContent = gameResult.totalQuestions;
    document.getElementById('correct-answers').textContent = gameResult.correctAnswers;
    document.getElementById('wrong-answers').textContent = gameResult.wrongAnswers || 0;
    document.getElementById('avg-response-time').textContent = (gameResult.averageResponseTime || 0) + '초';
  }

  const previousScore = getHighScore(gameResult.gameType, gameResult.difficulty);
  if (score > previousScore) {
    document.getElementById('new-record-badge').classList.remove('hidden');
  }

  if (previousScore > 0) {
    document.getElementById('comparison-section').classList.remove('hidden');
    document.getElementById('previous-score').textContent = Math.round(previousScore);

    const improvement = Math.round(((score - previousScore) / previousScore) * 100);
    const improvementEl = document.getElementById('improvement');
    improvementEl.textContent = (improvement >= 0 ? '+' : '') + improvement + '%';
  }

  updateFeedbackMessage(gameResult);
  updateTips(gameResult);
}

function getEvaluation(score) {
  if (score >= 90) {
    return { emoji: '🌟', message: '훌륭해요! 완벽한 점수!' };
  } else if (score >= 80) {
    return { emoji: '👍', message: '잘했어요! 대단합니다!' };
  } else if (score >= 70) {
    return { emoji: '😊', message: '괜찮아요! 계속 연습하세요!' };
  } else if (score >= 60) {
    return { emoji: '💪', message: '조금 더 노력하세요!' };
  } else {
    return { emoji: '🎯', message: '다시 한번 도전해보세요!' };
  }
}

function updateFeedbackMessage(result) {
  const feedbackEl = document.getElementById('feedback-message');
  let message = '';

  if (result.score >= 90) {
    message = '완벽한 성과입니다! 응원가 마스터가 되고 있네요! 🎉';
  } else if (result.score >= 80) {
    message = '훌륭한 성과입니다! 조금 더 노력하면 더 좋은 결과를 얻을 수 있습니다. 💙';
  } else if (result.score >= 70) {
    message = '좋은 시작입니다! 더 높은 난이도에 도전해보세요! ⚡';
  } else {
    message = '더 많은 응원가를 학습하고 다시 도전해보세요! 화이팅! 💪';
  }

  feedbackEl.textContent = message;
}

function updateTips(result) {
  const tips = [];

  if (result.score < 80) {
    tips.push('✓ 더 높은 난이도에 차근차근 도전해보세요.');
  }

  if (result.accuracy < 80) {
    tips.push('✓ 정확도를 높이기 위해 천천히 신중하게 입력하세요.');
  }

  if (result.wpm && result.wpm < 40) {
    tips.push('✓ 타자 속도를 높이기 위해 정기적으로 연습하세요.');
  }

  if (tips.length === 0) {
    tips.push('✓ 다른 게임도 도전해보세요!');
    tips.push('✓ 친구들과 점수를 비교해보세요!');
    tips.push('✓ 계속 연습하면 더 좋은 결과를 얻을 수 있습니다!');
  }

  document.getElementById('tip-1').textContent = tips[0] || '';
  document.getElementById('tip-2').textContent = tips[1] || '';
  document.getElementById('tip-3').textContent = tips[2] || '';
}

function attachEventListeners() {
  document.getElementById('replay-btn').addEventListener('click', () => {
    const gameId = sessionStorage.getItem('selectedGame');
    const difficulty = sessionStorage.getItem('selectedDifficulty');
    const gamePageMap = {
      typing: '../html/typing-game.html',
      fillInBlank: '../html/blank-game.html',
      titleQuiz: '../html/title-game.html',
    };
    window.location.href = gamePageMap[gameId];
  });

  document.getElementById('other-game-btn').addEventListener('click', () => {
    window.location.href = '../html/game-select.html';
  });

  document.getElementById('home-btn').addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = '../index.html';
  });
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins + ':' + String(secs).padStart(2, '0');
}

function getDifficultyName(difficulty) {
  const map = {
    easy: '🟢 쉬움',
    medium: '🟡 보통',
    hard: '🔴 어려움',
  };
  return map[difficulty] || difficulty;
}
`;

totalCount++;
if (createFile('js/results.js', resultsJS)) successCount++;

// main.js
const mainJS = `/**
 * 메인 페이지 로직
 */

import { GAME_CONFIG } from './config.js';
import { getGameHighScores, getAllData } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  console.log('🎮 수원삼성블루윙즈 팬 게임 초기화');

  renderGameCards();
  updateStatistics();

  const resetBtn = document.getElementById('reset-records-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', handleResetRecords);
  }
}

function renderGameCards() {
  const cardsContainer = document.getElementById('games-container');
  if (!cardsContainer) return;

  cardsContainer.innerHTML = '';

  Object.values(GAME_CONFIG).forEach((game) => {
    const highScores = getGameHighScores(game.id);
    const maxScore = Math.max(
      highScores.easy || 0,
      highScores.medium || 0,
      highScores.hard || 0
    );

    const card = createGameCard(game, maxScore);
    cardsContainer.appendChild(card);
  });
}

function createGameCard(game, maxScore) {
  const card = document.createElement('div');
  card.className = 'game-card slide-in';
  card.innerHTML = '<div class="game-card-content">' +
    '<div class="game-icon">' + game.icon + '</div>' +
    '<h3 class="game-title">' + game.name + '</h3>' +
    '<p class="game-description">' + game.description + '</p>' +
    '<div class="game-score">최고 점수: <span class="text-bluewings-primary font-bold">' + maxScore + '</span></div>' +
    '<button class="play-btn" data-game-id="' + game.id + '">' +
    '▶️ 플레이' +
    '</button>' +
    '</div>';

  card.querySelector('.play-btn').addEventListener('click', () => {
    handleGameSelect(game.id);
  });

  return card;
}

function handleGameSelect(gameId) {
  console.log('게임 선택: ' + gameId);
  sessionStorage.setItem('selectedGame', gameId);
  window.location.href = 'html/game-select.html?game=' + gameId;
}

function updateStatistics() {
  const data = getAllData();
  const stats = data.userStats;

  const totalGamesEl = document.getElementById('stats-total-games');
  if (totalGamesEl) {
    totalGamesEl.querySelector('div:first-child').textContent = stats.totalGamesPlayed;
  }

  const playTimeEl = document.getElementById('stats-play-time');
  if (playTimeEl) {
    const minutes = Math.floor(stats.totalPlayTime / 60);
    playTimeEl.querySelector('div:first-child').textContent = minutes + '분';
  }

  const lastPlayedEl = document.getElementById('stats-last-played');
  if (lastPlayedEl) {
    if (stats.lastPlayedDate) {
      const date = new Date(stats.lastPlayedDate);
      const dateStr = date.toLocaleDateString('ko-KR');
      lastPlayedEl.querySelector('div:first-child').textContent = dateStr;
    } else {
      lastPlayedEl.querySelector('div:first-child').textContent = '아직 없음';
    }
  }
}

async function handleResetRecords() {
  const { clearAllRecords } = await import('./storage.js');
  if (clearAllRecords()) {
    renderGameCards();
    updateStatistics();
    alert('모든 게임 기록이 삭제되었습니다.');
  }
}
`;

totalCount++;
if (createFile('js/main.js', mainJS)) successCount++;

// ============================================================
// 2. 게임 로직 파일들
// ============================================================

log('🎮 게임 로직 파일 생성 중...', 'yellow');

const typingGameStub = `/**
 * 타자 연습 게임 로직
 * 이전 메시지의 typing.js 코드를 여기에 붙여넣으세요
 */

console.log('Typing game module loaded');
`;

totalCount++;
if (createFile('js/games/typing.js', typingGameStub)) successCount++;

const fillInBlankStub = `/**
 * 응원가 블랭크 맞히기 게임 로직
 * 이전 메시지의 fillInBlank.js 코드를 여기에 붙여넣으세요
 */

console.log('Fill in blank game module loaded');
`;

totalCount++;
if (createFile('js/games/fillInBlank.js', fillInBlankStub)) successCount++;

const titleQuizStub = `/**
 * 응원가 제목 맞히기 게임 로직
 * 이전 메시지의 titleQuiz.js 코드를 여기에 붙여넣으세요
 */

console.log('Title quiz game module loaded');
`;

totalCount++;
if (createFile('js/games/titleQuiz.js', titleQuizStub)) successCount++;

// ============================================================
// 3. JSON 파일들
// ============================================================

log('📊 JSON 데이터 파일 생성 중...', 'yellow');

const blankQuestionsJSON = JSON.stringify({
  "questions": [
    {
      "id": "blank_001",
      "question": "나의 사랑 나의 ___",
      "blank_word": "수원",
      "options": ["수원", "블루윙", "승리", "친구"],
      "source_song": "나의 사랑 나의 수원",
      "difficulty": "easy"
    }
  ]
}, null, 2);

totalCount++;
if (createFile('data/blank-questions.json', blankQuestionsJSON)) successCount++;

const titleQuestionsJSON = JSON.stringify({
  "questions": [
    {
      "id": "title_001",
      "lyric_snippet": "오오오 오오 오오오오오~",
      "correct_title": "나의 사랑 나의 수원",
      "options": [
        "나의 사랑 나의 수원",
        "개선행진곡",
        "우리는 수원",
        "Blue-La-Di, Blue-La-Da"
      ],
      "difficulty": "easy"
    }
  ]
}, null, 2);

totalCount++;
if (createFile('data/title-questions.json', titleQuestionsJSON)) successCount++;

// ============================================================
// 완료
// ============================================================

console.log('');
log('================================', 'blue');
log(`✓ 파일 생성 완료! (${successCount}/${totalCount})`, 'green');
log('================================', 'blue');
console.log('');

if (successCount === totalCount) {
  log('✅ 모든 파일이 성공적으로 생성되었습니다!', 'green');
  log('다음 단계:', 'yellow');
  log('1. 다음 파일들의 코드를 업데이트하세요:', 'yellow');
  log('   - js/games/typing.js', 'yellow');
  log('   - js/games/fillInBlank.js', 'yellow');
  log('   - js/games/titleQuiz.js', 'yellow');
  log('2. npm run dev 실행하세요', 'yellow');
} else {
  log(`⚠️  ${totalCount - successCount}개의 파일 생성에 실패했습니다.`, 'red');
}

console.log('');
