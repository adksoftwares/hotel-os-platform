import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface POSDB extends DBSchema {
  sync_queue: {
    key: string;
    value: {
      id: string;
      endpoint: string;
      method: string;
      payload: any;
      timestamp: number;
    };
  };
  menu_cache: {
    key: string;
    value: any;
  };
}

let dbPromise: Promise<IDBPDatabase<POSDB>> | null = null;

export const getDB = () => {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<POSDB>('adk-pos-offline-db', 1, {
      upgrade(db) {
        db.createObjectStore('sync_queue', { keyPath: 'id' });
        db.createObjectStore('menu_cache', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
};

export const enqueueRequest = async (endpoint: string, method: string, payload: any) => {
  const db = await getDB();
  if (!db) return;
  const id = crypto.randomUUID();
  await db.put('sync_queue', {
    id,
    endpoint,
    method,
    payload,
    timestamp: Date.now(),
  });
  return id;
};

export const getSyncQueue = async () => {
  const db = await getDB();
  if (!db) return [];
  return db.getAll('sync_queue');
};

export const removeFromQueue = async (id: string) => {
  const db = await getDB();
  if (!db) return;
  await db.delete('sync_queue', id);
};

export const processSyncQueue = async () => {
  if (typeof window === 'undefined') return;
  if (!navigator.onLine) return;

  const queue = await getSyncQueue();
  if (queue.length === 0) return;

  const token = localStorage.getItem('access_token');
  
  for (const item of queue) {
    try {
      const res = await fetch(item.endpoint, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item.payload)
      });
      
      if (res.ok) {
        await removeFromQueue(item.id);
      }
    } catch (error) {
      console.error('Offline sync failed for item:', item.id, error);
      // Stop processing queue on network error to preserve order
      break; 
    }
  }
};

// Setup online listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', processSyncQueue);
}
