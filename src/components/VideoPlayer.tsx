import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    
    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
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
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
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
        style={
          isFullscreen
            ? isMobile
              ? { width: '100vw', height: '100vh', background: '#000', aspectRatio: '9/16' }
              : { width: '100vw', height: '100vh', background: '#000' }
            : { width: '100%', height: '100%', background: '#000', borderRadius: 'inherit' }
        }
      />
      
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
          <div className="relative">
            <div className="w-full h-1 bg-video-progress-bg rounded-full xs:h-0.5">
              <div
                className="h-full bg-video-progress rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer xs:h-2 xs:top-[-4px]"
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
                  className="w-full h-1 xs:h-0.5 bg-video-progress-bg rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--video-progress)) 0%, hsl(var(--video-progress)) ${isMuted ? 0 : volume * 100}%, hsl(var(--video-progress-bg)) ${isMuted ? 0 : volume * 100}%, hsl(var(--video-progress-bg)) 100%)`
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

          <motion.button
            className="w-8 h-8 sm:w-7 sm:h-7 xs:w-7 xs:h-7 flex items-center justify-center text-foreground hover:text-primary transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleFullscreen}
            tabIndex={0}
            aria-label="Fullscreen"
          >
            <Maximize className="w-5 h-5 text-red-600" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VideoPlayer;