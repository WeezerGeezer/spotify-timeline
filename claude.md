# Claude.md - Technical Implementation Guide
## Year-End Playlist Analyzer with Sankey Visualization

This document provides detailed technical guidance for implementing the Year-End Playlist Analyzer. It serves as a reference for developers and AI assistants working on this project.

---

## Table of Contents
1. [Project Architecture](#project-architecture)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Implementation Phases](#implementation-phases)
5. [API Integration Guide](#api-integration-guide)
6. [Sankey Diagram Implementation](#sankey-diagram-implementation)
7. [Color Coding System](#color-coding-system)
8. [State Management](#state-management)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Guide](#deployment-guide)
11. [Code Examples](#code-examples)

---

## Project Architecture

### System Overview
```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│   Browser   │────────▶│  Flask API   │────────▶│  Spotify API    │
│  (React UI) │◀────────│   Backend    │◀────────│  Apple Music    │
└─────────────┘         └──────────────┘         └─────────────────┘
      │                       │
      │                       │
      ▼                       ▼
┌─────────────┐         ┌──────────────┐
│  D3.js      │         │    Redis     │
│  Sankey     │         │   (Cache)    │
└─────────────┘         └──────────────┘
```

### Architecture Decisions

**Frontend-Backend Separation:**
- **Frontend:** React SPA for rich interactivity
- **Backend:** Flask API for OAuth handling and data processing
- **Reason:** Separation of concerns, easier testing, scalable

**Client-Side Rendering:**
- Sankey diagrams rendered in browser using D3.js
- **Reason:** Better interactivity, reduced server load, offline capability

**Session-Based Data:**
- No persistent database for MVP
- Data stored in browser sessionStorage
- **Reason:** Privacy-first, simpler architecture, faster development

---

## Technology Stack

### Frontend
```json
{
  "framework": "React 18.2+",
  "language": "TypeScript 5.0+",
  "visualization": "d3-sankey 0.12+",
  "styling": "Tailwind CSS 3.3+",
  "state": "Zustand 4.4+ or React Context",
  "http": "Axios 1.6+",
  "build": "Vite 5.0+"
}
```

### Backend
```python
{
  "framework": "Flask 3.0+",
  "spotify_library": "spotipy 2.23+",
  "auth": "Flask-Session",
  "cache": "redis 5.0+ (optional)",
  "environment": "python-dotenv",
  "cors": "Flask-CORS",
  "wsgi": "gunicorn 21.2+"
}
```

### Development Tools
- **Linting:** ESLint (frontend), Pylint (backend)
- **Formatting:** Prettier (frontend), Black (backend)
- **Testing:** Jest + React Testing Library, pytest
- **Version Control:** Git with conventional commits

---

## Project Structure

```
spotify-timeline/
├── frontend/                    # React application
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── SankeyDiagram.tsx       # Main visualization
│   │   │   ├── PlaylistInput.tsx       # URL input form
│   │   │   ├── ColorModeSelector.tsx   # Toggle color modes
│   │   │   ├── TrackTooltip.tsx        # Hover tooltip
│   │   │   ├── SearchFilter.tsx        # Track search
│   │   │   └── Analytics.tsx           # Stats dashboard
│   │   ├── hooks/
│   │   │   ├── useSpotifyAuth.ts       # OAuth flow
│   │   │   ├── usePlaylistData.ts      # Fetch playlists
│   │   │   └── useSankeyData.ts        # Transform data
│   │   ├── services/
│   │   │   ├── api.ts                  # Backend API calls
│   │   │   └── spotify.ts              # Spotify-specific logic
│   │   ├── utils/
│   │   │   ├── colorSchemes.ts         # Color palettes
│   │   │   ├── sankeyTransform.ts      # Data transformation
│   │   │   └── helpers.ts              # Utilities
│   │   ├── types/
│   │   │   ├── playlist.ts
│   │   │   ├── track.ts
│   │   │   └── sankey.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                     # Flask API
│   ├── app.py                  # Main application
│   ├── routes/
│   │   ├── auth.py             # OAuth endpoints
│   │   ├── playlists.py        # Playlist endpoints
│   │   └── tracks.py           # Track metadata endpoints
│   ├── services/
│   │   ├── spotify_service.py  # Spotify API integration
│   │   ├── apple_service.py    # Apple Music (future)
│   │   └── cache_service.py    # Redis caching
│   ├── utils/
│   │   ├── validators.py       # Input validation
│   │   └── transformers.py     # Data transformation
│   ├── config.py               # Configuration
│   └── requirements.txt
│
├── tests/
│   ├── frontend/
│   │   └── components/
│   └── backend/
│       └── test_routes.py
│
├── .env.example                # Environment template
├── .gitignore
├── README.md
├── PRD.md                      # Product requirements
├── claude.md                   # This file
└── docker-compose.yml          # Optional containerization
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

#### 1.1 Project Setup
```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Frontend setup
cd frontend
npm install
```

#### 1.2 Spotify OAuth Implementation
**Backend: `backend/routes/auth.py`**
```python
from flask import Blueprint, redirect, session, request, jsonify
from spotipy.oauth2 import SpotifyOAuth
import os

auth_bp = Blueprint('auth', __name__)

sp_oauth = SpotifyOAuth(
    client_id=os.getenv('SPOTIFY_CLIENT_ID'),
    client_secret=os.getenv('SPOTIFY_CLIENT_SECRET'),
    redirect_uri=os.getenv('SPOTIFY_REDIRECT_URI'),
    scope='playlist-read-private playlist-read-collaborative user-top-read',
    cache_handler=None  # Use session-based caching
)

@auth_bp.route('/login')
def login():
    auth_url = sp_oauth.get_authorize_url()
    return jsonify({'auth_url': auth_url})

@auth_bp.route('/callback')
def callback():
    code = request.args.get('code')
    token_info = sp_oauth.get_access_token(code)
    session['token_info'] = token_info
    return redirect(os.getenv('FRONTEND_URL'))

@auth_bp.route('/logout')
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'})
```

**Frontend: `frontend/src/hooks/useSpotifyAuth.ts`**
```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useSpotifyAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/auth/status');
      setAuthState({
        isAuthenticated: response.data.authenticated,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to check authentication status',
      });
    }
  };

  const login = async () => {
    try {
      const response = await axios.get('/api/auth/login');
      window.location.href = response.data.auth_url;
    } catch (error) {
      setAuthState(prev => ({ ...prev, error: 'Failed to initiate login' }));
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setAuthState({ isAuthenticated: false, isLoading: false, error: null });
    } catch (error) {
      setAuthState(prev => ({ ...prev, error: 'Failed to logout' }));
    }
  };

  return { ...authState, login, logout };
};
```

#### 1.3 Environment Configuration
**`.env.example`**
```bash
# Backend
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:5000/api/auth/callback
FRONTEND_URL=http://localhost:5173
FLASK_SECRET_KEY=your_secret_key_here
REDIS_URL=redis://localhost:6379/0  # Optional

# Frontend
VITE_API_URL=http://localhost:5000/api
```

---

### Phase 2: Playlist Data Fetching (Week 2-3)

#### 2.1 Backend Playlist Service
**`backend/services/spotify_service.py`**
```python
import spotipy
from typing import List, Dict, Optional
from flask import session

class SpotifyService:
    def __init__(self):
        self.sp = None

    def get_client(self) -> spotipy.Spotify:
        """Get authenticated Spotify client from session"""
        token_info = session.get('token_info')
        if not token_info:
            raise Exception('Not authenticated')

        return spotipy.Spotify(auth=token_info['access_token'])

    def get_playlist_data(self, playlist_id: str) -> Dict:
        """
        Fetch complete playlist data including tracks and metadata

        Returns:
        {
            'id': str,
            'name': str,
            'description': str,
            'total_tracks': int,
            'tracks': [Track objects]
        }
        """
        sp = self.get_client()

        # Get playlist metadata
        playlist = sp.playlist(playlist_id, fields='id,name,description,tracks.total')

        # Get all tracks (handle pagination)
        tracks = []
        offset = 0
        limit = 100

        while offset < playlist['tracks']['total']:
            results = sp.playlist_tracks(
                playlist_id,
                offset=offset,
                limit=limit,
                fields='items(track(id,name,artists,album,duration_ms,popularity))'
            )

            for item in results['items']:
                if item['track']:  # Filter out None tracks
                    track_data = self._process_track(item['track'])
                    tracks.append(track_data)

            offset += limit

        return {
            'id': playlist['id'],
            'name': playlist['name'],
            'description': playlist.get('description', ''),
            'total_tracks': len(tracks),
            'tracks': tracks
        }

    def _process_track(self, track: Dict) -> Dict:
        """Extract and enrich track data"""
        return {
            'id': track['id'],
            'name': track['name'],
            'artists': [{'id': a['id'], 'name': a['name']} for a in track['artists']],
            'album': {
                'id': track['album']['id'],
                'name': track['album']['name'],
                'release_date': track['album'].get('release_date', ''),
                'images': track['album'].get('images', [])
            },
            'duration_ms': track['duration_ms'],
            'popularity': track.get('popularity', 0)
        }

    def get_track_audio_features(self, track_ids: List[str]) -> Dict[str, Dict]:
        """Get audio features for multiple tracks"""
        sp = self.get_client()

        # Spotify API allows max 100 IDs per request
        features_map = {}

        for i in range(0, len(track_ids), 100):
            batch = track_ids[i:i+100]
            features = sp.audio_features(batch)

            for feature in features:
                if feature:
                    features_map[feature['id']] = {
                        'energy': feature['energy'],
                        'danceability': feature['danceability'],
                        'valence': feature['valence'],
                        'tempo': feature['tempo'],
                        'acousticness': feature['acousticness']
                    }

        return features_map

    def get_artist_genres(self, artist_ids: List[str]) -> Dict[str, List[str]]:
        """Get genres for multiple artists"""
        sp = self.get_client()

        genres_map = {}

        for i in range(0, len(artist_ids), 50):
            batch = artist_ids[i:i+50]
            artists = sp.artists(batch)

            for artist in artists['artists']:
                genres_map[artist['id']] = artist.get('genres', [])

        return genres_map
```

#### 2.2 Frontend Data Fetching Hook
**`frontend/src/hooks/usePlaylistData.ts`**
```typescript
import { useState, useCallback } from 'react';
import axios from 'axios';
import { PlaylistData, Track } from '../types';

interface UsePlaylistDataReturn {
  playlists: PlaylistData[];
  isLoading: boolean;
  error: string | null;
  fetchPlaylists: (urls: string[]) => Promise<void>;
}

export const usePlaylistData = (): UsePlaylistDataReturn => {
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractPlaylistId = (url: string): string | null => {
    // Extract from: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
    const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  const fetchPlaylists = useCallback(async (urls: string[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const playlistIds = urls
        .map(extractPlaylistId)
        .filter((id): id is string => id !== null);

      if (playlistIds.length === 0) {
        throw new Error('No valid playlist URLs provided');
      }

      // Fetch playlists in parallel
      const promises = playlistIds.map(id =>
        axios.get<PlaylistData>(`/api/playlists/${id}`)
      );

      const responses = await Promise.all(promises);
      const playlistData = responses.map(r => r.data);

      setPlaylists(playlistData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch playlists';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { playlists, isLoading, error, fetchPlaylists };
};
```

---

### Phase 3: Sankey Diagram Implementation (Week 3-5)

#### 3.1 Data Transformation
**`frontend/src/utils/sankeyTransform.ts`**
```typescript
import { PlaylistData, SankeyData, SankeyNode, SankeyLink } from '../types';

export interface SankeyInput {
  playlists: PlaylistData[];
  colorMode: 'genre' | 'artist' | 'album' | 'releaseYear';
}

export function transformToSankeyData(input: SankeyInput): SankeyData {
  const { playlists, colorMode } = input;

  const nodes: SankeyNode[] = [];
  const links: SankeyLink[] = [];

  // Create nodes for each track in each playlist
  playlists.forEach((playlist, playlistIndex) => {
    playlist.tracks.forEach((track, trackIndex) => {
      nodes.push({
        id: `${playlistIndex}-${track.id}`,
        name: track.name,
        playlist: playlistIndex,
        trackData: track,
        color: getColorForTrack(track, colorMode)
      });
    });
  });

  // Create links between consecutive playlists
  for (let i = 0; i < playlists.length - 1; i++) {
    const currentPlaylist = playlists[i];
    const nextPlaylist = playlists[i + 1];

    currentPlaylist.tracks.forEach((currentTrack, currentIndex) => {
      const matchIndex = nextPlaylist.tracks.findIndex(
        t => t.id === currentTrack.id
      );

      if (matchIndex !== -1) {
        links.push({
          source: `${i}-${currentTrack.id}`,
          target: `${i + 1}-${currentTrack.id}`,
          value: 1, // Can be weighted by play count or popularity
          color: getColorForTrack(currentTrack, colorMode)
        });
      }
    });
  }

  return { nodes, links };
}

function getColorForTrack(track: Track, mode: string): string {
  switch (mode) {
    case 'genre':
      return getGenreColor(track.genre || 'Other');
    case 'artist':
      return getArtistColor(track.artists[0]?.id);
    case 'album':
      return getAlbumColor(track.album.id);
    case 'releaseYear':
      return getReleaseYearColor(track.album.release_date);
    default:
      return '#CCCCCC';
  }
}

// Color mapping functions
const GENRE_COLORS: Record<string, string> = {
  'pop': '#FF6B9D',
  'rock': '#C44536',
  'hip hop': '#A64DFF',
  'electronic': '#00D9FF',
  'r&b': '#FFB84D',
  'country': '#8B4513',
  'jazz': '#4ECDC4',
  'classical': '#95A3B3',
  'indie': '#FFE66D',
  'alternative': '#6BCF7F',
};

function getGenreColor(genre: string): string {
  const normalized = genre.toLowerCase();
  for (const [key, color] of Object.entries(GENRE_COLORS)) {
    if (normalized.includes(key)) return color;
  }
  return '#CCCCCC';
}

function getArtistColor(artistId: string): string {
  // Generate consistent color from artist ID using hash
  let hash = 0;
  for (let i = 0; i < artistId.length; i++) {
    hash = artistId.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

function getAlbumColor(albumId: string): string {
  // Similar to artist color
  let hash = 0;
  for (let i = 0; i < albumId.length; i++) {
    hash = albumId.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = hash % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

function getReleaseYearColor(releaseDate: string): string {
  if (!releaseDate) return '#CCCCCC';

  const year = parseInt(releaseDate.substring(0, 4));
  const minYear = 1950;
  const maxYear = new Date().getFullYear();

  // Map year to blue (old) -> red (new)
  const normalized = (year - minYear) / (maxYear - minYear);
  const hue = 240 - (normalized * 240); // 240 (blue) to 0 (red)

  return `hsl(${hue}, 80%, 60%)`;
}
```

#### 3.2 Sankey Diagram Component
**`frontend/src/components/SankeyDiagram.tsx`**
```typescript
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal, SankeyGraph, SankeyNode, SankeyLink } from 'd3-sankey';
import { SankeyData } from '../types';

interface SankeyDiagramProps {
  data: SankeyData;
  width?: number;
  height?: number;
  onNodeHover?: (node: SankeyNode<any, any> | null) => void;
  onNodeClick?: (node: SankeyNode<any, any>) => void;
  highlightedTrackId?: string | null;
}

export const SankeyDiagram: React.FC<SankeyDiagramProps> = ({
  data,
  width = 1200,
  height = 800,
  onNodeHover,
  onNodeClick,
  highlightedTrackId
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const margin = { top: 20, right: 40, bottom: 20, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create sankey generator
    const sankeyGenerator = sankey<any, any>()
      .nodeId((d: any) => d.id)
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[0, 0], [innerWidth, innerHeight]]);

    // Generate layout
    const graph: SankeyGraph<any, any> = sankeyGenerator({
      nodes: data.nodes.map(d => ({ ...d })),
      links: data.links.map(d => ({ ...d }))
    });

    // Draw links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(graph.links)
      .enter()
      .append('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', (d: any) => d.color || '#999')
      .attr('stroke-width', (d: any) => Math.max(1, d.width || 0))
      .attr('fill', 'none')
      .attr('opacity', 0.3)
      .on('mouseover', function() {
        d3.select(this).attr('opacity', 0.6);
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.3);
      });

    // Draw nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('rect')
      .data(graph.nodes)
      .enter()
      .append('rect')
      .attr('x', (d: any) => d.x0)
      .attr('y', (d: any) => d.y0)
      .attr('height', (d: any) => Math.max(1, d.y1 - d.y0))
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('fill', (d: any) => d.color || '#888')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('opacity', (d: any) => {
        if (!highlightedTrackId) return 1;
        return d.trackData.id === highlightedTrackId ? 1 : 0.2;
      })
      .on('mouseover', function(event, d: any) {
        setHoveredNode(d.id);
        onNodeHover?.(d);
        d3.select(this).attr('stroke-width', 3);
      })
      .on('mouseout', function(event, d: any) {
        setHoveredNode(null);
        onNodeHover?.(null);
        d3.select(this).attr('stroke-width', 1);
      })
      .on('click', function(event, d: any) {
        onNodeClick?.(d);
      });

    // Add node labels (for larger nodes)
    g.append('g')
      .attr('class', 'node-labels')
      .selectAll('text')
      .data(graph.nodes.filter((d: any) => (d.y1 - d.y0) > 15))
      .enter()
      .append('text')
      .attr('x', (d: any) => d.x0 - 6)
      .attr('y', (d: any) => (d.y0 + d.y1) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('font-size', '10px')
      .attr('fill', '#333')
      .text((d: any) => d.name.length > 20 ? d.name.substring(0, 20) + '...' : d.name);

  }, [data, width, height, highlightedTrackId, onNodeHover, onNodeClick]);

  return (
    <div className="sankey-container">
      <svg ref={svgRef} />
    </div>
  );
};
```

---

### Phase 4: Color Modes & Interactivity (Week 5-6)

#### 4.1 Color Mode Selector
**`frontend/src/components/ColorModeSelector.tsx`**
```typescript
import React from 'react';

export type ColorMode = 'genre' | 'artist' | 'album' | 'releaseYear';

interface ColorModeSelectorProps {
  currentMode: ColorMode;
  onChange: (mode: ColorMode) => void;
}

export const ColorModeSelector: React.FC<ColorModeSelectorProps> = ({
  currentMode,
  onChange
}) => {
  const modes = [
    { value: 'genre', label: 'Genre', icon: '🎵' },
    { value: 'artist', label: 'Artist', icon: '🎤' },
    { value: 'album', label: 'Album', icon: '💿' },
    { value: 'releaseYear', label: 'Release Year', icon: '📅' }
  ] as const;

  return (
    <div className="flex gap-2 p-4 bg-gray-100 rounded-lg">
      <span className="font-semibold mr-2">Color by:</span>
      {modes.map(mode => (
        <button
          key={mode.value}
          onClick={() => onChange(mode.value)}
          className={`
            px-4 py-2 rounded-md transition-all
            ${currentMode === mode.value
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-200'}
          `}
        >
          <span className="mr-2">{mode.icon}</span>
          {mode.label}
        </button>
      ))}
    </div>
  );
};
```

#### 4.2 Track Tooltip
**`frontend/src/components/TrackTooltip.tsx`**
```typescript
import React from 'react';
import { Track } from '../types';

interface TrackTooltipProps {
  track: Track;
  position: { x: number; y: number };
}

export const TrackTooltip: React.FC<TrackTooltipProps> = ({ track, position }) => {
  return (
    <div
      className="absolute z-50 bg-white shadow-xl rounded-lg p-4 max-w-sm border border-gray-200"
      style={{
        left: position.x + 10,
        top: position.y + 10,
      }}
    >
      <div className="flex items-start gap-3">
        {track.album.images[0] && (
          <img
            src={track.album.images[0].url}
            alt={track.album.name}
            className="w-16 h-16 rounded"
          />
        )}
        <div className="flex-1">
          <h3 className="font-bold text-lg">{track.name}</h3>
          <p className="text-gray-600">{track.artists.map(a => a.name).join(', ')}</p>
          <p className="text-sm text-gray-500">{track.album.name}</p>
          <div className="mt-2 flex gap-2 text-xs">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {track.genre || 'Unknown Genre'}
            </span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
              {track.album.release_date?.substring(0, 4) || 'Unknown Year'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

### Phase 5: Polish & Deployment (Week 7-8)

#### 5.1 Performance Optimization
```typescript
// Use React.memo for expensive components
export const SankeyDiagram = React.memo(SankeyDiagramComponent);

// Debounce search input
import { useDebouncedValue } from './hooks/useDebouncedValue';

const debouncedSearch = useDebouncedValue(searchQuery, 300);

// Virtualize large lists
import { FixedSizeList } from 'react-window';

// Lazy load components
const Analytics = React.lazy(() => import('./components/Analytics'));
```

#### 5.2 Error Handling
**`frontend/src/components/ErrorBoundary.tsx`**
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-700 mb-4">
              We're sorry, but something unexpected happened.
            </p>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Testing Strategy

### Frontend Tests
```typescript
// frontend/src/components/__tests__/SankeyDiagram.test.tsx
import { render, screen } from '@testing-library/react';
import { SankeyDiagram } from '../SankeyDiagram';

describe('SankeyDiagram', () => {
  it('renders without crashing', () => {
    const mockData = {
      nodes: [{ id: '1', name: 'Track 1', playlist: 0, trackData: {} }],
      links: []
    };
    render(<SankeyDiagram data={mockData} />);
  });

  it('handles empty data', () => {
    const mockData = { nodes: [], links: [] };
    render(<SankeyDiagram data={mockData} />);
    // Should not crash
  });
});
```

### Backend Tests
```python
# backend/tests/test_spotify_service.py
import pytest
from services.spotify_service import SpotifyService

def test_extract_playlist_id():
    service = SpotifyService()
    url = "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M"
    playlist_id = service.extract_playlist_id(url)
    assert playlist_id == "37i9dQZF1DXcBWIGoYBM5M"

@pytest.mark.integration
def test_get_playlist_data(authenticated_spotify_client):
    service = SpotifyService()
    data = service.get_playlist_data("37i9dQZF1DXcBWIGoYBM5M")
    assert 'tracks' in data
    assert len(data['tracks']) > 0
```

---

## Deployment Guide

### Deployment Options

#### Option 1: Vercel (Frontend) + Railway (Backend)
```bash
# Frontend on Vercel
cd frontend
npm run build
vercel --prod

# Backend on Railway
# Connect GitHub repo to Railway dashboard
# Set environment variables in Railway UI
```

#### Option 2: Single Platform (Render, Fly.io)
```yaml
# render.yaml
services:
  - type: web
    name: spotify-timeline-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app
    envVars:
      - key: SPOTIFY_CLIENT_ID
        sync: false
      - key: SPOTIFY_CLIENT_SECRET
        sync: false

  - type: web
    name: spotify-timeline-frontend
    env: node
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
```

### Production Checklist
- [ ] Set all environment variables
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up error monitoring (Sentry)
- [ ] Enable rate limiting
- [ ] Configure caching headers
- [ ] Test OAuth flow in production
- [ ] Set up analytics (optional)
- [ ] Create backup/rollback plan

---

## Common Issues & Solutions

### Issue 1: CORS Errors
**Solution:**
```python
# backend/app.py
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=[os.getenv('FRONTEND_URL')], supports_credentials=True)
```

### Issue 2: Sankey Diagram Not Rendering
**Solution:** Check console for D3 errors, ensure data structure matches expected format:
```typescript
interface SankeyData {
  nodes: Array<{ id: string, name: string, ... }>;
  links: Array<{ source: string, target: string, value: number }>;
}
```

### Issue 3: Spotify API Rate Limiting
**Solution:** Implement exponential backoff:
```python
import time
from functools import wraps

def retry_with_backoff(retries=3, backoff_in_seconds=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            x = 0
            while True:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if x == retries:
                        raise
                    sleep = (backoff_in_seconds * 2 ** x)
                    time.sleep(sleep)
                    x += 1
        return wrapper
    return decorator
```

---

## Performance Benchmarks

Target performance metrics:
- **Initial Load:** < 3s
- **Playlist Fetch:** < 5s per playlist
- **Sankey Render:** < 2s for 10 playlists (1000 tracks)
- **Color Mode Switch:** < 300ms
- **Search/Filter:** < 100ms

Optimization techniques:
- Use React.memo for static components
- Implement virtualization for large lists
- Lazy load heavy libraries (D3)
- Cache API responses (Redis/localStorage)
- Use Web Workers for data transformation
- Optimize SVG rendering (limit nodes/links)

---

## Security Considerations

1. **OAuth Security:**
   - Use PKCE flow for public clients
   - Store tokens securely (httpOnly cookies)
   - Implement CSRF protection
   - Validate redirect URIs

2. **API Security:**
   - Validate all user inputs
   - Implement rate limiting (per IP/user)
   - Sanitize playlist URLs
   - Use HTTPS only

3. **Data Privacy:**
   - No persistent user data storage
   - Clear session data on logout
   - Transparent privacy policy
   - GDPR compliance (EU users)

---

## Resources

### Documentation
- [Spotify Web API Reference](https://developer.spotify.com/documentation/web-api/)
- [D3 Sankey Documentation](https://github.com/d3/d3-sankey)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)

### Design References
- [Spotify Wrapped 2024](https://newsroom.spotify.com/wrapped/)
- [Observable D3 Gallery](https://observablehq.com/@d3/gallery)
- [The Pudding Visualizations](https://pudding.cool/)

### Tools
- [Figma](https://www.figma.com/) - UI/UX design
- [Postman](https://www.postman.com/) - API testing
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/) - Performance profiling

---

**Document Version:** 1.0
**Last Updated:** 2025-10-26
**Maintainer:** Development Team
**Status:** Living Document - Update as implementation progresses
