import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAppStore } from '../store/appStore';

export default function Scanner() {
  const scannerRef = useRef(null);
  const [error, setError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { 
    isScanning, 
    setIsScanning, 
    setShowItemForm, 
    addScannedItem,
    currentTask
  } = useAppStore();

  useEffect(() => {
    if (isScanning && !isInitialized && scannerRef.current) {
      initializeScanner();
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (err) {
          console.log('Scanner cleanup error:', err);
        }
      }
    };
  }, [isScanning, isInitialized]);

  const initializeScanner = () => {
    try {
      const scanner = new Html5QrcodeScanner(
        'scanner-container',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          supportedScanTypes: [
            Html5QrcodeScanner.SCAN_TYPE_CAMERA
          ]
        },
        false
      );

      scanner.render(
        (decodedText, decodedResult) => {
          handleScanSuccess(decodedText, decodedResult);
        },
        (error) => {
          // Handle scan errors silently - they're frequent during scanning
          console.log('Scan error:', error);
        }
      );

      scannerRef.current = scanner;
      setIsInitialized(true);
      setError('');
    } catch (err) {
      setError('Failed to initialize camera: ' + err.message);
      setIsScanning(false);
    }
  };

  const handleScanSuccess = async (decodedText, decodedResult) => {
    try {
      // Stop scanning
      setIsScanning(false);
      
      if (scannerRef.current) {
        await scannerRef.current.clear();
        setIsInitialized(false);
      }

      // Process the scanned data
      const scannedData = {
        text: decodedText,
        format: decodedResult.format?.formatName || 'Unknown',
        timestamp: new Date().toISOString()
      };

      // Add to current task with basic data
      await addScannedItem(scannedData);
      
      // Show success message briefly
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successDiv.textContent = `✓ Scanned: ${decodedText}`;
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        document.body.removeChild(successDiv);
      }, 2000);
      
    } catch (error) {
      console.error('Error processing scan:', error);
      setError('Error processing scan: ' + error.message);
    }
  };

  const handleStopScanning = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.clear();
        setIsInitialized(false);
      }
    } catch (err) {
      console.log('Stop scanning error:', err);
    }
    setIsScanning(false);
  };

  const handleStartScanning = () => {
    if (!currentTask) {
      alert('Please create a task first');
      return;
    }
    setError('');
    setIsScanning(true);
  };

  if (!isScanning) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="bg-blue-50 rounded-full p-8 mb-6">
          <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4M4 7v4m0 0h4m-4 0l4-4m0 8h2m-6 0v4" />
          </svg>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Scan</h3>
        <p className="text-gray-600 text-center mb-6">
          Tap the button below to start scanning barcodes or QR codes
        </p>
        
        <button
          onClick={handleStartScanning}
          disabled={!currentTask}
          className="w-full max-w-xs bg-blue-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentTask ? 'Start Scanning' : 'Create Task First'}
        </button>
        
        {!currentTask && (
          <p className="text-sm text-red-600 mt-2">
            You need to create a task before scanning items
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Scanning...</h3>
          <button
            onClick={handleStopScanning}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Stop
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        
        <div id="scanner-container" className="w-full"></div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Point your camera at a barcode or QR code
          </p>
        </div>
      </div>
    </div>
  );
}
