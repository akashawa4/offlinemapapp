import React from 'react';
import { Navigation, X, Clock, MapPin, Car, User, Bike, Bus } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';

export default function NavigationPanel() {
  const { 
    isNavigating, 
    currentRoute, 
    stopNavigation, 
    transportMode,
    setTransportMode
  } = useNavigation();

  // Don't render the panel when navigating - we now use simple overlay
  if (isNavigating) {
    return null;
  }

  // Don't render if no route is available
  if (!currentRoute) {
    return null;
  }

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'driving':
        return <Car className="w-4 h-4" />;
      case 'walking':
        return <User className="w-4 h-4" />;
      case 'cycling':
        return <Bike className="w-4 h-4" />;
      case 'public-transport':
        return <Bus className="w-4 h-4" />;
      default:
        return <Car className="w-4 h-4" />;
    }
  };

  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const transportModes = [
    { id: 'driving', label: 'Drive', icon: Car },
    { id: 'walking', label: 'Walk', icon: User },
    { id: 'cycling', label: 'Bike', icon: Bike },
    { id: 'public-transport', label: 'Transit', icon: Bus }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getTransportIcon(transportMode)}
            <Navigation className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {formatTime(currentRoute.duration)} • {formatDistance(currentRoute.distance)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {currentRoute.startLocation} → {currentRoute.endLocation}
            </div>
          </div>
        </div>
        
        <button
          onClick={stopNavigation}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Transport Mode Selector */}
      <div className="px-4 py-2 border-b dark:border-gray-700">
        <div className="flex gap-2 overflow-x-auto">
          {transportModes.map(mode => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setTransportMode(mode.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  transportMode === mode.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Route Summary */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatDistance(currentRoute.distance)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Distance</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatTime(currentRoute.duration)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Time</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {currentRoute.steps.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Steps</div>
          </div>
        </div>
      </div>
    </div>
  );
}