import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from services.spotify_service import SpotifyService

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


@app.route('/api/playlists/fetch', methods=['POST'])
def fetch_playlists():
    """
    Fetch playlist data from Spotify API

    Request body:
    {
        "urls": ["playlist_url_1", "playlist_url_2", ...]
    }

    Returns:
    {
        "playlists": [...],
        "errors": [...]
    }
    """
    if not SPOTIFY_AVAILABLE:
        return jsonify({
            'error': 'Spotify API not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.',
            'playlists': [],
            'errors': ['Spotify API credentials not found']
        }), 503

    try:
        data = request.get_json()
        urls = data.get('urls', [])

        if not urls:
            return jsonify({
                'error': 'No playlist URLs provided',
                'playlists': [],
                'errors': []
            }), 400

        # Extract playlist IDs
        playlist_ids = []
        invalid_urls = []

        for url in urls:
            playlist_id = spotify_service.extract_playlist_id(url)
            if playlist_id:
                playlist_ids.append(playlist_id)
            else:
                invalid_urls.append(url)

        if not playlist_ids:
            return jsonify({
                'error': 'No valid playlist URLs found',
                'playlists': [],
                'errors': [f'Invalid URL: {url}' for url in invalid_urls]
            }), 400

        # Fetch playlists
        playlists = spotify_service.get_multiple_playlists(playlist_ids)

        errors = []
        if invalid_urls:
            errors = [f'Invalid URL format: {url}' for url in invalid_urls]

        return jsonify({
            'playlists': playlists,
            'errors': errors,
            'status': 'success'
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'playlists': [],
            'errors': [str(e)]
        }), 500


@app.route('/api/playlists/<playlist_id>', methods=['GET'])
def get_single_playlist(playlist_id):
    """Fetch a single playlist by ID"""
    if not SPOTIFY_AVAILABLE:
        return jsonify({
            'error': 'Spotify API not configured'
        }), 503

    try:
        playlist_data = spotify_service.get_playlist_data(playlist_id)
        return jsonify(playlist_data)
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Year-End Playlist Analyzer API is running',
        'spotify_configured': SPOTIFY_AVAILABLE
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

    if not SPOTIFY_AVAILABLE:
        print("\n" + "="*60)
        print("WARNING: Spotify API credentials not configured!")
        print("Please create a .env file with your Spotify credentials:")
        print("  SPOTIFY_CLIENT_ID=your_client_id")
        print("  SPOTIFY_CLIENT_SECRET=your_client_secret")
        print("\nGet credentials at: https://developer.spotify.com/dashboard")
        print("="*60 + "\n")

    app.run(host='0.0.0.0', port=port, debug=debug)
