import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import SearchBar from './components/SearchBar';
import SidePanel from './components/SidePanel';
import NavigationPanel from './components/NavigationPanel';
import SettingsModal from './components/SettingsModal';
import { MapProvider } from './contexts/MapContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LocationProvider } from './contexts/LocationContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { NavigationProvider } from './contexts/NavigationContext';

function App() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <ThemeProvider>
      <LocationProvider>
        <OfflineProvider>
          <NavigationProvider>
            <MapProvider>
              <div className="h-screen bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                {/* Map Container */}
                <div className="absolute inset-0">
                  <MapView />
                </div>

                {/* Search Bar */}
                <div className="absolute top-4 left-4 right-4 z-10">
                  <div className="max-w-md mx-auto">
                    <SearchBar />
                  </div>
                </div>

                {/* Side Panel */}
                <SidePanel onOpenSettings={() => setShowSettings(true)} />

                {/* Navigation Panel */}
                <NavigationPanel />

                {/* Settings Modal */}
                {showSettings && (
                  <SettingsModal onClose={() => setShowSettings(false)} />
                )}
              </div>
            </MapProvider>
          </NavigationProvider>
        </OfflineProvider>
      </LocationProvider>
    </ThemeProvider>
  );
}

export default App;