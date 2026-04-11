/**
 * 공용 유틸리티 함수 모음
 */

/**
 * 정확도 계산
 * 문자열 비교 또는 숫자 기반 계산 모두 지원
 */
export function calculateAccuracy(correctOrTyped, totalOrOriginal) {
  if (typeof correctOrTyped === 'number' && typeof totalOrOriginal === 'number') {
    if (totalOrOriginal === 0) return 100;
    return Math.round((correctOrTyped / totalOrOriginal) * 100);
  }

  const typed = String(correctOrTyped);
  const original = String(totalOrOriginal);
  const minLength = Math.min(typed.length, original.length);
  let correctCount = 0;

  for (let i = 0; i < minLength; i += 1) {
    if (typed[i] === original[i]) {
      correctCount += 1;
    }
  }

  if (original.length === 0) return 100;
  return Math.round((correctCount / original.length) * 100);
}

/**
 * 타자 속도 (타수/분) 계산
 */
export function calculateCPM(typedCount, elapsedSeconds) {
  if (elapsedSeconds === 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.round(typedCount / minutes);
}

const HANGUL_SYLLABLE_START = 0xac00;
const HANGUL_SYLLABLE_END = 0xd7a3;

const CHOSEONG_STROKES = [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1];
const JUNGSEONG_STROKES = [1, 1, 1, 2, 2, 1, 1, 1, 2, 2, 1, 2, 1, 1, 1, 1, 2, 2, 2, 2, 2];
const JONGSEONG_STROKES = [0, 1, 2, 2, 1, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1];

export function countTypingUnits(text) {
  return [...String(text)].reduce((sum, char) => {
    const code = char.charCodeAt(0);

    if (code < HANGUL_SYLLABLE_START || code > HANGUL_SYLLABLE_END) {
      return sum + 1;
    }

    const syllableIndex = code - HANGUL_SYLLABLE_START;
    const choseongIndex = Math.floor(syllableIndex / 588);
    const jungseongIndex = Math.floor((syllableIndex % 588) / 28);
    const jongseongIndex = syllableIndex % 28;

    return (
      sum +
      CHOSEONG_STROKES[choseongIndex] +
      JUNGSEONG_STROKES[jungseongIndex] +
      JONGSEONG_STROKES[jongseongIndex]
    );
  }, 0);
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
