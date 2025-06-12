import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Clock, Star, Navigation, Route, Car, User, Bike, Bus, X, ArrowRight, Phone, Globe, ArrowUpDown, RotateCcw, ChevronDown } from 'lucide-react';
import { useMap } from '../contexts/MapContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useLocation } from '../contexts/LocationContext';
import RouteSelector from './RouteSelector';

interface SearchResult {
  id: string;
  name: string;
  address: string;
  longitude: number;
  latitude: number;
  category?: string;
  isRecent?: boolean;
  isFavorite?: boolean;
  rating?: number;
  phone?: string;
  website?: string;
  openingHours?: string;
  priceLevel?: number;
}

interface RoutePoint {
  name: string;
  address: string;
  longitude: number;
  latitude: number;
}

export default function SearchBar() {
  const [startPoint, setStartPoint] = useState<RoutePoint | null>(null);
  const [endPoint, setEndPoint] = useState<RoutePoint | null>(null);
  const [activeInput, setActiveInput] = useState<'start' | 'end'>('start');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRouteSelector, setShowRouteSelector] = useState(false);
  const [isRouteMode, setIsRouteMode] = useState(false);
  const [routeSelectorDestination, setRouteSelectorDestination] = useState<any>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { setViewport, setSelectedPlace, addMarker, removeMarker, selectedPlace } = useMap();
  const { calculateRoute, startNavigation, transportMode, setTransportMode, currentRoute } = useNavigation();
  const { currentLocation } = useLocation();

  // Enhanced Maharashtra places with more details
  const maharashtraPlaces: SearchResult[] = [
    {
      id: '1',
      name: 'Gateway of India',
      address: 'Apollo Bandar, Colaba, Mumbai, Maharashtra 400001',
      longitude: 72.8347,
      latitude: 18.9220,
      category: 'Tourist Attraction',
      rating: 4.5,
      openingHours: 'Open 24 hours',
      priceLevel: 1
    },
    {
      id: '2',
      name: 'Shaniwar Wada',
      address: 'Shaniwar Peth, Pune, Maharashtra 411030',
      longitude: 73.8567,
      latitude: 18.5196,
      category: 'Historical Site',
      rating: 4.3,
      openingHours: '8:00 AM - 6:30 PM',
      priceLevel: 1
    },
    {
      id: '3',
      name: 'Ajanta Caves',
      address: 'Aurangabad, Maharashtra 431117',
      longitude: 75.7033,
      latitude: 20.5519,
      category: 'UNESCO World Heritage Site',
      rating: 4.6,
      openingHours: '9:00 AM - 5:30 PM',
      priceLevel: 1
    },
    {
      id: '4',
      name: 'Ellora Caves',
      address: 'Aurangabad, Maharashtra 431102',
      longitude: 75.1799,
      latitude: 20.0269,
      category: 'UNESCO World Heritage Site',
      rating: 4.7,
      openingHours: '6:00 AM - 6:00 PM',
      priceLevel: 1
    },
    {
      id: '5',
      name: 'Lonavala',
      address: 'Lonavala, Maharashtra 410401',
      longitude: 73.4062,
      latitude: 18.7537,
      category: 'Hill Station',
      isRecent: true,
      rating: 4.4,
      priceLevel: 2
    },
    {
      id: '6',
      name: 'Mahabaleshwar',
      address: 'Mahabaleshwar, Maharashtra 412806',
      longitude: 73.6581,
      latitude: 17.9244,
      category: 'Hill Station',
      rating: 4.5,
      priceLevel: 2
    },
    {
      id: '7',
      name: 'Shirdi',
      address: 'Shirdi, Maharashtra 423109',
      longitude: 74.4977,
      latitude: 19.7645,
      category: 'Religious Site',
      isFavorite: true,
      rating: 4.8,
      openingHours: '4:00 AM - 11:15 PM',
      priceLevel: 1
    },
    {
      id: '8',
      name: 'Chhatrapati Shivaji Terminus',
      address: 'Fort, Mumbai, Maharashtra 400001',
      longitude: 72.8347,
      latitude: 18.9401,
      category: 'Railway Station',
      rating: 4.4,
      openingHours: 'Open 24 hours',
      priceLevel: 0
    },
    {
      id: '9',
      name: 'Aga Khan Palace',
      address: 'Nagar Road, Pune, Maharashtra 411006',
      longitude: 73.9125,
      latitude: 18.5314,
      category: 'Historical Site',
      rating: 4.2,
      openingHours: '9:00 AM - 5:30 PM',
      priceLevel: 1
    },
    {
      id: '10',
      name: 'Tadoba National Park',
      address: 'Chandrapur, Maharashtra 442401',
      longitude: 79.3210,
      latitude: 20.2120,
      category: 'National Park',
      rating: 4.6,
      openingHours: '6:00 AM - 6:00 PM',
      priceLevel: 2
    },
    {
      id: '11',
      name: 'Kolhapur',
      address: 'Kolhapur, Maharashtra 416001',
      longitude: 74.2433,
      latitude: 16.7050,
      category: 'City',
      rating: 4.3,
      priceLevel: 1
    },
    {
      id: '12',
      name: 'Mahalaxmi Temple Kolhapur',
      address: 'Mahadwar Road, Kolhapur, Maharashtra 416012',
      longitude: 74.2297,
      latitude: 16.6945,
      category: 'Religious Site',
      isFavorite: true,
      rating: 4.7,
      openingHours: '5:00 AM - 10:00 PM',
      priceLevel: 0,
      phone: '+91 231 265 2949'
    },
    {
      id: '13',
      name: 'New Palace Kolhapur',
      address: 'Shahupuri, Kolhapur, Maharashtra 416001',
      longitude: 74.2433,
      latitude: 16.7050,
      category: 'Historical Site',
      rating: 4.1,
      openingHours: '9:30 AM - 6:00 PM',
      priceLevel: 1
    },
    {
      id: '14',
      name: 'Rankala Lake',
      address: 'Rankala, Kolhapur, Maharashtra 416012',
      longitude: 74.2297,
      latitude: 16.6945,
      category: 'Tourist Attraction',
      rating: 4.2,
      openingHours: 'Open 24 hours',
      priceLevel: 0
    },
    {
      id: '15',
      name: 'Panhala Fort',
      address: 'Panhala, Kolhapur, Maharashtra 416201',
      longitude: 74.1089,
      latitude: 16.8089,
      category: 'Historical Site',
      rating: 4.4,
      openingHours: '8:00 AM - 6:00 PM',
      priceLevel: 1
    },
    {
      id: '16',
      name: 'Shree Mahalaxmi Temple',
      address: 'Mahadwar Road, Kolhapur, Maharashtra 416012',
      longitude: 74.2297,
      latitude: 16.6945,
      category: 'Religious Site',
      isFavorite: true,
      rating: 4.7,
      openingHours: '5:00 AM - 10:00 PM',
      priceLevel: 0,
      phone: '+91 231 265 2949'
    },
    {
      id: '17',
      name: 'New Palace Kolhapur',
      address: 'Shahupuri, Kolhapur, Maharashtra 416001',
      longitude: 74.2433,
      latitude: 16.7050,
      category: 'Historical Site',
      rating: 4.1,
      openingHours: '9:30 AM - 6:00 PM',
      priceLevel: 1
    },
    {
      id: '18',
      name: 'Rankala Lake',
      address: 'Rankala, Kolhapur, Maharashtra 416012',
      longitude: 74.2297,
      latitude: 16.6945,
      category: 'Tourist Attraction',
      rating: 4.2,
      openingHours: 'Open 24 hours',
      priceLevel: 0
    },
    {
      id: '19',
      name: 'Panhala Fort',
      address: 'Panhala, Kolhapur, Maharashtra 416201',
      longitude: 74.1089,
      latitude: 16.8089,
      category: 'Historical Site',
      rating: 4.4,
      openingHours: '8:00 AM - 6:00 PM',
      priceLevel: 1
    },
    {
      id: '20',
      name: 'Jyotiba Temple',
      address: 'Jyotiba, Kolhapur, Maharashtra 416229',
      longitude: 74.1089,
      latitude: 16.8089,
      category: 'Religious Site',
      rating: 4.5,
      openingHours: '5:00 AM - 9:00 PM',
      priceLevel: 0
    },
    {
      id: '21',
      name: 'Kopeshwar Temple',
      address: 'Khidrapur, Kolhapur, Maharashtra 416108',
      longitude: 74.1089,
      latitude: 16.8089,
      category: 'Religious Site',
      rating: 4.3,
      openingHours: '6:00 AM - 8:00 PM',
      priceLevel: 0
    },
    {
      id: '22',
      name: 'Binkhambi Ganesh Temple',
      address: 'Binkhambi, Kolhapur, Maharashtra 416012',
      longitude: 74.2297,
      latitude: 16.6945,
      category: 'Religious Site',
      rating: 4.2,
      openingHours: '6:00 AM - 9:00 PM',
      priceLevel: 0
    },
    {
      id: '23',
      name: 'Town Hall Museum',
      address: 'Shahupuri, Kolhapur, Maharashtra 416001',
      longitude: 74.2433,
      latitude: 16.7050,
      category: 'Museum',
      rating: 4.0,
      openingHours: '10:00 AM - 5:00 PM',
      priceLevel: 1
    },
    {
      id: '24',
      name: 'Shalini Palace',
      address: 'Shahupuri, Kolhapur, Maharashtra 416001',
      longitude: 74.2433,
      latitude: 16.7050,
      category: 'Historical Site',
      rating: 4.3,
      openingHours: '9:00 AM - 6:00 PM',
      priceLevel: 1
    },
    {
      id: '25',
      name: 'Bhavani Mandap',
      address: 'Mahadwar Road, Kolhapur, Maharashtra 416012',
      longitude: 74.2297,
      latitude: 16.6945,
      category: 'Historical Site',
      rating: 4.2,
      openingHours: '8:00 AM - 8:00 PM',
      priceLevel: 0
    },
    {
      id: '26',
      name: 'Dajipur Wildlife Sanctuary',
      address: 'Dajipur, Kolhapur, Maharashtra 416208',
      longitude: 73.8500,
      latitude: 16.5000,
      category: 'Wildlife Sanctuary',
      rating: 4.6,
      openingHours: '6:00 AM - 6:00 PM',
      priceLevel: 2
    },
    {
      id: '27',
      name: 'Radhanagari Dam',
      address: 'Radhanagari, Kolhapur, Maharashtra 416212',
      longitude: 73.9833,
      latitude: 16.4167,
      category: 'Tourist Attraction',
      rating: 4.3,
      openingHours: '8:00 AM - 6:00 PM',
      priceLevel: 1
    },
    {
      id: '28',
      name: 'Gaganbawada',
      address: 'Gaganbawada, Kolhapur, Maharashtra 416203',
      longitude: 73.6500,
      latitude: 16.5500,
      category: 'Hill Station',
      rating: 4.4,
      openingHours: 'Open 24 hours',
      priceLevel: 1
    },
    {
      id: '29',
      name: 'Amboli Ghat',
      address: 'Amboli, Kolhapur, Maharashtra 416510',
      longitude: 73.9500,
      latitude: 16.0167,
      category: 'Hill Station',
      rating: 4.5,
      openingHours: 'Open 24 hours',
      priceLevel: 1
    },
    {
      id: '30',
      name: 'Kumbhi Waterfall',
      address: 'Kumbhi, Kolhapur, Maharashtra 416208',
      longitude: 73.8500,
      latitude: 16.5000,
      category: 'Waterfall',
      rating: 4.2,
      openingHours: '8:00 AM - 6:00 PM',
      priceLevel: 1
    },
    {
      id: '31',
      name: 'Shivaji University',
      address: 'Vidyanagar, Kolhapur, Maharashtra 416004',
      longitude: 74.2333,
      latitude: 16.7000,
      category: 'Educational',
      rating: 4.1,
      openingHours: '9:00 AM - 5:00 PM',
      priceLevel: 0
    },
    {
      id: '32',
      name: 'Binkhambi Ganapati Temple',
      address: 'Binkhambi, Kolhapur, Maharashtra 416012',
      longitude: 74.2297,
      latitude: 16.6945,
      category: 'Religious Site',
      rating: 4.2,
      openingHours: '6:00 AM - 9:00 PM',
      priceLevel: 0
    },
    {
      id: '33',
      name: 'Khasbag Maidan',
      address: 'Khasbag, Kolhapur, Maharashtra 416001',
      longitude: 74.2433,
      latitude: 16.7050,
      category: 'Park',
      rating: 4.0,
      openingHours: '6:00 AM - 9:00 PM',
      priceLevel: 0
    },
    {
      id: '34',
      name: 'Shahu Mill',
      address: 'Shahu Mill Compound, Kolhapur, Maharashtra 416001',
      longitude: 74.2433,
      latitude: 16.7050,
      category: 'Historical Site',
      rating: 4.1,
      openingHours: '9:00 AM - 5:00 PM',
      priceLevel: 1
    },
    {
      id: '35',
      name: 'Kolhapur Central Mall',
      address: 'Tararani Chowk, Kolhapur, Maharashtra 416001',
      longitude: 74.2433,
      latitude: 16.7050,
      category: 'Shopping',
      rating: 4.3,
      openingHours: '10:00 AM - 10:00 PM',
      priceLevel: 2
    }
  ];

  // Enhanced Kolhapur-specific suggestions
  const kolhapurSuggestions = [
    'Mahalaxmi Temple',
    'New Palace',
    'Rankala Lake',
    'Panhala Fort',
    'Jyotiba Temple',
    'Kopeshwar Temple',
    'Binkhambi Ganesh',
    'Town Hall Museum',
    'Shalini Palace',
    'Bhavani Mandap',
    'Dajipur Wildlife',
    'Radhanagari Dam',
    'Gaganbawada',
    'Amboli Ghat',
    'Kumbhi Waterfall',
    'Shivaji University',
    'Khasbag Maidan',
    'Shahu Mill',
    'Kolhapur Central Mall'
  ];

  // Add Kolhapur categories for better filtering
  const kolhapurCategories = [
    'Religious Sites',
    'Historical Places',
    'Natural Attractions',
    'Educational',
    'Shopping',
    'Parks & Recreation',
    'Wildlife',
    'Hill Stations',
    'Waterfalls'
  ];

  // Add Kolhapur popular routes
  const kolhapurPopularRoutes = [
    {
      name: 'Temple Circuit',
      places: ['Mahalaxmi Temple', 'Jyotiba Temple', 'Kopeshwar Temple', 'Binkhambi Ganesh']
    },
    {
      name: 'Historical Tour',
      places: ['New Palace', 'Shalini Palace', 'Town Hall Museum', 'Bhavani Mandap']
    },
    {
      name: 'Nature Trail',
      places: ['Rankala Lake', 'Dajipur Wildlife', 'Radhanagari Dam', 'Kumbhi Waterfall']
    },
    {
      name: 'Hill Station Visit',
      places: ['Panhala Fort', 'Gaganbawada', 'Amboli Ghat']
    }
  ];

  const recentSearches = maharashtraPlaces.filter(r => r.isRecent);
  const favorites = maharashtraPlaces.filter(r => r.isFavorite);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set current location as start point when available
  useEffect(() => {
    if (currentLocation && !startPoint) {
      setStartPoint({
        name: 'Your Location',
        address: 'Current GPS location',
        longitude: currentLocation.longitude,
        latitude: currentLocation.latitude
      });
    }
  }, [currentLocation, startPoint]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const estimateTravelTime = (distance: number, mode: string) => {
    let speedKmh = 50;
    switch (mode) {
      case 'driving': speedKmh = 50; break;
      case 'walking': speedKmh = 5; break;
      case 'cycling': speedKmh = 15; break;
      case 'public-transport': speedKmh = 35; break;
    }
    const timeHours = distance / speedKmh;
    const minutes = Math.round(timeHours * 60);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      // First check for exact matches in Kolhapur suggestions
      const kolhapurMatches = kolhapurSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Then search in all places
      const filtered = maharashtraPlaces.filter(result =>
        result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Add distance and travel time if current location is available
      if (currentLocation) {
        const enhancedResults = await Promise.all(
          filtered.map(async (result) => {
            const distance = calculateDistance(
              currentLocation.latitude,
              currentLocation.longitude,
              result.latitude,
              result.longitude
            );
            
            return {
              ...result,
              distance,
              travelTime: estimateTravelTime(distance, transportMode)
            };
          })
        );
        
        // Sort by distance
        enhancedResults.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        setResults(enhancedResults);
      } else {
        setResults(filtered);
      }
      
      setIsLoading(false);
    }, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    handleSearch(value);
  };

  const handleResultClick = async (result: SearchResult) => {
    if (isRouteMode) {
      const routePoint: RoutePoint = {
        name: result.name,
        address: result.address,
        longitude: result.longitude,
        latitude: result.latitude
      };

      if (activeInput === 'start') {
        setStartPoint(routePoint);
      } else {
        setEndPoint(routePoint);
      }

      setQuery('');
      setIsOpen(false);

      // Auto-calculate route if both points are set
      if ((activeInput === 'start' && endPoint) || (activeInput === 'end' && startPoint)) {
        const start = activeInput === 'start' ? routePoint : startPoint!;
        const end = activeInput === 'end' ? routePoint : endPoint!;
        
        try {
          const route = await calculateRoute(
            [start.longitude, start.latitude],
            [end.longitude, end.latitude],
            transportMode
          );
          
          if (route) {
            // Fit map to show entire route
            const bounds = [
              [Math.min(start.longitude, end.longitude) - 0.01, Math.min(start.latitude, end.latitude) - 0.01],
              [Math.max(start.longitude, end.longitude) + 0.01, Math.max(start.latitude, end.latitude) + 0.01]
            ];
            
            setViewport({
              longitude: (start.longitude + end.longitude) / 2,
              latitude: (start.latitude + end.latitude) / 2,
              zoom: 10
            });
          }
        } catch (error) {
          console.error('Failed to calculate route:', error);
        }
      }
    } else {
      // Simple search mode - just show the place
      setViewport({
        longitude: result.longitude,
        latitude: result.latitude,
        zoom: 16
      });

      addMarker({
        id: `search-${result.id}`,
        longitude: result.longitude,
        latitude: result.latitude,
        type: 'search',
        title: result.name,
        description: result.address
      });

      setSelectedPlace({
        id: result.id,
        name: result.name,
        address: result.address,
        longitude: result.longitude,
        latitude: result.latitude,
        category: result.category
      });

      setQuery('');
      setIsOpen(false);
    }
  };

  const handleSwapPoints = () => {
    const temp = startPoint;
    setStartPoint(endPoint);
    setEndPoint(temp);
    
    // Recalculate route if both points exist
    if (startPoint && endPoint) {
      calculateRoute(
        [endPoint.longitude, endPoint.latitude],
        [startPoint.longitude, startPoint.latitude],
        transportMode
      );
    }
  };

  const handleClearRoute = () => {
    setStartPoint(null);
    setEndPoint(null);
    setQuery('');
    removeMarker('route-start');
    removeMarker('route-end');
  };

  const handleGetDirections = () => {
    if (startPoint && endPoint) {
      setShowRouteSelector(true);
    }
  };

  // This is the key fix - use the same logic as MapView for directions from popup
  const handleDirectionsClick = () => {
    if (!selectedPlace) {
      console.log('No selected place for directions');
      return;
    }

    if (!currentLocation) {
      alert('Location is required for navigation. Please enable location services to get directions.');
      return;
    }

    console.log('Opening route selector for selected place:', selectedPlace);
    setRouteSelectorDestination({
      name: selectedPlace.name,
      longitude: selectedPlace.longitude,
      latitude: selectedPlace.latitude
    });
    setShowRouteSelector(true);
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

  const getPriceLevel = (level?: number) => {
    if (!level) return '';
    return '₹'.repeat(level);
  };

  const showSuggestions = isOpen && (query.length > 0 || recentSearches.length > 0 || !isRouteMode);

  const handleSearchBarClick = () => {
    setIsOpen(true);
    if (!isRouteMode && query.length === 0) {
      // Show popular places when clicking on simple search
      setResults(maharashtraPlaces.slice(0, 8));
    }
  };

  const toggleRouteMode = () => {
    setIsRouteMode(!isRouteMode);
    setQuery('');
    setResults([]);
    if (!isRouteMode) {
      setActiveInput('start');
    } else {
      setStartPoint(null);
      setEndPoint(null);
    }
  };

  const handleRouteModalClose = () => {
    setShowRouteSelector(false);
    setRouteSelectorDestination(null);
  };

  return (
    <>
      <div ref={searchRef} className="relative">
        {/* Search Bar Style Button */}
        <div className="mb-2">
          <button
            onClick={toggleRouteMode}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isRouteMode
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-md hover:shadow-lg'
            }`}
          >
            <Search className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="flex-1 text-left">
              {isRouteMode ? 'Route Planning' : 'Search places in Maharashtra...'}
            </span>
            <Route className="w-4 h-4" />
          </button>
        </div>

        {isRouteMode && (
          /* Enhanced Route Planning Search Interface */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Starting Point Input */}
            <div className="flex items-center border-b dark:border-gray-700">
              <div className="w-4 h-4 bg-green-500 rounded-full ml-4 flex-shrink-0"></div>
              <input
                type="text"
                placeholder={startPoint ? startPoint.name : "Choose starting point"}
                value={activeInput === 'start' ? query : (startPoint?.name || '')}
                onChange={activeInput === 'start' ? handleInputChange : undefined}
                onFocus={() => {
                  setActiveInput('start');
                  setIsOpen(true);
                  if (startPoint) setQuery('');
                }}
                className="w-full px-4 py-3 pl-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none"
              />
              {startPoint && activeInput !== 'start' && (
                <button
                  onClick={() => {
                    setStartPoint(null);
                    setActiveInput('start');
                    setQuery('');
                  }}
                  className="mr-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center py-2 border-b dark:border-gray-700">
              <button
                onClick={handleSwapPoints}
                disabled={!startPoint || !endPoint}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>

            {/* Destination Input */}
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full ml-4 flex-shrink-0"></div>
              <input
                type="text"
                placeholder={endPoint ? endPoint.name : "Choose destination"}
                value={activeInput === 'end' ? query : (endPoint?.name || '')}
                onChange={activeInput === 'end' ? handleInputChange : undefined}
                onFocus={() => {
                  setActiveInput('end');
                  setIsOpen(true);
                  if (endPoint) setQuery('');
                }}
                className="w-full px-4 py-3 pl-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none"
              />
              {endPoint && activeInput !== 'end' && (
                <button
                  onClick={() => {
                    setEndPoint(null);
                    setActiveInput('end');
                    setQuery('');
                  }}
                  className="mr-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Transport Mode Selector */}
            {(startPoint || endPoint) && (
              <div className="border-t dark:border-gray-700 px-4 py-3">
                <div className="flex gap-2 overflow-x-auto">
                  {['driving', 'walking', 'cycling', 'public-transport'].map(mode => {
                    const Icon = getTransportIcon(mode);
                    const isSelected = transportMode === mode;
                    
                    return (
                      <button
                        key={mode}
                        onClick={() => setTransportMode(mode as any)}
                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-all ${
                          isSelected
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium capitalize">
                          {mode === 'public-transport' ? 'Transit' : mode}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {startPoint && endPoint && (
              <div className="border-t dark:border-gray-700 px-4 py-3 flex gap-2">
                <button
                  onClick={handleGetDirections}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </button>
                <button
                  onClick={handleClearRoute}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Search Results Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[60vh] overflow-y-auto z-50">
            {/* Your Location Option */}
            {currentLocation && activeInput === 'start' && (
              <button
                onClick={() => handleResultClick({
                  id: 'current-location',
                  name: 'Your Location',
                  address: 'Current GPS location',
                  longitude: currentLocation.longitude,
                  latitude: currentLocation.latitude
                })}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b dark:border-gray-700"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Your Location</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Use current GPS location</p>
                </div>
              </button>
            )}

            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="p-3 border-b dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Searches
                </h3>
                {recentSearches.map(result => (
                  <SearchResultItem
                    key={result.id}
                    result={result}
                    currentLocation={currentLocation}
                    onResultClick={handleResultClick}
                    transportMode={transportMode}
                  />
                ))}
              </div>
            )}

            {/* Popular Places */}
            {!query && (
              <div className="p-3 border-b dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Popular Places in Kolhapur
                </h3>
                {kolhapurSuggestions.slice(0, 8).map(suggestion => {
                  const place = maharashtraPlaces.find(p => p.name.includes(suggestion));
                  if (place) {
                    return (
                      <SearchResultItem
                        key={place.id}
                        result={place}
                        currentLocation={currentLocation}
                        onResultClick={handleResultClick}
                        transportMode={transportMode}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            )}

            {/* Search Results */}
            {query && results.length > 0 && (
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Search Results ({results.length})
                </h3>
                {results.map(result => (
                  <SearchResultItem
                    key={result.id}
                    result={result}
                    currentLocation={currentLocation}
                    onResultClick={handleResultClick}
                    transportMode={transportMode}
                  />
                ))}
              </div>
            )}

            {/* No Results */}
            {query && results.length === 0 && !isLoading && (
              <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-2">No results found</p>
                <p className="text-sm">Try searching for a different place</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showRouteSelector && (
        <RouteSelector
          startPoint={isRouteMode ? startPoint : undefined}
          destination={
            isRouteMode && endPoint
              ? {
                  name: endPoint.name,
                  longitude: endPoint.longitude,
                  latitude: endPoint.latitude
                }
              : routeSelectorDestination || (selectedPlace ? {
                  name: selectedPlace.name,
                  longitude: selectedPlace.longitude,
                  latitude: selectedPlace.latitude
                } : undefined)
          }
          onClose={handleRouteModalClose}
        />
      )}
    </>
  );
}

// Enhanced Search Result Item Component
interface SearchResultItemProps {
  result: SearchResult & { distance?: number; travelTime?: string };
  currentLocation: any;
  onResultClick: (result: SearchResult) => void;
  transportMode: string;
}

function SearchResultItem({ result, currentLocation, onResultClick, transportMode }: SearchResultItemProps) {
  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const getPriceLevel = (level?: number) => {
    if (!level) return '';
    return '₹'.repeat(level);
  };

  return (
    <button
      onClick={() => onResultClick(result)}
      className="w-full flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
    >
      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
        <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{result.name}</h3>
          {result.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />}
          {result.isRecent && <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">{result.address}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          {result.category && (
            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{result.category}</span>
          )}
          {result.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span>{result.rating}</span>
            </div>
          )}
          {result.priceLevel && (
            <span className="text-green-600 dark:text-green-400">{getPriceLevel(result.priceLevel)}</span>
          )}
        </div>
        {result.distance && (
          <div className="flex items-center gap-2 mt-2 text-xs text-blue-600 dark:text-blue-400">
            <Navigation className="w-3 h-3" />
            <span>{formatDistance(result.distance)} • {result.travelTime}</span>
          </div>
        )}
      </div>
    </button>
  );
}