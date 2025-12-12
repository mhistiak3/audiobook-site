"use client";

import { useAuth } from "@/context/AuthContext";
import { useAppSelector } from "@/store/hooks";
import { Award, BookOpen, Clock, Headphones, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function StatisticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const playlists = useAppSelector((state) => state.playlists.playlists);
  const videoProgress = useAppSelector((state) => state.player.videoProgress);
  const mounted = true;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const stats = useMemo(() => {
    const allVideos = playlists.flatMap((p) => p.videos);
    const progressArray = Object.values(videoProgress);

    // Total listening time (in seconds)
    const totalListeningTime = progressArray.reduce(
      (acc, progress) => acc + (progress.currentTime || 0),
      0
    );

    // Completed chapters
    const completedChapters = progressArray.filter((p) => p.watched).length;

    // Total chapters
    const totalChapters = allVideos.length;

    // Completion percentage
    const completionPercentage =
      totalChapters > 0
        ? Math.round((completedChapters / totalChapters) * 100)
        : 0;

    // Currently reading (recently played)
    const currentlyReading = progressArray
      .filter((p) => !p.watched && p.currentTime > 0)
      .sort(
        (a, b) =>
          new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime()
      ).length;

    // This week stats (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const thisWeekProgress = progressArray.filter(
      (p) => new Date(p.lastPlayed) > weekAgo
    );

    const thisWeekTime = thisWeekProgress.reduce(
      (acc, p) => acc + (p.currentTime || 0),
      0
    );

    const thisWeekCompleted = thisWeekProgress.filter((p) => p.watched).length;

    // Achievements
    const achievements = [];
    if (totalListeningTime >= 36000)
      achievements.push({ name: "10 Hour Listener", icon: "🎧" });
    if (totalListeningTime >= 18000)
      achievements.push({ name: "5 Hour Listener", icon: "⏰" });
    if (completedChapters >= 50)
      achievements.push({ name: "Chapter Master", icon: "📚" });
    if (completedChapters >= 20)
      achievements.push({ name: "Bookworm", icon: "🐛" });
    if (completedChapters >= 10)
      achievements.push({ name: "Getting Started", icon: "🌟" });

    return {
      totalListeningTime,
      completedChapters,
      totalChapters,
      completionPercentage,
      currentlyReading,
      thisWeekTime,
      thisWeekCompleted,
      achievements,
    };
  }, [playlists, videoProgress]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!mounted || authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-hover to-surface pb-24">
      {/* Header */}
      <header className="pt-[var(--safe-top)] px-6 pb-6 sticky top-0 z-10 bg-surface/90 backdrop-blur-md border-b border-white/5">
        <div className="pt-4">
          <h1 className="text-2xl font-bold">Statistics</h1>
          <p className="text-muted text-sm mt-1">Your listening journey</p>
        </div>
      </header>

      <div className="px-6 py-6 space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-primary" size={20} />
              <span className="text-muted text-xs">Total Time</span>
            </div>
            <p className="text-2xl font-bold">
              {formatTime(stats.totalListeningTime)}
            </p>
          </div>

          <div className="bg-secondary rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="text-primary" size={20} />
              <span className="text-muted text-xs">Completed</span>
            </div>
            <p className="text-2xl font-bold">{stats.completedChapters}</p>
            <p className="text-xs text-muted">
              of {stats.totalChapters} chapters
            </p>
          </div>

          <div className="bg-secondary rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Headphones className="text-primary" size={20} />
              <span className="text-muted text-xs">In Progress</span>
            </div>
            <p className="text-2xl font-bold">{stats.currentlyReading}</p>
          </div>

          <div className="bg-secondary rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-primary" size={20} />
              <span className="text-muted text-xs">Progress</span>
            </div>
            <p className="text-2xl font-bold">{stats.completionPercentage}%</p>
          </div>
        </div>

        {/* This Week Section */}
        <div className="bg-secondary rounded-xl p-5 border border-white/5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-lg">📅</span> This Week
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted text-sm">Listening Time</span>
              <span className="font-semibold">
                {formatTime(stats.thisWeekTime)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted text-sm">Chapters Completed</span>
              <span className="font-semibold">{stats.thisWeekCompleted}</span>
            </div>
          </div>
        </div>

        {/* Achievements */}
        {stats.achievements.length > 0 && (
          <div className="bg-secondary rounded-xl p-5 border border-white/5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Award className="text-primary" size={20} />
              Achievements
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {stats.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="bg-hover rounded-lg p-3 border border-primary/20 flex flex-col items-center text-center"
                >
                  <span className="text-2xl mb-1">{achievement.icon}</span>
                  <span className="text-xs font-medium">
                    {achievement.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overall Progress */}
        <div className="bg-secondary rounded-xl p-5 border border-white/5">
          <h3 className="font-semibold mb-3">Overall Progress</h3>
          <div className="w-full bg-hover rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.completionPercentage}%` }}
            />
          </div>
          <p className="text-xs text-muted mt-2 text-center">
            {stats.completedChapters} of {stats.totalChapters} chapters
            completed
          </p>
        </div>
      </div>
    </div>
  );
}
