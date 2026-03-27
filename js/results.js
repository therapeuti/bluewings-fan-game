/**
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
