import React, { useEffect, useState } from 'react';

interface EditableElement {
  element: HTMLElement;
  type: 'text' | 'html' | 'empty';
  rect: DOMRect;
}

const EditableOverlay: React.FC = () => {
  const [hoveredElement, setHoveredElement] = useState<EditableElement | null>(null);
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Listen for drag state changes from parent window
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'dragStateChange') {
        setIsDragging(e.data.isDragging);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Update last mouse position
      const rect = document.body.getBoundingClientRect();
      const globalX = rect.left + e.clientX;
      const globalY = rect.top + e.clientY;
      setLastMousePosition({ x: globalX, y: globalY });

      // Send position update to parent window for ContentSelection
      if (window.parent) {
        window.parent.postMessage({
          type: 'updateContentSelectionPosition',
          position: { x: globalX, y: globalY }
        }, '*');
      }

      // If dragging is in progress, forward mouse position to parent
      if (isDragging && window.parent) {
        window.parent.postMessage({
          type: 'updateDragPosition',
          position: {
            x: globalX,
            y: globalY
          }
        }, '*');
      }

      const target = e.target as HTMLElement;
      const brickElement = target.closest('[data-brick-type]') as HTMLElement;
      const overlayElement = target.closest('.brick-overlay') as HTMLElement;
      
      // Clear any pending hide timeout
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        setHideTimeout(null);
      }
      
      if (brickElement) {
        const brickType = brickElement.getAttribute('data-brick-type') as 'text' | 'html' | 'empty';
        const rect = brickElement.getBoundingClientRect();
        
        setHoveredElement({
          element: brickElement,
          type: brickType,
          rect
        });
        
        setOverlayPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      } else if (!overlayElement && hoveredElement) {
        // Mouse is not over a brick element
        // Set a timeout to hide the overlay with a small delay
        const timeout = setTimeout(() => {
          setHoveredElement(null);
        }, 200); // 200ms delay
        setHideTimeout(timeout);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    // Send initial position
    if (window.parent) {
      window.parent.postMessage({
        type: 'updateContentSelectionPosition',
        position: lastMousePosition
      }, '*');
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [hoveredElement, hideTimeout, isDragging, lastMousePosition]);

  const handleEmptyBrickClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!hoveredElement || hoveredElement.type !== 'empty') return;
    
    // Get the brick ID from the element's data attribute
    const brickId = hoveredElement.element.getAttribute('data-brick-id');
    
    // Send message to parent window (CourseEditor) to expand ContentLibrary
    if (window.parent) {
      window.parent.postMessage({
        type: 'expandContentLibrary',
        elementData: {
          tagName: hoveredElement.element.tagName,
          className: hoveredElement.element.className,
          rect: hoveredElement.rect,
          elementType: 'empty',
          brickType: hoveredElement.type,
          brickId: brickId || `empty-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now()
        }
      }, '*');
    }
  };

  const handleContentBrickClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!hoveredElement || hoveredElement.type === 'empty') return;
    
    // Send message to parent window for content editing
    if (window.parent) {
      window.parent.postMessage({
        type: 'editBrickContent',
        elementData: {
          tagName: hoveredElement.element.tagName,
          className: hoveredElement.element.className,
          rect: hoveredElement.rect,
          elementType: hoveredElement.type,
          brickType: hoveredElement.type,
          content: hoveredElement.element.textContent || hoveredElement.element.innerHTML
        }
      }, '*');
    }
  };

  if (!hoveredElement) return null;

  const isEmptyBrick = hoveredElement.type === 'empty';
  const isTextBrick = hoveredElement.type === 'text';
  const isHtmlBrick = hoveredElement.type === 'html';

  return (
    <>
      {/* Overlay - Different colors for different brick types */}
      <div
        className={`brick-overlay fixed pointer-events-none z-40 rounded-md transition-all duration-150 ${
          isEmptyBrick 
            ? 'bg-green-500 opacity-30 border-2 border-green-500 border-opacity-70' 
            : isTextBrick
            ? 'bg-blue-500 opacity-20 border-2 border-blue-500 border-opacity-50'
            : 'bg-purple-500 opacity-20 border-2 border-purple-500 border-opacity-50'
        }`}
        style={{
          top: overlayPosition.top - (isEmptyBrick ? 4 : 0),
          left: overlayPosition.left - (isEmptyBrick ? 4 : 0),
          width: overlayPosition.width + (isEmptyBrick ? 8 : 0),
          height: Math.max(overlayPosition.height + (isEmptyBrick ? 8 : 0), isEmptyBrick ? 40 : 0),
        }}
      />
      
      {/* Action button for empty bricks - clickable */}
      {isEmptyBrick && (
        <div
          className="brick-overlay fixed z-50 flex items-center justify-center pointer-events-auto cursor-pointer"
          style={{
            top: overlayPosition.top + overlayPosition.height / 2 - 12,
            left: overlayPosition.left + overlayPosition.width / 2 - 12,
            width: 24,
            height: 24,
          }}
          onClick={handleEmptyBrickClick}
          title="Click to add content"
        >
          <div className="w-6 h-6 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
      )}
      
      {/* Edit button for content bricks */}
      {(isTextBrick || isHtmlBrick) && (
        <div
          className="brick-overlay fixed z-50 flex items-center justify-center pointer-events-auto cursor-pointer"
          style={{
            top: overlayPosition.top + 4,
            left: overlayPosition.left + overlayPosition.width - 28,
            width: 24,
            height: 24,
          }}
          onClick={handleContentBrickClick}
          title="Click to edit content"
        >
          <div className={`w-6 h-6 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200 ${
            isTextBrick ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
          }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        </div>
      )}
      
    </>
  );
};

export default EditableOverlay;
