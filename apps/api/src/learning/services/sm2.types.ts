export interface SM2State {
  /** Current interval in days */
  interval: number;
  /** Ease factor (min 1.3) */
  easeFactor: number;
  /** Number of consecutive successful repetitions */
  repetitions: number;
}

export interface SM2Result {
  /** New interval in days */
  interval: number;
  /** New ease factor */
  easeFactor: number;
  /** New repetitions count */
  repetitions: number;
  /** UTC timestamp for next review */
  nextReviewAt: Date;
}
