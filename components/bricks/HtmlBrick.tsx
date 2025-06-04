import React from 'react';

interface HtmlBrickProps {
  html: string;
  className?: string;
  editable?: boolean;
  onEdit?: (newHtml: string) => void;
  placeholder?: string;
  id?: string; // Unique identifier following AI pattern
}

const HtmlBrick: React.FC<HtmlBrickProps> = ({ 
  html, 
  className = '', 
  editable = true,
  onEdit,
  placeholder = 'Click to edit content...',
  id
}) => {
  const baseClasses = className;
  const displayContent = html;

  if (!displayContent && editable) {
    return (
      <div 
        className={`${baseClasses} text-gray-400 italic min-h-[2rem] flex items-center`}
        data-brick-type="html"
        data-editable={editable}
        data-brick-id={id}
      >
        {placeholder}
      </div>
    );
  }

  return (
    <div 
      className={baseClasses}
      dangerouslySetInnerHTML={{ __html: displayContent }}
      data-brick-type="html"
      data-editable={editable}
      data-brick-id={id}
    />
  );
};

export default HtmlBrick; 