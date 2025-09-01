import { useState } from 'react';
import { useAppStore } from '../store/appStore';

export default function TaskForm() {
  const [taskName, setTaskName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { createTask, setShowTaskForm } = useAppStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    setIsLoading(true);
    try {
      await createTask(taskName.trim());
      setTaskName('');
    } catch (error) {
      alert('Error creating task: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTaskName('');
    setShowTaskForm(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Start New Task</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 mb-1">
              Task Name
            </label>
            <input
              type="text"
              id="taskName"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Enter task name (e.g., Warehouse Audit 2024)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isLoading || !taskName.trim()}
            >
              {isLoading ? 'Creating...' : 'Start Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
