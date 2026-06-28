import { Injectable } from '@nestjs/common';
import { SM2State, SM2Result } from './sm2.types';

const MIN_EASE_FACTOR = 1.3;
const MIN_INTERVAL = 1;

/**
 * SM-2 (SuperMemo 2) spaced repetition algorithm.
 *
 * Formula:
 *   If quality >= 3 (success):
 *     interval = max(1, interval * easeFactor)
 *     easeFactor = easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
 *   Else (failure):
 *     interval = 1
 *     easeFactor = max(1.3, easeFactor - 0.2)
 *
 * nextReviewAt = now + interval (days), UTC
 */
@Injectable()
export class SM2AlgorithmService {
  calculate(state: SM2State, quality: number): SM2Result {
    if (quality < 0 || quality > 5) {
      throw new Error(`SM-2 quality must be 0–5, received: ${quality}`);
    }

    let { interval, easeFactor, repetitions } = state;

    if (quality >= 3) {
      // Success: advance interval
      interval = Math.max(MIN_INTERVAL, Math.round(interval * easeFactor));
      easeFactor = easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor);
      repetitions += 1;
    } else {
      // Failure: reset interval
      interval = MIN_INTERVAL;
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
      repetitions = 0;
    }

    const nextReviewAt = new Date();
    nextReviewAt.setUTCDate(nextReviewAt.getUTCDate() + interval);
    nextReviewAt.setUTCHours(0, 0, 0, 0);

    return { interval, easeFactor, repetitions, nextReviewAt };
  }
}
