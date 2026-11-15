import { useEffect, useState } from 'react';
import type { ComparisonResult } from '../../application';
import { container } from '../composition';
import { errorMessage } from '../content/labels';

interface State {
  data: ComparisonResult | null;
  error: string | null;
  loading: boolean;
}

const IDLE: State = { data: null, error: null, loading: false };

/** Compara dos análisis guardados cuando ya hay dos elegidos. */
export function useComparison(firstId: string | null, secondId: string | null): State {
  const [state, setState] = useState<State>(IDLE);

  useEffect(() => {
    if (firstId === null || secondId === null) {
      setState(IDLE);
      return undefined;
    }
    let active = true;
    setState({ data: null, error: null, loading: true });
    container.compareAnalyses
      .execute({ firstId, secondId })
      .then((data) => {
        if (active) setState({ data, error: null, loading: false });
      })
      .catch((e: unknown) => {
        if (active) setState({ data: null, error: errorMessage(e), loading: false });
      });
    return () => {
      active = false;
    };
  }, [firstId, secondId]);

  return state;
}
