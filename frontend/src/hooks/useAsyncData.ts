import { useEffect, useState } from 'react';

type AsyncState<T> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
};

export function useAsyncData<T>(factory: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;
    setState((current) => ({ ...current, error: null, isLoading: true }));

    factory()
      .then((data) => {
        if (isMounted) {
          setState({ data, error: null, isLoading: false });
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          const message = error instanceof Error ? error.message : 'Something went wrong';
          setState({ data: null, error: message, isLoading: false });
        }
      });

    return () => {
      isMounted = false;
    };
  }, deps);

  return state;
}
