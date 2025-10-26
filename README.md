# Year-End Playlist Analyzer

An interactive web application that visualizes how music listening habits evolve over time through year-end playlists, using Sankey diagrams to reveal patterns in genre preferences, artist loyalty, and musical discovery across multiple years.

![Status](https://img.shields.io/badge/status-MVP-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Real Spotify Data**: Fetch and analyze your actual Spotify playlists
- **Interactive Sankey Diagrams**: Visualize track continuity across multiple playlists
- **Multiple Color Modes**:
  - 🎵 **Genre**: Color by music genre
  - 🎤 **Artist**: Each artist gets a unique color
  - 💿 **Album**: Each album gets a unique color
  - 📅 **Release Year**: Gradient from old (blue) to new (red)
- **Interactive Tooltips**: Hover over tracks to see detailed information
- **Track Highlighting**: Click tracks to highlight their flow across years
- **Playlist URL Input**: Easy form to add multiple playlist URLs
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Placeholder Mode**: Demo data available without API setup

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **D3.js** and **d3-sankey** for visualizations
- **Tailwind CSS** for styling

### Backend
- **Flask** (Python) API
- **Spotipy** for Spotify API integration
- **Flask-CORS** for cross-origin requests
- **python-dotenv** for environment configuration

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Git
- Spotify Developer Account (optional - for real data)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spotify-timeline
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   # Create virtual environment
   python -m venv venv

   # Activate virtual environment
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows:
   venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt
   ```

4. **Set up Spotify API (Optional - for real data)**
   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit .env and add your Spotify credentials
   # Get credentials at: https://developer.spotify.com/dashboard
   ```

   See **[SPOTIFY_SETUP.md](./SPOTIFY_SETUP.md)** for detailed instructions.

   **Without API setup**: The app works with placeholder data for demo purposes.

### Running the Application

#### Development Mode

**Option 1: Run frontend and backend separately**

Terminal 1 - Frontend:
```bash
npm run dev
```

Terminal 2 - Backend:
```bash
npm run backend
# or manually:
cd backend && python app.py
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

**Option 2: Build and serve from Flask**
```bash
npm run build
cd backend && python app.py
```
Visit http://localhost:5000

### Using Real Spotify Data

With Spotify API configured:
1. Open the app at http://localhost:5173
2. Paste Spotify playlist URLs in the input form
3. Click "Analyze Playlists"
4. View your real data visualization!

**Getting Playlist URLs:**
- Open Spotify (app or web)
- Go to any playlist
- Click (...) → Share → Copy link to playlist
- Paste in the app

**Example public playlists to try:**
- Today's Top Hits
- Global Top 50
- Your year-end wrapped playlists

See **[SPOTIFY_SETUP.md](./SPOTIFY_SETUP.md)** for complete setup guide.

### Current Features

✅ **Implemented:**
- Real Spotify data fetching via API
- Playlist URL input form with validation
- Four color modes (genre, artist, album, release year)
- Interactive Sankey visualization
- Track tooltips and highlighting
- Error handling and loading states
- Placeholder mode for demo

🔜 **Coming Soon:**
- OAuth for private playlists
- Apple Music support
- Search/filter functionality
- Export visualizations (PNG/SVG)
- Analytics dashboard

## Project Structure

```
spotify-timeline/
├── src/                      # Frontend source
│   ├── components/           # React components
│   │   ├── SankeyDiagram.tsx
│   │   ├── ColorModeSelector.tsx
│   │   └── TrackTooltip.tsx
│   ├── data/                 # Placeholder data
│   ├── types/                # TypeScript types
│   ├── utils/                # Utilities
│   │   ├── colorSchemes.ts
│   │   └── sankeyTransform.ts
│   ├── App.tsx
│   └── main.tsx
├── backend/                  # Flask backend
│   ├── app.py
│   └── requirements.txt
├── public/                   # Static assets
├── PRD.md                    # Product Requirements
├── claude.md                 # Technical Guide
└── README.md                 # This file
```

## Documentation

- **[PRD.md](./PRD.md)**: Complete product requirements document
- **[claude.md](./claude.md)**: Technical implementation guide with code examples

## Usage

1. **View the Visualization**: The app loads with placeholder data showing 3 years of playlists
2. **Hover**: Move your cursor over any track to see details (song name, artist, album, year, genre)
3. **Click**: Click a track to highlight its journey across the years
4. **Switch Color Modes**: Use the buttons at the top to change how tracks are colored
5. **Explore Patterns**: Look for recurring tracks, genre shifts, and artist loyalty

## Future Features

### Phase 2
- Spotify OAuth integration
- Apple Music integration
- Real playlist fetching
- Search and filter tracks
- Export diagrams (PNG/SVG)

### Phase 3
- Analytics dashboard
- Genre trends over time
- Artist loyalty scores
- Playlist comparison mode

### Phase 4
- Social sharing
- Collaborative analysis
- ML-based recommendations
- Historical data tracking

## Contributing

Contributions are welcome! Please check out our:
- [Product Requirements Document](./PRD.md)
- [Technical Implementation Guide](./claude.md)

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Credits

Built with:
- [React](https://react.dev/)
- [D3.js](https://d3js.org/)
- [d3-sankey](https://github.com/d3/d3-sankey)
- [Tailwind CSS](https://tailwindcss.com/)
- [Flask](https://flask.palletsprojects.com/)
- [Spotipy](https://spotipy.readthedocs.io/)

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Status**: MVP with placeholder data. Spotify/Apple Music integration coming soon!
