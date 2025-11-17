'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { sidebarCollapsed } = useApp();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      {/* Main content */}
      <div
        className={cn(
          'transition-all duration-300 pt-16 pb-20 md:pb-0',
          sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
        )}
      >
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
