type QueryFn<T> = () => Promise<T>;

interface QueryOptions {
  staleTime?: number;
  enabled?: boolean;
}

interface UseQueryResult<T> {
  data?: T;
  error?: Error;
  loading: boolean;
  refetch: () => void;
}

const cache = new Map<string, { data: unknown; timestamp: number }>();

export function useQuery<T>(
  key: unknown[],
  fn: QueryFn<T>,
  options?: QueryOptions
): UseQueryResult<T> {
  const [state, setState] = React.useState<UseQueryResult<T>>({
    loading: true,
    refetch: () => {},
  });

  const cacheKey = JSON.stringify(key);

  React.useEffect(() => {
    if (options?.enabled === false) {
      setState({ loading: false, refetch: () => {} });
      return;
    }

    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < (options?.staleTime || 0)) {
      setState({
        data: cached.data as T,
        loading: false,
        refetch: () => {},
      });
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      try {
        const data = await fn();
        if (!cancelled) {
          cache.set(cacheKey, { data, timestamp: Date.now() });
          setState({ data, loading: false, refetch: () => {} });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            error: error instanceof Error ? error : new Error('Unknown error'),
            loading: false,
            refetch: () => {},
          });
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, fn, options?.enabled, options?.staleTime]);

  const refetch = React.useCallback(() => {
    cache.delete(cacheKey);
    setState({ loading: true, refetch });
  }, [cacheKey]);

  return { ...state, refetch };
}

import React from 'react';
