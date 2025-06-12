import React, { useState, useEffect } from 'react';
import { Menu, Navigation, Download, Star, MapPin, Settings, Moon, Sun, Wifi, WifiOff, Crosshair, MapPinIcon, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLocation } from '../contexts/LocationContext';
import { useOffline } from '../contexts/OfflineContext';
import { useMap } from '../contexts/MapContext';
import NearbyPlaces from './NearbyPlaces';
import OfflineManager from './OfflineManager';

interface SidePanelProps {
  onOpenSettings: () => void;
}

export default function SidePanel({ onOpenSettings }: SidePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'nearby' | 'offline' | 'favorites'>('nearby');
  const { isDark, toggleTheme } = useTheme();
  const { isTracking, startTracking, stopTracking, error, currentLocation } = useLocation();
  const { isOffline, toggleOfflineMode, isManualOffline } = useOffline();
  const { setViewport } = useMap();

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const panel = document.getElementById('side-panel');
      const menuButton = document.getElementById('menu-button');
      
      if (isOpen && panel && menuButton && 
          !panel.contains(target) && 
          !menuButton.contains(target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close panel on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const tabs = [
    { id: 'nearby', label: 'Nearby', icon: MapPin },
    { id: 'offline', label: 'Offline', icon: Download },
    { id: 'favorites', label: 'Favorites', icon: Star }
  ];

  const handleLocationToggle = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  const handleCenterOnLocation = () => {
    console.log('handleCenterOnLocation called!');
    if (currentLocation) {
      setViewport({
        longitude: currentLocation.longitude,
        latitude: currentLocation.latitude,
        zoom: 18
      });
      console.log('SidePanel: Centering on existing location, dispatching event.', currentLocation);
      window.dispatchEvent(new Event('center-location'));
    } else {
      console.log('SidePanel: No current location, starting tracking.');
      startTracking();
      setTimeout(() => {
        if (!navigator.geolocation) {
          alert('Geolocation is not supported by this browser.');
        } else {
          alert('Unable to get your location. Please enable location permissions in your browser or device settings.');
        }
      }, 5000);
    }
  };

  const getNetworkStatusText = () => {
    if (isManualOffline) {
      return 'Offline Mode (Manual)';
    }
    return isOffline ? 'Network Offline' : 'Online';
  };

  const getNetworkStatusColor = () => {
    if (isManualOffline) {
      return 'bg-orange-500 text-white';
    }
    return isOffline ? 'bg-red-500 text-white' : 'bg-green-500 text-white';
  };

  const handleTabClick = (tabId: 'nearby' | 'offline' | 'favorites') => {
    setActiveTab(tabId);
  };

  const handleMenuClick = () => {
    setIsOpen(!isOpen);
  };

  const handleClosePanel = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Menu Button */}
      <button
        id="menu-button"
        onClick={handleMenuClick}
        className="fixed top-20 left-4 z-20 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg hover:shadow-xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Floating Action Buttons (moved to top right) */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-3">
        {/* Get My Location Button */}
        <button
          onClick={handleCenterOnLocation}
          className={`p-3 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 ${
            currentLocation 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
          title="Get my location"
          aria-label="Center map on my location"
        >
          <MapPinIcon className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg text-gray-700 dark:text-gray-300 hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        
        {/* Network Status Toggle */}
        <button 
          onClick={toggleOfflineMode}
          className={`p-3 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 ${getNetworkStatusColor()} hover:opacity-90`}
          title={`${getNetworkStatusText()} - Click to toggle offline mode`}
          aria-label="Toggle offline mode"
        >
          {isOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
        </button>
      </div>

      {/* Side Panel */}
      {isOpen && (
        <>
          {/* Overlay - Fixed to not interfere with panel scrolling */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={handleClosePanel}
            aria-label="Close menu"
            style={{ pointerEvents: 'auto' }}
          />

          {/* Panel Content - Fixed positioning with proper scroll container */}
          <div 
            id="side-panel"
            className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 z-40 shadow-2xl flex flex-col"
            style={{ pointerEvents: 'auto' }}
          >
            {/* Header - Fixed at top */}
            <div className="flex-shrink-0 p-4 border-b dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Maharashtra Map
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenSettings}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Open settings"
                    aria-label="Open settings"
                  >
                    <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={handleClosePanel}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Close panel"
                    aria-label="Close panel"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Network Status */}
              <div className={`p-3 rounded-lg border ${
                isManualOffline 
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                  : isOffline 
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                    : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${
                    isManualOffline ? 'bg-orange-500' : isOffline ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                  }`}></div>
                  <span className="font-medium text-sm">
                    {getNetworkStatusText()}
                  </span>
                </div>
                <div className="text-xs opacity-75">
                  {isManualOffline 
                    ? 'Using offline maps and cached data'
                    : isOffline 
                      ? 'No internet connection detected'
                      : 'Connected to internet'
                  }
                </div>
                <button
                  onClick={toggleOfflineMode}
                  className="mt-2 text-xs underline opacity-75 hover:opacity-100 transition-opacity"
                >
                  {isManualOffline ? 'Go back online' : 'Switch to offline mode'}
                </button>
              </div>

              {/* Location Status */}
              {currentLocation && (
                <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 text-green-700 dark:text-green-400 text-sm rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></div>
                    <span className="font-medium">
                      {isTracking ? 'Location Tracking Active' : 'Location Available'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                    {currentLocation.accuracy && (
                      <span className="ml-2">±{Math.round(currentLocation.accuracy)}m</span>
                    )}
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="font-medium">Location Error</span>
                  </div>
                  <div className="text-xs">{error}</div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleCenterOnLocation}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 active:scale-95 ${
                    currentLocation
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-400 text-white cursor-not-allowed'
                  }`}
                >
                  <MapPinIcon className="w-4 h-4" />
                  {currentLocation ? 'Center Map' : 'No Location'}
                </button>
                <button
                  onClick={handleLocationToggle}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 active:scale-95 ${
                    isTracking
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {isTracking ? <Navigation className="w-4 h-4" /> : <Crosshair className="w-4 h-4" />}
                  {isTracking ? 'Stop' : 'Track'}
                </button>
              </div>
            </div>

            {/* Tabs - Fixed below header */}
            <div className="flex-shrink-0 flex border-b dark:border-gray-700">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id as any)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex flex-col items-center gap-1 ${
                      activeTab === tab.id
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content - Scrollable container */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {activeTab === 'nearby' && <NearbyPlaces />}
              {activeTab === 'offline' && <OfflineManager />}
              {activeTab === 'favorites' && (
                <div className="p-4 text-center text-gray-600 dark:text-gray-400">
                  <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-2">No favorites yet</p>
                  <p className="text-sm">
                    Tap the star icon on places to save them here
                  </p>
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-left">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">How to add favorites:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Search for a place</li>
                      <li>• Tap on nearby places</li>
                      <li>• Click the star icon to save</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}