export type EnvelopeStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
export type EnvelopeAction = 'flap' | 'paper'

// Only the flap opens/closes the envelope; only the paper changes its folds.
export function nextEnvelopeStep(step: EnvelopeStep, action: EnvelopeAction): EnvelopeStep {
  if (action === 'flap') return step === 0 ? 1 : step === 7 ? 0 : step
  return step >= 1 && step <= 6 ? (step + 1) as EnvelopeStep : step
}
