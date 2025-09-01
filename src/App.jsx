import { useState, useEffect } from 'react';
import { useAppStore } from './store/appStore';
import TaskHeader from './components/TaskHeader';
import TaskForm from './components/TaskForm';
import Scanner from './components/Scanner';
import ItemForm from './components/ItemForm';
import ItemsList from './components/ItemsList';
import ExportControls from './components/ExportControls';
import './App.css';

function App() {
  const { 
    showTaskForm, 
    showItemForm, 
    isScanning, 
    setIsScanning,
    currentTask,
    scannedItems
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('scan');

  // Auto-switch to items tab when items are added
  useEffect(() => {
    if (scannedItems.length > 0 && activeTab === 'scan' && !isScanning) {
      // Small delay to show the scan success before switching
      setTimeout(() => setActiveTab('items'), 1500);
    }
  }, [scannedItems.length, activeTab, isScanning]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TaskHeader />
      
      {/* Mobile-first navigation tabs */}
      {currentTask && (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('scan')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'scan'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4M4 7v4m0 0h4m-4 0l4-4m0 8h2m-6 0v4" />
                  </svg>
                  <span>Scan</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('items')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'items'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Items ({scannedItems.length})</span>
                </div>
              </button>
              
              {scannedItems.length > 0 && (
                <button
                  onClick={() => setActiveTab('export')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'export'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export</span>
                  </div>
                </button>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Main content area */}
      <main className="max-w-7xl mx-auto">
        {activeTab === 'scan' && <Scanner />}
        {activeTab === 'items' && <ItemsList />}
        {activeTab === 'export' && <ExportControls />}
      </main>

      {/* Floating action button for mobile */}
      {currentTask && activeTab === 'items' && (
        <div className="fixed bottom-6 right-6 sm:hidden">
          <button
            onClick={() => {
              setActiveTab('scan');
              setIsScanning(true);
            }}
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4M4 7v4m0 0h4m-4 0l4-4m0 8h2m-6 0v4" />
            </svg>
          </button>
        </div>
      )}

      {/* Modals */}
      {showTaskForm && <TaskForm />}
      {showItemForm && <ItemForm />}
    </div>
  );
}

export default App;
