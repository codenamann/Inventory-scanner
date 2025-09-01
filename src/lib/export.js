import * as XLSX from 'xlsx';

export const exportToExcel = (taskData) => {
  const { task, items } = taskData;
  
  if (!task || !items) {
    throw new Error('Invalid task data for export');
  }

  // Prepare data for Excel
  const worksheetData = [
    // Header row
    ['#', 'Serial/Code', 'Location', 'Condition', 'Notes', 'Scanned Time']
  ];

  // Add data rows
  items.forEach((item, index) => {
    const scannedText = typeof item.scannedData === 'string' 
      ? item.scannedData 
      : item.scannedData?.text || 'N/A';
    
    worksheetData.push([
      index + 1,
      scannedText,
      item.location || '',
      item.condition || '',
      item.notes || '',
      new Date(item.timestamp).toLocaleString()
    ]);
  });

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  const columnWidths = [
    { wch: 5 },   // #
    { wch: 20 },  // Serial/Code
    { wch: 15 },  // Location
    { wch: 12 },  // Condition
    { wch: 30 },  // Notes
    { wch: 18 }   // Scanned Time
  ];
  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Scanned Items');

  // Create filename with task name and timestamp
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const safeTaskName = task.name.replace(/[^a-zA-Z0-9]/g, '_'); // Remove special characters
  const filename = `${safeTaskName}_${timestamp}.xlsx`;

  // Generate and download file
  XLSX.writeFile(workbook, filename);
  
  return filename;
};

export const exportToCSV = (taskData) => {
  const { task, items } = taskData;
  
  if (!task || !items) {
    throw new Error('Invalid task data for export');
  }

  // Prepare CSV data
  const csvData = [
    // Header row
    ['#', 'Serial/Code', 'Location', 'Condition', 'Notes', 'Scanned Time']
  ];

  // Add data rows
  items.forEach((item, index) => {
    const scannedText = typeof item.scannedData === 'string' 
      ? item.scannedData 
      : item.scannedData?.text || 'N/A';
    
    csvData.push([
      index + 1,
      scannedText,
      item.location || '',
      item.condition || '',
      item.notes || '',
      new Date(item.timestamp).toLocaleString()
    ]);
  });

  // Convert to CSV string
  const csvContent = csvData.map(row => 
    row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return '"' + cellStr.replace(/"/g, '""') + '"';
      }
      return cellStr;
    }).join(',')
  ).join('\n');

  // Create and download file
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const safeTaskName = task.name.replace(/[^a-zA-Z0-9]/g, '_'); // Remove special characters
  const filename = `${safeTaskName}_${timestamp}.csv`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
  return filename;
};

// Generate summary statistics for the task
export const generateTaskSummary = (items) => {
  const summary = {
    totalItems: items.length,
    byCondition: {},
    byLocation: {},
    scanMethods: {}
  };

  items.forEach(item => {
    // Count by condition
    const condition = item.condition || 'Unknown';
    summary.byCondition[condition] = (summary.byCondition[condition] || 0) + 1;

    // Count by location
    const location = item.location || 'Unspecified';
    summary.byLocation[location] = (summary.byLocation[location] || 0) + 1;

    // Count scan methods
    const method = typeof item.scannedData === 'object' 
      ? item.scannedData?.format || 'Unknown'
      : 'Manual Entry';
    summary.scanMethods[method] = (summary.scanMethods[method] || 0) + 1;
  });

  return summary;
};
