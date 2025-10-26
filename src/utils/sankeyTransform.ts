import { PlaylistData, SankeyData, SankeyNode, SankeyLink, ColorMode } from '../types';
import { getTrackColor } from './colorSchemes';

export interface TransformOptions {
  playlists: PlaylistData[];
  colorMode: ColorMode;
}

/**
 * Transform playlist data into Sankey diagram format
 *
 * Creates nodes for each track in each playlist and links between
 * tracks that appear in consecutive playlists
 */
export function transformToSankeyData(options: TransformOptions): SankeyData {
  const { playlists, colorMode } = options;

  if (playlists.length === 0) {
    return { nodes: [], links: [] };
  }

  const nodes: SankeyNode[] = [];
  const links: SankeyLink[] = [];

  // Create a map to track node IDs
  const nodeIds = new Set<string>();

  // Create nodes for each track in each playlist
  playlists.forEach((playlist, playlistIndex) => {
    playlist.tracks.forEach((track) => {
      const nodeId = `${playlistIndex}-${track.id}`;

      // Avoid duplicate nodes
      if (!nodeIds.has(nodeId)) {
        nodes.push({
          id: nodeId,
          name: track.name,
          playlist: playlistIndex,
          trackData: track,
          color: getTrackColor(track, colorMode),
        });
        nodeIds.add(nodeId);
      }
    });
  });

  // Create links between consecutive playlists
  for (let i = 0; i < playlists.length - 1; i++) {
    const currentPlaylist = playlists[i];
    const nextPlaylist = playlists[i + 1];

    // For each track in current playlist, check if it appears in next playlist
    currentPlaylist.tracks.forEach((currentTrack) => {
      const matchingTrack = nextPlaylist.tracks.find(t => t.id === currentTrack.id);

      if (matchingTrack) {
        const sourceId = `${i}-${currentTrack.id}`;
        const targetId = `${i + 1}-${currentTrack.id}`;

        links.push({
          source: sourceId,
          target: targetId,
          value: 1, // Can be weighted by popularity, play count, etc.
          color: getTrackColor(currentTrack, colorMode),
        });
      }
    });
  }

  return { nodes, links };
}

/**
 * Get statistics about the playlists
 */
export function getPlaylistStats(playlists: PlaylistData[]) {
  if (playlists.length === 0) {
    return {
      totalTracks: 0,
      uniqueTracks: 0,
      recurringTracks: 0,
      topArtists: [],
      genreDistribution: {},
    };
  }

  const allTracks = playlists.flatMap(p => p.tracks);
  const uniqueTrackIds = new Set(allTracks.map(t => t.id));

  // Find recurring tracks (appear in more than one playlist)
  const trackCounts = new Map<string, number>();
  allTracks.forEach(track => {
    trackCounts.set(track.id, (trackCounts.get(track.id) || 0) + 1);
  });
  const recurringTracks = Array.from(trackCounts.values()).filter(count => count > 1).length;

  // Top artists by appearance count
  const artistCounts = new Map<string, { name: string; count: number }>();
  allTracks.forEach(track => {
    track.artists.forEach(artist => {
      const existing = artistCounts.get(artist.id);
      if (existing) {
        existing.count++;
      } else {
        artistCounts.set(artist.id, { name: artist.name, count: 1 });
      }
    });
  });

  const topArtists = Array.from(artistCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Genre distribution
  const genreDistribution: Record<string, number> = {};
  allTracks.forEach(track => {
    const genre = track.genre || 'Unknown';
    genreDistribution[genre] = (genreDistribution[genre] || 0) + 1;
  });

  return {
    totalTracks: allTracks.length,
    uniqueTracks: uniqueTrackIds.size,
    recurringTracks,
    topArtists,
    genreDistribution,
  };
}

/**
 * Find tracks that appear in all playlists
 */
export function findConsistentTracks(playlists: PlaylistData[]) {
  if (playlists.length === 0) return [];

  const trackAppearances = new Map<string, { track: any; count: number }>();

  playlists.forEach(playlist => {
    playlist.tracks.forEach(track => {
      const existing = trackAppearances.get(track.id);
      if (existing) {
        existing.count++;
      } else {
        trackAppearances.set(track.id, { track, count: 1 });
      }
    });
  });

  return Array.from(trackAppearances.values())
    .filter(item => item.count === playlists.length)
    .map(item => item.track);
}
