import { useState, useEffect } from 'react';
import Head from 'next/head';
import SearchBar from '../src/components/SearchBar';
import PluginTable from '../src/components/PluginTable';
import Footer from '../src/components/Footer';
import { Plugin } from '../src/types/plugin';

export default function Home() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 5;

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

  // Filter plugins based on search term (global search across all data)
  const filteredPlugins = plugins.filter(plugin =>
    plugin.plugin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plugin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredPlugins.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPagePlugins = filteredPlugins.slice(startIndex, endIndex);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>DemoWP - Plugin Demo Files</title>
          <meta name="description" content="DemoWP - Download demo files for various plugins" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading plugins...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>DemoWP - Error Loading Files</title>
          <meta name="description" content="DemoWP - Download demo files for various plugins" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
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
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Plugin Demo Files</title>
        <meta name="description" content="Download demo files for various plugins" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-5xl font-bold text-black mb-6" style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}>
              DemoWP
            </h1>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Plugin Demo Files
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Download demo files, presets, and samples for various audio, video, and image processing plugins.
              Use the search bar below to find specific plugins.
            </p>
          </header>

          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredPlugins.length)} of {filteredPlugins.length} plugins
              {searchTerm && (
                <span className="ml-2">
                  matching "<span className="font-medium">{searchTerm}</span>"
                </span>
              )}
              {filteredPlugins.length !== plugins.length && (
                <span className="ml-2 text-gray-500">
                  (filtered from {plugins.length} total)
                </span>
              )}
            </p>
          </div>

          <PluginTable
            plugins={currentPagePlugins}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
        <Footer />
      </div>
    </>
  );
}
