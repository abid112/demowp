'use client';

import { useState, useEffect } from 'react';
import FilterDropdown from '@/components/FilterDropdown';
import PluginCard from '@/components/PluginCard';
import { Plugin } from '@/types/plugin';

export default function Home() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlugins = async () => {
      try {
        const response = await fetch('/plugins.json');
        if (!response.ok) {
          throw new Error('Failed to load plugins data');
        }
        const data = await response.json();
        setPlugins(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadPlugins();
  }, []);

  const filteredPlugins = selectedPlugin
    ? plugins.filter(plugin => plugin.plugin === selectedPlugin)
    : plugins;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plugins...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-6xl font-bold text-black mb-6" style={{ fontFamily: 'monospace' }}>
            DemoWP
          </h1>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Plugin Demo Files
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Download demo files, presets, and samples for various audio, video, and image processing plugins.
            Use the filter below to browse by specific plugin type.
          </p>
        </header>

        <FilterDropdown
          plugins={plugins}
          selectedPlugin={selectedPlugin}
          onPluginChange={setSelectedPlugin}
        />

        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing {filteredPlugins.length} of {plugins.length} files
            {selectedPlugin && (
              <span className="ml-2">
                for <span className="font-medium">{selectedPlugin}</span>
              </span>
            )}
          </p>
        </div>

        {filteredPlugins.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
            <p className="text-gray-600">
              {selectedPlugin
                ? `No demo files available for ${selectedPlugin}. Try selecting a different plugin.`
                : 'No demo files are currently available.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlugins.map((plugin, index) => (
              <PluginCard key={index} plugin={plugin} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
