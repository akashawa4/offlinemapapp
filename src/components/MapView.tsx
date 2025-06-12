import React, { useRef, useEffect, useState } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl, Source, Layer } from 'react-map-gl/maplibre';
import { useMap } from '../contexts/MapContext';
import { useLocation } from '../contexts/LocationContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useOffline } from '../contexts/OfflineContext';
import { MapPin, Navigation, Wifi, WifiOff, Flag, Play, Star, Phone, Globe, Clock, Car, User, Bike, Bus, X } from 'lucide-react';
import RouteSelector from './RouteSelector';

export default function MapView() {
  const mapRef = useRef(null);
  const { setMapRef, markers, viewport, setViewport, selectedPlace, setSelectedPlace, routePoints, setRoutePoints } = useMap();
  const { currentLocation, isTracking } = useLocation();
  const { isDark } = useTheme();
  const { currentRoute, isNavigating, startNavigation, calculateRoute, transportMode, stopNavigation } = useNavigation();
  const { isOffline, isManualOffline } = useOffline();
  const [showRouteSelector, setShowRouteSelector] = useState(false);
  const [forceShowAccuracyCircle, setForceShowAccuracyCircle] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log('MapView Render: isTracking=', isTracking, 'forceShowAccuracyCircle=', forceShowAccuracyCircle);

  useEffect(() => {
    setMapRef(mapRef.current);
  }, [setMapRef]);

  // Enhanced map style with better rendering
  const getMapStyle = () => {
    return {
      version: 8,
      sources: {
        'osm': {
          type: 'raster',
          tiles: [
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors',
          maxzoom: 19
        }
      },
      layers: [
        {
          id: 'osm',
          type: 'raster',
          source: 'osm',
          paint: {
            'raster-opacity': isDark ? 0.8 : 1,
            'raster-brightness-min': isDark ? 0.2 : 0,
            'raster-brightness-max': isDark ? 0.4 : 1,
            'raster-contrast': isDark ? 0.3 : 0,
            'raster-saturation': isDark ? -0.3 : 0
          }
        }
      ]
    };
  };

  const handleMapClick = (event: any) => {
    const { lng, lat } = event.lngLat;
    
    if (event.type === 'dblclick') {
      const newMarker = {
        id: Date.now().toString(),
        longitude: lng,
        latitude: lat,
        type: 'pin' as const,
        title: 'Custom Pin'
      };
      console.log('Add marker:', newMarker);
    }
  };

  // Auto-center when location is first obtained or when tracking starts
  useEffect(() => {
    if (currentLocation && isTracking) {
      setViewport({
        longitude: currentLocation.longitude,
        latitude: currentLocation.latitude,
        zoom: 18
      });
    }
  }, [currentLocation, isTracking, setViewport]);

  // Listen for custom event to show accuracy circle for 5 seconds ONLY if not tracking or toggle off
  useEffect(() => {
    const handler = () => {
      console.log('center-location event received. Before: isTracking=', isTracking, 'forceShowAccuracyCircle=', forceShowAccuracyCircle);
      if (forceShowAccuracyCircle) {
        // If already showing, hide immediately and clear timeout
        setForceShowAccuracyCircle(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } else if (!isTracking) {
        // If not showing and not tracking, show for 5 seconds
        setForceShowAccuracyCircle(true);
        timeoutRef.current = setTimeout(() => {
          setForceShowAccuracyCircle(false);
          timeoutRef.current = null;
        }, 5000);
      }
      console.log('center-location event received. After: isTracking=', isTracking, 'forceShowAccuracyCircle=', forceShowAccuracyCircle);
    };
    window.addEventListener('center-location', handler);
    return () => {
      window.removeEventListener('center-location', handler);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isTracking, forceShowAccuracyCircle]);

  // Hide accuracy circle if any map or UI button is clicked
  useEffect(() => {
    if (!forceShowAccuracyCircle) return;
    const hideCircle = () => setForceShowAccuracyCircle(false);
    // Listen for clicks on the map and document (for UI buttons)
    const mapEl = document.querySelector('.maplibregl-canvas');
    if (mapEl) mapEl.addEventListener('mousedown', hideCircle);
    document.addEventListener('mousedown', hideCircle);
    return () => {
      if (mapEl) mapEl.removeEventListener('mousedown', hideCircle);
      document.removeEventListener('mousedown', hideCircle);
    };
  }, [forceShowAccuracyCircle]);

  // Handle route calculation when clicking on markers
  const handleMarkerClick = async (marker: any) => {
    if (currentLocation && !isNavigating) {
      const route = await calculateRoute(
        [currentLocation.longitude, currentLocation.latitude],
        [marker.longitude, marker.latitude],
        transportMode
      );
      
      if (route) {
        // Fit map to show entire route
        const bounds = [
          [Math.min(currentLocation.longitude, marker.longitude) - 0.01, Math.min(currentLocation.latitude, marker.latitude) - 0.01],
          [Math.max(currentLocation.longitude, marker.longitude) + 0.01, Math.max(currentLocation.latitude, marker.latitude) + 0.01]
        ];
        
        if (mapRef.current) {
          mapRef.current.fitBounds(bounds, { padding: 50 });
        }

        // Directly start navigation after route calculation
        startNavigation(route);
        // Do NOT set selectedPlace here to prevent popup from showing
        setSelectedPlace(null); // Ensure no popup is active
      }
    }
  };

  // Create route line data for MapLibre with proper formatting
  const routeGeoJSON = currentRoute ? {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: currentRoute.coordinates
      }
    }]
  } : null;

  // Enhanced route styling with better visibility
  const routeLayerStyle = {
    id: 'route',
    type: 'line',
    source: 'route-source',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#4285F4', // Google Maps blue
      'line-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        10, 6,
        15, 10,
        18, 14
      ],
      'line-opacity': 0.9,
      'line-dasharray': [0, 4, 3]
    }
  };

  // Route outline for better visibility
  const routeOutlineLayerStyle = {
    id: 'route-outline',
    type: 'line',
    source: 'route-source',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#FFFFFF',
      'line-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        10, 8,
        15, 14,
        18, 18
      ],
      'line-opacity': 0.8
    }
  };

  // Add route direction arrows
  const routeArrowsLayerStyle = {
    id: 'route-arrows',
    type: 'symbol',
    source: 'route-source',
    layout: {
      'symbol-placement': 'line',
      'symbol-spacing': 200,
      'icon-image': 'arrow',
      'icon-size': 0.5,
      'icon-allow-overlap': true,
      'icon-ignore-placement': true
    }
  };

  // Add route progress layer
  const routeProgressLayerStyle = {
    id: 'route-progress',
    type: 'line',
    source: 'route-source',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#4285F4',
      'line-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        10, 6,
        15, 10,
        18, 14
      ],
      'line-opacity': 1,
      'line-dasharray': [0, 4, 3],
      'line-gradient': [
        'interpolate',
        ['linear'],
        ['line-progress'],
        0, '#4285F4',
        1, '#34A853'
      ]
    }
  };

  // Add route start and end markers
  const routeStartMarkerStyle = {
    id: 'route-start',
    type: 'circle',
    source: 'route-source',
    paint: {
      'circle-radius': 8,
      'circle-color': '#34A853',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#FFFFFF'
    }
  };

  const routeEndMarkerStyle = {
    id: 'route-end',
    type: 'circle',
    source: 'route-source',
    paint: {
      'circle-radius': 8,
      'circle-color': '#EA4335',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#FFFFFF'
    }
  };

  const getOfflineStatusText = () => {
    if (isManualOffline) {
      return 'Offline Mode';
    }
    return isOffline ? 'Network Offline' : 'Online';
  };

  const getOfflineStatusColor = () => {
    if (isManualOffline) {
      return 'bg-orange-500/90';
    }
    return isOffline ? 'bg-red-500/90' : 'bg-green-500/90';
  };

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'driving': return Car;
      case 'walking': return User;
      case 'cycling': return Bike;
      case 'public-transport': return Bus;
      default: return Car;
    }
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

  const formatDistance = (distance: number) => {
    return `${(distance / 1000).toFixed(1)} km`;
  };

  const handleDirectionsClick = () => {
    if (!selectedPlace) {
      console.log('No selected place for directions');
      return;
    }

    if (!currentLocation) {
      alert('Location is required for navigation. Please enable location services to get directions.');
      return;
    }

    console.log('Opening route selector for:', selectedPlace);
    setShowRouteSelector(true);
  };

  const handleStartSimpleNavigation = (route: any) => {
    console.log('Starting simple navigation with route:', route);
    startNavigation(route);
    // Close the popup when navigation starts
    setSelectedPlace(null);
  };

  const handleCloseRouteSelector = () => {
    console.log('Closing route selector');
    setShowRouteSelector(false);
    // Don't automatically close the selected place popup
    // Let user decide if they want to keep it open
  };

  const handlePopupClose = () => {
    console.log('Closing popup');
    setSelectedPlace(null);
    // Also close route selector if it's open
    if (showRouteSelector) {
      setShowRouteSelector(false);
    }
  };

  return (
    <div className="w-full h-full relative">
      <Map
        ref={mapRef}
        {...viewport}
        onMove={evt => setViewport(evt.viewState)}
        onDblClick={handleMapClick}
        mapStyle={getMapStyle()}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        preserveDrawingBuffer={true}
      >
        {/* Navigation Controls */}
        <NavigationControl position="bottom-right" />
        
        {/* Geolocation Control */}
        <GeolocateControl
          position="bottom-right"
          trackUserLocation={isTracking}
          showUserHeading={true}
        />

        {/* Route Source */}
        {currentRoute && (
          <Source
            id="route-source"
            type="geojson"
            data={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: currentRoute.coordinates
              }
            }}
          >
            {/* Route Outline */}
            <Layer {...routeOutlineLayerStyle} />
            
            {/* Route Line */}
            <Layer {...routeLayerStyle} />
            
            {/* Route Progress */}
            <Layer {...routeProgressLayerStyle} />
            
            {/* Route Arrows */}
            <Layer {...routeArrowsLayerStyle} />
            
            {/* Route Start Marker */}
            <Layer {...routeStartMarkerStyle} />
            
            {/* Route End Marker */}
            <Layer {...routeEndMarkerStyle} />
          </Source>
        )}

        {/* Enhanced Current Location Marker */}
        {currentLocation && (
          <Marker 
            longitude={currentLocation.longitude}
            latitude={currentLocation.latitude}
            anchor="bottom"
          >
            <div className="flex flex-col items-center animate-pulse-once">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg transform translate-y-2">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="mt-1 text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full shadow-sm">
                You Are Here
              </div>
            </div>
            {isTracking && (
              <div
                className="absolute rounded-full bg-blue-500 opacity-20"
                style={{
                  width: `${currentLocation.accuracy * 2 * mapRef.current.getScale()}px`,
                  height: `${currentLocation.accuracy * 2 * mapRef.current.getScale()}px`,
                  transform: 'translate(-50%, -50%)',
                  top: '50%',
                  left: '50%',
                  transition: 'all 0.5s ease-out'
                }}
              />
            )}
            {(isTracking || forceShowAccuracyCircle) && currentLocation.accuracy && ( // Only show accuracy circle if tracking or forced
              <div
                className="absolute rounded-full bg-blue-500 opacity-20"
                style={{
                  width: `${currentLocation.accuracy * 2}px`,
                  height: `${currentLocation.accuracy * 2}px`,
                  transform: 'translate(-50%, -50%)',
                  top: '50%',
                  left: '50%',
                  // The size of this div needs to be dynamically adjusted based on map zoom and accuracy
                  // This is a placeholder, actual implementation would require more complex logic
                  // and potentially using a custom layer.
                }}
              />
            )}
          </Marker>
        )}

        {/* Dynamic Markers */}
        {markers.map(marker => (
          <Marker 
            key={marker.id}
            longitude={marker.longitude}
            latitude={marker.latitude}
            anchor="bottom"
            onClick={() => handleMarkerClick(marker)}
          >
            <div 
              className="flex flex-col items-center cursor-pointer transform hover:scale-110 transition-transform"
            >
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              {marker.title && (
                <div className="mt-1 text-xs font-semibold text-white bg-gray-800 px-2 py-1 rounded-full shadow-sm whitespace-nowrap">
                  {marker.title}
                </div>
              )}
            </div>
          </Marker>
        ))}
      </Map>

      {/* Offline Indicator */}
      {!isNavigating && (
        <div className="absolute top-4 right-4 z-10">
          <div className={`${getOfflineStatusColor()} backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 text-sm text-white`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isManualOffline ? 'bg-orange-200' : isOffline ? 'bg-red-200 animate-pulse' : 'bg-green-200'
              }`}></div>
              {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
              <span className="font-medium">{getOfflineStatusText()}</span>
            </div>
            {isManualOffline && (
              <div className="text-xs opacity-75 mt-1">
                Using cached maps
              </div>
            )}
          </div>
        </div>
      )}

      {/* Simple Route Info Panel */}
      {currentRoute && !isNavigating && (
        <div className="absolute bottom-6 left-4 right-4 z-10">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-5 mx-auto max-w-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  {React.createElement(getTransportIcon(transportMode), { className: "w-5 h-5 text-blue-600 dark:text-blue-400" })}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Route to Destination
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {transportMode === 'public-transport' ? 'Public Transit' : transportMode}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatDistance(currentRoute.distance)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Distance</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatTime(currentRoute.duration)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Duration</div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-500 mb-4 text-center">
              Via {currentRoute.startLocation} → {currentRoute.endLocation}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleStartSimpleNavigation(currentRoute)}
                className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <Navigation className="w-5 h-5" />
                Start Navigation
              </button>
              
              <button
                onClick={stopNavigation}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simple Navigation Status */}
      {isNavigating && currentRoute && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 max-w-sm w-full mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                  <Navigation className="w-4 h-4" />
                </div>
                
                <div className="flex-1">
                  <div className="font-bold text-sm text-gray-900 dark:text-white">
                    Navigating to {currentRoute.endLocation}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {formatDistance(currentRoute.distance)} • {formatTime(currentRoute.duration)}
                  </div>
                </div>
              </div>

              <button
                onClick={stopNavigation}
                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Attribution */}
      <div className="absolute bottom-2 left-2 z-10">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-600 dark:text-gray-400">
          © OpenStreetMap contributors
        </div>
      </div>

      {/* Route Selector Modal - This will now show when clicking Get Directions from popup */}
      {showRouteSelector && selectedPlace && (
        <RouteSelector
          destination={{
            name: selectedPlace.name,
            longitude: selectedPlace.longitude,
            latitude: selectedPlace.latitude
          }}
          onClose={handleCloseRouteSelector}
        />
      )}
    </div>
  );
}