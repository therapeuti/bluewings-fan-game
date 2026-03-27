/**
 * 타자 연습 게임 로직
 */

import { DIFFICULTY_CONFIG } from '../config.js';
import { loadAllContent, getQuestionsByDifficulty } from '../contentLoader.js';
import {
  calculateAccuracy,
  calculateWPM,
  calculateScore,
  formatTime,
  shuffleArray,
} from '../utils.js';
import { saveGameResult } from '../storage.js';

class TypingGame {
  constructor() {
    this.difficulty = sessionStorage.getItem('selectedDifficulty') || 'medium';
    this.gameType = 'typing';
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.startTime = null;
    this.endTime = null;
    this.score = 0;
    this.results = [];
    this.isGameActive = false;
    this.gameContent = null;

    // DOM 요소
    this.elements = {
      targetText: document.getElementById('target-text'),
      inputField: document.getElementById('input-field'),
      progressText: document.getElementById('progress-text'),
      wpmText: document.getElementById('wpm-text'),
      accuracyText: document.getElementById('accuracy-text'),
      timeText: document.getElementById('time-text'),
      progressBar: document.getElementById('progress-bar'),
      comparisonResult: document.getElementById('comparison-result'),
      skipBtn: document.getElementById('skip-btn'),
      submitBtn: document.getElementById('submit-btn'),
      quitBtn: document.getElementById('quit-btn'),
    };

    this.init();
  }

  async init() {
    try {
      // 콘텐츠 로드
      this.gameContent = await loadAllContent();

      // 게임 문제 수집
      this.collectQuestions();

      // 이벤트 리스너 설정
      this.attachEventListeners();

      // 게임 시작
      this.startGame();
    } catch (error) {
      console.error('게임 초기화 실패:', error);
      alert('게임을 시작할 수 없습니다. 페이지를 새로고침해주세요.');
    }
  }

  collectQuestions() {
    const questions = [];

    // 응원가 문제
    if (this.gameContent.typingQuestions) {
      questions.push(...this.gameContent.typingQuestions);
    }

    // 선수 이름 문제 추가
    if (this.gameContent.players) {
      this.gameContent.players.forEach((player) => {
        questions.push({
          id: `player_${player.id}`,
          content: player.name,
          source: `선수: ${player.position}`,
          difficulty: this.getRandomDifficulty(),
          category: 'player',
        });
      });
    }

    // 코칭 스태프 이름 문제 추가
    if (this.gameContent.staff) {
      this.gameContent.staff.forEach((staff) => {
        questions.push({
          id: `staff_${staff.id}`,
          content: staff.name,
          source: `코칭스태프: ${staff.position}`,
          difficulty: this.getRandomDifficulty(),
          category: 'staff',
        });
      });
    }

    // 난이도별로 필터링
    const difficultyConfig = DIFFICULTY_CONFIG[this.difficulty.toUpperCase()];
    const questionCount = difficultyConfig.questionCount.typing;

    const filteredQuestions = questions.filter((q) => q.difficulty === this.difficulty);

    // 불충분하면 다른 난이도도 포함
    if (filteredQuestions.length < questionCount) {
      this.questions = shuffleArray(questions).slice(0, questionCount);
    } else {
      this.questions = shuffleArray(filteredQuestions).slice(0, questionCount);
    }

    console.log(`총 ${this.questions.length}개 문제 로드됨`);
  }

  getRandomDifficulty() {
    const difficulties = ['easy', 'medium', 'hard'];
    return difficulties[Math.floor(Math.random() * difficulties.length)];
  }

  attachEventListeners() {
    this.elements.inputField.addEventListener('input', (e) => this.handleInput(e));
    this.elements.inputField.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.elements.submitBtn.addEventListener('click', () => this.nextQuestion());
    this.elements.skipBtn.addEventListener('click', () => this.skipQuestion());
    this.elements.quitBtn.addEventListener('click', () => this.quitGame());
  }

  startGame() {
    this.isGameActive = true;
    this.startTime = Date.now();
    this.updateDisplay();
    this.showQuestion();

    // 1초마다 UI 업데이트
    this.updateInterval = setInterval(() => this.updateDisplay(), 1000);

    // 입력 필드 포커스
    this.elements.inputField.focus();
  }

  showQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) {
      this.endGame();
      return;
    }

    const question = this.questions[this.currentQuestionIndex];
    this.elements.targetText.textContent = question.content;
    this.elements.inputField.value = '';
    this.elements.comparisonResult.classList.add('hidden');
    this.elements.inputField.focus();

    this.updateProgress();
  }

  handleInput(e) {
    const typed = e.target.value;
    const original = this.questions[this.currentQuestionIndex].content;

    // 비교 결과 표시
    this.displayComparison(typed, original);

    // 실시간 통계 업데이트
    this.updateStats(typed, original);
  }

  handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.nextQuestion();
    }
  }

  displayComparison(typed, original) {
    const resultDiv = this.elements.comparisonResult;
    resultDiv.innerHTML = '';

    const maxLength = Math.max(typed.length, original.length);

    for (let i = 0; i < maxLength; i++) {
      const span = document.createElement('span');
      span.className = 'typing-char';

      if (i < original.length && i < typed.length) {
        if (typed[i] === original[i]) {
          span.classList.add('correct');
          span.textContent = typed[i];
        } else {
          span.classList.add('incorrect');
          span.textContent = typed[i];
        }
      } else if (i < typed.length) {
        span.classList.add('extra');
        span.textContent = typed[i];
      } else {
        span.classList.add('pending');
        span.textContent = original[i];
      }

      resultDiv.appendChild(span);
    }

    resultDiv.classList.remove('hidden');
  }

  updateStats(typed, original) {
    const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const accuracy = calculateAccuracy(typed, original);
    const wpm = calculateWPM(typed.length, elapsedSeconds);

    this.elements.accuracyText.textContent = `${accuracy}%`;
    this.elements.wpmText.textContent = `${wpm} WPM`;
  }

  updateDisplay() {
    const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    this.elements.timeText.textContent = formatTime(elapsedSeconds);
  }

  updateProgress() {
    const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
    this.elements.progressText.textContent = `${this.currentQuestionIndex + 1}/${this.questions.length}`;
    this.elements.progressBar.style.width = `${progress}%`;
  }

  nextQuestion() {
    const typed = this.elements.inputField.value;
    const original = this.questions[this.currentQuestionIndex].content;
    const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);

    // 결과 저장
    const accuracy = calculateAccuracy(typed, original);
    const wpm = calculateWPM(typed.length, elapsedSeconds);
    const questionScore = calculateScore(accuracy, wpm, 1);

    this.results.push({
      question: original,
      typed,
      accuracy,
      wpm,
      score: questionScore,
    });

    this.score += questionScore;
    this.currentQuestionIndex++;
    this.showQuestion();
  }

  skipQuestion() {
    // 0점으로 처리
    this.results.push({
      question: this.questions[this.currentQuestionIndex].content,
      typed: '',
      accuracy: 0,
      wpm: 0,
      score: 0,
    });

    this.currentQuestionIndex++;
    this.showQuestion();
  }

  endGame() {
    this.isGameActive = false;
    clearInterval(this.updateInterval);
    this.endTime = Date.now();

    const elapsedSeconds = Math.floor((this.endTime - this.startTime) / 1000);
    const totalAccuracy = Math.round(
      (this.results.reduce((sum, r) => sum + r.accuracy, 0) / this.results.length) || 0
    );
    const averageWpm = Math.round(
      this.results.reduce((sum, r) => sum + r.wpm, 0) / this.results.length || 0
    );

    // 난이도 배수 적용
    const difficultyConfig = DIFFICULTY_CONFIG[this.difficulty.toUpperCase()];
    const finalScore = Math.round(this.score * difficultyConfig.multiplier);

    // 결과 저장
    const gameResult = {
      gameType: this.gameType,
      difficulty: this.difficulty,
      score: finalScore,
      accuracy: totalAccuracy,
      wpm: averageWpm,
      elapsedTime: elapsedSeconds,
      totalQuestions: this.questions.length,
      correctAnswers: this.results.filter((r) => r.accuracy === 100).length,
    };

    saveGameResult(gameResult);
    sessionStorage.setItem('gameResult', JSON.stringify(gameResult));

    // 결과 페이지로 이동
    window.location.href = '../html/results.html';
  }

  quitGame() {
    if (confirm('게임을 포기하시겠습니까?\n기록이 저장되지 않습니다.')) {
      window.location.href = '../index.html';
    }
  }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
  new TypingGame();
});
