import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

interface LocationContextType {
  currentLocation: Location | null;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  error: string | null;
  locationHistory: Location[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [locationHistory, setLocationHistory] = useState<Location[]>([]);

  // Auto-request location permission when app starts
  useEffect(() => {
    const requestLocationOnStart = async () => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by this browser');
        return;
      }

      try {
        // Request permission immediately with high accuracy settings
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            };
            setCurrentLocation(newLocation);
            setLocationHistory(prev => [...prev.slice(-9), newLocation]);
            setError(null);
          },
          (error) => {
            // Don't set error for permission denied on startup
            if (error.code !== error.PERMISSION_DENIED) {
              let errorMessage = 'Unable to get location: ';
              switch (error.code) {
                case error.POSITION_UNAVAILABLE:
                  errorMessage += 'Location information unavailable. Try moving to an area with better GPS signal.';
                  break;
                case error.TIMEOUT:
                  errorMessage += 'Location request timed out. Please try again.';
                  break;
                default:
                  errorMessage += error.message;
                  break;
              }
              setError(errorMessage);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 15000, // Increased timeout
            maximumAge: 0 // Don't use cached location
          }
        );
      } catch (err) {
        console.log('Error requesting location on startup:', err);
      }
    };

    requestLocationOnStart();
  }, []);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsTracking(true);
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 15000, // Increased timeout for better accuracy
      maximumAge: 0 // Always get fresh location
    };

    const handleSuccess = (position: GeolocationPosition) => {
      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };
      
      // Only update if accuracy is reasonable (less than 100 meters) or if it's the first location
      if (!currentLocation || (position.coords.accuracy && position.coords.accuracy < 100)) {
        setCurrentLocation(newLocation);
        setLocationHistory(prev => [...prev.slice(-9), newLocation]); // Keep last 10 locations
        setError(null);
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = 'Location error: ';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += 'Location access denied. Please enable location permissions in your browser settings.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += 'Location information unavailable. Please check your GPS signal and try again.';
          break;
        case error.TIMEOUT:
          errorMessage += 'Location request timed out. Please try again.';
          break;
        default:
          errorMessage += error.message;
          break;
      }
      setError(errorMessage);
      setIsTracking(false);
    };

    // Get initial position with high accuracy
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);

    // Start watching position with high accuracy
    const id = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
    setError(null);
  };

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <LocationContext.Provider value={{
      currentLocation,
      isTracking,
      startTracking,
      stopTracking,
      error,
      locationHistory
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
}