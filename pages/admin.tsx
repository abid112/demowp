import { useState, useEffect } from 'react';
import Head from 'next/head';
import toast from 'react-hot-toast';
import { Plugin } from '../src/types/plugin';
import AdminPluginForm from '../src/components/AdminPluginForm';
import UserManagement from '../src/components/UserManagement';

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPlugin, setEditingPlugin] = useState<Plugin | undefined>();
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'plugins' | 'users'>('plugins');
  const [showLogout, setShowLogout] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const loggedIn = localStorage.getItem('adminLoggedIn');
    const userData = localStorage.getItem('currentUser');
    if (loggedIn === 'true' && userData) {
      setIsLoggedIn(true);
      setCurrentUser(JSON.parse(userData));
      loadPlugins();
    }
  }, []);

  const loadPlugins = async () => {
    try {
      const response = await fetch('/plugins.json');
      const data = await response.json();
      setPlugins(data);
    } catch (error) {
      console.error('Failed to load plugins:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    // Fallback authentication for default user
    if (username === 'abid' && password === '2|EGNC0MkKap') {
      setIsLoggedIn(true);
      const defaultUser = { id: 1, username: 'abid', role: 'admin' };
      setCurrentUser(defaultUser);
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify(defaultUser));
      setLoginError('');
      loadPlugins();
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(true);
        setCurrentUser(data.user);
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        setLoginError('');
        loadPlugins();
        toast.success(`Welcome back, ${data.user.username}!`);
      } else {
        const error = await response.json();
        setLoginError(error.error || 'Invalid username or password');
        toast.error('Login failed - Invalid credentials');
      }
    } catch (error) {
      // Fallback to simple authentication if API fails
      console.error('API authentication failed, using fallback:', error);
      setLoginError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    const currentUsername = currentUser?.username || 'User';
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('currentUser');
    setUsername('');
    setPassword('');
    setActiveTab('plugins');
    toast.success(`Goodbye, ${currentUsername}! You've been logged out.`);
  };

  const savePlugins = async (updatedPlugins: Plugin[]) => {
    setSaving(true);
    try {
      const response = await fetch('/api/plugins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPlugins),
      });

      if (response.ok) {
        setPlugins(updatedPlugins);
        toast.success('Plugins updated successfully!');
      } else {
        toast.error('Failed to update plugins');
      }
    } catch (error) {
      toast.error('Error updating plugins');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPlugin = () => {
    setEditingPlugin(undefined);
    setShowForm(true);
  };

  const handleEditPlugin = (plugin: Plugin) => {
    setEditingPlugin(plugin);
    setShowForm(true);
  };

  const handleDeletePlugin = (index: number) => {
    const plugin = plugins[index];
    toast((t) => (
      <div className="flex flex-col space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-red-500">🗑️</span>
          <span className="font-medium">Delete Plugin</span>
        </div>
        <p className="text-sm text-gray-600">
          Are you sure you want to delete "{plugin.plugin}"?
        </p>
        <div className="flex space-x-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(t.id);
            }}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const updatedPlugins = plugins.filter((_, i) => i !== index);
              savePlugins(updatedPlugins);
              toast.dismiss(t.id);
              toast.success(`Plugin "${plugin.plugin}" deleted successfully`);
            }}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      style: {
        background: '#fff',
        color: '#000',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      },
    });
  };

  const handleSavePlugin = (plugin: Plugin) => {
    let updatedPlugins;
    const isEditing = !!editingPlugin;

    if (editingPlugin) {
      // Update existing plugin
      const index = plugins.findIndex(p =>
        p.plugin === editingPlugin.plugin &&
        p.title === editingPlugin.title &&
        p.file === editingPlugin.file
      );
      updatedPlugins = [...plugins];
      updatedPlugins[index] = plugin;
    } else {
      // Add new plugin
      updatedPlugins = [...plugins, plugin];
    }

    savePlugins(updatedPlugins);
    setShowForm(false);
    setEditingPlugin(undefined);

    // Show appropriate success message
    if (isEditing) {
      toast.success(`Plugin "${plugin.plugin}" updated successfully!`);
    } else {
      toast.success(`Plugin "${plugin.plugin}" added successfully!`);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPlugin(undefined);
  };

  if (!isLoggedIn) {
    return (
      <>
        <Head>
          <title>DemoWP - Admin Login</title>
          <meta name="description" content="Admin panel for DemoWP" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-xs space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-black mb-4" style={{ fontFamily: 'monospace' }}>
                DemoWP
              </h1>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Admin Panel
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Sign in to manage plugin demo files
              </p>
            </div>

            <div className="bg-white py-8 px-6 shadow rounded-lg">
              <form className="space-y-6" onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      placeholder="Enter your username"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md text-center">
                    {loginError}
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>DemoWP - Admin Panel</title>
        <meta name="description" content="Admin panel for DemoWP" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-lg border-b border-gray-200">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">⚙️</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'monospace' }}>
                    DemoWP Admin
                  </h1>
                  <p className="text-sm text-gray-500">Management Dashboard</p>
                </div>
              </div>

              {/* Navigation Tabs in Header */}
              <div className="flex items-center space-x-6">
                <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                  <button
                    onClick={() => setActiveTab('plugins')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      activeTab === 'plugins'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    <span>🔌</span>
                    <span>Plugins</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      activeTab === 'users'
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    <span>👥</span>
                    <span>Users</span>
                  </button>
                </div>

                {/* User Info with Hover Logout */}
                <div
                  className="relative"
                  onMouseEnter={() => setShowLogout(true)}
                  onMouseLeave={() => setShowLogout(false)}
                >
                  <div className="text-right cursor-pointer px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 border border-transparent hover:border-gray-200">
                    <p className="text-sm font-medium text-gray-900 flex items-center justify-end space-x-1">
                      <span>{currentUser?.username}</span>
                      <span className="text-xs text-gray-400">▼</span>
                    </p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>

                  {/* Logout button appears on hover - with extended hover area */}
                  {showLogout && (
                    <div
                      className="absolute right-0 top-full z-50"
                      style={{ zIndex: 9999 }}
                      onMouseEnter={() => setShowLogout(true)}
                      onMouseLeave={() => setShowLogout(false)}
                    >
                      {/* Invisible bridge to prevent hover gap */}
                      <div className="h-2 w-full"></div>
                      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 py-2 min-w-[140px] transform transition-all duration-200 ease-out">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2 font-medium"
                        >
                          <span>🚪</span>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {activeTab === 'plugins' && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <span>🔌</span>
                    <span>Plugin Management</span>
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Manage demo files and plugin data • {plugins.length} plugins total
                  </p>
                </div>
                <button
                  onClick={handleAddPlugin}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Add Plugin</span>
                </button>
              </div>

            {plugins.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No plugins found. Add your first plugin to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plugin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Format
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {plugins.map((plugin, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-6 h-6 flex items-center justify-center mr-2">
                              {plugin.icon && plugin.icon.startsWith('data:') ? (
                                <img
                                  src={plugin.icon}
                                  alt="Plugin icon"
                                  className="w-6 h-6 object-cover rounded"
                                  style={{ width: '24px', height: '24px' }}
                                />
                              ) : (
                                <span className="text-lg">🔌</span>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {plugin.plugin}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {plugin.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {plugin.file}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            plugin.type === 'csv' ? 'bg-green-100 text-green-800' :
                            plugin.type === 'json' ? 'bg-blue-100 text-blue-800' :
                            plugin.type === 'xml' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {plugin.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {plugin.fileSize}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditPlugin(plugin)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePlugin(index)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
                              style={{ backgroundColor: '#ef4444' }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            </div>
          )}

          {activeTab === 'users' && (
            <UserManagement />
          )}

          {showForm && (
            <AdminPluginForm
              plugin={editingPlugin}
              onSave={handleSavePlugin}
              onCancel={handleCancelForm}
            />
          )}
        </div>
      </div>
    </>
  );
}
