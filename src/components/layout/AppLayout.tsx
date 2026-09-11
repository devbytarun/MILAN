import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar.tsx';
import { Footer } from './Footer.tsx';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const isHomepage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col font-body antialiased bg-white text-[#333840]">
      <Navbar />
      <main className={`flex-1 w-full ${isHomepage ? '' : 'max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
