import { Metadata } from "next";
import SharePlaylistClient from "./SharePlaylistClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate dynamic metadata for OG tags
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id: playlistId } = await params;

  // For playlists, we can't get thumbnail without API call
  // Use a generic playlist image or fetch from YouTube
  const playlistThumb = `https://i.ytimg.com/vi/${playlistId}/hqdefault.jpg`;

  return {
    title: "Listen to Playlist on Audiobook Player",
    description:
      "Someone shared a playlist with you. Click to add it to your library and start listening!",
    openGraph: {
      title: "🎧 Playlist Shared - Audiobook Player",
      description:
        "Someone shared an audiobook playlist with you. Click to add it to your library and start listening!",
      type: "music.playlist",
      images: [
        {
          url: playlistThumb,
          width: 480,
          height: 360,
          alt: "Playlist thumbnail",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "🎧 Playlist Shared - Audiobook Player",
      description:
        "Someone shared an audiobook playlist with you. Click to add it to your library!",
      images: [playlistThumb],
    },
  };
}

export default async function SharePlaylistPage({ params }: PageProps) {
  const { id: playlistId } = await params;

  return <SharePlaylistClient playlistId={playlistId} />;
}
