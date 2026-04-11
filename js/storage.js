/**
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
  data.userStats.totalPlayTime += result.elapsedTime || 0;
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
