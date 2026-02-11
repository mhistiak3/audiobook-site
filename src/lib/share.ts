// Share utility functions

export interface ShareOptions {
  title: string;
  text?: string;
  url: string;
}

/**
 * Generate a share URL for a video
 */
export function getVideoShareUrl(videoId: string): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  return `${baseUrl}/share/v/${videoId}`;
}

/**
 * Generate a share URL for a playlist
 */
export function getPlaylistShareUrl(playlistId: string): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  return `${baseUrl}/share/p/${playlistId}`;
}

/**
 * Share content using Web Share API or fallback to clipboard
 */
export async function shareContent(
  options: ShareOptions,
): Promise<{ success: boolean; method: "share" | "clipboard" }> {
  // Try native share API first (better on mobile)
  if (navigator.share) {
    try {
      await navigator.share({
        title: options.title,
        text: options.text,
        url: options.url,
      });
      return { success: true, method: "share" };
    } catch (error) {
      // User cancelled or share failed, fall through to clipboard
      if ((error as Error).name === "AbortError") {
        return { success: false, method: "share" };
      }
    }
  }

  // Fallback to clipboard
  try {
    // Try modern clipboard API first
    if (navigator.clipboard && document.hasFocus()) {
      await navigator.clipboard.writeText(options.url);
      return { success: true, method: "clipboard" };
    }

    // Fallback for when document is not focused or clipboard API unavailable
    const textArea = document.createElement("textarea");
    textArea.value = options.url;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const success = document.execCommand("copy");
    document.body.removeChild(textArea);

    return { success, method: "clipboard" };
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return { success: false, method: "clipboard" };
  }
}

/**
 * Share a video
 */
export async function shareVideo(
  videoId: string,
  videoTitle: string,
): Promise<{ success: boolean; method: "share" | "clipboard" }> {
  const url = getVideoShareUrl(videoId);
  return shareContent({
    title: videoTitle,
    text: `Listen to "${videoTitle}" on Audiobook Player`,
    url,
  });
}

/**
 * Share a playlist
 */
export async function sharePlaylist(
  playlistId: string,
  playlistTitle: string,
  videoCount: number,
): Promise<{ success: boolean; method: "share" | "clipboard" }> {
  const url = getPlaylistShareUrl(playlistId);
  return shareContent({
    title: playlistTitle,
    text: `Listen to "${playlistTitle}" (${videoCount} chapters) on Audiobook Player`,
    url,
  });
}
