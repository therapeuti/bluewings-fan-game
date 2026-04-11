import { MODES, SENTENCE_ROUND_COUNT, WORD_ROUND_COUNT } from './config.js';
import { loadPracticeContent } from './contentLoader.js';
import { calculateAccuracy, calculateCPM, countTypingUnits, formatTime } from './utils.js';

const content = loadPracticeContent();

const state = {
  modeId: null,
  currentText: '',
  sessionTexts: [],
  completedTexts: [],
  sentenceCompletedCount: 0,
  sentenceTotalCount: 0,
  wordCompletedCount: 0,
  wordTotalCount: 0,
  songTitle: '',
  songSelection: 'random',
  inputValue: '',
  currentIndex: 0,
  startTime: null,
  attemptStartTime: null,
  lastSentenceCpm: 0,
  bestSentenceCpm: 0,
  endTime: null,
  committedTypedChars: 0,
  committedTypedUnits: 0,
  committedTargetChars: 0,
  committedErrorChars: 0,
  errorCount: 0,
  totalTypedChars: 0,
  wordsCompleted: 0,
  timerId: null,
  result: null,
};

const modeListEl = document.getElementById('mode-list');
const playPanelEl = document.getElementById('play-panel');

renderModeList();
renderEmptyState();

function renderModeList() {
  modeListEl.innerHTML = '';

  MODES.forEach((mode) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `mode-card${state.modeId === mode.id ? ' is-active' : ''}`;
    button.innerHTML = `<span class="mode-name">${mode.name}</span>`;
    button.addEventListener('click', () => startMode(mode.id));
    modeListEl.appendChild(button);
  });
}

function renderEmptyState() {
  playPanelEl.innerHTML = `
    <div class="empty-state">
      <div>
        <h2>모드를 선택하면 바로 시작할 수 있습니다.</h2>
        <p class="empty-copy">
          단어 연습, 단문 연습, 응원가 연습을 바로 시작할 수 있습니다.
        </p>
      </div>
    </div>
  `;
}

function startMode(modeId) {
  resetState();
  state.modeId = modeId;
  initializeSessionTexts(modeId);
  renderModeList();
  renderPracticeView();
}

function resetState() {
  clearTimer();
  state.currentText = '';
  state.sessionTexts = [];
  state.completedTexts = [];
  state.sentenceCompletedCount = 0;
  state.sentenceTotalCount = 0;
  state.wordCompletedCount = 0;
  state.wordTotalCount = 0;
  state.songTitle = '';
  state.inputValue = '';
  state.currentIndex = 0;
  state.startTime = null;
  state.attemptStartTime = null;
  state.lastSentenceCpm = 0;
  state.bestSentenceCpm = 0;
  state.endTime = null;
  state.committedTypedChars = 0;
  state.committedTypedUnits = 0;
  state.committedTargetChars = 0;
  state.committedErrorChars = 0;
  state.errorCount = 0;
  state.totalTypedChars = 0;
  state.wordsCompleted = 0;
  state.result = null;
}

function renderPracticeView() {
  const mode = getCurrentMode();
  const isWordMode = mode.id === 'words';
  const isSentenceMode = mode.id === 'sentence';
  const isParagraphMode = mode.id === 'paragraph';
  const statusSidebar = `
    <aside class="play-sidebar">
      ${
        isParagraphMode
          ? `
            <div class="anthem-toolbar anthem-toolbar-sidebar">
              <label class="anthem-select-wrap" for="song-select">
                <span class="anthem-select-label">응원가 선택</span>
                <select id="song-select" class="anthem-select">
                  <option value="random"${state.songSelection === 'random' ? ' selected' : ''}>랜덤 응원가</option>
                  ${content.songs
                    .map(
                      (song) => `
                        <option value="${escapeHtml(song.title)}"${state.songSelection === song.title ? ' selected' : ''}>
                          ${escapeHtml(song.title)}
                        </option>
                      `
                    )
                    .join('')}
                </select>
              </label>
              <button type="button" class="button subtle" id="song-random-button">랜덤으로 바꾸기</button>
            </div>
          `
          : ''
      }
      <div class="status-grid status-grid-sidebar">
        <div class="status-card">
          <span class="status-label">타수/분</span>
          <strong class="status-value">${getLiveCpm()}</strong>
        </div>
        <div class="status-card">
          <span class="status-label">정확도</span>
          <strong class="status-value">${getLiveAccuracy()}%</strong>
        </div>
        <div class="status-card">
          <span class="status-label">경과 시간</span>
          <strong class="status-value">${getTimeLabel()}</strong>
        </div>
        <div class="status-card">
          <span class="status-label">${getProgressLabel()}</span>
          <strong class="status-value">${getProgressValue()}</strong>
        </div>
      </div>
      ${
        isSentenceMode
          ? `
            <div class="status-grid status-grid-sidebar status-grid-secondary">
              <div class="status-card">
                <span class="status-label">이전 문장 타수</span>
                <strong class="status-value" id="last-sentence-cpm">${state.lastSentenceCpm}</strong>
              </div>
              <div class="status-card">
                <span class="status-label">최고 타수</span>
                <strong class="status-value" id="best-sentence-cpm">${state.bestSentenceCpm}</strong>
              </div>
            </div>
          `
          : ''
      }
    </aside>
  `;
  const compactSentenceBlock = isSentenceMode
    ? `
      <section class="sentence-compact-card">
        <div class="sentence-current-line" id="target-text">${renderTargetText()}</div>
        <input
          id="typing-input"
          class="typing-input sentence-inline-input"
          autocomplete="off"
          spellcheck="false"
          placeholder=""
        />
      </section>

      <section class="queue-card queue-card-compact">
        <div class="sentence-queue" id="sentence-queue">${renderSentenceQueue()}</div>
      </section>
    `
    : '';
  const compactWordBlock = isWordMode
    ? `
      <section class="word-compact-card">
        <div class="target-text is-word" id="target-text">${renderTargetText()}</div>
        <input
          id="typing-input"
          class="typing-input word-mode word-inline-input"
          autocomplete="off"
          spellcheck="false"
          placeholder=""
        />
      </section>
    `
    : '';
  const anthemBlock = isParagraphMode
    ? `
      <section class="anthem-card">
        <div class="anthem-flow">
          <div class="anthem-history" id="anthem-history">${renderAnthemHistory()}</div>
          <div class="anthem-current-line" id="target-text">${renderTargetText()}</div>
          <input
            id="typing-input"
            class="typing-input anthem-input"
            autocomplete="off"
            spellcheck="false"
            placeholder=""
          />
          <div class="anthem-upcoming" id="anthem-upcoming">${renderAnthemUpcoming()}</div>
        </div>
      </section>
    `
    : '';

  playPanelEl.innerHTML = `
    <div class="panel-head">
      <div>
        <h2>${mode.name}</h2>
      </div>
      <div class="panel-head-actions">
        <button type="button" class="button primary" id="restart-button">다시 시작</button>
      </div>
    </div>

    <div class="play-layout">
      ${statusSidebar}
      <div class="practice-panel${isSentenceMode ? ' compact-sentence' : ''}${isParagraphMode ? ' anthem-practice' : ''}">
        ${
          isSentenceMode
            ? compactSentenceBlock
            : isWordMode
              ? compactWordBlock
            : isParagraphMode
              ? anthemBlock
              : `
              <section class="target-card">
                <div class="target-text" id="target-text">${renderTargetText()}</div>
              </section>

              <section class="input-card">
                ${
                  `<textarea id="typing-input" class="typing-input" spellcheck="false" placeholder="${mode.inputPlaceholder}"></textarea>`
                }
              </section>
            `
        }

        ${
          isSentenceMode || isWordMode || isParagraphMode
            ? ''
            : `
              <section class="feedback-card">
                <div class="feedback-line">
                  <span class="feedback-badge ${state.errorCount > 0 ? 'error' : 'success'}">
                    ${state.errorCount > 0 ? `오타 ${state.errorCount}개` : '오타 없음'}
                  </span>
                </div>
              </section>
            `
        }
      </div>
    </div>
  `;

  document.getElementById('restart-button').addEventListener('click', () => {
    startMode(state.modeId);
  });

  const inputEl = document.getElementById('typing-input');
  inputEl.value = state.inputValue;
  inputEl.focus();
  inputEl.addEventListener('input', handleInputChange);

  if (isWordMode) {
    inputEl.addEventListener('keydown', handleWordKeydown);
  }

  if (isSentenceMode || isParagraphMode) {
    inputEl.addEventListener('beforeinput', handleLineBeforeInput);
    inputEl.addEventListener('keydown', handleLineKeydown);
  }

  if (isParagraphMode) {
    document.getElementById('song-select').addEventListener('change', handleSongSelectionChange);
    document.getElementById('song-random-button').addEventListener('click', () => {
      restartSongPractice('random');
    });
  }

  refreshPracticeView();
}

function handleInputChange(event) {
  const nextValue = event.target.value;

  if (!state.startTime && nextValue.length > 0) {
    startSession();
  }

  if (state.modeId === 'sentence' && !state.attemptStartTime && nextValue.length > 0) {
    state.attemptStartTime = Date.now();
  }

  state.inputValue = nextValue;
  state.currentIndex = nextValue.length;
  syncLiveMetrics();

  if (state.modeId === 'words') {
    if (normalizeWord(nextValue) === normalizeWord(state.currentText)) {
      completeCurrentWord();
      return;
    }
  }

  if (
    (state.modeId === 'sentence' || state.modeId === 'paragraph') &&
    nextValue.length > state.currentText.length
  ) {
    advanceCurrentLine();
    return;
  }

  refreshPracticeView();
}

function handleWordKeydown(event) {
  if (event.key !== 'Enter') return;

  event.preventDefault();

  if (normalizeWord(state.inputValue) === normalizeWord(state.currentText)) {
    completeCurrentWord();
  }
}

function handleLineBeforeInput(event) {
  if (event.inputType !== 'insertText') return;
  if (event.data !== ' ') return;
  if (state.inputValue.length !== state.currentText.length) return;

  event.preventDefault();
  event.stopPropagation();
  advanceCurrentLine();
}

function handleLineKeydown(event) {
  if (event.key !== 'Enter') return;
  if (state.inputValue.length !== state.currentText.length) return;

  event.preventDefault();
  event.stopPropagation();
  advanceCurrentLine();
}

function startSession() {
  state.startTime = Date.now();
  clearTimer();
  state.timerId = window.setInterval(() => {
    refreshPracticeView();
  }, 1000);
}

function completeCurrentWord() {
  commitCurrentAttempt();
  state.wordCompletedCount += 1;
  state.wordsCompleted += 1;
  state.inputValue = '';
  state.currentIndex = 0;

  if (state.wordCompletedCount >= state.wordTotalCount) {
    finishSession();
    return;
  }

  state.sessionTexts.shift();
  state.currentText = state.sessionTexts[0] || '';
  renderPracticeView();
}

function completeCurrentSentence() {
  const completedSentenceCpm = getLiveCpm();
  commitCurrentAttempt();
  state.sentenceCompletedCount += 1;
  state.inputValue = '';
  state.currentIndex = 0;
  state.attemptStartTime = null;
  state.lastSentenceCpm = completedSentenceCpm;
  state.bestSentenceCpm = Math.max(state.bestSentenceCpm, completedSentenceCpm);

  if (state.sentenceCompletedCount >= state.sentenceTotalCount) {
    finishSession();
    return;
  }

  state.sessionTexts.shift();
  state.currentText = state.sessionTexts[0] || '';
  renderPracticeView();
}

function completeCurrentSongLine() {
  state.committedTargetChars += state.currentText.length;
  commitCurrentAttempt();
  state.completedTexts.push({
    ...state.sessionTexts[0],
    targetText: state.currentText,
    typedText: state.inputValue,
  });
  state.sentenceCompletedCount += 1;
  state.inputValue = '';
  state.currentIndex = 0;

  if (state.sentenceCompletedCount >= state.sentenceTotalCount) {
    finishSession();
    return;
  }

  state.sessionTexts.shift();
  state.currentText = state.sessionTexts[0]?.text || '';
  renderPracticeView();
}

function advanceCurrentLine() {
  if (state.modeId === 'sentence') {
    completeCurrentSentence();
    clearTypingInputSoon();
    return;
  }

  if (state.modeId === 'paragraph') {
    completeCurrentSongLine();
    clearTypingInputSoon();
  }
}

function finishSession() {
  if (!state.startTime) return;

  clearTimer();
  state.endTime = Date.now();

  const { typedChars, errorChars } = getCurrentInputStats();
  const totalTypedChars = state.committedTypedChars + typedChars;
  const totalErrorChars = state.committedErrorChars + errorChars;

  const elapsedSeconds = Math.max(1, Math.round((state.endTime - state.startTime) / 1000));
  const accuracy =
    state.modeId === 'paragraph'
      ? calculateParagraphAccuracy()
      : calculateAccuracy(
          Math.max(totalTypedChars - totalErrorChars, 0),
          Math.max(totalTypedChars, 1)
        );
  const totalTypedUnits = state.committedTypedUnits + countTypingUnits(state.inputValue);
  const cpm = calculateCPM(totalTypedUnits, elapsedSeconds);

  state.result = {
    modeName: getCurrentMode().name,
    cpm,
    accuracy,
    elapsedSeconds,
    errorCount: totalErrorChars,
    wordsCompleted: state.wordsCompleted,
    totalTypedChars,
    songTitle: state.songTitle,
  };

  renderResultsView();
}

function renderResultsView() {
  const { modeName, cpm, accuracy, elapsedSeconds, errorCount, wordsCompleted, totalTypedChars } = state.result;

  playPanelEl.innerHTML = `
    <div class="results-head">
      <h2>결과 리포트</h2>
      <p>${modeName} 플레이가 종료되었습니다.</p>
    </div>

    <div class="results-grid">
      <div class="results-card">
        <span class="results-label">타수/분</span>
        <strong class="results-value">${cpm}</strong>
      </div>
      <div class="results-card">
        <span class="results-label">정확도</span>
        <strong class="results-value">${accuracy}%</strong>
      </div>
      <div class="results-card">
        <span class="results-label">총 시간</span>
        <strong class="results-value">${formatTime(elapsedSeconds)}</strong>
      </div>
      <div class="results-card">
        <span class="results-label">오타 수</span>
        <strong class="results-value">${errorCount}</strong>
      </div>
    </div>

    <div class="results-summary">
      ${state.modeId === 'paragraph' ? `<p>선택한 응원가: ${escapeHtml(state.result.songTitle)}</p>` : ''}
      <p>총 입력 문자 수: ${totalTypedChars}</p>
      ${state.modeId === 'words' ? `<p>완료한 단어 수: ${state.wordCompletedCount}</p>` : ''}
      ${state.modeId === 'sentence' ? `<p>완료한 문장 수: ${state.sentenceCompletedCount}</p>` : ''}
      ${state.modeId === 'paragraph' ? `<p>완료한 줄 수: ${state.sentenceCompletedCount}</p>` : ''}
    </div>

    <div class="results-actions">
      <button type="button" class="button primary" id="retry-button">같은 모드 다시 하기</button>
      <button type="button" class="button subtle" id="mode-select-button">모드 선택으로 돌아가기</button>
    </div>
  `;

  document.getElementById('retry-button').addEventListener('click', () => startMode(state.modeId));
  document.getElementById('mode-select-button').addEventListener('click', () => {
    resetState();
    state.modeId = null;
    renderModeList();
    renderEmptyState();
  });
}

function renderTargetText() {
  return renderComparedText(state.currentText, state.inputValue, { showPending: true });
}

function refreshPracticeView() {
  const targetTextEl = document.getElementById('target-text');
  const liveCpmEl = document.querySelector('.status-grid .status-card:nth-child(1) .status-value');
  const liveAccuracyEl = document.querySelector('.status-grid .status-card:nth-child(2) .status-value');
  const timeEl = document.querySelector('.status-grid .status-card:nth-child(3) .status-value');
  const progressEl = document.querySelector('.status-grid .status-card:nth-child(4) .status-value');
  const progressLabelEl = document.querySelector('.status-grid .status-card:nth-child(4) .status-label');
  const lastSentenceCpmEl = document.getElementById('last-sentence-cpm');
  const bestSentenceCpmEl = document.getElementById('best-sentence-cpm');
  const feedbackBadgeEl = document.querySelector('.feedback-badge');
  const helperTextEl = document.querySelector('.feedback-line .helper-text');
  const sentenceQueueEl = document.getElementById('sentence-queue');
  const anthemHistoryEl = document.getElementById('anthem-history');
  const anthemUpcomingEl = document.getElementById('anthem-upcoming');

  if (targetTextEl) {
    targetTextEl.innerHTML = renderTargetText();
  }

  if (liveCpmEl) {
    liveCpmEl.textContent = String(getLiveCpm());
  }

  if (liveAccuracyEl) {
    liveAccuracyEl.textContent = `${getLiveAccuracy()}%`;
  }

  if (timeEl) {
    timeEl.textContent = getTimeLabel();
  }

  if (progressEl) {
    progressEl.textContent = getProgressValue();
  }

  if (progressLabelEl) {
    progressLabelEl.textContent = getProgressLabel();
  }

  if (lastSentenceCpmEl) {
    lastSentenceCpmEl.textContent = String(state.lastSentenceCpm);
  }

  if (bestSentenceCpmEl) {
    bestSentenceCpmEl.textContent = String(state.bestSentenceCpm);
  }

  if (feedbackBadgeEl) {
    feedbackBadgeEl.className = `feedback-badge ${state.errorCount > 0 ? 'error' : 'success'}`;
    feedbackBadgeEl.textContent = state.errorCount > 0 ? `오타 ${state.errorCount}개` : '오타 없음';
  }

  if (helperTextEl) {
    helperTextEl.textContent =
      state.modeId === 'words'
        ? '정확한 단어 입력 시 자동으로 다음 단어로 넘어갑니다.'
        : state.modeId === 'sentence'
          ? ''
          : '텍스트 전체를 완료하면 자동으로 결과가 표시됩니다.';
  }

  if (sentenceQueueEl) {
    sentenceQueueEl.innerHTML = renderSentenceQueue();
  }

  if (anthemHistoryEl) {
    anthemHistoryEl.innerHTML = renderAnthemHistory();
  }

  if (anthemUpcomingEl) {
    anthemUpcomingEl.innerHTML = renderAnthemUpcoming();
  }
}

function getNextText(modeId) {
  if (modeId === 'words') {
    return sample(content.words);
  }

  if (modeId === 'sentence') {
    return sample(content.sentences);
  }

  return '';
}

function getCurrentMode() {
  return MODES.find((mode) => mode.id === state.modeId);
}

function initializeSessionTexts(modeId) {
  if (modeId === 'words') {
    state.sessionTexts = sampleMany(content.words, WORD_ROUND_COUNT);
    state.wordCompletedCount = 0;
    state.wordTotalCount = state.sessionTexts.length;
    state.currentText = state.sessionTexts[0] || '';
    return;
  }

  if (modeId === 'sentence') {
    state.sessionTexts = sampleMany(content.sentences, SENTENCE_ROUND_COUNT);
    state.sentenceCompletedCount = 0;
    state.sentenceTotalCount = state.sessionTexts.length;
    state.wordCompletedCount = 0;
    state.wordTotalCount = 0;
    state.currentText = state.sessionTexts[0] || '';
    return;
  }

  initializeSongSession();
}

function getLiveCpm() {
  if (state.modeId === 'sentence') {
    if (!state.attemptStartTime) return 0;
    const seconds = Math.max(1, Math.round((Date.now() - state.attemptStartTime) / 1000));
    return calculateCPM(countTypingUnits(state.inputValue), seconds);
  }

  if (!state.startTime) return 0;
  const seconds = Math.max(1, Math.round((Date.now() - state.startTime) / 1000));
  return calculateCPM(state.committedTypedUnits + countTypingUnits(state.inputValue), seconds);
}

function getLiveAccuracy() {
  if (state.modeId === 'paragraph') {
    return calculateParagraphAccuracy();
  }

  const { typedChars, errorChars } = getCurrentInputStats();
  const totalTypedChars = state.committedTypedChars + typedChars;
  const totalErrorChars = state.committedErrorChars + errorChars;

  if (totalTypedChars === 0) return 100;
  return calculateAccuracy(
    Math.max(totalTypedChars - totalErrorChars, 0),
    totalTypedChars
  );
}

function getTimeLabel() {
  if (!state.startTime) return formatTime(0);

  const seconds = Math.max(0, Math.round((Date.now() - state.startTime) / 1000));
  return formatTime(seconds);
}

function getProgressLabel() {
  if (state.modeId === 'words') {
    return '완료 단어 수';
  }

  if (state.modeId === 'sentence') {
    return '완료 문장 수';
  }

  if (state.modeId === 'paragraph') {
    return '완료 줄 수';
  }

  return '오타 수';
}

function getProgressValue() {
  if (state.modeId === 'words') {
    return `${state.wordCompletedCount}/${state.wordTotalCount}`;
  }

  if (state.modeId === 'sentence') {
    return `${state.sentenceCompletedCount}/${state.sentenceTotalCount}`;
  }

  if (state.modeId === 'paragraph') {
    return `${state.sentenceCompletedCount}/${state.sentenceTotalCount}`;
  }

  return String(state.errorCount);
}

function clearTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

function normalizeWord(value) {
  return value.trim();
}

function clearTypingInputSoon() {
  window.setTimeout(() => {
    state.inputValue = '';
    state.currentIndex = 0;
    syncLiveMetrics();

    const inputEl = document.getElementById('typing-input');
    if (inputEl) {
      inputEl.value = '';
    }

    refreshPracticeView();
  }, 0);
}


function sample(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function sampleMany(items, count) {
  const shuffled = [...items].sort(() => Math.random() - 0.5);

  if (shuffled.length >= count) {
    return shuffled.slice(0, count);
  }

  const result = [];
  while (result.length < count) {
    result.push(shuffled[result.length % shuffled.length]);
  }
  return result;
}

function renderSentenceQueue() {
  const upcoming = state.sessionTexts.slice(1, 4);

  if (!upcoming.length) {
    return '';
  }

  return upcoming
    .map(
      (sentence, index) => `
        <div class="queue-item">
          <span class="queue-index">${state.sentenceCompletedCount + index + 2}</span>
          <span class="queue-text">${escapeHtml(sentence)}</span>
        </div>
      `
    )
    .join('');
}

function renderAnthemHistory() {
  if (!state.completedTexts.length) {
    return '';
  }

  return state.completedTexts
    .slice(-1)
    .map(
      (entry) => `
        <div class="anthem-line anthem-line-completed${entry.type === 'title' ? ' anthem-line-title' : ''}">
          ${renderTypedResultText(entry.targetText, entry.typedText)}
        </div>
      `
    )
    .join('');
}

function renderAnthemUpcoming() {
  const upcoming = state.sessionTexts.slice(1, 5);

  if (!upcoming.length) {
    return '';
  }

  return upcoming
    .map(
      (entry) => `
        <div class="anthem-line anthem-line-upcoming${entry.type === 'title' ? ' anthem-line-title' : ''}">
          ${escapeHtml(entry.text)}
        </div>
      `
    )
    .join('');
}

function handleSongSelectionChange(event) {
  restartSongPractice(event.target.value);
}

function initializeSongSession() {
  const song = state.songSelection === 'random'
    ? sample(content.songs)
    : content.songs.find((item) => item.title === state.songSelection) || sample(content.songs);

  state.songSelection = state.songSelection === 'random' ? 'random' : song.title;
  state.songTitle = song.title;
  state.completedTexts = [];
  state.sessionTexts = [...song.entries];
  state.sentenceCompletedCount = 0;
  state.sentenceTotalCount = song.entries.length;
  state.wordCompletedCount = 0;
  state.wordTotalCount = 0;
  state.currentText = state.sessionTexts[0]?.text || '';
}

function restartSongPractice(selection) {
  resetState();
  state.modeId = 'paragraph';
  state.songSelection = selection;
  initializeSongSession();
  renderModeList();
  renderPracticeView();
}

function getCurrentInputStats() {
  const shouldClampToTarget = state.modeId === 'sentence' || state.modeId === 'paragraph';
  const typedChars = shouldClampToTarget
    ? Math.min(state.inputValue.length, state.currentText.length)
    : state.inputValue.length;
  let errorChars = 0;

  for (let index = 0; index < typedChars; index += 1) {
    if (state.inputValue[index] !== state.currentText[index]) {
      errorChars += 1;
    }
  }

  return { typedChars, errorChars };
}

function renderComparedText(target, input, options = {}) {
  const { showPending = false } = options;

  if (!target) return '';

  const spans = [...target].map((char, index) => {
    let className = 'pending';

    if (index < input.length) {
      className = input[index] === char ? 'correct' : 'incorrect';
    } else if (showPending && index === input.length) {
      className = 'current';
    }

    if (!showPending && index >= input.length) {
      className = 'pending';
    }

    return `<span class="char ${className}">${escapeHtml(char)}</span>`;
  });

  if (!showPending && input.length > target.length) {
    spans.push(
      ...[...input.slice(target.length)].map(
        (char) => `<span class="char incorrect">${escapeHtml(char)}</span>`
      )
    );
  }

  return spans.join('');
}

function renderTypedResultText(target, input) {
  if (!input) return '';

  return [...input]
    .map((char, index) => {
      const className = target[index] === char ? 'correct' : 'incorrect';
      return `<span class="char ${className}">${escapeHtml(char)}</span>`;
    })
    .join('');
}

function calculateParagraphAccuracy() {
  if (state.committedTargetChars === 0) {
    return 100;
  }

  return calculateAccuracy(
    Math.max(state.committedTargetChars - state.committedErrorChars, 0),
    state.committedTargetChars
  );
}

function commitCurrentAttempt() {
  const { typedChars, errorChars } = getCurrentInputStats();
  state.committedTypedChars += typedChars;
  state.committedTypedUnits += countTypingUnits(state.inputValue);
  state.committedErrorChars += errorChars;
  syncLiveMetrics();
}

function syncLiveMetrics() {
  const { typedChars, errorChars } = getCurrentInputStats();
  state.totalTypedChars = state.committedTypedChars + typedChars;
  state.errorCount = state.committedErrorChars + errorChars;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
