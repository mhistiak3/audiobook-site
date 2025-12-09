# Audiobook Player

A minimal, modern audiobook player built with Next.js that transforms YouTube playlists into an immersive listening experience.

## Features

- 🎵 **YouTube Playlist Integration** - Load any YouTube playlist by URL
- 🎧 **Custom Audio Player** - Full-featured player with play/pause, seek, speed control, and volume
- ⌨️ **Keyboard Controls** - Space for play/pause, arrows for seeking and volume
- 🌓 **Dark Mode** - Beautiful light and dark themes
- 💾 **Local Storage** - Your playlists are saved locally for quick access
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ⏭️ **Auto-play Next** - Automatically plays the next chapter when current ends
- 🎨 **Modern UI** - Clean, minimal design with smooth animations

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone or download this repository

2. Install dependencies:

```bash
npm install
```

3. (Optional) Configure YouTube API Key:
   - Create a `.env.local` file in the root directory
   - Add your YouTube Data API key:
   ```
   NEXT_PUBLIC_YOUTUBE_API_KEY=your_api_key_here
   ```
   - If no API key is provided, the app will use demo data

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## How to Use

1. **Load a Playlist**

   - Paste a YouTube playlist URL into the input field
   - Click "Load Playlist"
   - The playlist will be fetched and saved locally

2. **Play Your Audiobook**

   - Click on any playlist card to view chapters
   - Click on a chapter to start playing
   - Use the player controls at the bottom of the screen

3. **Keyboard Shortcuts**
   - `Space` - Play/Pause
   - `←` - Seek backward 10 seconds
   - `→` - Seek forward 10 seconds
   - `↑` - Increase volume
   - `↓` - Decrease volume

## Getting a YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API Key)
5. Copy the API key to your `.env.local` file

## Technology Stack

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **YouTube Data API** - Playlist and video data

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── playlist/[id]/
│   │   └── page.tsx          # Playlist detail page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── AudioPlayer.tsx       # Custom audio player
│   ├── ChapterList.tsx       # Chapter list display
│   ├── PlaylistCard.tsx      # Playlist card component
│   ├── PlaylistInput.tsx     # URL input form
│   └── DarkModeToggle.tsx    # Theme toggle
├── lib/
│   ├── types.ts              # TypeScript types
│   ├── youtube.ts            # YouTube API integration
│   └── storage.ts            # localStorage utilities
└── hooks/
    └── useKeyboardControls.ts # Keyboard shortcuts hook
```

## Notes

- Audio playback is currently simulated. YouTube doesn't allow direct audio streaming due to their Terms of Service.
- The YouTube Data API is used to fetch playlist metadata (titles, thumbnails, durations).
- For production use with real audio, you would need to integrate a service that handles YouTube audio extraction or use your own audio files.

## License

MIT License - feel free to use this project for personal or commercial purposes.
