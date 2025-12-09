"use client";

import { useState, useRef, useEffect } from "react";
import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Video } from "@/lib/types";
import Image from "next/image";

interface AudioPlayerProps {
  videos: Video[];
  currentVideoIndex: number;
  onVideoChange: (index: number) => void;
}

export default function AudioPlayer({
  videos,
  currentVideoIndex,
  onVideoChange,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const currentVideo = videos[currentVideoIndex];

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  // Reset state when video changes
  useEffect(() => {
    setPlayed(0);
    setDuration(0);
    // We don't reset isPlaying here to allow auto-play logic to handle it
  }, [currentVideo]);

  if (!currentVideo) return null;

  const startProgressTracking = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      if (
        playerRef.current &&
        typeof playerRef.current.getCurrentTime === "function"
      ) {
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        if (duration > 0) {
          setPlayed(currentTime / duration);
          setDuration(duration);
        }
      }
    }, 1000);
  };

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const onPlayerReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    setDuration(event.target.getDuration());
    if (isPlaying) {
      event.target.playVideo();
    }
  };

  const onPlayerStateChange = (event: YouTubeEvent) => {
    // 1 = Playing, 2 = Paused, 0 = Ended
    if (event.data === 1) {
      setIsPlaying(true);
      startProgressTracking();
    } else if (event.data === 2) {
      setIsPlaying(false);
      stopProgressTracking();
    } else if (event.data === 0) {
      handleNext();
    }
  };

  const handlePlayPause = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTo = parseFloat(e.target.value);
    setPlayed(seekTo);
    if (playerRef.current && duration > 0) {
      playerRef.current.seekTo(seekTo * duration, true);
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentVideoIndex < videos.length - 1) {
      onVideoChange(currentVideoIndex + 1);
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentVideoIndex > 0) {
      onVideoChange(currentVideoIndex - 1);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  return (
    <>
      {/* Hidden Player for Logic */}
      <div className="fixed top-0 left-0 w-px h-px opacity-0 pointer-events-none overflow-hidden">
        <YouTube
          videoId={currentVideo.id}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
          opts={{
            height: "100%",
            width: "100%",
            playerVars: {
              autoplay: 1,
              controls: 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              playsinline: 1,
            },
          }}
        />
      </div>

      {/* Mini Player (Bottom Bar) */}
      {!isExpanded && (
        <div
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-[20px] left-0 right-0 mx-auto max-w-[460px] w-[95%] bg-[#282828] rounded-lg p-2 flex items-center gap-3 shadow-2xl cursor-pointer z-50 border-b-2 border-green-500"
        >
          <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-800 flex-shrink-0">
            <Image
              src={currentVideo.thumbnail}
              alt={currentVideo.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white truncate">
              {currentVideo.title}
            </h4>
            <p className="text-xs text-gray-400">
              Audiobook • {isPlaying ? "Playing" : "Paused"}
            </p>
          </div>
          <button
            onClick={handlePlayPause}
            className="w-10 h-10 flex items-center justify-center text-white hover:scale-110 transition-transform"
          >
            {isPlaying ? (
              <Pause size={24} fill="white" />
            ) : (
              <Play size={24} fill="white" />
            )}
          </button>
        </div>
      )}

      {/* Full Screen Player Overlay */}
      {isExpanded && (
        <div className="fixed inset-0 z-[60] bg-gradient-to-b from-gray-900 to-black flex flex-col max-w-[480px] mx-auto animate-slideUp">
          {/* Header */}
          <div className="flex items-center justify-between p-6 pt-12">
            <button onClick={() => setIsExpanded(false)} className="text-white">
              <span className="sr-only">Close</span>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
              Now Playing
            </span>
            <button className="text-white opacity-0">
              <span className="sr-only">Menu</span>•••
            </button>
          </div>

          {/* Album Art */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-2xl elevation-high">
              <Image
                src={currentVideo.thumbnail}
                alt={currentVideo.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Controls Area */}
          <div className="p-8 pb-16 space-y-8">
            {/* Title Info */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-1 leading-tight">
                {currentVideo.title}
              </h2>
              <p className="text-lg text-gray-400">
                Audiobook Chapter {currentVideoIndex + 1}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <input
                type="range"
                min={0}
                max={0.999999}
                step="any"
                value={played}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
                style={{
                  background: `linear-gradient(to right, #fff ${
                    played * 100
                  }%, #404040 ${played * 100}%)`,
                }}
              />
              <div className="flex justify-between text-xs text-gray-400 font-medium">
                <span>{formatTime(duration * played)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrev}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <SkipBack size={32} />
              </button>

              <button
                onClick={handlePlayPause}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
              >
                {isPlaying ? (
                  <Pause size={32} className="text-black fill-black" />
                ) : (
                  <Play size={32} className="text-black fill-black ml-1" />
                )}
              </button>

              <button
                onClick={handleNext}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <SkipForward size={32} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
