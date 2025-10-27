import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from services.spotify_service import SpotifyService
from services.apple_music_service import AppleMusicService

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='../dist')

# Enable CORS for development
CORS(app, origins=['http://localhost:5173', 'http://localhost:5000'])

# Initialize Spotify service
try:
    spotify_service = SpotifyService()
    SPOTIFY_AVAILABLE = True
except ValueError as e:
    print(f"Warning: Spotify API not configured - {str(e)}")
    SPOTIFY_AVAILABLE = False
    spotify_service = None

# Initialize Apple Music service
try:
    apple_music_service = AppleMusicService()
    APPLE_MUSIC_AVAILABLE = True
except ValueError as e:
    print(f"Warning: Apple Music API not configured - {str(e)}")
    APPLE_MUSIC_AVAILABLE = False
    apple_music_service = None


def detect_platform(url: str) -> str:
    """Detect if URL is from Spotify or Apple Music"""
    if 'spotify.com' in url or 'open.spotify.com' in url:
        return 'spotify'
    elif 'music.apple.com' in url or 'apple.com' in url:
        return 'apple'
    # Try to detect from ID format
    elif url.startswith('pl.'):
        return 'apple'
    else:
        return 'spotify'  # Default to Spotify


@app.route('/api/playlists/fetch', methods=['POST'])
def fetch_playlists():
    """
    Fetch playlist data from Spotify or Apple Music API

    Request body:
    {
        "urls": ["playlist_url_1", "playlist_url_2", ...],
        "platform": "spotify" | "apple" (optional, auto-detected)
    }

    Returns:
    {
        "playlists": [...],
        "errors": [...],
        "platform": "spotify" | "apple" | "mixed"
    }
    """
    try:
        data = request.get_json()
        urls = data.get('urls', [])
        forced_platform = data.get('platform')

        if not urls:
            return jsonify({
                'error': 'No playlist URLs provided',
                'playlists': [],
                'errors': []
            }), 400

        # Group URLs by platform
        spotify_urls = []
        apple_urls = []
        invalid_urls = []

        for url in urls:
            platform = forced_platform or detect_platform(url)

            if platform == 'spotify':
                if not SPOTIFY_AVAILABLE:
                    invalid_urls.append(f"{url} (Spotify API not configured)")
                else:
                    spotify_urls.append(url)
            elif platform == 'apple':
                if not APPLE_MUSIC_AVAILABLE:
                    invalid_urls.append(f"{url} (Apple Music API not configured)")
                else:
                    apple_urls.append(url)
            else:
                invalid_urls.append(f"{url} (Unknown platform)")

        playlists = []
        errors = []

        # Fetch Spotify playlists
        if spotify_urls and SPOTIFY_AVAILABLE:
            playlist_ids = []
            for url in spotify_urls:
                playlist_id = spotify_service.extract_playlist_id(url)
                if playlist_id:
                    playlist_ids.append(playlist_id)
                else:
                    errors.append(f'Invalid Spotify URL: {url}')

            if playlist_ids:
                try:
                    spotify_playlists = spotify_service.get_multiple_playlists(playlist_ids)
                    # Add platform identifier
                    for p in spotify_playlists:
                        p['platform'] = 'spotify'
                    playlists.extend(spotify_playlists)
                except Exception as e:
                    errors.append(f'Spotify API error: {str(e)}')

        # Fetch Apple Music playlists
        if apple_urls and APPLE_MUSIC_AVAILABLE:
            playlist_ids = []
            for url in apple_urls:
                playlist_id = apple_music_service.extract_playlist_id(url)
                if playlist_id:
                    playlist_ids.append(playlist_id)
                else:
                    errors.append(f'Invalid Apple Music URL: {url}')

            if playlist_ids:
                try:
                    apple_playlists = apple_music_service.get_multiple_playlists(playlist_ids)
                    # Add platform identifier
                    for p in apple_playlists:
                        p['platform'] = 'apple'
                    playlists.extend(apple_playlists)
                except Exception as e:
                    errors.append(f'Apple Music API error: {str(e)}')

        # Add invalid URL errors
        errors.extend(invalid_urls)

        if not playlists:
            return jsonify({
                'error': 'No playlists could be fetched',
                'playlists': [],
                'errors': errors
            }), 400

        # Determine platform mix
        platforms = set(p.get('platform') for p in playlists)
        platform_status = 'mixed' if len(platforms) > 1 else list(platforms)[0] if platforms else 'unknown'

        return jsonify({
            'playlists': playlists,
            'errors': errors,
            'status': 'success',
            'platform': platform_status
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'playlists': [],
            'errors': [str(e)]
        }), 500


@app.route('/api/playlists/<platform>/<playlist_id>', methods=['GET'])
def get_single_playlist(platform, playlist_id):
    """Fetch a single playlist by ID and platform"""
    try:
        if platform == 'spotify':
            if not SPOTIFY_AVAILABLE:
                return jsonify({'error': 'Spotify API not configured'}), 503
            playlist_data = spotify_service.get_playlist_data(playlist_id)
            playlist_data['platform'] = 'spotify'
        elif platform == 'apple':
            if not APPLE_MUSIC_AVAILABLE:
                return jsonify({'error': 'Apple Music API not configured'}), 503
            playlist_data = apple_music_service.get_playlist_data(playlist_id)
            playlist_data['platform'] = 'apple'
        else:
            return jsonify({'error': 'Invalid platform. Must be "spotify" or "apple"'}), 400

        return jsonify(playlist_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Year-End Playlist Analyzer API is running',
        'services': {
            'spotify': SPOTIFY_AVAILABLE,
            'apple_music': APPLE_MUSIC_AVAILABLE
        }
    })


# Serve React app in production
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'

    print("\n" + "="*60)
    print("Year-End Playlist Analyzer API")
    print("="*60)

    if not SPOTIFY_AVAILABLE:
        print("⚠️  Spotify API: NOT CONFIGURED")
        print("   Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env")
    else:
        print("✓ Spotify API: CONFIGURED")

    if not APPLE_MUSIC_AVAILABLE:
        print("⚠️  Apple Music API: NOT CONFIGURED")
        print("   Set APPLE_MUSIC_TEAM_ID, APPLE_MUSIC_KEY_ID,")
        print("   and APPLE_MUSIC_PRIVATE_KEY_PATH in .env")
    else:
        print("✓ Apple Music API: CONFIGURED")

    if not SPOTIFY_AVAILABLE and not APPLE_MUSIC_AVAILABLE:
        print("\n❌ No music APIs configured!")
        print("   The app will only work with placeholder data.")
        print("\nGet credentials:")
        print("   Spotify: https://developer.spotify.com/dashboard")
        print("   Apple Music: https://developer.apple.com")

    print("="*60 + "\n")

    app.run(host='0.0.0.0', port=port, debug=debug)
