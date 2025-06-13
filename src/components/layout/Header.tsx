import React from 'react';
import { Bell, User, LogOut, Calendar, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const { user, logout } = useAuth();

  const artistNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Calendar },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'clients', label: 'Clients', icon: User },
    { id: 'services', label: 'Services', icon: Settings },
  ];

  const clientNavItems = [
    { id: 'services', label: 'Book Service', icon: Calendar },
    { id: 'my-bookings', label: 'My Bookings', icon: User },
  ];

  const navItems = user?.role === 'artist' ? artistNavItems : clientNavItems;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-white">BB</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">BeautyBook Pro</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    currentView === item.id
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all">
              <Bell className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
              </div>
              
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="p-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}