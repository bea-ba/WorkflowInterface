'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  HardDrive,
  Sheet,
  Check,
  X,
  Loader2,
  Bell,
  User,
  CreditCard,
  Trash2,
  Folder,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import MainLayout from '@/components/layout/MainLayout';
import { formatDate, cn } from '@/lib/utils';
import { listDriveFolders } from '@/services/integrations/driveClient';
import { DriveFolder } from '@/types';

export default function SettingsPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    user,
    integrations,
    connectIntegration,
    disconnectIntegration,
    preferences,
    updatePreferences,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'integrations' | 'preferences' | 'account'>('integrations');
  const [connectingType, setConnectingType] = useState<string | null>(null);
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [availableFolders, setAvailableFolders] = useState<DriveFolder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  if (!isAuthenticated) {
    return null;
  }

  const handleConnect = async (type: 'gmail' | 'drive' | 'sheets') => {
    setConnectingType(type);
    try {
      // MOCK: In real app, this would initiate OAuth flow
      await connectIntegration(type);
    } finally {
      setConnectingType(null);
    }
  };

  const handleDisconnect = (type: 'gmail' | 'drive' | 'sheets') => {
    if (confirm(`Are you sure you want to disconnect ${type}?`)) {
      disconnectIntegration(type);
    }
  };

  const handleSavePreferences = () => {
    updatePreferences(localPreferences);
    alert('Preferences saved successfully!');
  };

  const handleSelectFolder = async () => {
    setShowFolderModal(true);
    setLoadingFolders(true);
    try {
      const folders = await listDriveFolders();
      setAvailableFolders(folders);
    } catch (error) {
      console.error('Error loading folders:', error);
      alert('Failed to load folders. Please try again.');
    } finally {
      setLoadingFolders(false);
    }
  };

  const handleChooseFolder = (folder: DriveFolder) => {
    setLocalPreferences({
      ...localPreferences,
      driveMonitoredFolderId: folder.id,
      driveMonitoredFolderName: folder.name,
    });
    updatePreferences({
      driveMonitoredFolderId: folder.id,
      driveMonitoredFolderName: folder.name,
    });
    setShowFolderModal(false);
    alert(`Folder "${folder.name}" selected successfully!`);
  };

  const gmail = integrations.find(i => i.type === 'gmail');
  const drive = integrations.find(i => i.type === 'drive');
  const sheets = integrations.find(i => i.type === 'sheets');

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your integrations, preferences, and account settings.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('integrations')}
                className={cn(
                  'py-4 px-6 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'integrations'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                Integrations
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={cn(
                  'py-4 px-6 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'preferences'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                Preferences
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={cn(
                  'py-4 px-6 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'account'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                Account
              </button>
            </nav>
          </div>

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Connected Integrations
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Connect your Google Workspace accounts to automatically import and sync financial documents.
              </p>

              <div className="space-y-4">
                {/* Gmail Integration */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-danger-100 rounded-full">
                        <Mail className="h-6 w-6 text-danger-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Gmail</h3>
                        <p className="text-sm text-gray-600">
                          Automatically import bills and receipts from email attachments
                        </p>
                        {gmail?.connected && gmail.email && (
                          <p className="text-xs text-gray-500 mt-1">
                            Connected: {gmail.email}
                            {gmail.lastSync && ` • Last sync: ${formatDate(gmail.lastSync, 'relative')}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {gmail?.connected ? (
                        <>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                            <Check className="h-3 w-3 mr-1" />
                            Connected
                          </span>
                          <button
                            onClick={() => handleDisconnect('gmail')}
                            className="px-3 py-1.5 text-sm font-medium text-danger-700 hover:bg-danger-50 rounded-md transition-colors"
                          >
                            Disconnect
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleConnect('gmail')}
                          disabled={connectingType === 'gmail'}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {connectingType === 'gmail' ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : null}
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Google Drive Integration */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-success-100 rounded-full">
                        <HardDrive className="h-6 w-6 text-success-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900">Google Drive</h3>
                        <p className="text-sm text-gray-600">
                          Monitor folders for new documents and automatically process them
                        </p>
                        {drive?.connected && drive.email && (
                          <p className="text-xs text-gray-500 mt-1">
                            Connected: {drive.email}
                            {drive.lastSync && ` • Last sync: ${formatDate(drive.lastSync, 'relative')}`}
                          </p>
                        )}
                        {drive?.connected && localPreferences.driveMonitoredFolderName && (
                          <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                            <Folder className="h-3 w-3 mr-1" />
                            Monitoring: {localPreferences.driveMonitoredFolderName}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {drive?.connected ? (
                        <>
                          <button
                            onClick={handleSelectFolder}
                            className="px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
                          >
                            {localPreferences.driveMonitoredFolderId ? 'Change Folder' : 'Select Folder'}
                          </button>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                            <Check className="h-3 w-3 mr-1" />
                            Connected
                          </span>
                          <button
                            onClick={() => handleDisconnect('drive')}
                            className="px-3 py-1.5 text-sm font-medium text-danger-700 hover:bg-danger-50 rounded-md transition-colors"
                          >
                            Disconnect
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleConnect('drive')}
                          disabled={connectingType === 'drive'}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {connectingType === 'drive' ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : null}
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Google Sheets Integration */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-primary-100 rounded-full">
                        <Sheet className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Google Sheets</h3>
                        <p className="text-sm text-gray-600">
                          Sync extracted data to your existing expense tracking spreadsheets
                        </p>
                        {sheets?.connected && sheets.email && (
                          <p className="text-xs text-gray-500 mt-1">
                            Connected: {sheets.email}
                            {sheets.lastSync && ` • Last sync: ${formatDate(sheets.lastSync, 'relative')}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {sheets?.connected ? (
                        <>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                            <Check className="h-3 w-3 mr-1" />
                            Connected
                          </span>
                          <button
                            onClick={() => handleDisconnect('sheets')}
                            className="px-3 py-1.5 text-sm font-medium text-danger-700 hover:bg-danger-50 rounded-md transition-colors"
                          >
                            Disconnect
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleConnect('sheets')}
                          disabled={connectingType === 'sheets'}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {connectingType === 'sheets' ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : null}
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* MOCK Note */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Mock Integration:</strong> In production, clicking "Connect" would:
                  <ul className="mt-2 ml-5 list-disc space-y-1">
                    <li>Initiate Google OAuth 2.0 flow</li>
                    <li>Request necessary permissions (read emails, access drive, edit sheets)</li>
                    <li>Store encrypted access tokens in Supabase</li>
                    <li>Set up webhooks for real-time notifications</li>
                  </ul>
                </p>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                User Preferences
              </h2>

              <div className="space-y-6">
                {/* Notifications */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localPreferences.emailNotifications}
                        onChange={(e) => setLocalPreferences({ ...localPreferences, emailNotifications: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Email notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localPreferences.pushNotifications}
                        onChange={(e) => setLocalPreferences({ ...localPreferences, pushNotifications: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Push notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localPreferences.weeklyDigest}
                        onChange={(e) => setLocalPreferences({ ...localPreferences, weeklyDigest: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Weekly digest email</span>
                    </label>
                  </div>
                </div>

                {/* Display Settings */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Display Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Currency</label>
                      <select
                        value={localPreferences.currency}
                        onChange={(e) => setLocalPreferences({ ...localPreferences, currency: e.target.value })}
                        className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Date Format</label>
                      <select
                        value={localPreferences.dateFormat}
                        onChange={(e) => setLocalPreferences({ ...localPreferences, dateFormat: e.target.value })}
                        className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Default View</label>
                      <select
                        value={localPreferences.defaultView}
                        onChange={(e) => setLocalPreferences({ ...localPreferences, defaultView: e.target.value as 'grid' | 'list' })}
                        className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="grid">Grid View</option>
                        <option value="list">List View</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSavePreferences}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Account Information
              </h2>

              <div className="space-y-6">
                {/* Profile */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue={user?.fullName}
                        className="block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue={user?.email}
                        disabled
                        className="block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                  </div>
                </div>

                {/* Subscription */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Subscription
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Pro Plan</p>
                        <p className="text-xs text-gray-600">$19/month • Unlimited documents</p>
                      </div>
                      <button className="px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-50 rounded-md transition-colors">
                        Manage
                      </button>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-danger-900 mb-3 flex items-center">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Danger Zone
                  </h3>
                  <button className="px-4 py-2 border border-danger-300 rounded-md shadow-sm text-sm font-medium text-danger-700 bg-white hover:bg-danger-50">
                    Delete Account
                  </button>
                  <p className="mt-2 text-xs text-gray-500">
                    This action cannot be undone. All your data will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Folder Selection Modal */}
        {showFolderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Select Drive Folder</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Choose a folder to monitor for new financial documents
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {loadingFolders ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                  </div>
                ) : availableFolders.length === 0 ? (
                  <div className="text-center py-8">
                    <Folder className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">No folders found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableFolders.map((folder) => (
                      <button
                        key={folder.id}
                        onClick={() => handleChooseFolder(folder)}
                        className={cn(
                          'w-full text-left p-4 rounded-lg border transition-colors',
                          localPreferences.driveMonitoredFolderId === folder.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <Folder className="h-5 w-5 text-gray-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {folder.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Modified {formatDate(folder.modifiedTime, 'relative')}
                            </p>
                          </div>
                          {localPreferences.driveMonitoredFolderId === folder.id && (
                            <Check className="h-5 w-5 text-primary-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowFolderModal(false)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
