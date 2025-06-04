import { useState } from 'react';
import { Plugin } from '@/types/plugin';

interface AdminPluginFormProps {
  plugin?: Plugin;
  onSave: (plugin: Plugin) => void;
  onCancel: () => void;
}

export default function AdminPluginForm({ plugin, onSave, onCancel }: AdminPluginFormProps) {
  const [formData, setFormData] = useState<Plugin>({
    plugin: plugin?.plugin || '',
    title: plugin?.title || '',
    file: plugin?.file || '',
    type: plugin?.type || 'json',
    description: plugin?.description || '',
    fileSize: plugin?.fileSize || '',
    icon: plugin?.icon || ''
  });

  const [isLoadingFileSize, setIsLoadingFileSize] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedIconFile, setSelectedIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadProgress(0);

    // Update form data with file name
    setFormData(prev => ({
      ...prev,
      file: file.name
    }));

    // Auto-detect file type based on extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension && ['csv', 'json', 'xml'].includes(extension)) {
      setFormData(prev => ({
        ...prev,
        type: extension as 'csv' | 'json' | 'xml'
      }));
    }

    // Calculate and set file size
    const fileSize = formatFileSize(file.size);
    setFormData(prev => ({
      ...prev,
      fileSize: fileSize
    }));

    // Simulate upload progress (you can implement actual upload here)
    setUploadProgress(100);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setSelectedIconFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setIconPreview(result);
    };
    reader.readAsDataURL(file);

    // Upload the file to server
    try {
      const formData = new FormData();
      formData.append('icon', file);

      const response = await fetch('/api/upload-icon', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Update form data with the file path instead of base64
        setFormData(prev => ({
          ...prev,
          icon: data.iconPath // Store the file path
        }));
      } else {
        alert('Failed to upload icon');
      }
    } catch (error) {
      console.error('Icon upload error:', error);
      alert('Failed to upload icon');
    }
  };

  const handleFileNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filename = e.target.value;
    setFormData(prev => ({
      ...prev,
      file: filename
    }));

    // Auto-detect file size if filename is provided
    if (filename) {
      setIsLoadingFileSize(true);
      try {
        const response = await fetch(`/api/file-size?filename=${encodeURIComponent(filename)}`);
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            fileSize: data.fileSize
          }));
        }
      } catch (error) {
        console.error('Failed to get file size:', error);
      } finally {
        setIsLoadingFileSize(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };



  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {plugin ? 'Edit Plugin' : 'Add New Plugin'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plugin Name
                </label>
                <input
                  type="text"
                  name="plugin"
                  value={formData.plugin}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Upload
                </label>
                <div className="space-y-3">
                  {/* File Upload Option */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Upload File
                    </label>
                    <input
                      type="file"
                      accept=".csv,.json,.xml"
                      onChange={handleFileUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {selectedFile && (
                      <div className="mt-2 text-sm text-green-600">
                        ✅ File selected: {selectedFile.name}
                      </div>
                    )}
                  </div>

                  {/* Manual Entry Option */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Or Enter File Name Manually
                    </label>
                    <input
                      type="text"
                      name="file"
                      value={formData.file}
                      onChange={handleFileNameChange}
                      placeholder="example.json"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                  <option value="xml">XML</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Size {isLoadingFileSize && <span className="text-blue-500">(detecting...)</span>}
                </label>
                <input
                  type="text"
                  name="fileSize"
                  value={formData.fileSize}
                  onChange={handleInputChange}
                  placeholder="Auto-detected or manual entry"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon
                </label>
                <div className="space-y-3">
                  {/* Current Icon Preview */}
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-600">Current:</span>
                    <div className="w-6 h-6 flex items-center justify-center">
                      {formData.icon ? (
                        <img
                          src={formData.icon.startsWith('data:') ? formData.icon : formData.icon}
                          alt="Icon"
                          className="w-6 h-6 object-cover rounded"
                          style={{ width: '24px', height: '24px' }}
                        />
                      ) : iconPreview ? (
                        <img
                          src={iconPreview}
                          alt="Icon Preview"
                          className="w-6 h-6 object-cover rounded"
                          style={{ width: '24px', height: '24px' }}
                        />
                      ) : (
                        <span className="text-lg">🔌</span>
                      )}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Upload Icon Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {selectedIconFile && (
                      <div className="mt-2 text-sm text-green-600">
                        ✅ Icon uploaded: {selectedIconFile.name}
                      </div>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Optional: Upload a custom icon or use the default 🔌 plugin icon
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
              >
                {plugin ? 'Update' : 'Add'} Plugin
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
