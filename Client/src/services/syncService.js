import apiClient, { api, apiCache } from "./apiClient";
import { useState, useEffect } from "react";

/**
 * Sync Service for managing batch operations and offline synchronization
 */
class SyncService {
  constructor() {
    this.syncQueue = [];
    this.isSyncing = false;
    this.listeners = new Set();
    this.offlineMode = !navigator.onLine;

    //* Listen for online/offline events
    window.addEventListener("online", () => this.handleOnline());
    window.addEventListener("offline", () => this.handleOffline());

    //* Load pending operations from localStorage
    this.loadPendingOperations();
  }

  //! Subscribe to sync status changes
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  //! Notify all listeners
  notify(status) {
    this.listeners.forEach((callback) => callback(status));
  }

  //! Handle going online
  async handleOnline() {
    this.offlineMode = false;
    console.log("[Sync] Connection restored - processing pending operations");
    this.notify({ type: "ONLINE", pendingCount: this.syncQueue.length });
    await this.processSyncQueue();
  }

  //! Handle going offline
  handleOffline() {
    this.offlineMode = true;
    console.log("[Sync] Connection lost - operations will be queued");
    this.notify({ type: "OFFLINE", pendingCount: this.syncQueue.length });
  }

  //* Load pending operations from localStorage
  loadPendingOperations() {
    try {
      const stored = localStorage.getItem("syncQueue");
      if (stored) {
        this.syncQueue = JSON.parse(stored);
        console.log(`[Sync] Loaded ${this.syncQueue.length} pending operations`);
      }
    } catch (error) {
      console.error("[Sync] Failed to load pending operations:", error);
    }
  }

  //* Save pending operations to localStorage
  savePendingOperations() {
    try {
      localStorage.setItem("syncQueue", JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error("[Sync] Failed to save pending operations:", error);
    }
  }

  //* Add operation to sync queue
  queueOperation(operation) {
    const op = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
      ...operation,
    };

    this.syncQueue.push(op);
    this.savePendingOperations();
    this.notify({ type: "QUEUED", operation: op, pendingCount: this.syncQueue.length });

    //* Try to process immediately if online
    if (!this.offlineMode && !this.isSyncing) {
      this.processSyncQueue();
    }

    return op.id;
  }

  //* Process all queued operations
  async processSyncQueue() {
    if (this.isSyncing || this.syncQueue.length === 0 || this.offlineMode) {
      return;
    }

    this.isSyncing = true;
    this.notify({ type: "SYNCING", pendingCount: this.syncQueue.length });

    const processed = [];
    const failed = [];

    for (const operation of this.syncQueue) {
      try {
        await this.executeOperation(operation);
        processed.push(operation.id);
      } catch (error) {
        operation.retryCount++;
        if (operation.retryCount >= 3) {
          operation.error = error.message;
          operation.failed = true;
          failed.push(operation);
        }
      }
    }

    //* Remove processed operations
    this.syncQueue = this.syncQueue.filter(
      (op) => !processed.includes(op.id) && !op.failed
    );
    this.savePendingOperations();

    this.isSyncing = false;
    this.notify({
      type: "SYNCED",
      processed: processed.length,
      failed: failed.length,
      pendingCount: this.syncQueue.length,
    });

    if (failed.length > 0) {
      console.error("[Sync] Failed operations:", failed);
    }
  }

  //! Execute a single operation
  async executeOperation(operation) {
    const { type, endpoint, data, invalidateCache } = operation;

    switch (type) {
      case "POST":
        await api.post(endpoint, data, { invalidateCache });
        break;
      case "PUT":
        await api.put(endpoint, data, { invalidateCache });
        break;
      case "PATCH":
        await api.patch(endpoint, data, { invalidateCache });
        break;
      case "DELETE":
        await api.delete(endpoint, { invalidateCache });
        break;
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }

  //* Batch operations for efficient syncing
  async batchOperation(entityKey, operations) {
    const endpoint = `/batch/${entityKey}`;

    try {
      const response = await apiClient.post(endpoint, { operations });

      //! Invalidate cache for the entity
      apiCache.invalidate(entityKey);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      //* Queue individual operations if batch fails
      operations.forEach((op) => {
        this.queueOperation({
          type: op.type,
          endpoint: op.endpoint,
          data: op.data,
          invalidateCache: entityKey,
        });
      });

      return {
        success: false,
        error: error.message,
        queued: true,
      };
    }
  }

  //* Optimistic update with rollback capability
  async optimisticUpdate({
    entityKey,
    endpoint,
    data,
    optimisticData,
    onSuccess,
    onError,
  }) {
    //! Apply optimistic update immediately
    if (onSuccess) {
      onSuccess(optimisticData);
    }

    try {
      const response = await api.put(endpoint, data, { invalidateCache: entityKey });
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      //* Rollback on error
      if (onError) {
        onError(error);
      }

      //* Queue for retry
      this.queueOperation({
        type: "PUT",
        endpoint,
        data,
        invalidateCache: entityKey,
      });

      return {
        success: false,
        error: error.message,
        queued: true,
      };
    }
  }

  //! Get current sync status
  getStatus() {
    return {
      isOnline: !this.offlineMode,
      isSyncing: this.isSyncing,
      pendingCount: this.syncQueue.length,
      failedOperations: this.syncQueue.filter((op) => op.failed),
    };
  }

  //! Clear all pending operations
  clearQueue() {
    this.syncQueue = [];
    this.savePendingOperations();
    this.notify({ type: "CLEARED", pendingCount: 0 });
  }

  //* Retry failed operations
  async retryFailed() {
    const failedOps = this.syncQueue.filter((op) => op.failed);
    failedOps.forEach((op) => {
      op.failed = false;
      op.retryCount = 0;
      op.error = null;
    });

    this.savePendingOperations();
    await this.processSyncQueue();
  }
}

//! Export singleton instance
export const syncService = new SyncService();

//* React hook for sync status (for use in React components)
export const useSyncStatus = () => {
  const [status, setStatus] = useState(syncService.getStatus());

  useEffect(() => {
    return syncService.subscribe(() => {
      setStatus(syncService.getStatus());
    });
  }, []);

  return status;
};

export default syncService;
