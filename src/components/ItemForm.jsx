import { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';

export default function ItemForm() {
  const [formData, setFormData] = useState({
    scannedData: '',
    location: '',
    notes: '',
    condition: 'Good'
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    addScannedItem, 
    updateScannedItem, 
    setShowItemForm, 
    selectedItem,
    setSelectedItem,
    currentTask
  } = useAppStore();

  useEffect(() => {
    if (selectedItem) {
      setFormData({
        scannedData: selectedItem.scannedData?.text || selectedItem.scannedData || '',
        location: selectedItem.location || '',
        notes: selectedItem.notes || '',
        condition: selectedItem.condition || 'Good'
      });
    } else {
      setFormData({
        scannedData: '',
        location: '',
        notes: '',
        condition: 'Good'
      });
    }
  }, [selectedItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentTask) {
      alert('No active task');
      return;
    }

    setIsLoading(true);
    try {
      if (selectedItem) {
        // Update existing item
        await updateScannedItem(selectedItem.id, {
          location: formData.location,
          notes: formData.notes,
          condition: formData.condition
        });
      } else {
        // Add new item
        const scannedData = {
          text: formData.scannedData,
          format: 'Manual Entry',
          timestamp: new Date().toISOString()
        };
        
        await addScannedItem(scannedData, {
          location: formData.location,
          notes: formData.notes,
          condition: formData.condition
        });
      }
      
      handleCancel();
    } catch (error) {
      alert('Error saving item: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      scannedData: '',
      location: '',
      notes: '',
      condition: 'Good'
    });
    setShowItemForm(false);
    setSelectedItem(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          {selectedItem ? 'Edit Item' : 'Add Manual Entry'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="scannedData" className="block text-sm font-medium text-gray-700 mb-1">
              Serial Number / Code *
            </label>
            <input
              type="text"
              id="scannedData"
              value={formData.scannedData}
              onChange={(e) => handleInputChange('scannedData', e.target.value)}
              placeholder="Enter serial number or code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isLoading || selectedItem} // Disable if editing existing item
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Shelf A-1, Room 205, Zone B"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
              Condition
            </label>
            <select
              id="condition"
              value={formData.condition}
              onChange={(e) => handleInputChange('condition', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about this item..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="flex space-x-3 pt-2">
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
              disabled={isLoading || !formData.scannedData.trim()}
            >
              {isLoading ? 'Saving...' : selectedItem ? 'Update' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
