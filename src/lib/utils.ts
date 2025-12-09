// Utility functions for the audiobook application

/**
 * Format seconds to HH:MM:SS or MM:SS
 */
export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "00:00";
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, "0");
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
  }
  return `${mm}:${ss}`;
}

/**
 * Calculate total duration in minutes from an array of videos
 */
export function calculateTotalDuration(
  videos: { durationSeconds: number }[]
): number {
  return Math.floor(videos.reduce((acc, v) => acc + v.durationSeconds, 0) / 60);
}

/**
 * Check if a video is watched based on progress percentage
 */
export function isVideoWatched(currentTime: number, duration: number): boolean {
  if (duration <= 0) return false;
  const progressPercent = (currentTime / duration) * 100;
  return progressPercent >= 90;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Safely parse JSON from localStorage
 */
export function safeJSONParse<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error parsing JSON for key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safely stringify and save to localStorage
 */
export function safeJSONStringify(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage for key "${key}":`, error);
  }
}
