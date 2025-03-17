import { openDB } from 'idb';
import { MAX_CACHE_AGE_MS } from '.';

export class IndexedDBHelper {
  private dbName: string;
  private storeName: string;
  private dbPromise: Promise<any>;
  private maxAgeMs: number; // Default cache expiry time

  constructor(dbName, storeName, maxAgeMs = MAX_CACHE_AGE_MS) {
    this.dbName = dbName; // Name of the database
    this.storeName = storeName; // Name of the object store
    this.maxAgeMs = maxAgeMs;

    // Initialize the database
    this.dbPromise = this.initDB();
  }

  // Method to initialize the database
  async initDB() {
    return openDB(this.dbName, 1, {
      upgrade: (db) => {
        // Create an object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      },
    });
  }

  // Method to add or update a record
  async put(id, value, timestamp = Date.now()) {
    const db = await this.dbPromise;
    return await db.put(this.storeName, { id, value, timestamp });
  }

  // Method to retrieve a record by id
  async get(id) {
    const db = await this.dbPromise;
    const record = await db.get(this.storeName, id);

    if (!record) {
      return null;
    }

    // Update timestamp to keep recently accessed files fresh
    this.refreshTimestamp(record);

    return record.value;
  }

  // Method to refresh record timestamp
  async refreshTimestamp(record) {
    record.timestamp = Date.now();
    const db = await this.dbPromise;
    await db.put(this.storeName, record);
  }

  // Method to delete a record by id
  async delete(id) {
    const db = await this.dbPromise;
    return db.delete(this.storeName, id);
  }

  // Method to get all records
  async getAll() {
    const db = await this.dbPromise;
    const records = await db.getAll(this.storeName);
    return records;
  }

  // Method to clear the object store
  async clear() {
    console.log('xxx Clearing IndexedDB .. ');

    const db = await this.dbPromise;
    return db.clear(this.storeName);
  }

  // Method to clean up expired entries
  async cleanupExpired() {
    if (!this.maxAgeMs) {
      return 0;
    }

    const records = await this.getAll();
    const now = Date.now();
    let removedCount = 0;

    for (const record of records) {
      if (now - record.timestamp > this.maxAgeMs) {
        await this.delete(record.id);
        removedCount++;
      }
    }

    return removedCount;
  }
}

let indexedDBInstance: IndexedDBHelper | null = null;

export function getProvider(): IndexedDBHelper {
  if (!indexedDBInstance) {
    indexedDBInstance = new IndexedDBHelper('zos-db', 'image-store');
  }
  return indexedDBInstance;
}
