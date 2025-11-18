'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import MainLayout from '@/components/layout/MainLayout';
import { formatDate, cn } from '@/lib/utils';
import { initiateOAuthFlow, storeTokens, getStoredTokens, clearTokens } from '@/services/integrations/googleOAuth';

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  // Handle OAuth callback
  useEffect(() => {
    const gmailConnected = searchParams.get('gmail_connected');
    const tokensParam = searchParams.get('tokens');
    const error = searchParams.get('error');

    if (error) {
      setErrorMessage(`Connection failed: ${error}`);
      // Clean up URL
      router.replace('/settings');
      return;
    }

    if (gmailConnected === 'true' && tokensParam) {
      try {
        const tokens = JSON.parse(decodeURIComponent(tokensParam));
        storeTokens(tokens);
        connectIntegration('gmail');
        setSuccessMessage('Gmail connected successfully! You can now sync your bills.');
        // Clean up URL
        router.replace('/settings');
      } catch (error) {
        console.error('Error parsing tokens:', error);
        setErrorMessage('Failed to connect Gmail');
      }
    }
  }, [searchParams, connectIntegration, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleConnect = async (type: 'gmail' | 'drive' | 'sheets') => {
    setConnectingType(type);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (type === 'gmail') {
        // Real OAuth flow for Gmail
        const authUrl = await initiateOAuthFlow('gmail');
        window.location.href = authUrl;
      } else {
        // Mock for Drive and Sheets (not implemented yet)
        await connectIntegration(type);
        setSuccessMessage(`${type} connected successfully!`);
      }
    } catch (error) {
      console.error(`Error connecting ${type}:`, error);
      setErrorMessage(`Failed to connect ${type}`);
    } finally {
      if (type !== 'gmail') {
        setConnectingType(null);
      }
    }
  };

  const handleDisconnect = (type: 'gmail' | 'drive' | 'sheets') => {
    if (confirm(`Are you sure you want to disconnect ${type}?`)) {
      if (type === 'gmail') {
        clearTokens();
      }
      disconnectIntegration(type);
      setSuccessMessage(`${type} disconnected`);
    }
  };

  const handleSavePreferences = () => {
    updatePreferences(localPreferences);
    alert('Preferences saved successfully!');
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
              {/* Success/Error Messages */}
              {successMessage && (
                <div className="mb-4 p-4 bg-success-50 border border-success-200 rounded-lg flex items-center">
                  <Check className="h-5 w-5 text-success-600 mr-2" />
                  <p className="text-sm text-success-800">{successMessage}</p>
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="ml-auto text-success-600 hover:text-success-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              {errorMessage && (
                <div className="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-lg flex items-center">
                  <X className="h-5 w-5 text-danger-600 mr-2" />
                  <p className="text-sm text-danger-800">{errorMessage}</p>
                  <button
                    onClick={() => setErrorMessage(null)}
                    className="ml-auto text-danger-600 hover:text-danger-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

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
                      <div>
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
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {drive?.connected ? (
                        <>
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

              {/* Implementation Note */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Gmail Integration:</strong> Fully functional! Connect your Gmail to search for bills from electricity, water, and internet providers.
                  <br />
                  <strong>Drive & Sheets:</strong> Coming soon (currently mocked).
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
      </div>
    </MainLayout>
  );
}
