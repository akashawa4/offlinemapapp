import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MapContextType {
  mapRef: any;
  setMapRef: (ref: any) => void;
  markers: Marker[];
  addMarker: (marker: Marker) => void;
  removeMarker: (id: string) => void;
  viewport: ViewState;
  setViewport: (viewport: ViewState) => void;
  selectedPlace: Place | null;
  setSelectedPlace: (place: Place | null) => void;
  routePoints: RoutePoint[];
  setRoutePoints: (points: RoutePoint[]) => void;
}

interface Marker {
  id: string;
  longitude: number;
  latitude: number;
  title?: string;
  description?: string;
  type: 'pin' | 'search' | 'favorite';
}

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

interface Place {
  id: string;
  name: string;
  address: string;
  longitude: number;
  latitude: number;
  category?: string;
}

interface RoutePoint {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  type: 'start' | 'end' | 'waypoint';
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: ReactNode }) {
  const [mapRef, setMapRef] = useState<any>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  // Center on Maharashtra, India (Mumbai coordinates)
  const [viewport, setViewport] = useState<ViewState>({
    longitude: 75.7139,
    latitude: 19.7515,
    zoom: 7
  });
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);

  const addMarker = (marker: Marker) => {
    setMarkers(prev => [...prev.filter(m => m.id !== marker.id), marker]);
  };

  const removeMarker = (id: string) => {
    setMarkers(prev => prev.filter(m => m.id !== id));
  };

  return (
    <MapContext.Provider value={{
      mapRef,
      setMapRef,
      markers,
      addMarker,
      removeMarker,
      viewport,
      setViewport,
      selectedPlace,
      setSelectedPlace,
      routePoints,
      setRoutePoints
    }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within MapProvider');
  }
  return context;
}