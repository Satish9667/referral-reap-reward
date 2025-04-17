
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Award, LogOut, User } from 'lucide-react';

const Navigation = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-card border-b sticky top-0 z-10 border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Award className="h-6 w-6 text-primary" />
            <Link to="/" className="text-xl font-bold text-foreground">ReferReward</Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link to="/rewards" className="text-foreground hover:text-primary transition-colors">
                  Rewards
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2">
                  <User size={16} className="text-foreground" />
                  <span className="text-sm font-medium text-foreground">{currentUser?.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={logout} 
                  className="text-foreground hover:text-primary hover:bg-secondary"
                  size="sm"
                >
                  <LogOut size={18} className="mr-1" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild className="hover:bg-secondary">
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild className="bg-primary hover:bg-primary/90">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
