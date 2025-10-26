import { useState, useMemo } from 'react';
import { SankeyDiagram } from './components/SankeyDiagram';
import { ColorModeSelector } from './components/ColorModeSelector';
import { TrackTooltip } from './components/TrackTooltip';
import { placeholderPlaylists } from './data/placeholderPlaylists';
import { transformToSankeyData } from './utils/sankeyTransform';
import { ColorMode, Track, TooltipPosition } from './types';

function App() {
  const [colorMode, setColorMode] = useState<ColorMode>('genre');
  const [hoveredTrack, setHoveredTrack] = useState<Track | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | undefined>();
  const [highlightedTrackId, setHighlightedTrackId] = useState<string | null>(null);

  // Transform data whenever color mode changes
  const sankeyData = useMemo(() => {
    return transformToSankeyData({
      playlists: placeholderPlaylists,
      colorMode,
    });
  }, [colorMode]);

  // Get playlist names for labels
  const playlistNames = placeholderPlaylists.map((p) => p.name);

  const handleNodeHover = (track: Track | null, position?: { x: number; y: number }) => {
    setHoveredTrack(track);
    setTooltipPosition(position);
  };

  const handleNodeClick = (track: Track) => {
    setHighlightedTrackId((prev) => (prev === track.id ? null : track.id));
  };

  const handleColorModeChange = (mode: ColorMode) => {
    setColorMode(mode);
    // Clear highlight when changing color mode
    setHighlightedTrackId(null);
  };

  // Calculate some stats
  const totalTracks = placeholderPlaylists.reduce((sum, p) => sum + p.total_tracks, 0);
  const uniqueTracks = new Set(placeholderPlaylists.flatMap((p) => p.tracks.map((t) => t.id))).size;
  const recurringTracks = sankeyData.links.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Year-End Playlist Analyzer
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Visualize how your music taste evolves over time with interactive Sankey diagrams
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Tracks</div>
            <div className="text-2xl font-bold text-gray-900">{totalTracks}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Unique Tracks</div>
            <div className="text-2xl font-bold text-gray-900">{uniqueTracks}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Recurring Tracks</div>
            <div className="text-2xl font-bold text-gray-900">{recurringTracks}</div>
            <div className="text-xs text-gray-500 mt-1">
              Appeared in multiple years
            </div>
          </div>
        </div>

        {/* Color Mode Selector */}
        <ColorModeSelector currentMode={colorMode} onChange={handleColorModeChange} />

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">How to Use</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Hover over tracks to see details</li>
            <li>• Click a track to highlight its flow across years</li>
            <li>• Switch color modes to explore different patterns</li>
            <li>• Currently showing {placeholderPlaylists.length} years of placeholder data</li>
          </ul>
        </div>

        {/* Sankey Diagram */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <SankeyDiagram
            data={sankeyData}
            onNodeHover={handleNodeHover}
            onNodeClick={handleNodeClick}
            highlightedTrackId={highlightedTrackId}
            playlistNames={playlistNames}
          />
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This is a demo using placeholder data.
            <br />
            Future versions will integrate with Spotify and Apple Music APIs.
          </p>
        </div>
      </main>

      {/* Tooltip */}
      <TrackTooltip track={hoveredTrack} position={tooltipPosition} />
    </div>
  );
}

export default App;
