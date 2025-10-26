import os
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from typing import List, Dict, Optional


class SpotifyService:
    """Service for fetching data from Spotify API"""

    def __init__(self):
        """Initialize Spotify client with credentials from environment"""
        client_id = os.getenv('SPOTIFY_CLIENT_ID')
        client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')

        if not client_id or not client_secret:
            raise ValueError(
                "Spotify credentials not found. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables."
            )

        # Use client credentials flow (no user authentication needed for public playlists)
        auth_manager = SpotifyClientCredentials(
            client_id=client_id,
            client_secret=client_secret
        )
        self.sp = spotipy.Spotify(auth_manager=auth_manager)

    def extract_playlist_id(self, url_or_id: str) -> Optional[str]:
        """
        Extract playlist ID from URL or return ID if already in correct format

        Examples:
        - https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M -> 37i9dQZF1DXcBWIGoYBM5M
        - spotify:playlist:37i9dQZF1DXcBWIGoYBM5M -> 37i9dQZF1DXcBWIGoYBM5M
        - 37i9dQZF1DXcBWIGoYBM5M -> 37i9dQZF1DXcBWIGoYBM5M
        """
        # If it's already just an ID
        if '/' not in url_or_id and ':' not in url_or_id:
            return url_or_id

        # Extract from URL format
        if 'playlist/' in url_or_id:
            parts = url_or_id.split('playlist/')
            if len(parts) > 1:
                # Remove query parameters if present
                playlist_id = parts[1].split('?')[0]
                return playlist_id

        # Extract from URI format
        if 'spotify:playlist:' in url_or_id:
            parts = url_or_id.split('spotify:playlist:')
            if len(parts) > 1:
                return parts[1]

        return None

    def get_playlist_data(self, playlist_id: str) -> Dict:
        """
        Fetch complete playlist data including tracks and metadata

        Returns:
        {
            'id': str,
            'name': str,
            'description': str,
            'total_tracks': int,
            'tracks': [Track objects with artist genres]
        }
        """
        try:
            # Get playlist metadata
            playlist = self.sp.playlist(
                playlist_id,
                fields='id,name,description,tracks.total,owner.display_name'
            )

            # Fetch all tracks (handle pagination)
            tracks = []
            offset = 0
            limit = 100

            while offset < playlist['tracks']['total']:
                results = self.sp.playlist_tracks(
                    playlist_id,
                    offset=offset,
                    limit=limit,
                    fields='items(track(id,name,artists,album,duration_ms,popularity))'
                )

                for item in results['items']:
                    if item['track'] and item['track']['id']:  # Filter out None tracks
                        track_data = self._process_track(item['track'])
                        tracks.append(track_data)

                offset += limit

            # Fetch genres for all artists in batch
            artist_ids = []
            for track in tracks:
                for artist in track['artists']:
                    if artist['id'] not in artist_ids:
                        artist_ids.append(artist['id'])

            # Get genres for artists (batch by 50)
            artist_genres = {}
            for i in range(0, len(artist_ids), 50):
                batch = artist_ids[i:i+50]
                artists_data = self.sp.artists(batch)
                for artist_data in artists_data['artists']:
                    if artist_data:
                        artist_genres[artist_data['id']] = artist_data.get('genres', [])

            # Add genre to each track (primary artist's first genre)
            for track in tracks:
                if track['artists']:
                    primary_artist_id = track['artists'][0]['id']
                    genres = artist_genres.get(primary_artist_id, [])
                    track['genre'] = genres[0] if genres else 'Unknown'

            return {
                'id': playlist['id'],
                'name': playlist['name'],
                'description': playlist.get('description', ''),
                'owner': playlist.get('owner', {}).get('display_name', 'Unknown'),
                'total_tracks': len(tracks),
                'tracks': tracks
            }

        except spotipy.exceptions.SpotifyException as e:
            raise Exception(f"Spotify API error: {str(e)}")
        except Exception as e:
            raise Exception(f"Error fetching playlist: {str(e)}")

    def _process_track(self, track: Dict) -> Dict:
        """Extract and format track data"""
        return {
            'id': track['id'],
            'name': track['name'],
            'artists': [
                {
                    'id': artist['id'],
                    'name': artist['name']
                }
                for artist in track.get('artists', [])
            ],
            'album': {
                'id': track['album']['id'],
                'name': track['album']['name'],
                'release_date': track['album'].get('release_date', ''),
                'images': track['album'].get('images', [])
            },
            'duration_ms': track.get('duration_ms', 0),
            'popularity': track.get('popularity', 0),
            'genre': None  # Will be filled in later with artist genre
        }

    def get_multiple_playlists(self, playlist_ids: List[str]) -> List[Dict]:
        """
        Fetch multiple playlists

        Returns: List of playlist data dictionaries
        """
        playlists = []
        for playlist_id in playlist_ids:
            try:
                playlist_data = self.get_playlist_data(playlist_id)
                playlists.append(playlist_data)
            except Exception as e:
                print(f"Error fetching playlist {playlist_id}: {str(e)}")
                # Continue with other playlists
                continue

        return playlists
