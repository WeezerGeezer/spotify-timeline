import axios from 'axios';
import { PlaylistData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface FetchPlaylistsResponse {
  playlists: PlaylistData[];
  errors: string[];
  status: string;
  platform?: 'spotify' | 'apple' | 'mixed';
}

export interface FetchPlaylistsError {
  error: string;
  playlists: PlaylistData[];
  errors: string[];
}

/**
 * Fetch multiple playlists from Spotify via our backend
 */
export async function fetchPlaylists(urls: string[]): Promise<FetchPlaylistsResponse> {
  try {
    const response = await axios.post<FetchPlaylistsResponse>(
      `${API_BASE_URL}/playlists/fetch`,
      { urls },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Server responded with error
      const errorData = error.response.data as FetchPlaylistsError;
      throw new Error(errorData.error || 'Failed to fetch playlists');
    }
    // Network or other error
    throw new Error('Network error: Unable to connect to API');
  }
}

/**
 * Health check endpoint
 */
export async function healthCheck(): Promise<{ status: string; spotify_configured: boolean }> {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    throw new Error('API is not responding');
  }
}
