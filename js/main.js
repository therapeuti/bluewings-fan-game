/**
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
