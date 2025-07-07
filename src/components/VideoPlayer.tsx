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
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto bg-video-bg rounded-xl overflow-hidden shadow-video"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          onClick={togglePlay}
        />
        
        {/* Play/Pause Overlay */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: !isPlaying && showControls ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            className="w-20 h-20 bg-red-100 hover:bg-red-200 backdrop-blur-sm rounded-full flex items-center justify-center pointer-events-auto transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
          >
            <Play className="w-8 h-8 text-red-600 ml-1" />
          </motion.button>
        </motion.div>

        {/* Controls */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-video-controls/90 to-transparent p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="relative">
              <div className="w-full h-1 bg-video-progress-bg rounded-full">
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
                className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                className="w-10 h-10 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-red-600" />
                ) : (
                  <Play className="w-5 h-5 text-red-600 ml-0.5" />
                )}
              </motion.button>

              <div className="flex items-center space-x-2">
                <motion.button
                  className="w-8 h-8 flex items-center justify-center text-foreground hover:text-primary transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </motion.button>
                <div className="w-20">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume * 100}
                    onChange={handleVolumeChange}
                    className="w-full h-1 bg-video-progress-bg rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, hsl(var(--video-progress)) 0%, hsl(var(--video-progress)) ${isMuted ? 0 : volume * 100}%, hsl(var(--video-progress-bg)) ${isMuted ? 0 : volume * 100}%, hsl(var(--video-progress-bg)) 100%)`
                    }}
                  />
                </div>
              </div>

              <span className="text-sm text-muted-foreground font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <motion.button
              className="w-10 h-10 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors ml-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleFullscreen}
            >
              <Maximize className="w-5 h-5 text-red-600" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default VideoPlayer;