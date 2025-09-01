import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAppStore } from '../store/appStore';

export default function Scanner() {
  const scannerRef = useRef(null);
  const audioRef = useRef(null);
  const [error, setError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  
  const { 
    isScanning, 
    setIsScanning, 
    setShowItemForm, 
    addScannedItem,
    currentTask,
    scannedItems,
    deleteScannedItem
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

  // Audio feedback function
  const playBeepSound = () => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // 800Hz beep
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (err) {
      console.log('Audio not supported:', err);
    }
  };

  const initializeScanner = () => {
    try {
      const scanner = new Html5QrcodeScanner(
        'scanner-container',
        {
          fps: 10,
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1.0,
          supportedScanTypes: [
            Html5QrcodeScanner.SCAN_TYPE_CAMERA
          ],
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2
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
      // Play beep sound immediately
      playBeepSound();
      
      // Process the scanned data
      const scannedData = {
        text: decodedText,
        format: decodedResult.format?.formatName || 'Unknown',
        timestamp: new Date().toISOString()
      };

      // Add to current task with basic data
      await addScannedItem(scannedData);
      
      // Set last scanned for display
      setLastScanned(decodedText);
      
      // Show success message briefly
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse';
      successDiv.textContent = `✓ Scanned: ${decodedText}`;
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv);
        }
      }, 3000);
      
      // Continue scanning after a brief pause
      setTimeout(() => {
        setLastScanned(null);
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

  // Handle removing items from the scanner view
  const handleRemoveItem = async (itemId) => {
    try {
      await deleteScannedItem(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  if (!isScanning) {
    return (
      <div className="p-4">
        {/* Scanner start section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col items-center justify-center">
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
        </div>

        {/* Recently scanned items preview */}
        {scannedItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Recent Scans ({scannedItems.length})</h4>
              <span className="text-sm text-gray-500">Latest items</span>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {scannedItems.slice(-5).reverse().map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {typeof item.scannedData === 'string' ? item.scannedData : item.scannedData?.text || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="ml-3 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Remove item"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Camera Scanner Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Camera Scanner</h3>
            <p className="text-sm text-gray-600">Point camera at barcode or QR code</p>
          </div>
          <button
            onClick={handleStopScanning}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6m-6 4h6" />
            </svg>
            <span>Stop</span>
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-800 text-sm flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          </div>
        )}
        
        {lastScanned && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
            <p className="text-green-800 text-sm flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Successfully scanned: {lastScanned}
            </p>
          </div>
        )}
        
        {/* Camera container with better styling */}
        <div className="relative">
          <div id="scanner-container" className="w-full min-h-[400px] bg-gray-100 rounded-lg overflow-hidden"></div>
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            Live Camera
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span>Scanning active</span>
          </div>
          <span>•</span>
          <span>Items scanned: {scannedItems.length}</span>
        </div>
      </div>

    </div>
  );
}
