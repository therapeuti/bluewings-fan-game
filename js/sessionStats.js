import { calculateAccuracy, calculateCPM } from './utils.js';

export function buildSessionResult({
  modeId,
  modeName,
  elapsedSeconds,
  committedTypedChars,
  committedTypedUnits,
  committedTargetChars,
  committedErrorChars,
  wordsCompleted,
  songTitle,
}) {
  const accuracyDenominator = modeId === 'paragraph' ? committedTargetChars : committedTypedChars;
  const accuracy = calculateAccuracy(
    Math.max(accuracyDenominator - committedErrorChars, 0),
    Math.max(accuracyDenominator, 1)
  );

  return {
    modeName,
    cpm: calculateCPM(committedTypedUnits, elapsedSeconds),
    accuracy,
    elapsedSeconds,
    errorCount: committedErrorChars,
    wordsCompleted,
    totalTypedChars: committedTypedChars,
    songTitle,
  };
}
