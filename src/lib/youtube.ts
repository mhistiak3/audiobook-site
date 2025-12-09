// YouTube Data API integration

import { Playlist, Video } from "./types";

// Extract playlist ID from YouTube URL
export function extractPlaylistId(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // Handle different YouTube URL formats
    if (urlObj.hostname.includes("youtube.com")) {
      return urlObj.searchParams.get("list");
    }

    return null;
  } catch (error) {
    console.error("Invalid URL:", error);
    return null;
  }
}

// Extract video ID from YouTube URL
export function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // Handle different YouTube URL formats
    if (
      urlObj.hostname.includes("youtube.com") ||
      urlObj.hostname.includes("youtu.be")
    ) {
      // youtube.com/watch?v=VIDEO_ID
      if (urlObj.pathname === "/watch") {
        return urlObj.searchParams.get("v");
      }
      // youtu.be/VIDEO_ID
      if (urlObj.hostname === "youtu.be") {
        return urlObj.pathname.slice(1);
      }
    }

    return null;
  } catch (error) {
    console.error("Invalid URL:", error);
    return null;
  }
}

// Convert ISO 8601 duration to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");

  return hours * 3600 + minutes * 60 + seconds;
}

// Format seconds to HH:MM:SS or MM:SS
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

// Mock data for demonstration when API key is not available
function getMockPlaylist(playlistId: string): Playlist {
  const mockVideos: Video[] = [
    {
      id: "mock1",
      title: "Chapter 1: Introduction to the Journey",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      duration: "15:30",
      durationSeconds: 930,
    },
    {
      id: "mock2",
      title: "Chapter 2: The Adventure Begins",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      duration: "22:45",
      durationSeconds: 1365,
    },
    {
      id: "mock3",
      title: "Chapter 3: Challenges and Triumphs",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      duration: "18:20",
      durationSeconds: 1100,
    },
    {
      id: "mock4",
      title: "Chapter 4: The Turning Point",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      duration: "25:10",
      durationSeconds: 1510,
    },
    {
      id: "mock5",
      title: "Chapter 5: Resolution and Reflection",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      duration: "20:00",
      durationSeconds: 1200,
    },
  ];

  return {
    id: playlistId,
    title: "Demo Audiobook: An Epic Journey",
    description:
      "This is a demo playlist. Add your YouTube API key to fetch real playlists.",
    thumbnail: mockVideos[0].thumbnail,
    videoCount: mockVideos.length,
    videos: mockVideos,
    url: `https://www.youtube.com/playlist?list=${playlistId}`,
    dateAdded: new Date().toISOString(),
  };
}

// Fetch single video data from YouTube API
export async function fetchSingleVideo(url: string): Promise<Playlist> {
  const videoId = extractVideoId(url);

  if (!videoId) {
    throw new Error("Invalid YouTube video URL");
  }

  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn("YouTube API key not found. Using mock data.");
    return {
      id: videoId,
      title: "Demo Video",
      description:
        "This is a demo video. Add your YouTube API key to fetch real videos.",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      videoCount: 1,
      videos: [
        {
          id: videoId,
          title: "Demo Video",
          thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
          duration: "10:00",
          durationSeconds: 600,
        },
      ],
      url,
      dateAdded: new Date().toISOString(),
    };
  }

  try {
    // Fetch video details
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
    );

    if (!videoResponse.ok) {
      throw new Error("Failed to fetch video details");
    }

    const videoData = await videoResponse.json();

    if (!videoData.items || videoData.items.length === 0) {
      throw new Error("Video not found");
    }

    const videoInfo = videoData.items[0];
    const durationSeconds = parseDuration(videoInfo.contentDetails.duration);

    const video: Video = {
      id: videoId,
      title: videoInfo.snippet.title,
      thumbnail:
        videoInfo.snippet.thumbnails.high?.url ||
        videoInfo.snippet.thumbnails.default.url,
      duration: formatDuration(durationSeconds),
      durationSeconds,
    };

    // Create a "playlist" with single video
    return {
      id: videoId,
      title: videoInfo.snippet.title,
      description: videoInfo.snippet.description,
      thumbnail: video.thumbnail,
      videoCount: 1,
      videos: [video],
      url,
      dateAdded: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching video:", error);
    throw error;
  }
}

// Fetch playlist data from YouTube API
export async function fetchPlaylist(url: string): Promise<Playlist> {
  const playlistId = extractPlaylistId(url);

  if (!playlistId) {
    throw new Error("Invalid YouTube playlist URL");
  }

  // Check for API key in environment variables
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn("YouTube API key not found. Using mock data.");
    return getMockPlaylist(playlistId);
  }

  try {
    // Fetch playlist details
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`
    );

    if (!playlistResponse.ok) {
      throw new Error("Failed to fetch playlist details");
    }

    const playlistData = await playlistResponse.json();

    if (!playlistData.items || playlistData.items.length === 0) {
      throw new Error("Playlist not found");
    }

    const playlistInfo = playlistData.items[0];

    // Fetch playlist items (videos)
    const videos: Video[] = [];
    let nextPageToken: string | undefined;

    do {
      const itemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${apiKey}${
        nextPageToken ? `&pageToken=${nextPageToken}` : ""
      }`;

      const itemsResponse = await fetch(itemsUrl);

      if (!itemsResponse.ok) {
        throw new Error("Failed to fetch playlist items");
      }

      const itemsData = await itemsResponse.json();

      // Get video IDs to fetch durations
      const videoIds = itemsData.items
        .map((item: any) => item.snippet.resourceId.videoId)
        .join(",");

      // Fetch video details for durations
      const videosResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`
      );

      const videosData = await videosResponse.json();

      // Map videos with duration
      itemsData.items.forEach((item: any, index: number) => {
        const videoId = item.snippet.resourceId.videoId;
        const videoDetails = videosData.items[index];
        const durationSeconds = parseDuration(
          videoDetails.contentDetails.duration
        );

        videos.push({
          id: videoId,
          title: item.snippet.title,
          thumbnail:
            item.snippet.thumbnails.high?.url ||
            item.snippet.thumbnails.default.url,
          duration: formatDuration(durationSeconds),
          durationSeconds,
        });
      });

      nextPageToken = itemsData.nextPageToken;
    } while (nextPageToken);

    return {
      id: playlistId,
      title: playlistInfo.snippet.title,
      description: playlistInfo.snippet.description,
      thumbnail:
        videos[0]?.thumbnail || playlistInfo.snippet.thumbnails.high.url,
      videoCount: videos.length,
      videos,
      url,
      dateAdded: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching playlist:", error);
    // Fallback to mock data on error
    console.warn("Falling back to mock data due to API error");
    return getMockPlaylist(playlistId);
  }
}
