import React, { useState } from 'react';

interface PlaylistInputProps {
  onSubmit: (urls: string[]) => void;
  isLoading?: boolean;
}

type Platform = 'spotify' | 'apple' | 'unknown';

export const PlaylistInput: React.FC<PlaylistInputProps> = ({ onSubmit, isLoading = false }) => {
  const [playlistUrls, setPlaylistUrls] = useState<string[]>(['', '', '']);
  const [showExamples, setShowExamples] = useState(false);

  const detectPlatform = (url: string): Platform => {
    if (url.includes('spotify.com') || url.includes('open.spotify.com')) {
      return 'spotify';
    } else if (url.includes('music.apple.com') || url.includes('apple.com')) {
      return 'apple';
    } else if (url.startsWith('pl.') || url.startsWith('p.')) {
      return 'apple'; // Apple Music playlist ID format
    }
    return 'unknown';
  };

  const extractPlaylistId = (url: string): { id: string | null; platform: Platform } => {
    const platform = detectPlatform(url);

    if (platform === 'spotify') {
      // Match: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
      const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
      return { id: match ? match[1] : null, platform };
    } else if (platform === 'apple') {
      // Match: https://music.apple.com/us/playlist/name/pl.u-abc123
      if (url.startsWith('pl.') || url.startsWith('p.')) {
        return { id: url, platform };
      }
      if (url.includes('/playlist/')) {
        const parts = url.split('/playlist/');
        if (parts.length > 1) {
          const id = parts[1].split('/').pop()?.split('?')[0];
          return { id: id || null, platform };
        }
      }
    }

    return { id: null, platform: 'unknown' };
  };

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
    const validUrls = playlistUrls.filter(url => {
      const { id } = extractPlaylistId(url.trim());
      return id !== null;
    });
    if (validUrls.length > 0) {
      onSubmit(validUrls);
    }
  };

  const loadSpotifyExamples = () => {
    setPlaylistUrls([
      'https://open.spotify.com/playlist/37i9dQZF1DX18jTM2l2fJY', // Hot Hits USA 2024
      'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M', // Today's Top Hits
      'https://open.spotify.com/playlist/37i9dQZEVXbMDoHDwVN2tF', // Global Top 50
    ]);
  };

  const loadAppleMusicExamples = () => {
    setPlaylistUrls([
      'https://music.apple.com/us/playlist/todays-hits/pl.f4d106fed2bd41149aaacabb233eb5eb',
      'https://music.apple.com/us/playlist/a-list-pop/pl.5ee8333dbe944d9f9151e97d92d1ead9',
      'https://music.apple.com/us/playlist/pure-pop/pl.18af742aaa894195b285c6d8fc6e6c73',
    ]);
  };

  const loadMixedExamples = () => {
    setPlaylistUrls([
      'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M', // Spotify
      'https://music.apple.com/us/playlist/todays-hits/pl.f4d106fed2bd41149aaacabb233eb5eb', // Apple Music
      'https://open.spotify.com/playlist/37i9dQZEVXbMDoHDwVN2tF', // Spotify
    ]);
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'spotify':
        return '🟢'; // Spotify green
      case 'apple':
        return '🍎'; // Apple
      default:
        return '❓';
    }
  };

  const getPlatformName = (platform: Platform) => {
    switch (platform) {
      case 'spotify':
        return 'Spotify';
      case 'apple':
        return 'Apple Music';
      default:
        return 'Unknown';
    }
  };

  const hasValidUrls = playlistUrls.some(url => {
    const { id } = extractPlaylistId(url.trim());
    return id !== null;
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Add Playlists
          <span className="text-sm font-normal text-gray-500 ml-2">
            (Spotify or Apple Music)
          </span>
        </h3>
        <button
          type="button"
          onClick={() => setShowExamples(!showExamples)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showExamples ? 'Hide' : 'Show'} Examples
        </button>
      </div>

      {showExamples && (
        <div className="mb-4 space-y-4">
          {/* Spotify Instructions */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-900 mb-2">
              🟢 Spotify Playlists
            </p>
            <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside mb-3">
              <li>Open Spotify (app or web)</li>
              <li>Navigate to any playlist</li>
              <li>Click the three dots (...) menu</li>
              <li>Select "Share" → "Copy link to playlist"</li>
              <li>Paste the URL below</li>
            </ol>
            <button
              type="button"
              onClick={loadSpotifyExamples}
              className="text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700"
            >
              Load Spotify Examples
            </button>
          </div>

          {/* Apple Music Instructions */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-semibold text-red-900 mb-2">
              🍎 Apple Music Playlists
            </p>
            <ol className="text-sm text-red-800 space-y-1 list-decimal list-inside mb-3">
              <li>Open Apple Music (app or web)</li>
              <li>Navigate to any playlist</li>
              <li>Click the three dots (...) menu</li>
              <li>Select "Share Playlist" → "Copy Link"</li>
              <li>Paste the URL below</li>
            </ol>
            <button
              type="button"
              onClick={loadAppleMusicExamples}
              className="text-sm bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700"
            >
              Load Apple Music Examples
            </button>
          </div>

          {/* Mixed Example */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm font-semibold text-purple-900 mb-2">
              🎵 Mix Both Platforms!
            </p>
            <p className="text-sm text-purple-800 mb-3">
              You can analyze playlists from both Spotify and Apple Music together in the same visualization.
            </p>
            <button
              type="button"
              onClick={loadMixedExamples}
              className="text-sm bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700"
            >
              Load Mixed Examples
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-3 mb-4">
          {playlistUrls.map((url, index) => {
            const { id, platform } = extractPlaylistId(url);
            const isValid = id !== null;

            return (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    placeholder={`Playlist ${index + 1} URL (Spotify or Apple Music)`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  {url && isValid && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <span>{getPlatformIcon(platform)}</span>
                      <span>✓ Valid {getPlatformName(platform)} playlist: {id}</span>
                    </p>
                  )}
                  {url && !isValid && platform !== 'unknown' && (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠ Invalid {getPlatformName(platform)} URL format
                    </p>
                  )}
                  {url && platform === 'unknown' && (
                    <p className="text-xs text-red-600 mt-1">
                      ✗ Unrecognized URL format (use Spotify or Apple Music)
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
            );
          })}
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
            disabled={isLoading || !hasValidUrls}
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
          Tip: Add 2-10 playlists for best visualization. Mix Spotify and Apple Music playlists!
        </p>
      </form>
    </div>
  );
};
