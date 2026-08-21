import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildSessionResult } from './sessionStats.js';

describe('buildSessionResult', () => {
  it('counts the committed final attempt only once', () => {
    const result = buildSessionResult({
      modeId: 'words',
      modeName: '단어 연습',
      elapsedSeconds: 60,
      committedTypedChars: 10,
      committedTypedUnits: 20,
      committedTargetChars: 0,
      committedErrorChars: 2,
      wordsCompleted: 2,
      songTitle: '',
    });

    assert.equal(result.cpm, 20);
    assert.equal(result.totalTypedChars, 10);
    assert.equal(result.errorCount, 2);
    assert.equal(result.accuracy, 80);
  });

  it('uses target length for song accuracy', () => {
    const result = buildSessionResult({
      modeId: 'paragraph',
      modeName: '응원가 연습',
      elapsedSeconds: 30,
      committedTypedChars: 8,
      committedTypedUnits: 16,
      committedTargetChars: 10,
      committedErrorChars: 1,
      wordsCompleted: 0,
      songTitle: '테스트',
    });

    assert.equal(result.accuracy, 90);
    assert.equal(result.cpm, 32);
  });
});
