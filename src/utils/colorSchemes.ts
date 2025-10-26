import { Track } from '../types';

// Genre color palette
export const GENRE_COLORS: Record<string, string> = {
  'pop': '#FF6B9D',
  'rock': '#C44536',
  'hip hop': '#A64DFF',
  'rap': '#A64DFF',
  'electronic': '#00D9FF',
  'dance': '#00D9FF',
  'r&b': '#FFB84D',
  'soul': '#FFB84D',
  'country': '#8B4513',
  'jazz': '#4ECDC4',
  'classical': '#95A3B3',
  'indie': '#FFE66D',
  'alternative': '#6BCF7F',
  'other': '#CCCCCC',
};

/**
 * Get color for a track based on its genre
 */
export function getGenreColor(genre: string | undefined): string {
  if (!genre) return GENRE_COLORS['other'];

  const normalized = genre.toLowerCase();

  // Check for exact or partial match
  for (const [key, color] of Object.entries(GENRE_COLORS)) {
    if (normalized.includes(key)) {
      return color;
    }
  }

  return GENRE_COLORS['other'];
}

/**
 * Generate consistent color from a string ID using hash function
 */
function hashStringToColor(str: string, saturation: number = 70, lightness: number = 60): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }

  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Get color for a track based on its primary artist
 */
export function getArtistColor(artistId: string): string {
  return hashStringToColor(artistId, 70, 60);
}

/**
 * Get color for a track based on its album
 */
export function getAlbumColor(albumId: string): string {
  return hashStringToColor(albumId, 65, 55);
}

/**
 * Get color for a track based on its release year
 * Blue (old) -> Red (new) gradient
 */
export function getReleaseYearColor(releaseDate: string | undefined): string {
  if (!releaseDate) return '#CCCCCC';

  const year = parseInt(releaseDate.substring(0, 4));
  if (isNaN(year)) return '#CCCCCC';

  const minYear = 1950;
  const maxYear = new Date().getFullYear();

  // Normalize year to 0-1 range
  const normalized = Math.max(0, Math.min(1, (year - minYear) / (maxYear - minYear)));

  // Map to hue: 240 (blue) to 0 (red)
  const hue = 240 - (normalized * 240);

  return `hsl(${hue}, 80%, 60%)`;
}

/**
 * Get color for a track based on the selected color mode
 */
export function getTrackColor(
  track: Track,
  colorMode: 'genre' | 'artist' | 'album' | 'releaseYear'
): string {
  switch (colorMode) {
    case 'genre':
      return getGenreColor(track.genre);
    case 'artist':
      return getArtistColor(track.artists[0]?.id || 'unknown');
    case 'album':
      return getAlbumColor(track.album.id);
    case 'releaseYear':
      return getReleaseYearColor(track.album.release_date);
    default:
      return '#CCCCCC';
  }
}

/**
 * Get legend items for the current color mode
 */
export function getLegendItems(colorMode: 'genre' | 'artist' | 'album' | 'releaseYear'): Array<{ label: string; color: string }> {
  switch (colorMode) {
    case 'genre':
      return Object.entries(GENRE_COLORS).map(([genre, color]) => ({
        label: genre.charAt(0).toUpperCase() + genre.slice(1),
        color
      }));
    case 'releaseYear':
      return [
        { label: '1950s', color: getReleaseYearColor('1950-01-01') },
        { label: '1970s', color: getReleaseYearColor('1970-01-01') },
        { label: '1990s', color: getReleaseYearColor('1990-01-01') },
        { label: '2000s', color: getReleaseYearColor('2000-01-01') },
        { label: '2010s', color: getReleaseYearColor('2010-01-01') },
        { label: '2020s', color: getReleaseYearColor('2020-01-01') },
      ];
    case 'artist':
    case 'album':
      return [{ label: 'Each unique item has a distinct color', color: '#888888' }];
    default:
      return [];
  }
}
