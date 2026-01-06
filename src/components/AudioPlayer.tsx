"use client";

import { Bookmark as BookmarkType, Video } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setCurrentVideo,
  setIsPlaying,
  updateVideoProgress,
} from "@/store/playerSlice";
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube";
import SleepTimer from "./SleepTimer";

interface AudioPlayerProps {
  videos: Video[];
  currentVideoIndex: number;
  onVideoChange: (index: number) => void;
  playlistId: string;
}

export default function AudioPlayer({
  videos,
  currentVideoIndex,
  onVideoChange,
  playlistId,
}: AudioPlayerProps) {
  const dispatch = useAppDispatch();
  const isPlayingRedux = useAppSelector((state) => state.player.isPlaying);
  const videoProgress = useAppSelector((state) => state.player.videoProgress);

  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(() => {
    const savedSpeed = localStorage.getItem("defaultPlaybackSpeed");
    return savedSpeed ? parseFloat(savedSpeed) : 1;
  });
  const [volume, setVolume] = useState(() => {
    if (typeof window !== "undefined") {
      const savedVolume = localStorage.getItem("playerVolume");
      return savedVolume ? parseInt(savedVolume) : 100;
    }
    return 100;
  });
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      const savedMuted = localStorage.getItem("playerMuted");
      return savedMuted === "true";
    }
    return false;
  });
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showBookmarkMenu, setShowBookmarkMenu] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState("");
  const [skipBackward] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("skipBackwardSeconds");
      return saved ? parseInt(saved) : 10;
    }
    return 10;
  });
  const [skipForward] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("skipForwardSeconds");
      return saved ? parseInt(saved) : 30;
    }
    return 30;
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const hasRestoredPosition = useRef(false);

  const currentVideo = videos[currentVideoIndex];
  const currentProgress = currentVideo
    ? videoProgress[currentVideo.id]
    : undefined;

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  // Reset state when video changes and restore saved position
  useEffect(() => {
    if (currentVideo) {
      dispatch(
        setCurrentVideo({ videoId: currentVideo.id, index: currentVideoIndex })
      );
      hasRestoredPosition.current = false;
    }
  }, [currentVideo, currentVideoIndex, dispatch]);

  // Keyboard shortcuts - must be before early return
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case " ":
        case "k":
        case "K":
          e.preventDefault();
          if (playerRef.current) {
            if (isPlayingRedux) {
              playerRef.current.pauseVideo();
            } else {
              playerRef.current.playVideo();
            }
          }
          break;
        case "ArrowLeft":
          if (playerRef.current && duration > 0) {
            const currentTime = playerRef.current.getCurrentTime();
            const newTime = Math.max(0, currentTime - skipBackward);
            playerRef.current.seekTo(newTime, true);
            setPlayed(newTime / duration);
          }
          break;
        case "ArrowRight":
          if (playerRef.current && duration > 0) {
            const currentTime = playerRef.current.getCurrentTime();
            const newTime = Math.min(duration, currentTime + skipForward);
            playerRef.current.seekTo(newTime, true);
            setPlayed(newTime / duration);
          }
          break;
        case "m":
        case "M":
          setIsMuted((prev) => {
            const newMuted = !prev;
            if (playerRef.current) {
              if (newMuted) {
                playerRef.current.mute();
              } else {
                playerRef.current.unMute();
                playerRef.current.setVolume(volume);
              }
            }
            localStorage.setItem("playerMuted", newMuted.toString());
            return newMuted;
          });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlayingRedux, duration, skipBackward, skipForward, volume]);

  if (!currentVideo) return null;

  const startProgressTracking = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      if (
        playerRef.current &&
        typeof playerRef.current.getCurrentTime === "function" &&
        typeof playerRef.current.getDuration === "function"
      ) {
        const currentTime = playerRef.current.getCurrentTime();
        const videoDuration = playerRef.current.getDuration();

        // Only update if we have valid duration
        if (videoDuration && videoDuration > 0 && !isNaN(videoDuration)) {
          setPlayed(currentTime / videoDuration);
          setDuration(videoDuration);

          // Save progress to Redux/Supabase every second
          if (currentVideo) {
            dispatch(
              updateVideoProgress({
                videoId: currentVideo.id,
                playlistId,
                currentTime,
                duration: videoDuration,
              })
            );
          }
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

    // Set volume and mute state
    if (isMuted) {
      event.target.mute();
    } else {
      event.target.unMute();
      event.target.setVolume(volume);
    }

    // Get duration immediately and set it
    const videoDuration = event.target.getDuration();
    if (videoDuration && videoDuration > 0) {
      setDuration(videoDuration);

      // Restore saved position if available and not already restored
      if (currentProgress && !hasRestoredPosition.current) {
        const savedTime = currentProgress.currentTime || 0;

        // Only restore if there's meaningful progress (more than 1 second)
        if (savedTime > 1) {
          const savedProgress = savedTime / videoDuration;
          setPlayed(savedProgress);
          event.target.seekTo(savedTime, true);
        }
        hasRestoredPosition.current = true;
      }
    }

    if (isPlayingRedux) {
      event.target.playVideo();
    }
  };

  const onPlayerStateChange = (event: YouTubeEvent) => {
    // 1 = Playing, 2 = Paused, 0 = Ended
    if (event.data === 1) {
      dispatch(setIsPlaying(true));
      startProgressTracking();
    } else if (event.data === 2) {
      dispatch(setIsPlaying(false));
      stopProgressTracking();
    } else if (event.data === 0) {
      // Video ended - check auto-play setting
      const autoPlayNext = localStorage.getItem("autoPlayNext") || "next";

      if (autoPlayNext === "next") {
        handleNext();
      } else if (autoPlayNext === "repeat") {
        // Replay current video
        if (playerRef.current) {
          playerRef.current.seekTo(0, true);
          playerRef.current.playVideo();
        }
      } else if (autoPlayNext === "stop") {
        // Just stop playing
        dispatch(setIsPlaying(false));
      }
    }
  };

  const handlePlayPause = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (playerRef.current) {
      if (isPlayingRedux) {
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

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentVideoIndex > 0) {
      onVideoChange(currentVideoIndex - 1);
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentVideoIndex < videos.length - 1) {
      onVideoChange(currentVideoIndex + 1);
    }
  };

  const handleSkipBackward = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (playerRef.current && duration > 0) {
      const currentTime = playerRef.current.getCurrentTime();
      const newTime = Math.max(0, currentTime - skipBackward);
      playerRef.current.seekTo(newTime, true);
      setPlayed(newTime / duration);
    }
  };

  const handleSkipForward = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (playerRef.current && duration > 0) {
      const currentTime = playerRef.current.getCurrentTime();
      const newTime = Math.min(duration, currentTime + skipForward);
      playerRef.current.seekTo(newTime, true);
      setPlayed(newTime / duration);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(speed);
    }
    setShowSpeedMenu(false);
  };

  const saveBookmark = () => {
    if (!currentVideo || duration === 0) return;

    const bookmark: BookmarkType = {
      id: Date.now().toString(),
      videoId: currentVideo.id,
      playlistId: playlistId,
      time: played * duration,
      note: bookmarkNote.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    // Save to localStorage
    try {
      const saved = localStorage.getItem("audiobook_bookmarks");
      const bookmarks = saved ? JSON.parse(saved) : [];
      bookmarks.push(bookmark);
      localStorage.setItem("audiobook_bookmarks", JSON.stringify(bookmarks));
      setShowBookmarkMenu(false);
      setBookmarkNote("");
      // Show success feedback
      alert("Bookmark saved!");
    } catch (error) {
      console.error("Failed to save bookmark:", error);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        playerRef.current.unMute();
        localStorage.setItem("playerMuted", "false");
      }
    }
    localStorage.setItem("playerVolume", newVolume.toString());
  };

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (playerRef.current) {
      if (newMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
      }
    }
    localStorage.setItem("playerMuted", newMuted.toString());
  };

  const speedOptions = [0.75, 1, 1.25, 1.5, 1.75, 2];

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
          className="fixed bottom-5 left-0 right-0 mx-auto max-w-[460px] w-[95%] bg-secondary rounded-lg p-2 flex items-center gap-3 shadow-2xl cursor-pointer z-50 border-b-2 border-primary"
        >
          <div className="relative w-10 h-10 rounded overflow-hidden bg-secondary shrink-0">
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
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-400">
                {videos.length === 1 ? "Video" : "Audiobook"} •{" "}
                {isPlayingRedux ? "Playing" : "Paused"}
              </p>
              {currentProgress?.watched && (
                <CheckCircle size={12} className="text-primary" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleSkipBackward}
              className="w-8 h-8 flex items-center justify-center text-white hover:scale-110 transition-transform"
              title={`Skip backward ${skipBackward}s`}
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 flex items-center justify-center text-white hover:scale-110 transition-transform"
            >
              {isPlayingRedux ? (
                <Pause size={24} fill="white" />
              ) : (
                <Play size={24} fill="white" />
              )}
            </button>
            <button
              onClick={handleSkipForward}
              className="w-8 h-8 flex items-center justify-center text-white hover:scale-110 transition-transform"
              title={`Skip forward ${skipForward}s`}
            >
              <RotateCw size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Full Screen Player Overlay */}
      {isExpanded && (
        <div className="fixed inset-0 z-60 bg-linear-to-b from-surface to-background flex flex-col max-w-[480px] mx-auto animate-slideUp">
          {/* Header - Fixed */}
          <div className="flex items-center justify-between p-6 pt-12 shrink-0">
            <button
              onClick={() => setIsExpanded(false)}
              className="text-foreground"
            >
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
            <div className="flex items-center gap-2">
              <SleepTimer
                currentVideoDuration={duration}
                currentVideoTime={played * duration}
                onFinishChapter={handleNext}
              />
              <button
                onClick={() => setShowSpeedMenu(true)}
                className="text-muted hover:text-white hover:bg-hover p-2 rounded-full transition-colors"
                title="Playback Speed"
              >
                <Gauge size={20} />
              </button>
              <button
                onClick={() => setShowBookmarkMenu(true)}
                className="text-muted hover:text-white hover:bg-hover p-2 rounded-full transition-colors"
                title="Add Bookmark"
              >
                <Bookmark size={20} />
              </button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {/* Album Art */}
            <div className="flex items-center justify-center px-8 py-4">
              <div className="relative w-full max-w-[280px] aspect-square rounded-xl overflow-hidden shadow-2xl elevation-high">
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
            <div className="px-8 pb-8 space-y-6">
              {/* Title Info */}
              <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-1 leading-tight">
                  {currentVideo.title}
                </h2>
                <p className="text-base text-gray-400">
                  Audiobook Chapter {currentVideoIndex + 1}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="relative h-2 bg-gray-600/50 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-white rounded-full transition-all"
                    style={{ width: `${played * 100}%` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={0.999999}
                    step="any"
                    value={played}
                    onChange={handleSeek}
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 font-medium">
                  <span>
                    {duration > 0 ? formatTime(duration * played) : "00:00"}
                  </span>
                  <span>
                    {duration > 0
                      ? formatTime(duration)
                      : currentVideo.duration}
                  </span>
                </div>
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-center gap-8">
                <button
                  onClick={handlePrev}
                  className="text-gray-300 hover:text-white transition-colors p-2"
                >
                  <SkipBack size={28} />
                </button>

                <button
                  onClick={handlePlayPause}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                >
                  {isPlayingRedux ? (
                    <Pause size={28} className="text-black fill-black" />
                  ) : (
                    <Play size={28} className="text-black fill-black ml-1" />
                  )}
                </button>

                <button
                  onClick={handleNext}
                  className="text-gray-300 hover:text-white transition-colors p-2"
                >
                  <SkipForward size={28} />
                </button>
              </div>

              {/* Skip Controls */}
              <div className="flex items-center justify-center gap-10">
                <button
                  onClick={handleSkipBackward}
                  className="flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-colors"
                >
                  <RotateCcw size={22} />
                  <span className="text-xs">{skipBackward}s</span>
                </button>
                <button
                  onClick={handleSkipForward}
                  className="flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-colors"
                >
                  <RotateCw size={22} />
                  <span className="text-xs">{skipForward}s</span>
                </button>
              </div>

              {/* Volume Control */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleMute}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX size={20} />
                    ) : (
                      <Volume2 size={20} />
                    )}
                  </button>
                  <div className="flex-1 relative h-2 bg-gray-600/50 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-white rounded-full transition-all"
                      style={{ width: `${isMuted ? 0 : volume}%` }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">
                    {isMuted ? 0 : volume}
                  </span>
                </div>
              </div>

              {/* Speed Indicator */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted pb-4">
                <Gauge size={16} />
                <span>{playbackSpeed}x Speed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Speed Control Modal */}
      {showSpeedMenu && (
        <div
          className="fixed inset-0 z-70 flex items-end justify-center bg-black/70 animate-fadeIn"
          onClick={() => setShowSpeedMenu(false)}
        >
          <div
            className="w-full max-w-[480px] bg-secondary rounded-t-3xl p-6 pb-[calc(var(--safe-bottom)+1.5rem)] animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Playback Speed</h3>
              <button
                onClick={() => setShowSpeedMenu(false)}
                className="text-muted hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {speedOptions.map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`px-4 py-4 rounded-xl font-semibold text-lg transition-all ${
                    playbackSpeed === speed
                      ? "bg-primary text-black"
                      : "bg-hover text-white hover:bg-hover/80 border border-white/5"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bookmark Modal */}
      {showBookmarkMenu && (
        <div
          className="fixed inset-0 z-70 flex items-end justify-center bg-black/70 animate-fadeIn"
          onClick={() => setShowBookmarkMenu(false)}
        >
          <div
            className="w-full max-w-[480px] bg-secondary rounded-t-3xl p-6 pb-[calc(var(--safe-bottom)+1.5rem)] animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Add Bookmark</h3>
              <button
                onClick={() => setShowBookmarkMenu(false)}
                className="text-muted hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted block mb-2">
                  Time: {formatTime(played * duration)}
                </label>
                <div className="bg-hover rounded-lg px-4 py-3 text-white">
                  {currentVideo.title}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted block mb-2">
                  Note (Optional)
                </label>
                <textarea
                  value={bookmarkNote}
                  onChange={(e) => setBookmarkNote(e.target.value)}
                  placeholder="Add a note about this moment..."
                  className="w-full bg-hover rounded-lg px-4 py-3 text-white placeholder-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>
              <button
                onClick={saveBookmark}
                className="w-full bg-primary hover:bg-primary-hover text-black font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <BookmarkCheck size={20} />
                Save Bookmark
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
