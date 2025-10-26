import React, { useEffect, useRef, useState } from 'react';
import { Track } from '../types';

interface TrackTooltipProps {
  track: Track | null;
  position?: { x: number; y: number };
}

export const TrackTooltip: React.FC<TrackTooltipProps> = ({ track, position }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (!position || !tooltipRef.current) {
      setAdjustedPosition(position);
      return;
    }

    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x + 10;
    let y = position.y;

    // Adjust if tooltip goes off right edge
    if (x + tooltipRect.width > viewportWidth) {
      x = position.x - tooltipRect.width - 10;
    }

    // Adjust if tooltip goes off bottom edge
    if (y + tooltipRect.height > viewportHeight) {
      y = viewportHeight - tooltipRect.height - 10;
    }

    // Adjust if tooltip goes off top edge
    if (y < 0) {
      y = 10;
    }

    setAdjustedPosition({ x, y });
  }, [position, track]);

  if (!track || !adjustedPosition) {
    return null;
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const releaseYear = track.album.release_date?.substring(0, 4) || 'Unknown';

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 bg-white shadow-2xl rounded-lg p-4 max-w-sm border border-gray-200 pointer-events-none"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      <div className="flex items-start gap-3">
        {track.album.images && track.album.images.length > 0 && track.album.images[0].url ? (
          <img
            src={track.album.images[0].url}
            alt={track.album.name}
            className="w-16 h-16 rounded shadow"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-2xl">🎵</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-gray-900 truncate" title={track.name}>
            {track.name}
          </h3>
          <p className="text-sm text-gray-600 truncate" title={track.artists.map((a) => a.name).join(', ')}>
            {track.artists.map((a) => a.name).join(', ')}
          </p>
          <p className="text-xs text-gray-500 truncate mt-1" title={track.album.name}>
            {track.album.name}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
        {track.genre && (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
            🎵 {track.genre}
          </span>
        )}
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
          📅 {releaseYear}
        </span>
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
          ⏱️ {formatDuration(track.duration_ms)}
        </span>
        {track.popularity !== undefined && (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
            ⭐ {track.popularity}
          </span>
        )}
      </div>
    </div>
  );
};
