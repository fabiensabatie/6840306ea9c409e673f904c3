import React, { useState, useEffect } from 'react';
import Brick, { type UploadedFile, formatFileSize, handleDownload } from './Brick';

export interface DocumentBrickProps {
  document: UploadedFile;
  onSelect?: (document: UploadedFile) => void;
  onDelete?: (document: UploadedFile) => void;
  onAddToSelection?: (document: UploadedFile) => void;
  showAIBadge?: boolean;
  className?: string;
}

export const DocumentBrick: React.FC<DocumentBrickProps> = ({ 
  document, 
  onSelect, 
  onDelete, 
  onAddToSelection,
  showAIBadge = false,
  className = ''
}) => {
  const [isSelected, setIsSelected] = useState(false);

  // Listen for selection updates
  useEffect(() => {
    const handleSelectionUpdate = (event: MessageEvent) => {
      if (event.data?.type === 'contentSelectionUpdated') {
        const isInSelection = event.data.selectedItems.some((item: UploadedFile) => item._id === document._id);
        setIsSelected(isInSelection);
      } else if (event.data?.type === 'clearedSelection') {
        setIsSelected(false);
      }
    };

    window.addEventListener('message', handleSelectionUpdate);
    return () => window.removeEventListener('message', handleSelectionUpdate);
  }, [document._id]);

  const handleDocumentClick = () => {
    if (onSelect) {
      onSelect(document);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(document);
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    handleDownload(document.publicUrl, document.originalName, e);
  };

  const handleAddToSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToSelection) {
      onAddToSelection(document);
    } else {
      window.postMessage({
        type: 'addToContentSelection',
        content: document
      }, '*');
    }
  };

  const handleRemoveFromSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.postMessage({
      type: 'removeFromContentSelection',
      contentId: document._id
    }, '*');
  };

  return (
    <Brick
      onClick={handleDocumentClick}
      onDownload={handleDownloadClick}
      onDelete={handleDeleteClick}
      onAddToSelection={handleAddToSelection}
      onRemoveFromSelection={handleRemoveFromSelection}
      isSelected={isSelected}
      usageCount={document.usageCount}
      tags={document.tags}
      className={className}
    >
      <div className="h-42 lg:h-64 bg-gray-50 flex items-center justify-center overflow-hidden relative group">
        <div className="text-center p-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>

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
          <h4 className="text-sm font-medium text-gray-900 truncate flex-1" title={document.description || document.originalName}>
            {document.description || document.originalName}
          </h4>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">
            {document.metadata.pageCount ? 
              `${document.metadata.pageCount} pages` : 
              formatFileSize(document.size)
            }
          </span>
        </div>
      </div>
    </Brick>
  );
};

export default DocumentBrick; 