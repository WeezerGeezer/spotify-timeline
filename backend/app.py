import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='../dist')

# Enable CORS for development
CORS(app, origins=['http://localhost:5173', 'http://localhost:5000'])

# Placeholder playlist data endpoint
@app.route('/api/playlists', methods=['GET'])
def get_playlists():
    """
    Return placeholder playlists for testing
    In production, this would fetch from Spotify/Apple Music APIs
    """
    # For now, we're using client-side placeholder data
    # This endpoint is here for future API integration
    return jsonify({
        'message': 'Using client-side placeholder data',
        'status': 'success'
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Year-End Playlist Analyzer API is running'
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
    app.run(host='0.0.0.0', port=port, debug=debug)
