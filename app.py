import re
import os
from collections import Counter
from datetime import datetime

from flask import Flask
from flask import render_template

from flask import Flask, render_template, redirect, url_for, request
import spotipy
from spotipy.oauth2 import SpotifyOAuth

app = Flask(__name__)
app.secret_key = "YOUR_SECRET_KEY"  # Change this to a random secret key

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login():
    return redirect(url_for('index'))

sp_oauth = SpotifyOAuth(client_id='YOUR_CLIENT_ID',
                       client_secret='YOUR_CLIENT_SECRET',
                       redirect_uri='YOUR_REDIRECT_URI',
                       scope='user-library-read')

@app.route('/process_playlists', methods=['POST'])
def process_playlists():
    playlist_links = request.form.getlist('playlist_link[]')
    artist_frequencies = {}

    # Authenticate with Spotify
    sp = spotipy.Spotify(auth_manager=sp_oauth)

    for idx, playlist_link in enumerate(playlist_links):
        # Extract playlist ID from the link (assuming a simple format)
        playlist_id = playlist_link.split('/')[-1]

        # Retrieve playlist information
        playlist_info = sp.playlist(playlist_id)
        playlist_name = playlist_info['name']

        # Calculate artist frequency
        tracks = sp.playlist_tracks(playlist_id)['items']
        artist_counter = Counter()
        for track in tracks:
            for artist in track['track']['artists']:
                artist_name = artist['name']
                artist_counter[artist_name] += 1

        # Store artist frequencies and playlist names
        artist_frequencies[f'Playlist {idx + 1} - {playlist_name}'] = artist_counter

    return render_template('results.html', artist_frequencies=artist_frequencies)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000), debug=False))