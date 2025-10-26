import React, { useState } from 'react';

interface PlaylistInputProps {
  onSubmit: (urls: string[]) => void;
  isLoading?: boolean;
}

export const PlaylistInput: React.FC<PlaylistInputProps> = ({ onSubmit, isLoading = false }) => {
  const [playlistUrls, setPlaylistUrls] = useState<string[]>(['', '', '']);
  const [showExamples, setShowExamples] = useState(false);

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...playlistUrls];
    newUrls[index] = value;
    setPlaylistUrls(newUrls);
  };

  const addUrlField = () => {
    if (playlistUrls.length < 10) {
      setPlaylistUrls([...playlistUrls, '']);
    }
  };

  const removeUrlField = (index: number) => {
    if (playlistUrls.length > 1) {
      const newUrls = playlistUrls.filter((_, i) => i !== index);
      setPlaylistUrls(newUrls);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validUrls = playlistUrls.filter(url => url.trim() !== '');
    if (validUrls.length > 0) {
      onSubmit(validUrls);
    }
  };

  const loadExamplePlaylists = () => {
    // Spotify's official year-end playlists (public)
    setPlaylistUrls([
      'https://open.spotify.com/playlist/37i9dQZF1DX18jTM2l2fJY', // Hot Hits USA 2024
      'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M', // Today's Top Hits
      'https://open.spotify.com/playlist/37i9dQZEVXbMDoHDwVN2tF', // Global Top 50
    ]);
  };

  const extractPlaylistId = (url: string): string | null => {
    // Match: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
    const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Add Spotify Playlists</h3>
        <button
          type="button"
          onClick={() => setShowExamples(!showExamples)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showExamples ? 'Hide' : 'Show'} Examples
        </button>
      </div>

      {showExamples && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 mb-2">
            <strong>How to get a Spotify playlist URL:</strong>
          </p>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside mb-3">
            <li>Open Spotify (app or web)</li>
            <li>Navigate to any playlist</li>
            <li>Click the three dots (...) menu</li>
            <li>Select "Share" → "Copy link to playlist"</li>
            <li>Paste the URL below</li>
          </ol>
          <button
            type="button"
            onClick={loadExamplePlaylists}
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
          >
            Load Example Playlists
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-3 mb-4">
          {playlistUrls.map((url, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  placeholder={`Playlist ${index + 1} URL (e.g., Year ${2022 + index})`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                {url && extractPlaylistId(url) && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Valid playlist ID: {extractPlaylistId(url)}
                  </p>
                )}
                {url && !extractPlaylistId(url) && (
                  <p className="text-xs text-red-600 mt-1">
                    ✗ Invalid playlist URL format
                  </p>
                )}
              </div>
              {playlistUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUrlField(index)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                  disabled={isLoading}
                  title="Remove this playlist"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          {playlistUrls.length < 10 && (
            <button
              type="button"
              onClick={addUrlField}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              disabled={isLoading}
            >
              + Add Playlist
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || playlistUrls.filter(url => extractPlaylistId(url.trim())).length === 0}
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Fetching Playlists...
              </span>
            ) : (
              'Analyze Playlists'
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Tip: Add 2-10 playlists for best visualization. Try year-end playlists from different years!
        </p>
      </form>
    </div>
  );
};
