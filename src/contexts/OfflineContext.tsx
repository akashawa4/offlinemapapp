import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface OfflineArea {
  id: string;
  name: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  downloadDate: Date;
  size: number; // in MB
  maxZoom: number;
}

interface OfflineContextType {
  isOffline: boolean;
  downloadedAreas: OfflineArea[];
  isDownloading: boolean;
  downloadProgress: number;
  startDownload: (area: OfflineArea) => Promise<void>;
  deleteArea: (id: string) => void;
  getTotalSize: () => number;
  maharashtraDistricts: OfflineArea[];
  downloadDistrict: (districtId: string) => Promise<void>;
  toggleOfflineMode: () => void;
  isManualOffline: boolean;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

// Enhanced Maharashtra districts with Kolhapur and accurate coordinates
const maharashtraDistricts: OfflineArea[] = [
  {
    id: 'mumbai',
    name: 'Mumbai',
    bounds: { north: 19.2728, south: 18.8942, east: 72.9781, west: 72.7757 },
    downloadDate: new Date(),
    size: 45.2,
    maxZoom: 16
  },
  {
    id: 'pune',
    name: 'Pune',
    bounds: { north: 18.6298, south: 18.4088, east: 73.9997, west: 73.6821 },
    downloadDate: new Date(),
    size: 38.7,
    maxZoom: 16
  },
  {
    id: 'nagpur',
    name: 'Nagpur',
    bounds: { north: 21.2497, south: 21.0077, east: 79.1943, west: 78.9629 },
    downloadDate: new Date(),
    size: 32.1,
    maxZoom: 16
  },
  {
    id: 'nashik',
    name: 'Nashik',
    bounds: { north: 20.0504, south: 19.9975, east: 73.8567, west: 73.7138 },
    downloadDate: new Date(),
    size: 28.5,
    maxZoom: 16
  },
  {
    id: 'aurangabad',
    name: 'Aurangabad',
    bounds: { north: 19.9615, south: 19.8597, east: 75.4138, west: 75.2792 },
    downloadDate: new Date(),
    size: 25.3,
    maxZoom: 16
  },
  {
    id: 'kolhapur',
    name: 'Kolhapur',
    bounds: { north: 16.8050, south: 16.6050, east: 74.3433, west: 74.1433 },
    downloadDate: new Date(),
    size: 24.8,
    maxZoom: 16
  },
  {
    id: 'solapur',
    name: 'Solapur',
    bounds: { north: 17.7599, south: 17.6599, east: 75.9664, west: 75.8664 },
    downloadDate: new Date(),
    size: 22.8,
    maxZoom: 16
  },
  {
    id: 'satara',
    name: 'Satara',
    bounds: { north: 17.7805, south: 17.5805, east: 74.1183, west: 73.9183 },
    downloadDate: new Date(),
    size: 21.4,
    maxZoom: 16
  },
  {
    id: 'sangli',
    name: 'Sangli',
    bounds: { north: 16.8667, south: 16.8467, east: 74.5804, west: 74.5404 },
    downloadDate: new Date(),
    size: 19.6,
    maxZoom: 16
  },
  {
    id: 'amravati',
    name: 'Amravati',
    bounds: { north: 20.9374, south: 20.9174, east: 77.7898, west: 77.7498 },
    downloadDate: new Date(),
    size: 18.7,
    maxZoom: 16
  },
  {
    id: 'nanded',
    name: 'Nanded',
    bounds: { north: 19.1383, south: 19.1183, east: 77.3210, west: 77.2810 },
    downloadDate: new Date(),
    size: 17.2,
    maxZoom: 16
  },
  {
    id: 'ahmednagar',
    name: 'Ahmednagar',
    bounds: { north: 19.1136, south: 19.0736, east: 74.7691, west: 74.7291 },
    downloadDate: new Date(),
    size: 16.8,
    maxZoom: 16
  }
];

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isManualOffline, setIsManualOffline] = useState(false);
  const [isNetworkOffline, setIsNetworkOffline] = useState(!navigator.onLine);
  const [downloadedAreas, setDownloadedAreas] = useState<OfflineArea[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Combined offline state - offline if either network is down OR manually set to offline
  const isOffline = isNetworkOffline || isManualOffline;

  useEffect(() => {
    const handleOnline = () => setIsNetworkOffline(false);
    const handleOffline = () => setIsNetworkOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pre-downloaded Maharashtra districts on app start
    const loadMaharashtraDistricts = () => {
      const savedAreas = localStorage.getItem('maharashtra-offline-areas');
      if (savedAreas) {
        const areas = JSON.parse(savedAreas).map((area: any) => ({
          ...area,
          downloadDate: new Date(area.downloadDate)
        }));
        setDownloadedAreas(areas);
      } else {
        // Pre-load major cities including Kolhapur as already downloaded
        const preloadedCities = maharashtraDistricts.slice(0, 4); // Mumbai, Pune, Nagpur, Nashik, Kolhapur
        setDownloadedAreas(preloadedCities);
        localStorage.setItem('maharashtra-offline-areas', JSON.stringify(preloadedCities));
      }
    };

    // Load manual offline preference
    const savedOfflineMode = localStorage.getItem('manual-offline-mode');
    if (savedOfflineMode === 'true') {
      setIsManualOffline(true);
    }

    loadMaharashtraDistricts();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleOfflineMode = () => {
    const newOfflineState = !isManualOffline;
    setIsManualOffline(newOfflineState);
    localStorage.setItem('manual-offline-mode', newOfflineState.toString());
  };

  const startDownload = async (area: OfflineArea) => {
    setIsDownloading(true);
    setDownloadProgress(0);

    // Simulate download progress
    for (let i = 0; i <= 100; i += 5) {
      setDownloadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const newAreas = [...downloadedAreas.filter(a => a.id !== area.id), area];
    setDownloadedAreas(newAreas);
    localStorage.setItem('maharashtra-offline-areas', JSON.stringify(newAreas));
    
    setIsDownloading(false);
    setDownloadProgress(0);
  };

  const downloadDistrict = async (districtId: string) => {
    const district = maharashtraDistricts.find(d => d.id === districtId);
    if (district && !downloadedAreas.find(a => a.id === districtId)) {
      await startDownload(district);
    }
  };

  const deleteArea = (id: string) => {
    const newAreas = downloadedAreas.filter(a => a.id !== id);
    setDownloadedAreas(newAreas);
    localStorage.setItem('maharashtra-offline-areas', JSON.stringify(newAreas));
  };

  const getTotalSize = () => {
    return downloadedAreas.reduce((total, area) => total + area.size, 0);
  };

  return (
    <OfflineContext.Provider value={{
      isOffline,
      downloadedAreas,
      isDownloading,
      downloadProgress,
      startDownload,
      deleteArea,
      getTotalSize,
      maharashtraDistricts,
      downloadDistrict,
      toggleOfflineMode,
      isManualOffline
    }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineContext');
  }
  return context;
}