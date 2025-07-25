import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Undo } from 'lucide-react';
import { motion } from 'framer-motion';

interface VideoPlayerProps {
  videoUrl: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', () => setIsPlaying(false));
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  useEffect(() => {
    if (isPlaying && showControls) {
      if (controlsTimeout) clearTimeout(controlsTimeout);
      const timeout = setTimeout(() => setShowControls(false), 3000);
      setControlsTimeout(timeout);
      return () => clearTimeout(timeout);
    }
    if (!isPlaying) setShowControls(true);
    return () => { if (controlsTimeout) clearTimeout(controlsTimeout); };
  }, [isPlaying, showControls]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (isFull && window.screen.orientation && (window.screen.orientation as any).lock) {
        (window.screen.orientation as any).lock('landscape').catch(() => {});
      } else if (!isFull && window.screen.orientation && (window.screen.orientation as any).unlock) {
        (window.screen.orientation as any).unlock();
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
      // Add spacebar shortcut for play/pause
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
      // Add left arrow shortcut for go back
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleRewind10();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value) / 100;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleVideoClick = () => {
    if (!showControls) {
      setShowControls(true);
    } else {
      togglePlay();
    }
  };

  const handleRewind10 = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 5);
  };

  // Helper to detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;

  return (
    <motion.div
      ref={containerRef}
      className={
        isFullscreen
          ? 'fixed inset-0 w-screen h-screen z-50 bg-black flex items-center justify-center'
          : 'relative w-full max-w-4xl mx-auto bg-video-bg rounded-xl overflow-hidden shadow-video sm:rounded-lg sm:max-w-2xl xs:max-w-full xs:rounded-md flex items-center justify-center'
      }
      style={
        isFullscreen
          ? { width: '100vw', height: '100vh' }
          : { width: '100%', aspectRatio: '16/9', maxWidth: '100vw' }
      }
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className={
          isFullscreen
            ? isMobile
              ? 'w-full h-full object-cover bg-black'
              : 'w-full h-full object-contain bg-black'
            : 'w-full h-full object-contain bg-black rounded-xl'
        }
        onClick={handleVideoClick}
        onDoubleClick={toggleFullscreen}
        controls={false}
        playsInline
        preload="auto"
        onWaiting={() => setIsBuffering(true)}
        onLoadStart={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
        onCanPlayThrough={() => setIsBuffering(false)}
        style={
          isFullscreen
            ? isMobile
              ? { width: '100vw', height: '100vh', background: '#000', aspectRatio: '9/16' }
              : { width: '100vw', height: '100vh', background: '#000' }
            : { width: '100%', height: '100%', background: '#000', borderRadius: 'inherit' }
        }
      />

      {/* Loading Spinner Overlay */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-50">
          <svg className="animate-spin h-12 w-12 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      )}
      
      {/* Play/Pause Overlay */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: !isPlaying && showControls ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.button
          className="w-16 h-16 sm:w-14 sm:h-14 xs:w-12 xs:h-12 bg-white rounded-full flex items-center justify-center pointer-events-auto shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          tabIndex={0}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          style={{ display: isPlaying ? 'none' : 'flex' }}
        >
          <Play className="w-8 h-8 text-red-600 ml-1" />
        </motion.button>
      </motion.div>

      {/* Controls */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-video-controls/90 to-transparent p-4 xs:p-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 20 }}
        transition={{ duration: 0.3 }}
        style={{ pointerEvents: showControls ? 'auto' : 'none' }}
      >
        {/* Progress Bar */}
        <div className="mb-4 xs:mb-2">
          <div className="relative group">
            <div className="w-full h-1 group-hover:h-2 bg-video-progress-bg rounded-full xs:h-0.5 transition-all duration-200">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{ width: `${progress}%`, background: '#ef4444' }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-1 group-hover:h-2 opacity-0 cursor-pointer xs:h-2 xs:top-[-4px] transition-all duration-200"
              tabIndex={0}
              aria-label="Seek video"
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between xs:flex-col xs:gap-2">
          <div className="flex items-center space-x-4 xs:space-x-2 xs:w-full xs:justify-between">
            <motion.button
              className="w-10 h-10 sm:w-9 sm:h-9 xs:w-8 xs:h-8 bg-white rounded-full flex items-center justify-center transition-colors shadow"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              tabIndex={0}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-red-600" />
              ) : (
                <Play className="w-5 h-5 text-red-600 ml-0.5" />
              )}
            </motion.button>

            {/* Go Back 10 Seconds button */}
            <motion.button
              className="w-10 h-10 sm:w-9 sm:h-9 xs:w-8 xs:h-8 bg-white rounded-full flex items-center justify-center transition-colors shadow ml-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRewind10}
              tabIndex={0}
              aria-label="Go back 10 seconds"
            >
              <Undo className="w-5 h-5 text-red-600" />
            </motion.button>

            <div className="flex items-center space-x-2">
              <motion.button
                className="w-8 h-8 sm:w-7 sm:h-7 xs:w-7 xs:h-7 flex items-center justify-center text-foreground hover:text-primary transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleMute}
                tabIndex={0}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </motion.button>
              <div className="w-20 xs:w-16">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume * 100}
                  onChange={handleVolumeChange}
                  className="w-full h-1 xs:h-0.5 bg-video-progress-bg rounded-full appearance-none cursor-pointer volume-slider"
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${isMuted ? 0 : volume * 100}%, #fecaca ${isMuted ? 0 : volume * 100}%, #fecaca 100%)`
                  }}
                  tabIndex={0}
                  aria-label="Volume"
                />
              </div>
            </div>

            <span className="text-sm xs:text-xs text-muted-foreground font-medium">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right-side controls: logo and fullscreen button, with fullscreen at the far right */}
          <div className="flex items-center space-x-0 xs:space-x-0 ml-auto">
            <motion.button
              className="w-10 h-10 sm:w-9 sm:h-9 xs:w-8 xs:h-8 bg-white rounded-full flex items-center justify-center transition-colors shadow"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleFullscreen}
              tabIndex={0}
              aria-label="Fullscreen"
              style={{ marginLeft: 0 }}
            >
              <Maximize className="w-5 h-5 text-red-600" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VideoPlayer;