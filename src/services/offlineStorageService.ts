// Offline Storage Service - Complete offline-first architecture
// Stores all data locally using IndexedDB and syncs when online

interface StoredData {
  id: string;
  type: 'market_price' | 'weather' | 'disease_detection' | 'community_message' | 'user_query' | 'scheme';
  data: any;
  timestamp: number;
  synced: boolean;
  lastModified: number;
}

class OfflineStorageService {
  private dbName = 'SmartKrishiSahayakDB';
  private dbVersion = 4;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ Offline Storage initialized');
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;

        // Market Prices Store
        if (!db.objectStoreNames.contains('market_prices')) {
          const marketStore = db.createObjectStore('market_prices', { keyPath: 'id' });
          marketStore.createIndex('timestamp', 'timestamp', { unique: false });
          marketStore.createIndex('synced', 'synced', { unique: false });
        } else {
          // Add synced index to existing store if missing
          const transaction = event.target.transaction;
          const marketStore = transaction.objectStore('market_prices');
          if (!marketStore.indexNames.contains('synced')) {
            marketStore.createIndex('synced', 'synced', { unique: false });
          }
        }

        // Weather Data Store
        if (!db.objectStoreNames.contains('weather_data')) {
          const weatherStore = db.createObjectStore('weather_data', { keyPath: 'id' });
          weatherStore.createIndex('timestamp', 'timestamp', { unique: false });
          weatherStore.createIndex('location', 'data.location', { unique: false });
        }

        // Disease Detection History
        if (!db.objectStoreNames.contains('disease_detections')) {
          const diseaseStore = db.createObjectStore('disease_detections', { keyPath: 'id' });
          diseaseStore.createIndex('timestamp', 'timestamp', { unique: false });
          diseaseStore.createIndex('synced', 'synced', { unique: false });
        }

        // Community Messages
        if (!db.objectStoreNames.contains('community_messages')) {
          const communityStore = db.createObjectStore('community_messages', { keyPath: 'id' });
          communityStore.createIndex('timestamp', 'timestamp', { unique: false });
          communityStore.createIndex('synced', 'synced', { unique: false });
        }

        // User Queries (AI Agent)
        if (!db.objectStoreNames.contains('user_queries')) {
          const queryStore = db.createObjectStore('user_queries', { keyPath: 'id' });
          queryStore.createIndex('timestamp', 'timestamp', { unique: false });
          queryStore.createIndex('synced', 'synced', { unique: false });
        }

        // Government Schemes
        if (!db.objectStoreNames.contains('schemes')) {
          const schemeStore = db.createObjectStore('schemes', { keyPath: 'id' });
          schemeStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Sync Queue
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('priority', 'priority', { unique: false });
        }

        console.log('📦 Database structure created');
      };
    });
  }

  // Save data offline
  async save(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const item: StoredData = {
        id: data.id || this.generateId(),
        type: storeName as any,
        data: data,
        timestamp: Date.now(),
        synced: navigator.onLine,
        lastModified: Date.now()
      };

      const request = store.put(item);

      request.onsuccess = () => {
        console.log(`💾 Saved to ${storeName}:`, item.id);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Get all data from a store
  async getAll(storeName: string): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result.map((item: StoredData) => item.data);
        console.log(`📂 Retrieved ${results.length} items from ${storeName}`);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Get data by ID
  async getById(storeName: string, id: string): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result ? request.result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Save multiple items in batch
  async saveBatch(storeName: string, items: any[]): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      let completed = 0;
      const total = items.length;

      items.forEach(item => {
        const storedItem: StoredData = {
          id: item.id || this.generateId(),
          type: storeName as any,
          data: item,
          timestamp: Date.now(),
          synced: navigator.onLine,
          lastModified: Date.now()
        };

        const request = store.put(storedItem);
        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            console.log(`💾 Batch saved ${total} items to ${storeName}`);
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  // Add to sync queue
  async addToSyncQueue(action: string, data: any, priority: number = 1): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');

      const item = {
        action,
        data,
        priority,
        timestamp: Date.now(),
        retries: 0
      };

      const request = store.add(item);
      request.onsuccess = () => {
        console.log('📋 Added to sync queue:', action);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Get sync queue
  async getSyncQueue(): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readonly');
      const store = transaction.objectStore('sync_queue');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Clear sync queue item
  async clearSyncQueueItem(id: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Mark as synced
  async markAsSynced(storeName: string, id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        const item = request.result;
        if (item) {
          item.synced = true;
          item.lastModified = Date.now();
          store.put(item);
          console.log(`✅ Marked as synced: ${id}`);
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Get unsynced items
  async getUnsyncedItems(storeName: string): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        
        // Check if synced index exists
        if (!store.indexNames.contains('synced')) {
          console.log(`⚠️ Store ${storeName} doesn't have synced index, returning empty array`);
          resolve([]);
          return;
        }
        
        const index = store.index('synced');
        // Use cursor to iterate and filter unsynced items
        const request = index.openCursor();
        const unsyncedItems: any[] = [];

        request.onsuccess = (event: any) => {
          const cursor = event.target.result;
          if (cursor) {
            // Check if item is not synced (false, 0, undefined, or null)
            if (!cursor.value.synced) {
              unsyncedItems.push(cursor.value);
            }
            cursor.continue();
          } else {
            // Done iterating
            console.log(`🔄 Found ${unsyncedItems.length} unsynced items in ${storeName}`);
            resolve(unsyncedItems);
          }
        };
        request.onerror = () => {
          console.error(`❌ Error getting unsynced items from ${storeName}:`, request.error);
          reject(request.error);
        };
      } catch (error) {
        console.error(`❌ Error accessing store ${storeName}:`, error);
        resolve([]);
      }
    });
  }

  // Clear old data (older than 30 days)
  async clearOldData(storeName: string, daysToKeep: number = 30): Promise<void> {
    if (!this.db) await this.init();

    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const index = store.index('timestamp');
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));

      let deleted = 0;
      request.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          deleted++;
          cursor.continue();
        } else {
          console.log(`🗑️ Cleared ${deleted} old items from ${storeName}`);
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Get storage usage
  async getStorageInfo(): Promise<{used: number, quota: number, percentage: number}> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = (used / quota) * 100;

      console.log(`💾 Storage: ${(used / 1024 / 1024).toFixed(2)} MB / ${(quota / 1024 / 1024).toFixed(2)} MB (${percentage.toFixed(1)}%)`);

      return { used, quota, percentage };
    }
    return { used: 0, quota: 0, percentage: 0 };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new OfflineStorageService();
