'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Document, Integration, Notification, UserPreferences } from '@/types';
import {
  mockUser,
  mockDocuments,
  mockIntegrations,
  mockNotifications,
} from '@/data/mockData';

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
  syncGmailBills: (monthsBack?: number) => Promise<{ success: boolean; count: number; error?: string }>;

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

  // Gmail sync method
  const syncGmailBills = async (monthsBack: number = 3): Promise<{ success: boolean; count: number; error?: string }> => {
    try {
      // Dynamic import to avoid issues with server-side rendering
      const { searchForBills } = await import('@/services/integrations/gmailMonitor');

      const billFiles = await searchForBills(monthsBack);

      // Convert BillFile objects to Document objects
      const newDocuments: Document[] = billFiles.map((bill) => {
        const docId = `gmail_${bill.messageId}_${Date.now()}`;

        return {
          id: docId,
          organizationId: user?.organizationId || 'org_1',
          uploadedBy: user?.id || 'user_1',
          sourceType: 'gmail' as const,
          sourceReference: bill.messageId,
          vendorName: bill.from.split('<')[0].trim() || 'Unknown Vendor',
          vendorNormalized: bill.from.toLowerCase(),
          totalAmount: 0, // No extraction yet - just getting files
          currency: 'USD',
          documentDate: bill.date,
          dueDate: undefined,
          category: bill.category,
          documentType: 'bill' as const,
          tags: [bill.category],
          extractionData: {
            vendor: {
              name: bill.from.split('<')[0].trim() || 'Unknown Vendor',
              normalizedId: bill.from.toLowerCase(),
            },
            amounts: {
              subtotal: 0,
              tax: 0,
              total: 0,
              currency: 'USD',
            },
            dates: {
              issued: bill.date,
            },
            category: bill.category,
            documentType: 'bill' as const,
            confidenceScores: {
              overall: 0,
              perField: {},
            },
          },
          confidenceScore: 0,
          status: 'pending' as const,
          fileUrl: `data:${bill.mimeType};base64,${bill.data}`,
          thumbnailUrl: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

      // Add all new documents to state
      setDocuments(prev => [...newDocuments, ...prev]);

      // Update Gmail integration last sync
      setIntegrations(prev =>
        prev.map(int =>
          int.type === 'gmail'
            ? { ...int, lastSync: new Date() }
            : int
        )
      );

      return { success: true, count: newDocuments.length };
    } catch (error) {
      console.error('Error syncing Gmail bills:', error);
      return {
        success: false,
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
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
    syncGmailBills,
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
