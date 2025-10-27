import { useState } from 'react';
import { PlaylistData } from '../types';
import { fetchPlaylists } from '../services/api';

interface UseFetchPlaylistsReturn {
  isLoading: boolean;
  error: string | null;
  warnings: string[];
  platform: 'spotify' | 'apple' | 'mixed' | null;
  fetchPlaylistData: (urls: string[]) => Promise<PlaylistData[]>;
}

export function useFetchPlaylists(): UseFetchPlaylistsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [platform, setPlatform] = useState<'spotify' | 'apple' | 'mixed' | null>(null);

  const fetchPlaylistData = async (urls: string[]): Promise<PlaylistData[]> => {
    setIsLoading(true);
    setError(null);
    setWarnings([]);

    try {
      const response = await fetchPlaylists(urls);

      // Set platform information
      if (response.platform) {
        setPlatform(response.platform);
      }

      // Set warnings if any URLs failed
      if (response.errors && response.errors.length > 0) {
        setWarnings(response.errors);
      }

      // Return the successfully fetched playlists
      if (response.playlists.length === 0) {
        throw new Error('No playlists could be fetched. Please check your URLs.');
      }

      return response.playlists;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch playlists';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    warnings,
    platform,
    fetchPlaylistData,
  };
}
