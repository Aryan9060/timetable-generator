import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = "/api/v1";

//* Request cache storage
const requestCache = new Map();
const pendingRequests = new Map();

//* Token refresh state
let isRefreshing = false;
let refreshSubscribers = [];
let refreshPromise = null;

//* Subscribe to token refresh
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

//* Notify all subscribers with new token
const onTokenRefreshed = (success = true) => {
  refreshSubscribers.forEach((callback) => callback(success));
  refreshSubscribers = [];
};

//* Perform token refresh with locking
const performTokenRefresh = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = axios.post(
    `${API_BASE_URL}/users/refresh-token`,
    {},
    { withCredentials: true, timeout: 10000 }
  ).then((response) => {
    if (response.data?.success) {
      console.log("[API] Token refreshed successfully");
      onTokenRefreshed(true);
      return { success: true };
    }
    throw new Error("Refresh failed");
  }).catch((error) => {
    console.error("[API] Token refresh failed:", error);
    onTokenRefreshed(false);
    throw error;
  }).finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });

  return refreshPromise;
};

//* Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; //? 5 minutes
const CACHEABLE_METHODS = ["GET"];

//! Create axios instance with optimized configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000, //? 30 second timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

//* Generate cache key from request config
const getCacheKey = (config) => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
};

//* Check if request is cacheable
const isCacheable = (config) => {
  return (
    CACHEABLE_METHODS.includes(config.method?.toUpperCase()) &&
    config.cache !== false
  );
};

//! Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    //* Check cache for GET requests
    if (isCacheable(config)) {
      const cacheKey = getCacheKey(config);
      const cached = requestCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        //* Return cached data as a cancelled request with cached data attached
        config.adapter = () => {
          return Promise.resolve({
            data: cached.data,
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            cached: true,
          });
        };
        return config;
      }

      //* Check for pending duplicate requests
      if (pendingRequests.has(cacheKey)) {
        config.adapter = () => pendingRequests.get(cacheKey);
        return config;
      }
    }

    //* Add request timestamp for performance tracking
    config.metadata = { startTime: Date.now() };

    //? Note: Authentication is handled via HTTP-only cookies automatically by the browser
    //? The backend sets accessToken and refreshToken cookies on login
    //? No need to manually set Authorization header - cookies are sent automatically

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//! Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    //* Cache successful GET responses
    if (isCacheable(response.config) && !response.cached) {
      const cacheKey = getCacheKey(response.config);
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });

      //* Clean up pending request
      pendingRequests.delete(cacheKey);

      //? Log request duration in development
      if (import.meta.env.DEV && response.config.metadata) {
        const duration = Date.now() - response.config.metadata.startTime;
        console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
      }
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    //! Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      //* Skip refresh for auth endpoints to prevent loops
      const isAuthEndpoint = originalRequest.url?.includes('/users/me') || 
                             originalRequest.url?.includes('/users/refresh-token') ||
                             originalRequest.url?.includes('/users/login') ||
                             originalRequest.url?.includes('/users/logout');
      
      if (isAuthEndpoint) {
        console.log(`[API] Auth endpoint returned 401 - not attempting refresh`);
        return Promise.reject(error);
      }

      //* The refresh token cookie is httpOnly, so it is invisible to JS.
      //* The browser attaches it automatically; let the server decide if it is still valid.

      //* If already refreshing, queue this request
      if (isRefreshing || refreshPromise) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((success) => {
            if (success) {
              resolve(apiClient(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      isRefreshing = true;

      try {
        //* Perform token refresh
        await performTokenRefresh();
        
        //* Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("[API] Token refresh failed");
        requestCache.clear();
        window.dispatchEvent(new CustomEvent('auth:sessionExpired'));
        return Promise.reject(refreshError);
      }
    }

    //! Handle network errors with retry logic
    if (!error.response && originalRequest && !originalRequest._retry) {
      originalRequest._retry = (originalRequest._retry || 0) + 1;

      if (originalRequest._retry <= 3) {
        //? Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, originalRequest._retry - 1) * 1000;
        console.log(`[API] Retrying request (${originalRequest._retry}/3) after ${delay}ms`);

        await new Promise((resolve) => setTimeout(resolve, delay));
        return apiClient(originalRequest);
      }
    }

    //! Handle specific error statuses
    if (error.response) {
      switch (error.response.status) {
        case 401:
          //* Token refresh failed or invalid token
          console.error("[API] Unauthorized request - redirecting to login");
          break;
        case 403:
          console.error("[API] Access forbidden:", error.response.data?.message);
          break;
        case 404:
          console.error("[API] Resource not found:", error.config?.url);
          break;
        case 429:
          console.error("[API] Rate limit exceeded");
          break;
        case 500:
          console.error("[API] Server error:", error.response.data?.message);
          break;
        default:
          console.error(`[API] Error ${error.response.status}:`, error.response.data?.message);
      }
    } else if (error.request) {
      console.error("[API] Network error - no response received");
      toast.error("Network error. Please check your connection.");
    }

    return Promise.reject(error);
  }
);

//* Cache management utilities
export const apiCache = {
  clear: () => {
    requestCache.clear();
    console.log("[API] Cache cleared");
  },
  clearByPattern: (pattern) => {
    const keysToDelete = [];
    requestCache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => requestCache.delete(key));
    console.log(`[API] Cleared ${keysToDelete.length} cache entries matching "${pattern}"`);
  },
  invalidate: (entityKey) => {
    //* Invalidate cache for specific entity
    apiCache.clearByPattern(`:${entityKey}`);
  },
  getStats: () => {
    return {
      cachedEntries: requestCache.size,
      pendingRequests: pendingRequests.size,
    };
  },
};

//* Optimized request methods with additional options
export const api = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data, config = {}) => {
    //* Invalidate related cache on mutation
    if (config.invalidateCache) {
      apiCache.invalidate(config.invalidateCache);
    }
    return apiClient.post(url, data, config);
  },
  put: (url, data, config = {}) => {
    if (config.invalidateCache) {
      apiCache.invalidate(config.invalidateCache);
    }
    return apiClient.put(url, data, config);
  },
  patch: (url, data, config = {}) => {
    if (config.invalidateCache) {
      apiCache.invalidate(config.invalidateCache);
    }
    return apiClient.patch(url, data, config);
  },
  delete: (url, config = {}) => {
    if (config.invalidateCache) {
      apiCache.invalidate(config.invalidateCache);
    }
    return apiClient.delete(url, config);
  },
};

export default apiClient;
