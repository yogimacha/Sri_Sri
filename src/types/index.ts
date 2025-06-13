export interface User {
  id: string;
  email: string;
  name: string;
  role: 'artist' | 'client';
  avatar?: string;
  phone?: string;
  createdAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: string;
  imageUrl?: string;
  addOns?: AddOn[];
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceId: string;
  serviceName: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: Date;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  booking?: Booking;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  skinType?: string;
  allergies?: string;
  preferences?: string;
  bookingHistory: Booking[];
  createdAt: Date;
  lastVisit?: Date;
}

export interface Artist {
  id: string;
  name: string;
  email: string;
  specialties: string[];
  workingHours: WorkingHours;
  avatar?: string;
  bio?: string;
}

export interface WorkingHours {
  [key: string]: {
    start: string;
    end: string;
    breaks?: { start: string; end: string }[];
  };
}