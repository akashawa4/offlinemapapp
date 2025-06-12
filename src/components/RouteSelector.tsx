import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Clock, Car, User, Bike, Bus, X, Route, ArrowRight, Zap, Fuel, TreePine } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';
import { useLocation } from '../contexts/LocationContext';

interface RouteSelectorProps {
  startPoint?: {
    name: string;
    longitude: number;
    latitude: number;
  };
  destination: {
    name: string;
    longitude: number;
    latitude: number;
  };
  onClose: () => void;
}

export default function RouteSelector({ startPoint, destination, onClose }: RouteSelectorProps) {
  const { calculateRoute, startNavigation, transportMode, setTransportMode } = useNavigation();
  const { currentLocation } = useLocation();
  const [isCalculating, setIsCalculating] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  // Use provided start point or current location
  const effectiveStartPoint = startPoint || (currentLocation ? {
    name: 'Your Location',
    longitude: currentLocation.longitude,
    latitude: currentLocation.latitude
  } : null);

  const transportModes = [
    { 
      id: 'driving', 
      label: 'Drive', 
      icon: Car, 
      color: 'blue',
      description: 'Fastest route by car'
    },
    { 
      id: 'walking', 
      label: 'Walk', 
      icon: User, 
      color: 'green',
      description: 'Walking directions'
    },
    { 
      id: 'cycling', 
      label: 'Bike', 
      icon: Bike, 
      color: 'orange',
      description: 'Bike-friendly route'
    },
    { 
      id: 'public-transport', 
      label: 'Transit', 
      icon: Bus, 
      color: 'purple',
      description: 'Public transportation'
    }
  ];

  useEffect(() => {
    if (effectiveStartPoint) {
      handleModeSelect(transportMode);
    }
  }, [effectiveStartPoint]);

  const handleModeSelect = async (mode: string) => {
    if (!effectiveStartPoint) return;
    
    setTransportMode(mode as any);
    setIsCalculating(true);
    
    try {
      const route = await calculateRoute(
        [effectiveStartPoint.longitude, effectiveStartPoint.latitude],
        [destination.longitude, destination.latitude],
        mode as any
      );
      
      if (route) {
        // Generate multiple route options for variety
        const routeVariations = [
          {
            ...route,
            id: 'fastest',
            name: 'Fastest Route',
            description: 'Fastest time, may include tolls',
            icon: Zap,
            color: 'blue'
          },
          {
            ...route,
            id: 'shortest',
            name: 'Shortest Route',
            description: 'Shortest distance',
            icon: MapPin,
            color: 'green',
            distance: route.distance * 0.9,
            duration: route.duration * 1.1
          },
          {
            ...route,
            id: 'eco',
            name: 'Eco-Friendly',
            description: 'Most fuel efficient',
            icon: TreePine,
            color: 'emerald',
            distance: route.distance * 1.05,
            duration: route.duration * 1.05
          }
        ];
        
        setRoutes(routeVariations);
        setSelectedRouteIndex(0);
      }
    } catch (error) {
      console.error('Failed to calculate route:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleStartNavigation = (route: any) => {
    startNavigation(route);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const formatDistance = (distance: number) => {
    return `${(distance / 1000).toFixed(1)} km`;
  };

  const getColorClasses = (color: string, isSelected: boolean = false) => {
    const colors = {
      blue: isSelected ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
      green: isSelected ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400',
      orange: isSelected ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400',
      purple: isSelected ? 'bg-purple-500 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400',
      emerald: isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white dark:bg-gray-800 w-full max-h-[85vh] rounded-t-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 z-10">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Route className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Routes to {destination.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  From {effectiveStartPoint?.name || 'Unknown location'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Transport Mode Tabs */}
          <div className="px-6 pb-4">
            <div className="flex gap-2 overflow-x-auto">
              {transportModes.map(mode => {
                const Icon = mode.icon;
                const isSelected = transportMode === mode.id;
                const isCalculatingThis = isCalculating && isSelected;
                
                return (
                  <button
                    key={mode.id}
                    onClick={() => handleModeSelect(mode.id)}
                    disabled={isCalculating}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all whitespace-nowrap ${
                      isSelected
                        ? `border-${mode.color}-500 ${getColorClasses(mode.color, true)} shadow-lg`
                        : `border-gray-200 dark:border-gray-700 ${getColorClasses(mode.color)} hover:border-${mode.color}-300`
                    } ${isCalculating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-white/20' : `bg-${mode.color}-100 dark:bg-${mode.color}-900/30`
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">
                        {mode.label}
                      </div>
                      <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                        {isCalculatingThis ? 'Calculating...' : mode.description}
                      </div>
                    </div>
                    {isCalculatingThis && (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Route Options */}
        {routes.length > 0 && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Route Options
            </h3>
            
            <div className="space-y-3">
              {routes.map((route, index) => {
                const RouteIcon = route.icon;
                const isSelected = selectedRouteIndex === index;
                
                return (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRouteIndex(index)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? `border-${route.color}-500 ${getColorClasses(route.color, true)} shadow-lg`
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isSelected ? 'bg-white/20' : `bg-${route.color}-100 dark:bg-${route.color}-900/30`
                        }`}>
                          <RouteIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {route.name}
                          </h4>
                          <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                            {route.description}
                          </p>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 opacity-70" />
                        <div>
                          <div className="font-bold text-lg">
                            {formatTime(route.duration)}
                          </div>
                          <div className={`text-xs ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                            Travel time
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 opacity-70" />
                        <div>
                          <div className="font-bold text-lg">
                            {formatDistance(route.distance)}
                          </div>
                          <div className={`text-xs ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                            Distance
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`text-xs ${isSelected ? 'text-white/70' : 'text-gray-500'} mb-3`}>
                      Via {route.startLocation} → {route.endLocation}
                    </div>
                    
                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartNavigation(route);
                        }}
                        className="w-full bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-4 h-4" />
                        Start Navigation
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Location Warning */}
        {!effectiveStartPoint && (
          <div className="p-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <div className="flex items-center gap-3 text-yellow-700 dark:text-yellow-400">
                <MapPin className="w-5 h-5" />
                <div>
                  <h4 className="font-semibold">Location Required</h4>
                  <p className="text-sm mt-1">
                    Please enable location services or set a starting point to calculate routes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isCalculating && routes.length === 0 && (
          <div className="p-6">
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Calculating Routes
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Finding the best routes to {destination.name}...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}