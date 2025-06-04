import React from 'react';

interface EmptyBrickProps {
  height?: string;
  className?: string;
  onAdd?: () => void;
  placeholder?: string;
  showPlaceholder?: boolean;
  id?: string; // Unique identifier following AI pattern: slide-{slideIndex}-{type}-{number}
}

const EmptyBrick: React.FC<EmptyBrickProps> = ({ 
  height = 'h-8',
  className = '', 
  onAdd,
  id,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onAdd) {
      onAdd();
    } else {
      // Send message to parent window (CourseEditor) to expand ContentLibrary
      if (window.parent) {
        window.parent.postMessage({
          type: 'expandContentLibrary',
          elementData: {
            elementType: 'empty',
            brickId: id || `slide-${Date.now()}-section-${Math.floor(Math.random() * 1000)}`,
            rect: e.currentTarget.getBoundingClientRect(),
            clickX: e.clientX,
            clickY: e.clientY,
            timestamp: Date.now()
          }
        }, '*');
      }
    }
  };

  return (
    <div
      className={`w-full ${height} rounded transition-colors cursor-pointer relative ${className}`}
      onClick={handleClick}
      data-brick-type="empty"
      data-editable="true"
      data-brick-id={id}
    >
      {/* Empty content - styling handled by EditableOverlay */}
    </div>
  );
};

export default EmptyBrick; 