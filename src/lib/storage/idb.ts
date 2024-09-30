import { openDB } from 'idb';

export class IndexedDBHelper {
  private dbName: string;
  private storeName: string;
  private dbPromise: Promise<any>;

  constructor(dbName, storeName) {
    this.dbName = dbName; // Name of the database
    this.storeName = storeName; // Name of the object store

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
  async put(id, value) {
    const db = await this.dbPromise;
    return await db.put(this.storeName, { id, value });
  }

  // Method to retrieve a record by id
  async get(id) {
    const db = await this.dbPromise;
    const record = await db.get(this.storeName, id);
    return record ? record.value : null;
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
    return records.map((record) => record.value);
  }

  // Method to clear the object store
  async clear() {
    const db = await this.dbPromise;
    return db.clear(this.storeName);
  }
}

function createProvider() {
  return new IndexedDBHelper('zos-db', 'image-store');
}

let provider;
export function getProvider(): IndexedDBHelper {
  provider = provider ?? createProvider();
  return provider;
}
