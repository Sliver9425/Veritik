import { describe, expect, it } from 'vitest';
import { AnalysisResult, Signal, compareAnalyses } from '../index';
import { makeProfile } from '../../application/__tests__/helpers';

function analysis(id: string, scores: Partial<Record<Parameters<typeof Signal.create>[0]['id'], number | null>>): AnalysisResult {
  const signals = Object.entries(scores).map(([key, score]) =>
    score === null || score === undefined
      ? Signal.unavailable(key as 'engagement')
      : Signal.create({ id: key as 'engagement', score }),
  );
  return AnalysisResult.create({ id, profile: makeProfile('demo.uno'), signals, analyzedAt: new Date() });
}

describe('compareAnalyses', () => {
  it('elige la cuenta con mejores señales', () => {
    const a = analysis('a', { engagement: 90, viewsToFollowers: 80 });
    const b = analysis('b', { engagement: 30, viewsToFollowers: 40 });
    const c = compareAnalyses(a, b);
    expect(c.verdict).toBe('first');
    expect(c.signals.find((s) => s.id === 'engagement')?.verdict).toBe('first');
    expect(compareAnalyses(b, a).verdict).toBe('second');
  });

  it('considera empate si la diferencia es menor al margen', () => {
    const c = compareAnalyses(analysis('a', { engagement: 80 }), analysis('b', { engagement: 77 }));
    expect(c.verdict).toBe('tie');
    expect(c.signals.find((s) => s.id === 'engagement')?.verdict).toBe('tie');
  });

  it('compara solo las señales disponibles en ambas (no favorece a quien tiene menos datos)', () => {
    // A tiene una señal extra muy buena que B no tiene: no debe inflar su ventaja.
    const a = analysis('a', { engagement: 60, commentQuality: 100 });
    const b = analysis('b', { engagement: 60, commentQuality: null });
    const c = compareAnalyses(a, b);
    expect(c.commonSignalCount).toBe(1);
    expect(c.commonFirstScore).toBe(60);
    expect(c.commonSecondScore).toBe(60);
    expect(c.verdict).toBe('tie');
    expect(c.signals.find((s) => s.id === 'commentQuality')?.verdict).toBe('unknown');
  });

  it('devuelve "unknown" si no tienen ninguna señal en común', () => {
    const c = compareAnalyses(analysis('a', { engagement: 90 }), analysis('b', { followRatio: 20 }));
    expect(c.commonSignalCount).toBe(0);
    expect(c.commonFirstScore).toBe(null);
    expect(c.verdict).toBe('unknown');
  });
});
