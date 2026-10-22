import { useState, useEffect, useCallback, useRef } from "react";
import apiClient, { api, apiCache } from "../services/apiClient";

/**
 *! Custom hook for optimized API data fetching with caching
 * @param {string} url - API endpoint
 * @param {Object} options - Configuration options
 * @returns {Object} { data, loading, error, refetch, clearCache }
 */
export const useApi = (url, options = {}) => {
  const {
    method = "GET",
    params = {},
    body = null,
    immediate = true,
    cacheDuration: _cacheDuration = 5 * 60 * 1000, //5 minutes
    onSuccess,
    onError,
    dependencies = [],
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  //* Cancel previous request on unmount or dependency change
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

// * Fetch data function with caching and cancellation support
  const fetchData = useCallback(
    async (fetchOptions = {}) => {
      const { forceRefresh = false, silent = false } = fetchOptions;

      //* Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      if (!silent) {
        setLoading(true);
      }
      setError(null);

      try {
        const config = {
          signal: abortControllerRef.current.signal,
          cache: !forceRefresh, // Disable cache if force refresh
          params,
        };

        let response;
        switch (method.toUpperCase()) {
          case "GET":
            response = await apiClient.get(url, config);
            break;
          case "POST":
            response = await apiClient.post(url, body, config);
            break;
          case "PUT":
            response = await apiClient.put(url, body, config);
            break;
          case "PATCH":
            response = await apiClient.patch(url, body, config);
            break;
          case "DELETE":
            response = await apiClient.delete(url, config);
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }

        const responseData = response.data.data || response.data;
        setData(responseData);

        if (onSuccess) {
          onSuccess(responseData);
        }

        return { success: true, data: responseData };
      } catch (err) {
        // Don't update state if request was cancelled
        if (err.name === "CanceledError" || err.name === "AbortError") {
          return { success: false, cancelled: true };
        }

        const errorMessage = err.response?.data?.message || err.message;
        setError(errorMessage);

        if (onError) {
          onError(err);
        }

        return { success: false, error: errorMessage };
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [
      url,
      method,
      JSON.stringify(params),
      JSON.stringify(body),
      ...dependencies,
    ],
  );

  //* Initial fetch
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  //! Refetch function
  const refetch = useCallback(
    (options = {}) => fetchData({ ...options, forceRefresh: true }),
    [fetchData],
  );

  //! Clear cache for this endpoint
  const clearCache = useCallback(() => {
    apiCache.clearByPattern(url);
  }, [url]);

  return {
    data,
    loading,
    error,
    refetch,
    clearCache,
    setData,
  };
};

/**
 * Hook for paginated data fetching
 * @param {string} url - API endpoint
 * @param {Object} options - Configuration options
 * @returns {Object} Paginated data and controls
 */
export const usePaginatedApi = (url, options = {}) => {
  const { initialPage = 1, initialLimit = 20, ...restOptions } = options;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const params = {
    page,
    limit,
    ...restOptions.params,
  };

  const { data, loading, error, refetch, clearCache } = useApi(url, {
    ...restOptions,
    params,
  });

  //* Derive pagination directly from data
  const pagination = data?.pagination || null;

  const goToPage = useCallback(
    (newPage) => {
      if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
        setPage(newPage);
      }
    },
    [pagination],
  );

  const nextPage = useCallback(() => {
    if (pagination?.hasNextPage) {
      setPage((p) => p + 1);
    }
  }, [pagination]);

  const prevPage = useCallback(() => {
    if (pagination?.hasPrevPage) {
      setPage((p) => p - 1);
    }
  }, [pagination]);

  const changeLimit = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  return {
    data: data?.data || data,
    loading,
    error,
    pagination,
    page,
    limit,
    goToPage,
    nextPage,
    prevPage,
    changeLimit,
    refetch,
    clearCache,
  };
};

/**
 * Hook for mutation operations (POST, PUT, PATCH, DELETE)
 * @returns {Object} { mutate, loading, error, reset }
 */
export const useMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = useCallback(
    async (url, method = "POST", body = null, options = {}) => {
      const { onSuccess, onError, invalidateCache } = options;

      setLoading(true);
      setError(null);

      try {
        let response;
        switch (method.toUpperCase()) {
          case "POST":
            response = await api.post(url, body, { invalidateCache });
            break;
          case "PUT":
            response = await api.put(url, body, { invalidateCache });
            break;
          case "PATCH":
            response = await api.patch(url, body, { invalidateCache });
            break;
          case "DELETE":
            response = await api.delete(url, { invalidateCache });
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }

        const responseData = response.data.data || response.data;
        setData(responseData);

        if (onSuccess) {
          onSuccess(responseData);
        }

        return { success: true, data: responseData };
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        setError(errorMessage);

        if (onError) {
          onError(err);
        }

        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    mutate,
    loading,
    error,
    data,
    reset,
  };
};

/**
 * Hook for batch operations with progress tracking
 * @returns {Object} Batch operation controls
 */
export const useBatchOperation = () => {
  const [progress, setProgress] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    loading: false,
  });

  const executeBatch = useCallback(async (operations, options = {}) => {
    const { onProgress, continueOnError = true } = options;

    setProgress({
      total: operations.length,
      completed: 0,
      failed: 0,
      loading: true,
    });

    const results = [];

    for (let i = 0; i < operations.length; i++) {
      const op = operations[i];
      try {
        const response = await apiClient[op.method.toLowerCase()](
          op.url,
          op.data,
        );
        results.push({ success: true, data: response.data, operation: op });
        setProgress((prev) => ({ ...prev, completed: prev.completed + 1 }));
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          operation: op,
        });
        setProgress((prev) => ({ ...prev, failed: prev.failed + 1 }));

        if (!continueOnError) {
          break;
        }
      }

      if (onProgress) {
        onProgress({
          current: i + 1,
          total: operations.length,
          completed: results.filter((r) => r.success).length,
          failed: results.filter((r) => !r.success).length,
        });
      }
    }

    setProgress((prev) => ({ ...prev, loading: false }));
    return results;
  }, []);

  const reset = useCallback(() => {
    setProgress({
      total: 0,
      completed: 0,
      failed: 0,
      loading: false,
    });
  }, []);

  return {
    executeBatch,
    progress,
    reset,
  };
};

export default useApi;
