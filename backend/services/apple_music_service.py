import os
import jwt
import requests
from datetime import datetime
from typing import List, Dict, Optional


class AppleMusicService:
    """Service for fetching data from Apple Music API"""

    BASE_URL = 'https://api.music.apple.com/v1'

    def __init__(self):
        """Initialize Apple Music client with credentials from environment"""
        self.team_id = os.getenv('APPLE_MUSIC_TEAM_ID')
        self.key_id = os.getenv('APPLE_MUSIC_KEY_ID')
        private_key_path = os.getenv('APPLE_MUSIC_PRIVATE_KEY_PATH')

        if not all([self.team_id, self.key_id, private_key_path]):
            raise ValueError(
                "Apple Music credentials not found. Please set "
                "APPLE_MUSIC_TEAM_ID, APPLE_MUSIC_KEY_ID, and "
                "APPLE_MUSIC_PRIVATE_KEY_PATH environment variables."
            )

        # Read private key
        try:
            with open(private_key_path, 'r') as f:
                self.private_key = f.read()
        except FileNotFoundError:
            raise ValueError(f"Private key file not found at: {private_key_path}")

        # Generate developer token
        self.developer_token = self._generate_token()

    def _generate_token(self) -> str:
        """Generate JWT developer token for Apple Music API"""
        iat = int(datetime.utcnow().timestamp())
        exp = iat + (86400 * 180)  # 180 days

        payload = {
            'iss': self.team_id,
            'iat': iat,
            'exp': exp
        }

        headers = {
            'alg': 'ES256',
            'kid': self.key_id
        }

        token = jwt.encode(
            payload,
            self.private_key,
            algorithm='ES256',
            headers=headers
        )

        return token

    def extract_playlist_id(self, url_or_id: str) -> Optional[str]:
        """
        Extract playlist ID from URL or return ID if already in correct format

        Examples:
        - https://music.apple.com/us/playlist/name/pl.u-abc123 -> pl.u-abc123
        - pl.u-abc123 -> pl.u-abc123
        """
        # Already an ID
        if url_or_id.startswith('pl.') or url_or_id.startswith('p.'):
            return url_or_id

        # Extract from URL
        if '/playlist/' in url_or_id:
            parts = url_or_id.split('/playlist/')
            if len(parts) > 1:
                # Get last segment, remove query params
                playlist_id = parts[1].split('/')[-1].split('?')[0]
                return playlist_id

        return None

    def get_playlist_data(self, playlist_id: str, storefront: str = 'us') -> Dict:
        """
        Fetch complete playlist data including tracks and metadata

        Args:
            playlist_id: Apple Music playlist ID
            storefront: Two-letter country code (default: 'us')

        Returns:
        {
            'id': str,
            'name': str,
            'description': str,
            'total_tracks': int,
            'tracks': [Track objects]
        }
        """
        try:
            # Fetch playlist with tracks
            url = f'{self.BASE_URL}/catalog/{storefront}/playlists/{playlist_id}'

            headers = {
                'Authorization': f'Bearer {self.developer_token}',
                'Content-Type': 'application/json'
            }

            params = {
                'include': 'tracks'
            }

            response = requests.get(url, headers=headers, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()

            if 'data' not in data or len(data['data']) == 0:
                raise Exception('Playlist not found or is not public')

            playlist = data['data'][0]
            attrs = playlist['attributes']

            # Process tracks
            tracks = []
            if 'tracks' in playlist.get('relationships', {}):
                track_data = playlist['relationships']['tracks'].get('data', [])

                for track in track_data:
                    if track.get('attributes'):
                        processed_track = self._process_track(track)
                        if processed_track:
                            tracks.append(processed_track)

                # Handle pagination if more than 100 tracks
                # Note: Would need to implement next page fetching if needed
                # For now, we get the first 100 tracks which matches Spotify behavior

            return {
                'id': playlist['id'],
                'name': attrs['name'],
                'description': attrs.get('description', {}).get('standard', ''),
                'curator': attrs.get('curatorName', 'Unknown'),
                'total_tracks': len(tracks),
                'tracks': tracks
            }

        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                raise Exception('Playlist not found')
            elif e.response.status_code == 403:
                raise Exception('Access denied - playlist may be private')
            elif e.response.status_code == 429:
                raise Exception('Rate limit exceeded - please try again later')
            else:
                raise Exception(f"Apple Music API error: {str(e)}")
        except requests.exceptions.Timeout:
            raise Exception('Request timeout - Apple Music API is not responding')
        except requests.exceptions.RequestException as e:
            raise Exception(f"Network error: {str(e)}")
        except Exception as e:
            raise Exception(f"Error fetching playlist: {str(e)}")

    def _process_track(self, track: Dict) -> Optional[Dict]:
        """Extract and format track data"""
        try:
            attrs = track.get('attributes', {})

            # Skip tracks without essential data
            if not attrs.get('name') or not attrs.get('artistName'):
                return None

            # Get primary genre - remove generic 'Music' genre if present
            genre_names = attrs.get('genreNames', [])
            genre_names = [g for g in genre_names if g.lower() != 'music']
            primary_genre = genre_names[0] if genre_names else 'Unknown'

            # Extract artist ID from track URL or use a hash of the name
            artist_name = attrs['artistName']
            # Apple Music doesn't provide artist IDs in track data by default
            # We'll use a hash of the artist name as a consistent ID
            artist_id = f"apple-{hash(artist_name) % 1000000}"

            return {
                'id': track['id'],
                'name': attrs['name'],
                'artists': [
                    {
                        'id': artist_id,
                        'name': artist_name
                    }
                ],
                'album': {
                    'id': f"apple-album-{hash(attrs.get('albumName', '')) % 1000000}",
                    'name': attrs.get('albumName', 'Unknown Album'),
                    'release_date': attrs.get('releaseDate', ''),
                    'images': [{'url': attrs.get('artwork', {}).get('url', ''), 'width': 640, 'height': 640}] if attrs.get('artwork') else []
                },
                'duration_ms': attrs.get('durationInMillis', 0),
                'popularity': 50,  # Apple Music doesn't provide popularity, use neutral value
                'genre': primary_genre,
            }
        except Exception as e:
            print(f"Error processing track: {str(e)}")
            return None

    def get_multiple_playlists(
        self,
        playlist_ids: List[str],
        storefront: str = 'us'
    ) -> List[Dict]:
        """
        Fetch multiple playlists

        Args:
            playlist_ids: List of Apple Music playlist IDs
            storefront: Two-letter country code

        Returns: List of playlist data dictionaries
        """
        playlists = []
        for playlist_id in playlist_ids:
            try:
                playlist_data = self.get_playlist_data(playlist_id, storefront)
                playlists.append(playlist_data)
            except Exception as e:
                print(f"Error fetching playlist {playlist_id}: {str(e)}")
                # Continue with other playlists
                continue

        return playlists
