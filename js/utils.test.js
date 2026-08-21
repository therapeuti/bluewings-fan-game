import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculateAccuracy, calculateCPM, countTypingUnits } from './utils.js';

describe('typing metrics', () => {
  it('counts Korean keyboard strokes', () => {
    assert.equal(countTypingUnits('가'), 2);
    assert.equal(countTypingUnits('각'), 3);
    assert.equal(countTypingUnits('과'), 3);
  });

  it('calculates accuracy and CPM safely', () => {
    assert.equal(calculateAccuracy(8, 10), 80);
    assert.equal(calculateAccuracy(0, 0), 100);
    assert.equal(calculateCPM(150, 30), 300);
  });
});
