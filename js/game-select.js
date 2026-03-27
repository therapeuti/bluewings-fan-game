/**
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
