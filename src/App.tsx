import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/auth/AuthForm';
import { Header } from './components/layout/Header';
import { ArtistDashboard } from './components/views/ArtistDashboard';
import { BookingsView } from './components/views/BookingsView';
import { ServicesView } from './components/views/ServicesView';
import { ArtistServicesView } from './components/views/ArtistServicesView';
import { MyBookingsView } from './components/views/MyBookingsView';

function App() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState(
    user?.profile?.role === 'artist' ? 'dashboard' : 'services'
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthForm />
        <Toaster position="top-right" />
      </>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <ArtistDashboard />;
      case 'bookings':
        return <BookingsView />;
      case 'services':
        return user.profile?.role === 'artist' ? <ArtistServicesView /> : <ServicesView />;
      case 'my-bookings':
        return <MyBookingsView />;
      default:
        return user.profile?.role === 'artist' ? <ArtistDashboard /> : <ServicesView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;