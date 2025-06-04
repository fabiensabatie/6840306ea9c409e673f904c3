// Base Brick Component and Types
export { default as Brick } from './Brick';
export type { UploadedFile } from './Brick';

// Editable Brick Components
export { default as TextBrick } from './TextBrick';
export { default as HtmlBrick } from './HtmlBrick';
export { default as EmptyBrick } from './EmptyBrick';
export { default as ImageBrick } from './ImageBrick';
export { default as AudioBrick } from './AudioBrick';
export { default as DocumentBrick } from './DocumentBrick';
export { default as ModelBrick } from './ModelBrick';
export { default as VideoBrick } from './VideoBrick';

// Utility functions and modals
export { 
  formatFileSize,
  formatDuration,
  handleDownload
} from './Brick'; 