const STORAGE_KEY = 'bluewings-typing-records-v1';

const emptyRecord = () => ({ bestCpm: 0, bestAccuracy: 0, sessionCount: 0, recent: [] });

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

export function getModeRecord(modeId) {
  return { ...emptyRecord(), ...(loadRecords()[modeId] || {}) };
}

export function saveSessionResult(modeId, result) {
  const records = loadRecords();
  const previous = getModeRecord(modeId);
  const next = {
    bestCpm: Math.max(previous.bestCpm, result.cpm),
    bestAccuracy: Math.max(previous.bestAccuracy, result.accuracy),
    sessionCount: previous.sessionCount + 1,
    recent: [
      { cpm: result.cpm, accuracy: result.accuracy, elapsedSeconds: result.elapsedSeconds, playedAt: new Date().toISOString() },
      ...previous.recent,
    ].slice(0, 10),
  };
  records[modeId] = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // 저장 공간이 차단된 환경에서도 결과 화면은 정상적으로 표시한다.
  }

  return {
    ...next,
    previousBestCpm: previous.bestCpm,
    isPersonalBest: result.cpm > previous.bestCpm,
  };
}
