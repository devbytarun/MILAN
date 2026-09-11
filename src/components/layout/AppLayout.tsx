import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar.tsx';
import { Footer } from './Footer.tsx';
import { OfflineSyncBanner } from '../common/OfflineSyncBanner.tsx';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const isCinematic = location.pathname === '/';

  return (
    <div className={`min-h-screen flex flex-col font-body antialiased ${
      isCinematic ? 'bg-slate-950 text-white' : 'bg-slate-50/50 text-slate-900'
    }`}>
      <Navbar />
      <OfflineSyncBanner />
      <main className={`flex-1 w-full ${isCinematic ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
