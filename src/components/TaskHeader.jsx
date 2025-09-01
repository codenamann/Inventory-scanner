import { useAppStore } from '../store/appStore';

export default function TaskHeader() {
  const { currentTask, scannedItems, resetTask, setShowTaskForm } = useAppStore();

  if (!currentTask) {
    return (
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inventory Scanner</h1>
              <p className="text-sm text-gray-600">No active task</p>
            </div>
            <button
              onClick={() => setShowTaskForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Start New Task
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {currentTask.name}
            </h1>
            <p className="text-sm text-gray-600">
              {scannedItems.length} item{scannedItems.length !== 1 ? 's' : ''} scanned
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowTaskForm(true)}
              className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              New Task
            </button>
            <button
              onClick={resetTask}
              className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              End Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
