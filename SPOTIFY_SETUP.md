# Spotify API Setup Guide

This guide will help you set up Spotify API credentials to fetch real playlist data.

## Step 1: Create a Spotify Developer Account

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account (or create one if you don't have it)
3. Accept the Terms of Service

## Step 2: Create a New App

1. Click **"Create app"** button
2. Fill in the application details:
   - **App name**: `Year-End Playlist Analyzer` (or any name you prefer)
   - **App description**: `Analyze and visualize playlist data over time`
   - **Redirect URI**: `http://localhost:5173/callback` (not used for now, but required)
   - **Which API/SDKs are you planning to use**: Check **Web API**
3. Agree to the Terms of Service
4. Click **"Save"**

## Step 3: Get Your Credentials

1. On your app's dashboard, click **"Settings"**
2. You'll see:
   - **Client ID**: Copy this
   - **Client Secret**: Click "View client secret" and copy this

## Step 4: Configure Your Application

1. In your project root, create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your credentials:
   ```env
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   FLASK_ENV=development
   FLASK_SECRET_KEY=any_random_string_here
   FRONTEND_URL=http://localhost:5173
   ```

3. Replace:
   - `your_client_id_here` with your actual Client ID
   - `your_client_secret_here` with your actual Client Secret
   - `any_random_string_here` with any random string (for Flask sessions)

## Step 5: Run the Application

### Backend (Flask API)
```bash
# Install Python dependencies (if not already)
pip install -r requirements.txt

# Run the Flask server
cd backend
python app.py
```

The backend will start on `http://localhost:5000`

### Frontend (React App)
```bash
# In a new terminal
# Install Node dependencies (if not already)
npm install

# Run the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## Step 6: Test with Real Playlists

1. Open your browser to `http://localhost:5173`
2. In the "Add Spotify Playlists" section:
   - Click **"Show Examples"** to see how to get playlist URLs
   - Or click **"Load Example Playlists"** to test with public playlists
3. Click **"Analyze Playlists"**
4. The app will fetch real data from Spotify!

## Finding Playlist URLs

### From Spotify Desktop/Web App:
1. Navigate to any playlist
2. Click the three dots (...) menu
3. Select **Share** → **Copy link to playlist**
4. Paste the URL in the app

### Example Public Playlists:
- Today's Top Hits: `https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M`
- Global Top 50: `https://open.spotify.com/playlist/37i9dQZEVXbMDoHDwVN2tF`
- Hot Hits USA: `https://open.spotify.com/playlist/37i9dQZF1DX18jTM2l2fJY`

## Troubleshooting

### Error: "Spotify API not configured"
- Make sure your `.env` file exists in the project root
- Check that `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` are set
- Restart the Flask server after adding credentials

### Error: "Invalid client" or "Authentication failed"
- Double-check your Client ID and Client Secret
- Make sure you copied them correctly without extra spaces
- Verify the credentials in your Spotify Developer Dashboard

### Error: "Playlist not found" or "403 Forbidden"
- The playlist might be private (you can only fetch public playlists without OAuth)
- Try with a public Spotify playlist first

### Rate Limiting
- Spotify API has rate limits
- If you get rate limit errors, wait a few minutes before retrying
- For development, limit the number of playlists you fetch at once

## API Limits

**Client Credentials Flow (what we use):**
- ✅ Can access public playlists
- ✅ Can get track information
- ✅ Can get artist genres
- ❌ Cannot access user's private playlists
- ❌ Cannot access user's listening history

**Rate Limits:**
- Spotify doesn't publish exact limits
- Generally: ~180 requests per minute per app
- The app fetches playlists sequentially to avoid hitting limits

## Next Steps

For accessing private playlists, you'll need to implement:
1. **OAuth 2.0 Authorization Flow** (user login)
2. **User authentication** with proper scopes
3. **Token refresh** mechanism

This is planned for a future update! For now, use public playlists to test the visualization.

## Privacy Note

With Client Credentials Flow:
- No user authentication required
- Only public playlists can be accessed
- No personal data is stored or transmitted
- All data is fetched in real-time and not persisted

## Resources

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Client Credentials Flow](https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow)
- [Spotipy Library Docs](https://spotipy.readthedocs.io/)
