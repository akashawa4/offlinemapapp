import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationStep {
  instruction: string;
  distance: number;
  duration: number;
  type: 'turn-left' | 'turn-right' | 'straight' | 'u-turn' | 'merge';
  coordinates: [number, number];
}

interface Route {
  id: string;
  coordinates: [number, number][];
  distance: number; // in meters
  duration: number; // in seconds
  steps: NavigationStep[];
  mode: TransportMode;
  startLocation: string;
  endLocation: string;
}

type TransportMode = 'driving' | 'walking' | 'cycling' | 'public-transport';

interface NavigationContextType {
  isNavigating: boolean;
  currentRoute: Route | null;
  currentStepIndex: number;
  transportMode: TransportMode;
  startNavigation: (route: Route) => void;
  stopNavigation: () => void;
  nextStep: () => void;
  setTransportMode: (mode: TransportMode) => void;
  calculateRoute: (start: [number, number], end: [number, number], mode: TransportMode) => Promise<Route | null>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [transportMode, setTransportMode] = useState<TransportMode>('driving');

  const startNavigation = (route: Route) => {
    console.log('Starting navigation with route:', route);
    setCurrentRoute(route);
    setCurrentStepIndex(0);
    setIsNavigating(true);
  };

  const stopNavigation = () => {
    console.log('Stopping navigation');
    setIsNavigating(false);
    setCurrentRoute(null);
    setCurrentStepIndex(0);
  };

  const nextStep = () => {
    if (currentRoute && currentStepIndex < currentRoute.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else if (currentRoute && currentStepIndex === currentRoute.steps.length - 1) {
      // Navigation completed
      setIsNavigating(false);
      alert('You have arrived at your destination!');
    }
  };

  const calculateRoute = async (
    start: [number, number], 
    end: [number, number], 
    mode: TransportMode
  ): Promise<Route | null> => {
    try {
      console.log('Calculating route from', start, 'to', end, 'with mode', mode);
      
      // OSRM expects coordinates in [longitude, latitude] format
      const waypoints = `${start[0]},${start[1]};${end[0]},${end[1]}`;
      let osrmProfile = 'car';
      switch (mode) {
        case 'driving':
          osrmProfile = 'car';
          break;
        case 'walking':
          osrmProfile = 'foot';
          break;
        case 'cycling':
          osrmProfile = 'bike';
          break;
        case 'public-transport':
          osrmProfile = 'car'; // OSRM doesn't have public transport, default to car
          break;
      }
      const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${waypoints}?overview=full&geometries=geojson&steps=true`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 'Ok') {
        console.error('OSRM Error:', data.message);
        return null;
      }

      const route = data.routes[0];
      const coordinates = route.geometry.coordinates;
      const distance = route.distance; // meters
      const duration = route.duration; // seconds

      const steps: NavigationStep[] = route.legs[0].steps.map((step: any) => ({
        instruction: step.maneuver.instruction,
        distance: step.distance,
        duration: step.duration,
        type: step.maneuver.type, // OSRM has various types, may need mapping
        coordinates: step.maneuver.location,
      }));

      return {
        id: Math.random().toString(36).substring(7), // Generate a random ID
        coordinates,
        distance,
        duration,
        steps,
        mode,
        startLocation: 'Your Location', // OSRM doesn't provide names directly, placeholder
        endLocation: 'Destination', // OSRM doesn't provide names directly, placeholder
      };

    } catch (error) {
      console.error('Failed to calculate route with OSRM:', error);
      return null;
    }
  };

  const handleTransportModeChange = async (mode: TransportMode) => {
    setTransportMode(mode);
    // Re-calculate route if there's an active route, otherwise just update mode
    // This logic might need to be adjusted based on how you want to handle route re-calculation
  };

  const value = {
    isNavigating,
    currentRoute,
    currentStepIndex,
    transportMode,
    startNavigation,
    stopNavigation,
    nextStep,
    setTransportMode,
    calculateRoute,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}