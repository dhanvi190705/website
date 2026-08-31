import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Run an async loader on mount and expose {data, error, loading, reload}.
 * Guards against setting state after unmount so navigating between tabs
 * mid-request never warns.
 */
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(loader)
      .then((data) => mounted.current && setState({ data, error: null, loading: false }))
      .catch((error) => mounted.current && setState({ data: null, error, loading: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(run, [run]);

  return { ...state, reload: run };
}

export default useAsync;
