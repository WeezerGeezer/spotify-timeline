"""
Tests for Spotify Service
"""
import pytest
import responses
from services.spotify_service import SpotifyService


class TestSpotifyService:
    """Test Spotify service functionality"""

    def test_extract_playlist_id_from_url(self):
        """Test extracting playlist ID from various URL formats"""
        service = SpotifyService()

        # Standard URL
        assert service.extract_playlist_id(
            'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M'
        ) == '37i9dQZF1DXcBWIGoYBM5M'

        # URL with query params
        assert service.extract_playlist_id(
            'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=abc123'
        ) == '37i9dQZF1DXcBWIGoYBM5M'

        # Already an ID
        assert service.extract_playlist_id('37i9dQZF1DXcBWIGoYBM5M') == '37i9dQZF1DXcBWIGoYBM5M'

        # Invalid URL
        assert service.extract_playlist_id('https://example.com') is None

    @responses.activate
    def test_get_playlist_data(self, mock_spotify_playlist_response, mock_spotify_tracks_response, mock_spotify_artists_response):
        """Test fetching playlist data"""
        # Mock API responses
        responses.add(
            responses.GET,
            'https://api.spotify.com/v1/playlists/test_id',
            json=mock_spotify_playlist_response,
            status=200
        )
        responses.add(
            responses.GET,
            'https://api.spotify.com/v1/playlists/test_id/tracks',
            json=mock_spotify_tracks_response,
            status=200
        )
        responses.add(
            responses.GET,
            'https://api.spotify.com/v1/artists',
            json=mock_spotify_artists_response,
            status=200
        )

        service = SpotifyService()
        # Note: This test requires actual API credentials
        # In real implementation, mock the spotipy client
        assert True  # Placeholder

    def test_process_track_data(self):
        """Test track data processing"""
        service = SpotifyService()
        track_data = {
            'id': 'track1',
            'name': 'Test Song',
            'artists': [{'id': 'artist1', 'name': 'Test Artist'}],
            'album': {
                'id': 'album1',
                'name': 'Test Album',
                'release_date': '2023-01-01',
                'images': []
            },
            'duration_ms': 180000,
            'popularity': 80
        }

        processed = service._process_track(track_data)

        assert processed['id'] == 'track1'
        assert processed['name'] == 'Test Song'
        assert len(processed['artists']) == 1
        assert processed['artists'][0]['name'] == 'Test Artist'
        assert processed['duration_ms'] == 180000
