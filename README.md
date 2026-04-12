# 🎧 Audiobook Player

A minimal, modern audiobook player built with Next.js that transforms YouTube playlists into an immersive listening experience.

## ✨ Features

### 🎯 New Features 

- **Skip Forward/Backward Buttons** ⏪⏩ - Quick skip buttons in mini and full player with customizable intervals (5-60s)
- **Sleep Timer** ⏰ - Set automatic playback stop with presets (15/30/45/60 min) or end of chapter
- **Playback Speed Control** - Quick speed presets (0.75x - 2x) with memory across sessions
- **Bookmarks & Notes** 📌 - Save timestamped moments with optional notes, synced to cloud
- **Continue Listening** 🔄 - Quick access to recently played audiobooks with progress
- **Statistics Dashboard** 📊 - Track listening time, completed chapters, and achievements
- **Enhanced Navigation** 🧭 - Bottom navigation with dedicated pages for all features

### 🔐 Cloud Sync & Authentication

- **Supabase Auth** - Secure email/password authentication
- **Cloud Storage** - Access your library from any device
- **Progress Sync** - Resume playback on any device
- **Multi-Device** - Seamless experience everywhere

### 📱 New: Progressive Web App

- **Installable** - Add to home screen on mobile/desktop
- **Offline Ready** - Service worker caches assets
- **Standalone Mode** - App-like experience
- **Auto Updates** - Stay current automatically

### 🎵 Core Features

- **YouTube Integration** - Load playlists and videos by URL
- **Custom Player** - Full controls (play, pause, seek, speed, volume)
- **Keyboard Shortcuts** - Space, arrows for quick control
- **Dark Mode** - Beautiful dark theme
- **Responsive** - Works on desktop, tablet, mobile
- **Auto-play** - Automatically plays next chapter
- **Modern UI** - Clean, minimal design with animations

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install dependencies**:

```bash
npm install
```

2. **Configure environment variables** (`.env.local` already set up):

```env
NEXT_PUBLIC_YOUTUBE_API_KEY=your_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_anon_key
```

3. **Run database migration** ⚠️ REQUIRED:
   - Open [Supabase Dashboard](https://supabase.com/dashboard)
   - Go to SQL Editor
   - Copy & run `supabase/migrations/001_initial_schema.sql`

4. **Start development server**:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, and start listening!

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

## 🏗️ Technology Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Supabase** - Authentication & PostgreSQL database
- **Redux Toolkit** - State management
- **next-pwa** - Progressive Web App support
- **YouTube Data API** - Playlist and video metadata

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

## 📚 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── playlist/[id]/     # Playlist player page
│   └── page.tsx           # Home page
├── components/            # React components
├── context/               # Auth context
├── lib/                   # Utilities and Supabase
│   ├── supabase/          # Supabase client setup
│   └── supabaseStorage.ts # Database operations
└── store/                 # Redux state management
```

## 🔒 Security

- **Row Level Security (RLS)** - Users can only access their own data
- **Secure Authentication** - Passwords handled by Supabase Auth
- **Protected Routes** - Middleware ensures authentication
- **Environment Variables** - Sensitive keys stored securely

## 🚀 Deployment

### Deploy to Vercel

```bash
npm run build
# Push to GitHub and connect to Vercel
```

### Install as PWA

- **Mobile**: Browser → Share → Add to Home Screen
- **Desktop**: Address bar → Install icon → Install

## 📝 Notes

- YouTube IFrame API used for video playback (complies with TOS)
- Progress saves every second during playback
- Data syncs automatically across devices
- PWA works offline (but videos require internet)
- Service worker caches static assets for fast loading

## License

MIT License - feel free to use this project for personal or commercial purposes.
