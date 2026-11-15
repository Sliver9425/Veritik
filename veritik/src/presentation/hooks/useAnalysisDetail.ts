import { useEffect, useState } from 'react';
import type { AnalysisResult } from '../../domain';
import { container } from '../composition';
import { errorMessage } from '../content/labels';

interface State {
  result: AnalysisResult | null;
  error: string | null;
  loading: boolean;
}

/** Carga un análisis guardado por id (los parámetros de navegación solo llevan el id, que es serializable). */
export function useAnalysisDetail(analysisId: string): State {
  const [state, setState] = useState<State>({ result: null, error: null, loading: true });

  useEffect(() => {
    let active = true;
    container.getAnalysisDetail
      .execute(analysisId)
      .then((result) => {
        if (active) setState({ result, error: null, loading: false });
      })
      .catch((e: unknown) => {
        if (active) setState({ result: null, error: errorMessage(e), loading: false });
      });
    return () => {
      active = false;
    };
  }, [analysisId]);

  return state;
}
