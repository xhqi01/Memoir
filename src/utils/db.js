const DB_NAME = 'memoir';
const DB_VERSION = 1;
let db = null;

export function openDB() {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains('people')) {
        d.createObjectStore('people', { keyPath: 'id' });
      }
      if (!d.objectStoreNames.contains('cards')) {
        const s = d.createObjectStore('cards', { keyPath: 'id' });
        s.createIndex('personId', 'personId');
        s.createIndex('date', 'date');
      }
      if (!d.objectStoreNames.contains('settings')) {
        d.createObjectStore('settings', { keyPath: 'key' });
      }
    };
    req.onsuccess = (e) => { db = e.target.result; resolve(db); };
    req.onerror = () => reject(req.error);
  });
}

async function tx(store, mode, fn) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const t = d.transaction(store, mode);
    const s = t.objectStore(store);
    const req = fn(s);
    if (req && req.onsuccess !== undefined) {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } else {
      t.oncomplete = () => resolve(req?.result);
      t.onerror = () => reject(t.error);
    }
  });
}

export const getPeople = () => tx('people', 'readonly', s => s.getAll());
export const getPerson = (id) => tx('people', 'readonly', s => s.get(id));
export const savePerson = (p) => tx('people', 'readwrite', s => s.put(p));
export const deletePerson = (id) => tx('people', 'readwrite', s => s.delete(id));

export const getCards = async (personId) => {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const t = d.transaction('cards', 'readonly');
    const idx = t.objectStore('cards').index('personId');
    const req = idx.getAll(personId);
    req.onsuccess = () => resolve(req.result.sort((a, b) => b.date - a.date));
    req.onerror = () => reject(req.error);
  });
};
export const saveCard = (c) => tx('cards', 'readwrite', s => s.put(c));
export const deleteCard = (id) => tx('cards', 'readwrite', s => s.delete(id));
export const deleteCardsByPerson = async (personId) => {
  const cards = await getCards(personId);
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const t = d.transaction('cards', 'readwrite');
    const s = t.objectStore('cards');
    cards.forEach(c => s.delete(c.id));
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
  });
};

export const getSetting = async (key) => {
  const r = await tx('settings', 'readonly', s => s.get(key));
  return r ? r.value : null;
};
export const setSetting = (key, value) =>
  tx('settings', 'readwrite', s => s.put({ key, value }));
