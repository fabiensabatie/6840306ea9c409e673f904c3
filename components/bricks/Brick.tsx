import React, { useState } from 'react';

// Base interface for all uploaded files
export interface UploadedFile {
  _id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  fileType: 'image' | 'video' | 'audio' | 'document' | '3d';
  courseId: string;
  courseName: string;
  filePath: string;
  repositoryUrl: string;
  publicUrl: string;
  tags: string[];
  description?: string;
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    bitrate?: number;
    extension: string;
    textContent?: string;
    vertices?: number;
    pageCount?: number;
    // Grid layout metadata
    cols?: number;
    rows?: number;
    bricks?: Array<{ type: string; props: Record<string, any> }>;
  };
  uploadedBy?: string;
  uploadedAt: string;
  updatedAt: string;
  isPublic: boolean;
  usageCount: number;
  lastUsedAt?: string;
}

// Base Brick Component
interface BrickProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onDownload?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onFullscreen?: (e: React.MouseEvent) => void;
  onAddToSelection?: (e: React.MouseEvent) => void;
  onRemoveFromSelection?: (e: React.MouseEvent) => void;
  showActions?: boolean;
  loading?: boolean;
  error?: boolean;
  usageCount?: number;
  tags?: string[];
  isSelected?: boolean;
}

const Brick: React.FC<BrickProps> = ({ 
  children, 
  className = '', 
  onClick,
  onMouseEnter,
  onMouseLeave,
  onDownload,
  onDelete,
  onFullscreen,
  onAddToSelection,
  onRemoveFromSelection,
  showActions = true,
  loading = false,
  error = false,
  usageCount = 0,
  tags = [],
  isSelected = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsHovered(true);
    onMouseEnter?.();
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    setIsHovered(false);
    onMouseLeave?.();
  };

  return (
    <div
      className={`group bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 ${className}`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Content Area */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
            <div className="text-center">
              <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-xs text-gray-500">Failed to load</p>
            </div>
          </div>
        )}

        {children}

        {/* Action Icons */}
        {showActions && (
          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            {onDelete && (
              <button
                onClick={onDelete}
                className="bg-white bg-opacity-90 hover:bg-opacity-100 text-red-600 rounded-full p-1.5 transition-all"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            {onDownload && (
              <button
                onClick={onDownload}
                className="bg-white bg-opacity-90 hover:bg-opacity-100 text-black rounded-full p-1.5 transition-all"
                title="Download"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </button>
            )}
            {onFullscreen && (
              <button
                onClick={onFullscreen}
                className="bg-white bg-opacity-90 hover:bg-opacity-100 text-black rounded-full p-1.5 transition-all"
                title="Fullscreen"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            )}
            
            {(onAddToSelection || onRemoveFromSelection) && (
              <button
                onClick={isSelected ? onRemoveFromSelection : onAddToSelection}
                className={`bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-1.5 transition-all ${
                  isSelected ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'
                }`}
                title={isSelected ? "Remove from Selection" : "Add to Selection"}
              >
                {isSelected ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                  </svg>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer Area */}
      <div className="p-3 h-16 hidden">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 truncate flex-1">
            {/* Title will be provided by children */}
          </h4>
        </div>
        <div className="flex items-center justify-between mt-1">
          {/* Metadata will be provided by children */}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="text-xs text-gray-400">
                +{tags.length - 2}
              </span>
            )}
          </div>
        )}
        {usageCount > 0 && (
          <span className="text-xs text-blue-600 font-medium mt-1 block">
            Used {usageCount}×
          </span>
        )}
      </div>
    </div>
  );
};

// Utility functions
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (seconds?: number) => {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const handleDownload = (url: string, filename: string, e: React.MouseEvent) => {
  e.stopPropagation();
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default Brick; 