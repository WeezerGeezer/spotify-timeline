"""
Pytest configuration and fixtures for backend tests
"""
import pytest
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


@pytest.fixture
def mock_spotify_playlist_response():
    """Mock Spotify API playlist response"""
    return {
        'id': 'test_playlist_id',
        'name': 'Test Playlist',
        'description': 'Test Description',
        'tracks': {
            'total': 3
        }
    }


@pytest.fixture
def mock_spotify_tracks_response():
    """Mock Spotify API tracks response"""
    return {
        'items': [
            {
                'track': {
                    'id': 'track1',
                    'name': 'Test Song 1',
                    'artists': [{'id': 'artist1', 'name': 'Artist 1'}],
                    'album': {
                        'id': 'album1',
                        'name': 'Album 1',
                        'release_date': '2023-01-01',
                        'images': []
                    },
                    'duration_ms': 180000,
                    'popularity': 80
                }
            },
            {
                'track': {
                    'id': 'track2',
                    'name': 'Test Song 2',
                    'artists': [{'id': 'artist2', 'name': 'Artist 2'}],
                    'album': {
                        'id': 'album2',
                        'name': 'Album 2',
                        'release_date': '2023-06-01',
                        'images': []
                    },
                    'duration_ms': 200000,
                    'popularity': 75
                }
            }
        ]
    }


@pytest.fixture
def mock_spotify_artists_response():
    """Mock Spotify API artists response"""
    return {
        'artists': [
            {'id': 'artist1', 'name': 'Artist 1', 'genres': ['pop', 'rock']},
            {'id': 'artist2', 'name': 'Artist 2', 'genres': ['electronic']}
        ]
    }


@pytest.fixture
def mock_apple_music_playlist_response():
    """Mock Apple Music API playlist response"""
    return {
        'data': [{
            'id': 'pl.test123',
            'type': 'playlists',
            'attributes': {
                'name': 'Test Apple Playlist',
                'description': {'standard': 'Test Description'},
                'curatorName': 'Test Curator'
            },
            'relationships': {
                'tracks': {
                    'data': [
                        {
                            'id': 'apple-track1',
                            'type': 'songs',
                            'attributes': {
                                'name': 'Apple Song 1',
                                'artistName': 'Apple Artist 1',
                                'albumName': 'Apple Album 1',
                                'genreNames': ['Pop', 'Rock'],
                                'releaseDate': '2023-01-01',
                                'durationInMillis': 180000
                            }
                        }
                    ]
                }
            }
        }]
    }
