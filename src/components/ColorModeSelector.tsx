import React from 'react';
import { ColorMode } from '../types';
import { getLegendItems } from '../utils/colorSchemes';

interface ColorModeSelectorProps {
  currentMode: ColorMode;
  onChange: (mode: ColorMode) => void;
}

export const ColorModeSelector: React.FC<ColorModeSelectorProps> = ({
  currentMode,
  onChange,
}) => {
  const modes: Array<{ value: ColorMode; label: string; icon: string; description: string }> = [
    {
      value: 'genre',
      label: 'Genre',
      icon: '🎵',
      description: 'Color by music genre',
    },
    {
      value: 'artist',
      label: 'Artist',
      icon: '🎤',
      description: 'Each artist gets a unique color',
    },
    {
      value: 'album',
      label: 'Album',
      icon: '💿',
      description: 'Each album gets a unique color',
    },
    {
      value: 'releaseYear',
      label: 'Release Year',
      icon: '📅',
      description: 'Gradient from old (blue) to new (red)',
    },
  ];

  const legendItems = getLegendItems(currentMode);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Color Mode</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {modes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => onChange(mode.value)}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200
              ${
                currentMode === mode.value
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow'
              }
            `}
            title={mode.description}
          >
            <div className="text-3xl mb-2">{mode.icon}</div>
            <div
              className={`font-medium ${
                currentMode === mode.value ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              {mode.label}
            </div>
          </button>
        ))}
      </div>

      {legendItems.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold mb-3 text-gray-700">Legend</h4>
          <div className="flex flex-wrap gap-3">
            {legendItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
