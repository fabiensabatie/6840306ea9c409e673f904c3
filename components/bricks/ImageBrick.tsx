import React, { useState, useEffect } from 'react';
import Brick, { type UploadedFile, formatFileSize, handleDownload } from './Brick';

export interface ImageBrickProps {
  image: UploadedFile;
  onSelect?: (image: UploadedFile) => void;
  onDelete?: (image: UploadedFile) => void;
  onAddToSelection?: (image: UploadedFile) => void;
  showAIBadge?: boolean;
  className?: string;
}

// Fullscreen Modal Components
export const FullscreenImageModal: React.FC<{ src: string; alt: string; onClose: () => void }> = ({ src, alt, onClose }) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center">
      <div className="relative max-w-full max-h-full p-4">
        <img src={src} alt={alt} className="max-w-full max-h-full object-contain" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export const ImageBrick: React.FC<ImageBrickProps> = ({
  image,
  onSelect,
  onDelete,
  onAddToSelection,
  showAIBadge = false,
  className = ''
}) => {
  const [fullscreenImage, setFullscreenImage] = useState<{ src: string; alt: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  // Listen for selection updates
  useEffect(() => {
    const handleSelectionUpdate = (event: MessageEvent) => {
      if (event.data?.type === 'contentSelectionUpdated') {
        const isInSelection = event.data.selectedItems.some((item: UploadedFile) => item._id === image._id);
        setIsSelected(isInSelection);
      } else if (event.data?.type === 'clearedSelection') {
        setIsSelected(false);
      }
    };

    window.addEventListener('message', handleSelectionUpdate);
    return () => window.removeEventListener('message', handleSelectionUpdate);
  }, [image._id]);

  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [image.publicUrl]);

  const handleImageClick = () => {
    if (onSelect) {
      onSelect(image);
    }
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFullscreenImage({ src: image.publicUrl, alt: image.originalName });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(image);
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    handleDownload(image.publicUrl, image.originalName, e);
  };

  const handleImageLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    setError(true);
    setLoading(false);
  };

  const handleAddToSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToSelection) {
      onAddToSelection(image);
    } else {
      window.postMessage({
        type: 'addToContentSelection',
        content: image
      }, '*');
    }
  };

  const handleRemoveFromSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.postMessage({
      type: 'removeFromContentSelection',
      contentId: image._id
    }, '*');
  };

  return (
    <Brick
      onClick={handleImageClick}
      onDownload={handleDownloadClick}
      onDelete={handleDeleteClick}
      onFullscreen={handleFullscreen}
      onAddToSelection={handleAddToSelection}
      onRemoveFromSelection={handleRemoveFromSelection}
      isSelected={isSelected}
      loading={loading}
      error={error}
      usageCount={image.usageCount}
      tags={image.tags}
      className={className}
    >
      <div className="h-42 lg:h-64 bg-gray-100 flex items-center justify-center overflow-hidden relative">
        <img
          src={image.publicUrl}
          alt={image.originalName}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {showAIBadge && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center">
              ✨ AI
            </span>
          </div>
        )}
      </div>

      <div className="p-3 h-16">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 truncate flex-1" title={image.description || image.originalName}>
            {image.description || image.originalName}
          </h4>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">
            {image.metadata.width && image.metadata.height ? 
              `${image.metadata.width}×${image.metadata.height}` : 
              formatFileSize(image.size)
            }
          </span>
        </div>
      </div>

      {fullscreenImage && (
        <FullscreenImageModal
          src={fullscreenImage.src}
          alt={fullscreenImage.alt}
          onClose={() => setFullscreenImage(null)}
        />
      )}
    </Brick>
  );
};

export default ImageBrick; 