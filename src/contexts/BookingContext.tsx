import React, { createContext, useContext, useState, useEffect } from 'react';
import { Booking, Service, ClientProfile } from '../types';
import { addDays, format } from 'date-fns';

interface BookingContextType {
  bookings: Booking[];
  services: Service[];
  clients: ClientProfile[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
  getAvailableSlots: (date: Date, serviceId: string) => string[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Mock data
const mockServices: Service[] = [
  {
    id: '1',
    name: 'Bridal Makeup',
    description: 'Complete bridal makeup package with trial session',
    duration: 120,
    price: 299,
    category: 'Bridal',
    imageUrl: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  },
  {
    id: '2',
    name: 'Evening Glam',
    description: 'Sophisticated evening makeup for special occasions',
    duration: 90,
    price: 149,
    category: 'Special Occasion',
    imageUrl: 'https://images.pexels.com/photos/1687675/pexels-photo-1687675.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  },
  {
    id: '3',
    name: 'Natural Day Look',
    description: 'Fresh, natural makeup for everyday elegance',
    duration: 60,
    price: 89,
    category: 'Everyday',
    imageUrl: 'https://images.pexels.com/photos/1844012/pexels-photo-1844012.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  },
  {
    id: '4',
    name: 'Photoshoot Ready',
    description: 'High-definition makeup perfect for photography',
    duration: 105,
    price: 189,
    category: 'Professional',
    imageUrl: 'https://images.pexels.com/photos/1153655/pexels-photo-1153655.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  },
];

const mockBookings: Booking[] = [
  {
    id: '1',
    clientId: '2',
    clientName: 'Jessica Alba',
    clientEmail: 'client@example.com',
    clientPhone: '+1 (555) 987-6543',
    serviceId: '1',
    serviceName: 'Bridal Makeup',
    date: addDays(new Date(), 5),
    startTime: '10:00',
    endTime: '12:00',
    duration: 120,
    price: 299,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: new Date(),
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Jessica Alba',
    clientEmail: 'client@example.com',
    serviceId: '2',
    serviceName: 'Evening Glam',
    date: addDays(new Date(), 2),
    startTime: '16:00',
    endTime: '17:30',
    duration: 90,
    price: 149,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: new Date(),
  },
];

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [services] = useState<Service[]>(mockServices);
  const [clients, setClients] = useState<ClientProfile[]>([]);

  useEffect(() => {
    // Generate client profiles from bookings
    const clientMap = new Map<string, ClientProfile>();
    
    bookings.forEach(booking => {
      if (!clientMap.has(booking.clientId)) {
        clientMap.set(booking.clientId, {
          id: booking.clientId,
          name: booking.clientName,
          email: booking.clientEmail,
          phone: booking.clientPhone,
          bookingHistory: [],
          createdAt: new Date(),
        });
      }
      
      const client = clientMap.get(booking.clientId)!;
      client.bookingHistory.push(booking);
      client.lastVisit = booking.date;
    });

    setClients(Array.from(clientMap.values()));
  }, [bookings]);

  const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setBookings(prev => [...prev, newBooking]);
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(booking => 
      booking.id === id ? { ...booking, ...updates } : booking
    ));
  };

  const deleteBooking = (id: string) => {
    setBookings(prev => prev.filter(booking => booking.id !== id));
  };

  const getAvailableSlots = (date: Date, serviceId: string): string[] => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return [];

    const dateStr = format(date, 'yyyy-MM-dd');
    const bookedSlots = bookings
      .filter(b => format(b.date, 'yyyy-MM-dd') === dateStr)
      .map(b => b.startTime);

    const allSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
      '18:00', '18:30'
    ];

    return allSlots.filter(slot => !bookedSlots.includes(slot));
  };

  return (
    <BookingContext.Provider value={{
      bookings,
      services,
      clients,
      addBooking,
      updateBooking,
      deleteBooking,
      getAvailableSlots,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}