import Dexie from 'dexie';

// Database schema
export class InventoryDB extends Dexie {
  constructor() {
    super('InventoryDB');
    
    this.version(1).stores({
      tasks: '++id, name, createdAt, updatedAt',
      scannedItems: '++id, taskId, scannedData, location, notes, condition, timestamp'
    });
  }
}

export const db = new InventoryDB();

// Data models
export const createTask = (name) => ({
  name,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

export const createScannedItem = (taskId, scannedData, additionalData = {}) => ({
  taskId,
  scannedData,
  location: additionalData.location || '',
  notes: additionalData.notes || '',
  condition: additionalData.condition || '',
  timestamp: new Date().toISOString(),
  ...additionalData
});

// Storage operations
export const storage = {
  // Tasks
  async createTask(name) {
    const task = createTask(name);
    const id = await db.tasks.add(task);
    return { ...task, id };
  },

  async getTasks() {
    return await db.tasks.orderBy('createdAt').reverse().toArray();
  },

  async getTask(id) {
    return await db.tasks.get(id);
  },

  async updateTask(id, updates) {
    const updatedAt = new Date().toISOString();
    await db.tasks.update(id, { ...updates, updatedAt });
    return await db.tasks.get(id);
  },

  async deleteTask(id) {
    // Delete all scanned items for this task first
    await db.scannedItems.where('taskId').equals(id).delete();
    // Then delete the task
    await db.tasks.delete(id);
  },

  // Scanned Items
  async addScannedItem(taskId, scannedData, additionalData = {}) {
    const item = createScannedItem(taskId, scannedData, additionalData);
    const id = await db.scannedItems.add(item);
    return { ...item, id };
  },

  async getScannedItems(taskId) {
    return await db.scannedItems
      .where('taskId')
      .equals(taskId)
      .orderBy('timestamp')
      .toArray();
  },

  async updateScannedItem(id, updates) {
    await db.scannedItems.update(id, updates);
    return await db.scannedItems.get(id);
  },

  async deleteScannedItem(id) {
    await db.scannedItems.delete(id);
  },

  // Export data
  async getTaskWithItems(taskId) {
    const task = await db.tasks.get(taskId);
    const items = await db.scannedItems
      .where('taskId')
      .equals(taskId)
      .orderBy('timestamp')
      .toArray();
    
    return {
      task,
      items
    };
  },

  // Clear all data
  async clearAllData() {
    await db.scannedItems.clear();
    await db.tasks.clear();
  }
};

// LocalStorage fallback (simple implementation)
export const localStorageFallback = {
  getItem(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null');
    } catch {
      return null;
    }
  },

  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};

// Check if IndexedDB is available
export const isIndexedDBAvailable = () => {
  return typeof window !== 'undefined' && 'indexedDB' in window;
};
