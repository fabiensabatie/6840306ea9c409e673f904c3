import React, { useState, useEffect, useRef } from 'react';
import Brick, { type UploadedFile, formatFileSize, formatDuration, handleDownload } from './Brick';

export interface AudioBrickProps {
  audio: UploadedFile;
  onSelect?: (audio: UploadedFile) => void;
  onDelete?: (audio: UploadedFile) => void;
  onAddToSelection?: (audio: UploadedFile) => void;
  showAIBadge?: boolean;
  className?: string;
}

export const AudioBrick: React.FC<AudioBrickProps> = ({ 
  audio, 
  onSelect, 
  onDelete,
  onAddToSelection,
  showAIBadge = false,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [audio.publicUrl]);

  // Listen for selection updates
  useEffect(() => {
    const handleSelectionUpdate = (event: MessageEvent) => {
      if (event.data?.type === 'contentSelectionUpdated') {
        const isInSelection = event.data.selectedItems.some((item: UploadedFile) => item._id === audio._id);
        setIsSelected(isInSelection);
      } else if (event.data?.type === 'clearedSelection') {
        setIsSelected(false);
      }
    };

    window.addEventListener('message', handleSelectionUpdate);
    return () => window.removeEventListener('message', handleSelectionUpdate);
  }, [audio._id]);

  const handleAudioClick = () => {
    if (onSelect) {
      onSelect(audio);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(audio);
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    handleDownload(audio.publicUrl, audio.originalName, e);
  };

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      const newMuted = !isMuted;
      audioRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (newMuted) {
        setVolume(0);
      } else {
        setVolume(1);
        audioRef.current.volume = 1;
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleAddToSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToSelection) {
      onAddToSelection(audio);
    } else {
      window.postMessage({
        type: 'addToContentSelection',
        content: audio
      }, '*');
    }
  };

  const handleRemoveFromSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.postMessage({
      type: 'removeFromContentSelection',
      contentId: audio._id
    }, '*');
  };

  return (
    <Brick
      onClick={handleAudioClick}
      onDownload={handleDownloadClick}
      onDelete={handleDeleteClick}
      onAddToSelection={handleAddToSelection}
      onRemoveFromSelection={handleRemoveFromSelection}
      isSelected={isSelected}
      usageCount={audio.usageCount}
      tags={audio.tags}
      className={className}
    >
      <div className="h-42 lg:h-64 bg-gray-200 flex items-center justify-center overflow-hidden relative group">
        <div className="w-full h-full relative flex flex-col">
          {/* Center Play Button */}
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={handlePlayPause}
              className="w-16 h-16 bg-white bg-opacity-90 hover:bg-blue-500 rounded-full flex items-center justify-center transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
            >
              {isPlaying ? (
                <svg className="w-8 h-8 text-gray-600 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-8 h-8 text-gray-600 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
          </div>

          {/* Bottom Timeline - Full Width */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent">
            <div className="px-4 py-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-white w-12">{formatDuration(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <span className="text-xs text-white w-12">{formatDuration(duration)}</span>
              </div>
            </div>
          </div>

          {/* Right Side Volume Control */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-2 bg-black/20 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleMuteToggle}
              className="w-8 h-8 text-white hover:text-gray-200 focus:outline-none"
            >
              {isMuted || volume === 0 ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : volume < 0.5 ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="h-24 w-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              style={{ WebkitAppearance: 'slider-vertical' }}
            />
          </div>

          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            src={audio.publicUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            preload="metadata"
            className="hidden"
          />

          {/* AI Badge */}
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
          <h4 className="text-sm font-medium text-gray-900 truncate flex-1" title={audio.description || audio.originalName}>
            {audio.description || audio.originalName}
          </h4>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">
            {audio.metadata.duration ? formatDuration(audio.metadata.duration) : formatFileSize(audio.size)}
          </span>
        </div>
      </div>
    </Brick>
  );
};

export default AudioBrick; 