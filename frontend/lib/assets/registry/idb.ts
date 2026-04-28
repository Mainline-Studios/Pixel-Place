import { GAME_ASSET_IDB_NAME, GAME_ASSET_IDB_STORE } from './types';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'));
      return;
    }
    const req = indexedDB.open(GAME_ASSET_IDB_NAME, 1);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(GAME_ASSET_IDB_STORE)) {
        db.createObjectStore(GAME_ASSET_IDB_STORE);
      }
    };
  });
}

export async function idbPutModelBuffer(id: string, buffer: ArrayBuffer): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(GAME_ASSET_IDB_STORE, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IDB transaction failed'));
    tx.objectStore(GAME_ASSET_IDB_STORE).put(buffer, id);
  });
  db.close();
}

export async function idbGetModelBuffer(id: string): Promise<ArrayBuffer | undefined> {
  const db = await openDb();
  const buffer = await new Promise<ArrayBuffer | undefined>((resolve, reject) => {
    const tx = db.transaction(GAME_ASSET_IDB_STORE, 'readonly');
    tx.onerror = () => reject(tx.error ?? new Error('IDB read failed'));
    const req = tx.objectStore(GAME_ASSET_IDB_STORE).get(id);
    req.onsuccess = () => resolve(req.result as ArrayBuffer | undefined);
  });
  db.close();
  return buffer;
}

export async function idbDeleteModelBuffer(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(GAME_ASSET_IDB_STORE, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IDB delete failed'));
    tx.objectStore(GAME_ASSET_IDB_STORE).delete(id);
  });
  db.close();
}
