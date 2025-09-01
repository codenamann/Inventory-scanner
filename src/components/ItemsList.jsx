import { useAppStore } from '../store/appStore';

export default function ItemsList() {
  const { 
    scannedItems, 
    deleteScannedItem, 
    setSelectedItem, 
    setShowItemForm,
    currentTask
  } = useAppStore();

  if (!currentTask) {
    return (
      <div className="p-8 text-center">
        <div className="bg-gray-50 rounded-lg p-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Task</h3>
          <p className="text-gray-600">Create a task to start scanning items</p>
        </div>
      </div>
    );
  }

  if (scannedItems.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="bg-blue-50 rounded-lg p-8">
          <svg className="w-12 h-12 text-blue-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4M4 7v4m0 0h4m-4 0l4-4m0 8h2m-6 0v4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Scanned</h3>
          <p className="text-gray-600 mb-4">Start scanning items or add manual entries</p>
          <button
            onClick={() => setShowItemForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Manual Entry
          </button>
        </div>
      </div>
    );
  }

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowItemForm(true);
  };

  const handleDelete = async (item) => {
    if (confirm(`Delete item "${item.scannedData?.text || item.scannedData}"?`)) {
      try {
        await deleteScannedItem(item.id);
      } catch (error) {
        alert('Error deleting item: ' + error.message);
      }
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getScannedText = (scannedData) => {
    if (typeof scannedData === 'string') return scannedData;
    return scannedData?.text || 'N/A';
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Scanned Items ({scannedItems.length})
            </h3>
            <button
              onClick={() => setShowItemForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              Add Manual Entry
            </button>
          </div>
        </div>

        {/* Mobile-first responsive table */}
        <div className="overflow-hidden">
          {/* Mobile view (cards) */}
          <div className="block sm:hidden">
            {scannedItems.map((item, index) => (
              <div key={item.id} className="border-b border-gray-200 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {getScannedText(item.scannedData)}
                    </h4>
                    <p className="text-xs text-gray-500">#{index + 1}</p>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  {item.location && (
                    <div className="flex text-xs">
                      <span className="text-gray-500 w-16">Location:</span>
                      <span className="text-gray-900">{item.location}</span>
                    </div>
                  )}
                  <div className="flex text-xs">
                    <span className="text-gray-500 w-16">Condition:</span>
                    <span className="text-gray-900">{item.condition}</span>
                  </div>
                  {item.notes && (
                    <div className="flex text-xs">
                      <span className="text-gray-500 w-16">Notes:</span>
                      <span className="text-gray-900">{item.notes}</span>
                    </div>
                  )}
                  <div className="flex text-xs">
                    <span className="text-gray-500 w-16">Time:</span>
                    <span className="text-gray-900">{formatTimestamp(item.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop view (table) */}
          <div className="hidden sm:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serial/Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scannedItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getScannedText(item.scannedData)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.location || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                        ${item.condition === 'Excellent' 
                        ? 'bg-green-100 text-green-800' 
                        :item.condition === 'Good' 
                        ? 'bg-blue-100 text-blue-800' 
                        :item.condition === 'Fair' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        :item.condition === 'Poor' 
                        ? 'bg-orange-100 text-orange-800' 
                        :'bg-red-100 text-red-800'}`}>
                          {item.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {item.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(item.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
