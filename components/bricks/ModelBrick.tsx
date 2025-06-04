import React, { useState, Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import Brick, { type UploadedFile, formatFileSize, handleDownload } from './Brick';
import * as THREE from 'three';

// Loading progress component
const Loader: React.FC = () => {
  return (
    <Html center>
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 border-2 border-white border-t-blue-500 rounded-full animate-spin mb-2"></div>
        <div className="text-xs text-gray-600">Loading...</div>
      </div>
    </Html>
  );
};

// 3D Model Component
const Model3D: React.FC<{ url: string }> = ({ url }) => {
  const { scene } = useGLTF(url);
  const meshRef = useRef<THREE.Group>(null);

  useEffect(() => {
    let animationId: number;
    const animate = () => {
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.01;
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <primitive 
      ref={meshRef}
      object={scene} 
      scale={1}
      position={[0, 0, 0]}
    />
  );
};

// Fullscreen Modal Component
const FullscreenModelModal: React.FC<{ model: UploadedFile; onClose: () => void }> = ({ model, onClose }) => {
  const fileName = model.originalName.toLowerCase();
  const extension = model.metadata.extension?.toLowerCase().replace('.', '') || 
                   fileName.split('.').pop() || '';
  
  const isSupported = extension === 'glb' || 
                     extension === 'gltf' ||
                     fileName.endsWith('.glb') ||
                     fileName.endsWith('.gltf');

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center">
      <div className="relative w-full h-full p-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {isSupported ? (
          <div className="w-full h-full">
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <directionalLight position={[-10, -10, -5]} intensity={0.3} />
              <Suspense fallback={<Loader />}>
                <Model3D url={model.publicUrl} />
                <OrbitControls 
                  enablePan={true} 
                  enableZoom={true}
                  autoRotate={false}
                />
              </Suspense>
            </Canvas>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-center">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-lg">Preview not available</p>
              <p className="text-sm opacity-75">{extension.toUpperCase() || 'Unknown'} format</p>
              <p className="text-sm opacity-75 mt-2">Only .GLB and .GLTF files can be previewed</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export interface ModelBrickProps {
  model: UploadedFile;
  onSelect?: (model: UploadedFile) => void;
  onDelete?: (model: UploadedFile) => void;
  onAddToSelection?: (model: UploadedFile) => void;
  showAIBadge?: boolean;
  className?: string;
}

export const ModelBrick: React.FC<ModelBrickProps> = ({
  model,
  onSelect,
  onDelete,
  onAddToSelection,
  showAIBadge = false,
  className = ''
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  // Listen for selection updates
  useEffect(() => {
    const handleSelectionUpdate = (event: MessageEvent) => {
      if (event.data?.type === 'contentSelectionUpdated') {
        const isInSelection = event.data.selectedItems.some((item: UploadedFile) => item._id === model._id);
        setIsSelected(isInSelection);
      } else if (event.data?.type === 'clearedSelection') {
        setIsSelected(false);
      }
    };

    window.addEventListener('message', handleSelectionUpdate);
    return () => window.removeEventListener('message', handleSelectionUpdate);
  }, [model._id]);

  const handleModelClick = () => {
    if (onSelect) {
      onSelect(model);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(model);
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    handleDownload(model.publicUrl, model.originalName, e);
  };

  const handleFullscreenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFullscreen(true);
  };

  const handleMouseEnter = () => {
    setShowPreview(true);
  };

  const handleMouseLeave = () => {
    setShowPreview(false);
  };

  const handleAddToSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToSelection) {
      onAddToSelection(model);
    } else {
      window.postMessage({
        type: 'addToContentSelection',
        content: model
      }, '*');
    }
  };

  const handleRemoveFromSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.postMessage({
      type: 'removeFromContentSelection',
      contentId: model._id
    }, '*');
  };

  // Check if file is a supported 3D format
  const fileName = model.originalName.toLowerCase();
  const extension = model.metadata.extension?.toLowerCase().replace('.', '') || 
                   fileName.split('.').pop() || '';
  
  const isSupported = extension === 'glb' || 
                     extension === 'gltf' ||
                     fileName.endsWith('.glb') ||
                     fileName.endsWith('.gltf');

  return (
    <Brick
      onClick={handleModelClick}
      onDownload={handleDownloadClick}
      onDelete={handleDeleteClick}
      onFullscreen={handleFullscreenClick}
      onAddToSelection={handleAddToSelection}
      onRemoveFromSelection={handleRemoveFromSelection}
      isSelected={isSelected}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      loading={false}
      error={error}
      usageCount={model.usageCount}
      tags={model.tags}
      className={className}
    >
      <div className="h-42 lg:h-64 bg-gray-50 flex items-center justify-center overflow-hidden relative">
        {showPreview && isSupported ? (
          <div className="absolute inset-0">
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <directionalLight position={[-10, -10, -5]} intensity={0.3} />
              <Suspense fallback={<Loader />}>
                <Model3D url={model.publicUrl} />
                <OrbitControls 
                  enablePan={true} 
                  enableZoom={true}
                  autoRotate={false}
                  autoRotateSpeed={2}
                />
              </Suspense>
            </Canvas>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}

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
          <h4 className="text-sm font-medium text-gray-900 truncate flex-1" title={model.description || model.originalName}>
            {model.description || model.originalName}
          </h4>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">
            {model.metadata.vertices ? 
              `${model.metadata.vertices.toLocaleString()} vertices` : 
              formatFileSize(model.size)
            }
          </span>
        </div>
      </div>

      {showFullscreen && (
        <FullscreenModelModal
          model={model}
          onClose={() => setShowFullscreen(false)}
        />
      )}
    </Brick>
  );
};

export default ModelBrick; 