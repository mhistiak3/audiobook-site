import { Metadata } from "next";
import ShareVideoClient from "./ShareVideoClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate dynamic metadata for OG tags
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id: videoId } = await params;

  // Use YouTube thumbnail directly - no API call needed for basic OG
  const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const maxResThumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  return {
    title: "Listen on Audiobook Player",
    description:
      "Someone shared an audiobook with you. Click to add it to your library and start listening!",
    openGraph: {
      title: "🎧 Listen on Audiobook Player",
      description:
        "Someone shared an audiobook with you. Click to add it to your library and start listening!",
      type: "music.song",
      images: [
        {
          url: maxResThumbnail,
          width: 1280,
          height: 720,
          alt: "Audiobook thumbnail",
        },
        {
          url: thumbnail,
          width: 480,
          height: 360,
          alt: "Audiobook thumbnail",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "🎧 Listen on Audiobook Player",
      description:
        "Someone shared an audiobook with you. Click to add it to your library!",
      images: [maxResThumbnail],
    },
  };
}

export default async function ShareVideoPage({ params }: PageProps) {
  const { id: videoId } = await params;

  return <ShareVideoClient videoId={videoId} />;
}
