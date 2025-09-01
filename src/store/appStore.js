import { create } from 'zustand';
import { storage } from '../lib/database';

export const useAppStore = create((set, get) => ({
  // Current task state
  currentTask: null,
  scannedItems: [],
  
  // UI state
  isScanning: false,
  showTaskForm: false,
  showItemForm: false,
  selectedItem: null,

  // Actions
  setCurrentTask: async (task) => {
    set({ currentTask: task });
    if (task) {
      const items = await storage.getScannedItems(task.id);
      set({ scannedItems: items });
    } else {
      set({ scannedItems: [] });
    }
  },

  createTask: async (name) => {
    try {
      const task = await storage.createTask(name);
      set({ 
        currentTask: task, 
        scannedItems: [],
        showTaskForm: false 
      });
      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  addScannedItem: async (scannedData, additionalData = {}) => {
    const { currentTask } = get();
    if (!currentTask) {
      throw new Error('No active task');
    }

    try {
      const item = await storage.addScannedItem(currentTask.id, scannedData, additionalData);
      set(state => ({
        scannedItems: [...state.scannedItems, item],
        showItemForm: false
      }));
      return item;
    } catch (error) {
      console.error('Error adding scanned item:', error);
      throw error;
    }
  },

  updateScannedItem: async (id, updates) => {
    try {
      const updatedItem = await storage.updateScannedItem(id, updates);
      set(state => ({
        scannedItems: state.scannedItems.map(item => 
          item.id === id ? updatedItem : item
        ),
        selectedItem: null,
        showItemForm: false
      }));
      return updatedItem;
    } catch (error) {
      console.error('Error updating scanned item:', error);
      throw error;
    }
  },

  deleteScannedItem: async (id) => {
    try {
      await storage.deleteScannedItem(id);
      set(state => ({
        scannedItems: state.scannedItems.filter(item => item.id !== id),
        selectedItem: null
      }));
    } catch (error) {
      console.error('Error deleting scanned item:', error);
      throw error;
    }
  },

  // UI actions
  setIsScanning: (isScanning) => set({ isScanning }),
  setShowTaskForm: (show) => set({ showTaskForm: show }),
  setShowItemForm: (show) => set({ showItemForm: show }),
  setSelectedItem: (item) => set({ selectedItem: item }),

  // Reset state
  resetTask: () => set({
    currentTask: null,
    scannedItems: [],
    isScanning: false,
    showTaskForm: false,
    showItemForm: false,
    selectedItem: null
  }),

  // Export functionality
  exportTaskData: async (taskId) => {
    try {
      const data = await storage.getTaskWithItems(taskId);
      return data;
    } catch (error) {
      console.error('Error exporting task data:', error);
      throw error;
    }
  }
}));
