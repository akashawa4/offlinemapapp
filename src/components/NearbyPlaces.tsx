import React, { useState } from 'react';
import { MapPin, Clock, Star, Navigation, Phone, Globe, Heart, Route } from 'lucide-react';
import { useMap } from '../contexts/MapContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useLocation } from '../contexts/LocationContext';
import RouteSelector from './RouteSelector';

interface NearbyPlace {
  id: string;
  name: string;
  category: string;
  distance: number; // in meters
  rating: number;
  isOpen: boolean;
  longitude: number;
  latitude: number;
  phone?: string;
  website?: string;
  isFavorite?: boolean;
}

const categories = [
  'All',
  'Restaurants',
  'Temples',
  'Tourist Attractions',
  'Hotels',
  'Hospitals',
  'ATMs',
  'Petrol Pumps'
];

// Maharashtra-specific nearby places
const maharashtraNearbyPlaces: NearbyPlace[] = [
  {
    id: '1',
    name: 'Shree Siddhivinayak Temple',
    category: 'Temples',
    distance: 500,
    rating: 4.8,
    isOpen: true,
    longitude: 72.8311,
    latitude: 19.0176,
    phone: '+91 22 2422 4785'
  },
  {
    id: '2',
    name: 'Trishna Restaurant',
    category: 'Restaurants',
    distance: 300,
    rating: 4.6,
    isOpen: true,
    longitude: 72.8347,
    latitude: 18.9220,
    phone: '+91 22 2270 3213',
    website: 'trishna.com'
  },
  {
    id: '3',
    name: 'Hotel Taj Mahal Palace',
    category: 'Hotels',
    distance: 800,
    rating: 4.9,
    isOpen: true,
    longitude: 72.8331,
    latitude: 18.9216,
    phone: '+91 22 6665 3366',
    website: 'tajhotels.com'
  },
  {
    id: '4',
    name: 'Kokilaben Dhirubhai Ambani Hospital',
    category: 'Hospitals',
    distance: 1200,
    rating: 4.4,
    isOpen: true,
    longitude: 72.8347,
    latitude: 19.1136,
    phone: '+91 22 4269 6969'
  },
  {
    id: '5',
    name: 'HDFC Bank ATM',
    category: 'ATMs',
    distance: 150,
    rating: 4.0,
    isOpen: true,
    longitude: 72.8340,
    latitude: 18.9200
  },
  {
    id: '6',
    name: 'Bharat Petroleum',
    category: 'Petrol Pumps',
    distance: 600,
    rating: 4.2,
    isOpen: true,
    longitude: 72.8380,
    latitude: 18.9250,
    phone: '+91 22 2345 6789'
  },
  {
    id: '7',
    name: 'Marine Drive',
    category: 'Tourist Attractions',
    distance: 400,
    rating: 4.7,
    isOpen: true,
    longitude: 72.8239,
    latitude: 18.9434,
    isFavorite: true
  },
  {
    id: '8',
    name: 'Saravanaa Bhavan',
    category: 'Restaurants',
    distance: 700,
    rating: 4.3,
    isOpen: true,
    longitude: 72.8310,
    latitude: 18.9180,
    phone: '+91 22 2204 2755'
  }
];

export default function NearbyPlaces() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [places, setPlaces] = useState<NearbyPlace[]>(maharashtraNearbyPlaces);
  const [showRouteSelector, setShowRouteSelector] = useState<NearbyPlace | null>(null);
  const { setViewport, addMarker, setSelectedPlace } = useMap();
  const { calculateRoute, startNavigation, transportMode } = useNavigation();
  const { currentLocation } = useLocation();

  const filteredPlaces = selectedCategory === 'All' 
    ? places 
    : places.filter(place => place.category === selectedCategory);

  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${distance}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const handlePlaceClick = async (place: NearbyPlace) => {
    // Center map on the place
    setViewport({
      longitude: place.longitude,
      latitude: place.latitude,
      zoom: 16
    });

    // Add marker
    addMarker({
      id: `nearby-${place.id}`,
      longitude: place.longitude,
      latitude: place.latitude,
      type: 'search',
      title: place.name,
      description: `${place.category} • ${formatDistance(place.distance)} away`
    });

    // Directly calculate and show route if location is available
    if (currentLocation) {
      try {
        const route = await calculateRoute(
          [currentLocation.longitude, currentLocation.latitude],
          [place.longitude, place.latitude],
          transportMode
        );
        
        if (route) {
          startNavigation(route);
        }
      } catch (error) {
        console.error('Failed to calculate route:', error);
      }
    }
  };

  const handleRouteClick = (place: NearbyPlace, event: React.MouseEvent) => {
    event.stopPropagation();
    setShowRouteSelector(place);
  };

  const handleQuickNavigate = async (place: NearbyPlace, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!currentLocation) {
      alert('Location is required for navigation. Please enable location services.');
      return;
    }

    try {
      const route = await calculateRoute(
        [currentLocation.longitude, currentLocation.latitude],
        [place.longitude, place.latitude],
        transportMode
      );
      
      if (route) {
        startNavigation(route);
        handlePlaceClick(place); // Also show the place on map
      }
    } catch (error) {
      console.error('Failed to start navigation:', error);
      alert('Failed to calculate route. Please try again.');
    }
  };

  const toggleFavorite = (placeId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setPlaces(prev => prev.map(place => 
      place.id === placeId 
        ? { ...place, isFavorite: !place.isFavorite }
        : place
    ));
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="p-4">
      {/* Category Filter */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Categories
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Places List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedCategory === 'All' ? 'All Places' : selectedCategory}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {filteredPlaces.length} found
          </span>
        </div>

        {filteredPlaces.map(place => (
          <div
            key={place.id}
            onClick={() => handlePlaceClick(place)}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {place.name}
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {place.rating}
                    </span>
                  </div>
                  <button
                    onClick={(e) => toggleFavorite(place.id, e)}
                    className={`p-1 rounded-full transition-colors ${
                      place.isFavorite 
                        ? 'text-red-500 hover:text-red-600' 
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-3 h-3 ${place.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {formatDistance(place.distance)}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className={place.isOpen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {place.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {place.category}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {place.phone && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`tel:${place.phone}`, '_blank');
                        }}
                        className="p-1 rounded-full text-gray-400 hover:text-blue-500 transition-colors"
                        title="Call"
                      >
                        <Phone className="w-3 h-3" />
                      </button>
                    )}
                    
                    {place.website && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://${place.website}`, '_blank');
                        }}
                        className="p-1 rounded-full text-gray-400 hover:text-blue-500 transition-colors"
                        title="Website"
                      >
                        <Globe className="w-3 h-3" />
                      </button>
                    )}
                    
                    <button 
                      onClick={(e) => handleRouteClick(place, e)}
                      className="p-1 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                      title="Route options"
                    >
                      <Route className="w-3 h-3" />
                    </button>
                    
                    <button 
                      onClick={(e) => handleQuickNavigate(place, e)}
                      className="p-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                      title="Quick navigate"
                    >
                      <Navigation className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlaces.length === 0 && (
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
            No {selectedCategory.toLowerCase()} found nearby
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Try searching in a different area of Maharashtra
          </p>
          <button
            onClick={() => setSelectedCategory('All')}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
          >
            Show All Places
          </button>
        </div>
      )}

      {/* Route Selector Modal */}
      {showRouteSelector && (
        <RouteSelector
          destination={{
            name: showRouteSelector.name,
            longitude: showRouteSelector.longitude,
            latitude: showRouteSelector.latitude
          }}
          onClose={() => setShowRouteSelector(null)}
        />
      )}
    </div>
  );
}