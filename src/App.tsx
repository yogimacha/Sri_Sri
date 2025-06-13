import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BookingProvider } from './contexts/BookingContext';
import { LoginForm } from './components/auth/LoginForm';
import { Header } from './components/layout/Header';
import { ArtistDashboard } from './components/views/ArtistDashboard';
import { BookingsView } from './components/views/BookingsView';
import { ClientsView } from './components/views/ClientsView';
import { ServicesView } from './components/views/ServicesView';
import { MyBookingsView } from './components/views/MyBookingsView';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState(
    user?.role === 'artist' ? 'dashboard' : 'services'
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <ArtistDashboard />;
      case 'bookings':
        return <BookingsView />;
      case 'clients':
        return <ClientsView />;
      case 'services':
        return <ServicesView />;
      case 'my-bookings':
        return <MyBookingsView />;
      default:
        return user.role === 'artist' ? <ArtistDashboard /> : <ServicesView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <AppContent />
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;