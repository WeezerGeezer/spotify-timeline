import { useState, useMemo } from 'react';
import { SankeyDiagram } from './components/SankeyDiagram';
import { ColorModeSelector } from './components/ColorModeSelector';
import { TrackTooltip } from './components/TrackTooltip';
import { PlaylistInput } from './components/PlaylistInput';
import { placeholderPlaylists } from './data/placeholderPlaylists';
import { transformToSankeyData } from './utils/sankeyTransform';
import { useFetchPlaylists } from './hooks/useFetchPlaylists';
import { ColorMode, Track, TooltipPosition, PlaylistData } from './types';

function App() {
  const [colorMode, setColorMode] = useState<ColorMode>('genre');
  const [hoveredTrack, setHoveredTrack] = useState<Track | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | undefined>();
  const [highlightedTrackId, setHighlightedTrackId] = useState<string | null>(null);
  const [currentPlaylists, setCurrentPlaylists] = useState<PlaylistData[]>(placeholderPlaylists);
  const [usingPlaceholder, setUsingPlaceholder] = useState(true);

  const { isLoading, error, warnings, fetchPlaylistData } = useFetchPlaylists();

  // Transform data whenever color mode or playlists change
  const sankeyData = useMemo(() => {
    return transformToSankeyData({
      playlists: currentPlaylists,
      colorMode,
    });
  }, [currentPlaylists, colorMode]);

  // Get playlist names for labels
  const playlistNames = currentPlaylists.map((p) => p.name);

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

  const handleFetchPlaylists = async (urls: string[]) => {
    try {
      const playlists = await fetchPlaylistData(urls);
      setCurrentPlaylists(playlists);
      setUsingPlaceholder(false);
      setHighlightedTrackId(null); // Clear any highlights
    } catch (err) {
      console.error('Failed to fetch playlists:', err);
      // Error is already set by the hook
    }
  };

  const handleUsePlaceholder = () => {
    setCurrentPlaylists(placeholderPlaylists);
    setUsingPlaceholder(true);
    setHighlightedTrackId(null);
  };

  // Calculate some stats
  const totalTracks = currentPlaylists.reduce((sum, p) => sum + p.total_tracks, 0);
  const uniqueTracks = new Set(currentPlaylists.flatMap((p) => p.tracks.map((t) => t.id))).size;
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
        {/* Playlist Input */}
        <PlaylistInput onSubmit={handleFetchPlaylists} isLoading={isLoading} />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-red-900 mb-2">Error</h3>
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={handleUsePlaceholder}
              className="mt-3 text-sm text-red-700 underline hover:text-red-900"
            >
              Use placeholder data instead
            </button>
          </div>
        )}

        {/* Warnings Display */}
        {warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">Warnings</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              {warnings.map((warning, idx) => (
                <li key={idx}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-6 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-blue-900 font-medium">Fetching playlists from Spotify...</p>
            <p className="text-sm text-blue-700 mt-2">This may take a few seconds</p>
          </div>
        )}

        {/* Stats Bar */}
        {!isLoading && currentPlaylists.length > 0 && (
          <>
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
                  Appeared in multiple playlists
                </div>
              </div>
            </div>

            {/* Data Source Indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">
                {usingPlaceholder ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                    📊 Using placeholder data
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700">
                    ✓ Using real Spotify data
                  </span>
                )}
              </div>
              {!usingPlaceholder && (
                <button
                  onClick={handleUsePlaceholder}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Switch to placeholder data
                </button>
              )}
            </div>

            {/* Color Mode Selector */}
            <ColorModeSelector currentMode={colorMode} onChange={handleColorModeChange} />

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">How to Use</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Hover over tracks to see details</li>
                <li>• Click a track to highlight its flow across playlists</li>
                <li>• Switch color modes to explore different patterns</li>
                <li>• Currently showing {currentPlaylists.length} playlists</li>
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
          </>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            {usingPlaceholder ? (
              <>
                Using placeholder data for demonstration.
                <br />
                Add your Spotify playlist URLs above to analyze your own music!
              </>
            ) : (
              <>
                Analyzing your Spotify playlists.
                <br />
                Data is fetched in real-time and not stored.
              </>
            )}
          </p>
        </div>
      </main>

      {/* Tooltip */}
      <TrackTooltip track={hoveredTrack} position={tooltipPosition} />
    </div>
  );
}

export default App;
