// Core data types for the playlist analyzer

export interface Artist {
  id: string;
  name: string;
}

export interface Album {
  id: string;
  name: string;
  release_date: string;
  images?: { url: string; width: number; height: number }[];
}

export interface Track {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  duration_ms: number;
  popularity?: number;
  genre?: string;
}

export interface PlaylistData {
  id: string;
  name: string;
  description?: string;
  year?: number;
  total_tracks: number;
  tracks: Track[];
  platform?: 'spotify' | 'apple';
}

export interface SankeyNode {
  id: string;
  name: string;
  playlist: number;
  trackData: Track;
  color: string;
  // D3 sankey will add these during layout
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
}

export interface SankeyLink {
  source: string | SankeyNode;
  target: string | SankeyNode;
  value: number;
  color: string;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export type ColorMode = 'genre' | 'artist' | 'album' | 'releaseYear';

export interface TooltipPosition {
  x: number;
  y: number;
}
