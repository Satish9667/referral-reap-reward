
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-brand-purple-light">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-white py-6 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Referral Reward Program. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
