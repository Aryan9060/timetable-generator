import toast from 'react-hot-toast';

/**
 * Toast notification utilities
 * Provides consistent toast notifications across the app
 */

export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    duration: options.duration || 3000,
    ...options,
  });
};

export const showError = (message, options = {}) => {
  return toast.error(message, {
    duration: options.duration || 5000,
    ...options,
  });
};

export const showLoading = (message, options = {}) => {
  return toast.loading(message, {
    duration: options.duration || Infinity,
    ...options,
  });
};

export const dismissToast = (toastId) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

export const updateToast = (toastId, message, type = 'success', options = {}) => {
  if (!toastId) return;

  const config = {
    duration: type === 'error' ? 5000 : 3000,
    ...options,
  };

  switch (type) {
    case 'success':
      toast.success(message, { id: toastId, ...config });
      break;
    case 'error':
      toast.error(message, { id: toastId, ...config });
      break;
    default:
      toast(message, { id: toastId, ...config });
  }
};

/**
 * Promise-based toast that shows loading, success, and error states
 * @param {Promise} promise - The promise to track
 * @param {Object} messages - Messages for loading, success, and error states
 * @returns {Promise} The original promise
 */
export const promiseToast = (promise, messages = {}) => {
  const {
    loading = 'Loading...',
    success = 'Success!',
    error = 'Something went wrong',
  } = messages;

  return toast.promise(
    promise,
    {
      loading,
      success,
      error,
    },
    {
      success: {
        duration: 3000,
      },
      error: {
        duration: 5000,
      },
    }
  );
};

/**
 *! API response handler with toast notifications
 * @param {Promise} apiCall - The API call promise
 * @param {Object} options - Configuration options
 */
export const handleApiWithToast = async (apiCall, options = {}) => {
  const {
    loadingMsg = 'Processing...',
    successMsg = 'Operation completed successfully',
    errorMsg = 'Operation failed',
    onSuccess,
    onError,
  } = options;

  const loadingToast = showLoading(loadingMsg);

  try {
    const result = await apiCall;
    dismissToast(loadingToast);
    showSuccess(typeof successMsg === 'function' ? successMsg(result) : successMsg);
    
    if (onSuccess) {
      onSuccess(result);
    }
    
    return { success: true, data: result };
  } catch (error) {
    dismissToast(loadingToast);
    const message = error.response?.data?.message || error.message || errorMsg;
    showError(typeof errorMsg === 'function' ? errorMsg(error) : message);
    
    if (onError) {
      onError(error);
    }
    
    return { success: false, error };
  }
};

export default {
  success: showSuccess,
  error: showError,
  loading: showLoading,
  dismiss: dismissToast,
  update: updateToast,
  promise: promiseToast,
  handleApi: handleApiWithToast,
};
