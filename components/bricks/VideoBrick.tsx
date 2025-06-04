import React, { useState, useEffect } from 'react';
import Brick, { type UploadedFile, formatFileSize, handleDownload } from './Brick';

export interface VideoBrickProps {
  video: UploadedFile;
  onSelect?: (video: UploadedFile) => void;
  onDelete?: (video: UploadedFile) => void;
  onAddToSelection?: (video: UploadedFile) => void;
  showAIBadge?: boolean;
  className?: string;
}

export const VideoBrick: React.FC<VideoBrickProps> = ({ 
  video, 
  onSelect, 
  onDelete, 
  onAddToSelection,
  showAIBadge = false,
  className = ''
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  // Listen for selection updates
  useEffect(() => {
    const handleSelectionUpdate = (event: MessageEvent) => {
      if (event.data?.type === 'contentSelectionUpdated') {
        const isInSelection = event.data.selectedItems.some((item: UploadedFile) => item._id === video._id);
        setIsSelected(isInSelection);
      } else if (event.data?.type === 'clearedSelection') {
        setIsSelected(false);
      }
    };

    window.addEventListener('message', handleSelectionUpdate);
    return () => window.removeEventListener('message', handleSelectionUpdate);
  }, [video._id]);

  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [video.publicUrl]);

  const handleVideoClick = () => {
    if (onSelect) {
      onSelect(video);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(video);
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    handleDownload(video.publicUrl, video.originalName, e);
  };

  const handleAddToSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToSelection) {
      onAddToSelection(video);
    } else {
      window.postMessage({
        type: 'addToContentSelection',
        content: video
      }, '*');
    }
  };

  const handleRemoveFromSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.postMessage({
      type: 'removeFromContentSelection',
      contentId: video._id
    }, '*');
  };

  const handleVideoLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleVideoError = () => {
    setError(true);
    setLoading(false);
  };

  return (
    <Brick
      onClick={handleVideoClick}
      onDownload={handleDownloadClick}
      onDelete={handleDeleteClick}
      onAddToSelection={handleAddToSelection}
      onRemoveFromSelection={handleRemoveFromSelection}
      isSelected={isSelected}
      loading={loading}
      error={error}
      usageCount={video.usageCount}
      tags={video.tags}
      className={className}
    >
      <div className="h-42 lg:h-64 bg-gray-100 flex items-center justify-center overflow-hidden relative group">
        <div className="w-full h-full relative">
            <video
              src={video.publicUrl}
            className="w-full h-full object-contain bg-black"
            controls
            controlsList="nodownload"
              preload="metadata"
              onLoadedMetadata={handleVideoLoad}
              onError={handleVideoError}
            onClick={(e) => e.stopPropagation()}
          />

          {showAIBadge && (
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center">
                ✨ AI
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 h-16">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 truncate flex-1" title={video.description || video.originalName}>
            {video.description || video.originalName}
          </h4>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">
            {video.metadata.width && video.metadata.height ? 
              `${video.metadata.width}×${video.metadata.height}` : 
              formatFileSize(video.size)
            }
          </span>
        </div>
      </div>
    </Brick>
  );
};

export default VideoBrick; 