'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Document, Integration, Notification, UserPreferences, DriveFile } from '@/types';
import {
  mockUser,
  mockDocuments,
  mockIntegrations,
  mockNotifications,
} from '@/data/mockData';
import { listFilesInFolder } from '@/services/integrations/driveClient';

interface AppContextType {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;

  // Documents
  documents: Document[];
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;

  // Integrations
  integrations: Integration[];
  connectIntegration: (type: 'gmail' | 'drive' | 'sheets') => Promise<void>;
  disconnectIntegration: (type: 'gmail' | 'drive' | 'sheets') => void;
  syncDriveFiles: () => Promise<void>;

  // Notifications
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;

  // UI state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Preferences
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultPreferences: UserPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  weeklyDigest: true,
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  defaultView: 'grid',
};

export function AppProvider({ children }: { children: ReactNode }) {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Data state
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  // Authentication methods
  const login = async (email: string, password: string) => {
    // Mock login - in real app, this would call API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser(mockUser);
    setIsAuthenticated(true);
  };

  const loginWithGoogle = async () => {
    // Mock Google OAuth - in real app, this would use Google OAuth
    await new Promise(resolve => setTimeout(resolve, 1500));
    setUser(mockUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  // Document methods
  const addDocument = (document: Document) => {
    setDocuments(prev => [document, ...prev]);
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments(prev =>
      prev.map(doc => (doc.id === id ? { ...doc, ...updates } : doc))
    );
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  // Integration methods
  const connectIntegration = async (type: 'gmail' | 'drive' | 'sheets') => {
    // Mock connection - in real app, this would handle OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIntegrations(prev =>
      prev.map(int =>
        int.type === type
          ? { ...int, connected: true, email: user?.email, status: 'active' as const, lastSync: new Date() }
          : int
      )
    );
  };

  const disconnectIntegration = (type: 'gmail' | 'drive' | 'sheets') => {
    setIntegrations(prev =>
      prev.map(int =>
        int.type === type
          ? { ...int, connected: false, status: 'disconnected' as const }
          : int
      )
    );
  };

  // Notification methods
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  // UI methods
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // Preferences methods
  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  // Drive sync methods
  const convertDriveFileToDocument = (driveFile: DriveFile): Document => {
    // Create a mock document from Drive file
    // In production, this would trigger OCR and extraction
    return {
      id: `drive-${driveFile.id}`,
      organizationId: user?.organizationId || 'mock-org',
      uploadedBy: user?.id || 'mock-user',
      sourceType: 'drive',
      sourceReference: driveFile.id,
      vendorName: 'Unknown Vendor',
      vendorNormalized: 'unknown-vendor',
      totalAmount: 0,
      currency: preferences.currency,
      documentDate: driveFile.modifiedTime,
      category: 'Uncategorized',
      documentType: 'receipt',
      tags: [],
      extractionData: {
        vendor: {
          name: 'Unknown Vendor',
          normalizedId: 'unknown-vendor',
        },
        amounts: {
          subtotal: 0,
          tax: 0,
          total: 0,
          currency: preferences.currency,
        },
        dates: {
          issued: driveFile.modifiedTime,
        },
        category: 'Uncategorized',
        documentType: 'receipt',
        confidenceScores: {
          overall: 0,
          perField: {},
        },
      },
      confidenceScore: 0,
      status: 'pending',
      fileUrl: driveFile.webViewLink || '',
      thumbnailUrl: driveFile.thumbnailLink || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  const syncDriveFiles = async () => {
    const driveIntegration = integrations.find(i => i.type === 'drive');

    if (!driveIntegration?.connected) {
      console.log('Drive not connected');
      return;
    }

    const folderId = preferences.driveMonitoredFolderId;
    if (!folderId) {
      console.log('No folder selected for monitoring');
      return;
    }

    try {
      const driveFiles = await listFilesInFolder(folderId);

      // Check which files are new (not already in documents)
      const existingDriveIds = new Set(
        documents
          .filter(doc => doc.sourceType === 'drive')
          .map(doc => doc.sourceReference)
      );

      const newFiles = driveFiles.filter(file => !existingDriveIds.has(file.id));

      // Convert new files to documents
      const newDocuments = newFiles.map(convertDriveFileToDocument);

      // Add new documents
      if (newDocuments.length > 0) {
        setDocuments(prev => [...newDocuments, ...prev]);

        // Update last sync time
        setIntegrations(prev =>
          prev.map(int =>
            int.type === 'drive' ? { ...int, lastSync: new Date() } : int
          )
        );

        console.log(`Synced ${newDocuments.length} new files from Drive`);
      } else {
        console.log('No new files found in Drive folder');
      }
    } catch (error) {
      console.error('Error syncing Drive files:', error);
    }
  };

  const value: AppContextType = {
    user,
    isAuthenticated,
    login,
    loginWithGoogle,
    logout,
    documents,
    addDocument,
    updateDocument,
    deleteDocument,
    integrations,
    connectIntegration,
    disconnectIntegration,
    syncDriveFiles,
    notifications,
    markNotificationAsRead,
    sidebarCollapsed,
    toggleSidebar,
    preferences,
    updatePreferences,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
