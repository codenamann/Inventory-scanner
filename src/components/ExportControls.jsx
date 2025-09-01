import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { exportToExcel, exportToCSV, generateTaskSummary } from '../lib/export';

export default function ExportControls() {
  const [isExporting, setIsExporting] = useState(false);
  const { currentTask, scannedItems, exportTaskData } = useAppStore();

  if (!currentTask || scannedItems.length === 0) {
    return null;
  }

  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      const taskData = await exportTaskData(currentTask.id);
      
      let filename;
      if (format === 'excel') {
        filename = exportToExcel(taskData);
      } else {
        filename = exportToCSV(taskData);
      }
      
      // Show success message
      alert(`Successfully exported ${scannedItems.length} items to ${filename}`);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const summary = generateTaskSummary(scannedItems);

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.totalItems}</div>
            <div className="text-xs text-blue-800">Total Items</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">
              {summary.byCondition['Excellent'] || 0}
            </div>
            <div className="text-xs text-green-800">Excellent</div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {(summary.byCondition['Fair'] || 0) + (summary.byCondition['Poor'] || 0)}
            </div>
            <div className="text-xs text-yellow-800">Fair/Poor</div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-600">
              {summary.byCondition['Damaged'] || 0}
            </div>
            <div className="text-xs text-red-800">Damaged</div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleExport('excel')}
            disabled={isExporting}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{isExporting ? 'Exporting...' : 'Download Excel File (.xlsx)'}</span>
          </button>
          
          <button
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{isExporting ? 'Exporting...' : 'Download CSV File (.csv)'}</span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Export {scannedItems.length} items from "{currentTask.name}"
          </p>
        </div>
      </div>
    </div>
  );
}
