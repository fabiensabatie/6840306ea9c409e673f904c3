import React from 'react';

interface TextBrickProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'li';
  className?: string;
  editable?: boolean;
  onEdit?: (newContent: string) => void;
  placeholder?: string;
  id?: string; // Unique identifier following AI pattern
}

const TextBrick: React.FC<TextBrickProps> = ({ 
  children, 
  variant = 'p', 
  className = '', 
  editable = true,
  onEdit,
  placeholder = 'Click to edit text...',
  id
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'h1':
        return 'text-4xl font-bold text-gray-900';
      case 'h2':
        return 'text-3xl font-bold text-gray-900';
      case 'h3':
        return 'text-2xl font-semibold text-gray-900';
      case 'h4':
        return 'text-xl font-semibold text-gray-900';
      case 'p':
        return 'text-base text-gray-700';
      case 'span':
        return 'text-sm text-gray-600';
      case 'li':
        return 'text-base text-gray-700';
      default:
        return 'text-base text-gray-700';
    }
  };

  const baseClasses = `${getVariantClasses()} ${className}`;

  const sharedProps = {
    className: baseClasses,
    'data-brick-type': 'text',
    'data-editable': editable,
    'data-brick-id': id
  };

  const displayContent = children || (editable ? <span className="text-gray-400 italic">{placeholder}</span> : '');

  // Return the appropriate element based on variant
  switch (variant) {
    case 'h1':
      return <h1 {...sharedProps}>{displayContent}</h1>;
    case 'h2':
      return <h2 {...sharedProps}>{displayContent}</h2>;
    case 'h3':
      return <h3 {...sharedProps}>{displayContent}</h3>;
    case 'h4':
      return <h4 {...sharedProps}>{displayContent}</h4>;
    case 'span':
      return <span {...sharedProps}>{displayContent}</span>;
    case 'li':
      return <li {...sharedProps}>{displayContent}</li>;
    case 'p':
    default:
      return <p {...sharedProps}>{displayContent}</p>;
  }
};

export default TextBrick; 