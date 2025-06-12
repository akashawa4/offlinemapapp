import React, { useState } from 'react';
import { Download, Trash2, Plus, MapPin, HardDrive, Map, Check, X } from 'lucide-react';
import { useOffline } from '../contexts/OfflineContext';
import { useMap } from '../contexts/MapContext';

export default function OfflineManager() {
  const { 
    downloadedAreas, 
    isDownloading, 
    downloadProgress, 
    startDownload, 
    deleteArea, 
    getTotalSize,
    maharashtraDistricts,
    downloadDistrict
  } = useOffline();
  const { viewport, setViewport } = useMap();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [areaName, setAreaName] = useState('');
  const [maxZoom, setMaxZoom] = useState(16);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDownloadCurrentArea = async () => {
    if (!areaName.trim()) {
      alert('Please enter an area name');
      return;
    }

    const area = {
      id: Date.now().toString(),
      name: areaName.trim(),
      bounds: {
        north: viewport.latitude + 0.1,
        south: viewport.latitude - 0.1,
        east: viewport.longitude + 0.1,
        west: viewport.longitude - 0.1
      },
      downloadDate: new Date(),
      size: Math.floor(Math.random() * 50) + 20,
      maxZoom
    };

    await startDownload(area);
    setShowDownloadModal(false);
    setAreaName('');
  };

  const handleDistrictClick = (district: any) => {
    setViewport({
      longitude: (district.bounds.east + district.bounds.west) / 2,
      latitude: (district.bounds.north + district.bounds.south) / 2,
      zoom: 10
    });
  };

  const handleDownloadDistrict = async (districtId: string) => {
    if (!isDownloading) {
      await downloadDistrict(districtId);
    }
  };

  const handleDeleteArea = (areaId: string) => {
    setShowDeleteConfirm(areaId);
  };

  const confirmDelete = (areaId: string) => {
    deleteArea(areaId);
    setShowDeleteConfirm(null);
  };

  const formatSize = (size: number) => {
    return `${size.toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isDistrictDownloaded = (districtId: string) => {
    return downloadedAreas.some(area => area.id === districtId);
  };

  const handleModalClose = () => {
    setShowDownloadModal(false);
    setAreaName('');
  };

  return (
    <div className="p-4">
      {/* Maharashtra State Info */}
      <div className="bg-gradient-to-r from-orange-50 to-green-50 dark:from-orange-900/20 dark:to-green-900/20 rounded-lg p-4 mb-4 border border-orange-200 dark:border-orange-800">
        <div className="flex items-center gap-3 mb-2">
          <Map className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Maharashtra State Map
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Complete offline maps for all districts
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Area:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">307,713 km²</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Districts:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">36</span>
          </div>
        </div>
      </div>

      {/* Storage Info */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <HardDrive className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Storage Used
          </span>
        </div>
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          {formatSize(getTotalSize())}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {downloadedAreas.length} areas downloaded
        </div>
      </div>

      {/* Download Progress */}
      {isDownloading && (
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 mb-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Downloading...
            </span>
            <span className="text-sm text-blue-600 dark:text-blue-400">
              {downloadProgress}%
            </span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Please wait while we download the map data...
          </div>
        </div>
      )}

      {/* Maharashtra Districts */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Maharashtra Districts
        </h3>
        
        <div className="grid grid-cols-1 gap-2">
          {maharashtraDistricts.map(district => (
            <div
              key={district.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => handleDistrictClick(district)}
              >
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {district.name}
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Size: {formatSize(district.size)}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isDistrictDownloaded(district.id) ? (
                  <>
                    <div className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Downloaded
                    </div>
                    <button
                      onClick={() => handleDeleteArea(district.id)}
                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete offline data"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleDownloadDistrict(district.id)}
                    disabled={isDownloading}
                    className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Download for offline use"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Area Download */}
      <button
        onClick={() => setShowDownloadModal(true)}
        disabled={isDownloading}
        className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mb-4"
      >
        <Plus className="w-4 h-4" />
        Download Custom Area
      </button>

      {/* Downloaded Areas */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Downloaded Areas
        </h3>
        
        {downloadedAreas.map(area => (
          <div
            key={area.id}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {area.name}
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-1">
                  <div>Size: {formatSize(area.size)}</div>
                  <div>Downloaded: {formatDate(area.downloadDate)}</div>
                  <div>Max Zoom: {area.maxZoom}</div>
                </div>
              </div>
              
              <button
                onClick={() => handleDeleteArea(area.id)}
                className="ml-3 p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Delete offline data"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {downloadedAreas.length === 0 && (
          <div className="text-center py-8">
            <Download className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
              No offline areas downloaded
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Download Maharashtra districts for offline use
            </p>
          </div>
        )}
      </div>

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Download Custom Area
              </h3>
              <button
                onClick={handleModalClose}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Area Name *
                </label>
                <input
                  type="text"
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  placeholder="Enter area name"
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maximum Zoom Level: {maxZoom}
                </label>
                <input
                  type="range"
                  min="10"
                  max="18"
                  value={maxZoom}
                  onChange={(e) => setMaxZoom(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Lower detail (smaller size)</span>
                  <span>Higher detail (larger size)</span>
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  This will download the current map view area for offline use. Higher zoom levels will result in larger download sizes.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleModalClose}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadCurrentArea}
                disabled={!areaName.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete Offline Data
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete this offline area? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}