import React, { useState, useRef, useEffect } from 'react';
import { 
  FiX, FiPlay, FiPause, FiVolume2, FiVolumeX, 
  FiMaximize, FiMinimize, FiClock, FiEye,
  FiDownload, FiHeart, FiShare2, FiSettings,
  FiSkipBack, FiSkipForward, FiFastForward, FiRewind,
  FiChevronRight, FiChevronLeft, FiInfo, FiMenu
} from 'react-icons/fi';
import api from '../../api';

const VideoPlayer = ({ video, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const controlsTimeout = useRef(null);

  if (!video) return null;

  const token = localStorage.getItem('token');
  const videoSrc = `${api.videos.getStreamUrl(video._id)}?token=${token}`;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (showControls) {
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [showControls]);

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen();
      } else if (playerRef.current.webkitRequestFullscreen) {
        playerRef.current.webkitRequestFullscreen();
      } else if (playerRef.current.msRequestFullscreen) {
        playerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSettings(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 10;
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 10;
    }
  };

  const downloadVideo = async () => {
    try {
      const response = await fetch(videoSrc);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${video.title}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-black z-50 flex items-center justify-center p-4"
      onClick={() => setShowControls(true)}
    >
      <div 
        ref={playerRef}
        className={`relative glass rounded-2xl border border-gray-800 overflow-hidden ${
          isFullscreen ? 'w-full h-full' : 'max-w-6xl w-full'
        }`}
        onMouseMove={handleMouseMove}
      >
        {/* Video Container */}
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            className="w-full h-full"
            src={videoSrc}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleTimeUpdate}
            onEnded={handleEnded}
            onClick={handlePlayPause}
          />
          
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/70 to-transparent"></div>
          
          <div className={`absolute top-0 left-0 right-0 p-6 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">{video.title}</h1>
                <div className="flex items-center space-x-4 text-gray-300 text-sm">
                  <span className="flex items-center space-x-1">
                    <FiEye size={14} />
                    <span>{video.views || 0} views</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <FiClock size={14} />
                    <span>{formatTime(duration || video.duration || 0)}</span>
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 rounded-full bg-gray-900/70 backdrop-blur-sm hover:bg-gray-800 transition-colors"
              >
                <FiX className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
          
          {/* Play/Pause Overlay */}
          {!isPlaying && showControls && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={handlePlayPause}
                className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-600/80 to-purple-600/80 backdrop-blur-sm flex items-center justify-center hover:scale-105 transition-transform"
              >
                <FiPlay className="w-12 h-12 text-white ml-2" />
              </button>
            </div>
          )}
          
          {/* Skip Buttons */}
          {showControls && (
            <>
              <button
                onClick={skipBackward}
                className="absolute left-8 top-1/2 transform -translate-y-1/2 p-4 rounded-full bg-gray-900/70 backdrop-blur-sm hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
              >
                <FiRewind className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={skipForward}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 p-4 rounded-full bg-gray-900/70 backdrop-blur-sm hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
              >
                <FiFastForward className="w-6 h-6 text-white" />
              </button>
            </>
          )}
          
          {/* Controls Bar */}
          <div className={`absolute bottom-0 left-0 right-0 p-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}>
            {/* Progress Bar */}
            <div 
              className="relative h-1.5 bg-gray-800 rounded-full mb-4 cursor-pointer"
              onClick={handleSeek}
            >
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
              <div 
                className="absolute w-4 h-4 bg-white rounded-full -top-1.5 transform -translate-x-1/2 shadow-lg"
                style={{ left: `${progress}%` }}
              />
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Play/Pause */}
                <button
                  onClick={handlePlayPause}
                  className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
                >
                  {isPlaying ? (
                    <FiPause className="w-5 h-5 text-white" />
                  ) : (
                    <FiPlay className="w-5 h-5 text-white" />
                  )}
                </button>
                
                {/* Skip Backward */}
                <button
                  onClick={skipBackward}
                  className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
                >
                  <FiSkipBack className="w-5 h-5 text-white" />
                </button>
                
                {/* Skip Forward */}
                <button
                  onClick={skipForward}
                  className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
                >
                  <FiSkipForward className="w-5 h-5 text-white" />
                </button>
                
                {/* Volume Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <FiVolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <FiVolume2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24 accent-indigo-500"
                  />
                </div>
                
                {/* Time Display */}
                <div className="text-white text-sm font-mono">
                  {formatTime(currentTime)} / {formatTime(duration || video.duration || 0)}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Playback Speed */}
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
                  >
                    <FiSettings className="w-5 h-5 text-white" />
                  </button>
                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-800 min-w-[120px]">
                      <div className="py-1">
                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(speed => (
                          <button
                            key={speed}
                            onClick={() => handleSpeedChange(speed)}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-800/50 ${
                              playbackSpeed === speed ? 'text-indigo-400' : 'text-gray-300'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                              
                
                {/* Download Button */}
                <button
                  onClick={downloadVideo}
                  className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
                >
                  <FiDownload className="w-5 h-5 text-white" />
                </button>
                
                {/* Fullscreen Button */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
                >
                  {isFullscreen ? (
                    <FiMinimize className="w-5 h-5 text-white" />
                  ) : (
                    <FiMaximize className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Video Information Panel */}
        {showInfo && (
          <div className="p-6 bg-gradient-to-b from-gray-900/50 to-gray-900/30 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2 flex items-center">
                  <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="mr-3 p-1 rounded hover:bg-gray-800/50"
                  >
                    <FiInfo className="w-5 h-5" />
                  </button>
                  About this video
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  {video.description || 'No description available.'}
                </p>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <FiChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-300">Uploaded:</span>
                <span>{new Date(video.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              
              {video.tags && video.tags.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-300">Tags:</span>
                  <div className="flex flex-wrap gap-2">
                    {video.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-800/50 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {video.privacy && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-300">Privacy:</span>
                  <span className="capitalize">{video.privacy}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {!showInfo && (
          <button
            onClick={() => setShowInfo(true)}
            className="absolute bottom-24 right-4 p-3 rounded-full bg-gray-900/70 backdrop-blur-sm hover:bg-gray-800 transition-colors"
          >
            <FiChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;