import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { addMinutes, format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  services?: Database['public']['Tables']['services']['Row'];
  profiles?: Database['public']['Tables']['profiles']['Row'];
  client_profile?: Database['public']['Tables']['profiles']['Row'];
};

export function useBookings(userId?: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchBookings();
    }
  }, [userId]);

  const fetchBookings = async () => {
    if (!userId) return;

    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          services (
            id,
            name,
            duration,
            price,
            category
          ),
          profiles!bookings_artist_id_fkey (
            id,
            full_name,
            avatar_url
          ),
          client_profile:profiles!bookings_client_id_fkey (
            id,
            full_name,
            email,
            phone,
            avatar_url
          )
        `)
        .order('appointment_date', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast.error('Error loading bookings');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: {
    serviceId: string;
    artistId: string;
    appointmentDate: string;
    startTime: string;
    notes?: string;
  }) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      // Get service details to calculate end time and amount
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('duration, price')
        .eq('id', bookingData.serviceId)
        .single();

      if (serviceError) throw serviceError;

      const startDateTime = parseISO(`${bookingData.appointmentDate}T${bookingData.startTime}`);
      const endDateTime = addMinutes(startDateTime, service.duration);
      const endTime = format(endDateTime, 'HH:mm');

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          client_id: userId,
          service_id: bookingData.serviceId,
          artist_id: bookingData.artistId,
          appointment_date: bookingData.appointmentDate,
          start_time: bookingData.startTime,
          end_time: endTime,
          total_amount: service.price,
          notes: bookingData.notes,
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchBookings();
      toast.success('Booking created successfully!');
      return data;
    } catch (error: any) {
      toast.error('Error creating booking');
      throw error;
    }
  };

  const updateBookingStatus = async (id: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      await fetchBookings();
      toast.success(`Booking ${status} successfully!`);
    } catch (error: any) {
      toast.error(`Error updating booking status`);
      throw error;
    }
  };

  const getAvailableSlots = async (artistId: string, date: string, serviceId: string) => {
    try {
      // Get service duration
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('duration')
        .eq('id', serviceId)
        .single();

      if (serviceError) throw serviceError;

      // Get existing bookings for the date
      const { data: existingBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('artist_id', artistId)
        .eq('appointment_date', date)
        .in('status', ['pending', 'confirmed']);

      if (bookingsError) throw bookingsError;

      // Generate available slots (9 AM to 6 PM, 30-minute intervals)
      const slots = [];
      for (let hour = 9; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          
          // Check if this slot conflicts with existing bookings
          const slotStart = parseISO(`${date}T${timeSlot}`);
          const slotEnd = addMinutes(slotStart, service.duration);
          
          const hasConflict = existingBookings?.some(booking => {
            const bookingStart = parseISO(`${date}T${booking.start_time}`);
            const bookingEnd = parseISO(`${date}T${booking.end_time}`);
            
            return (slotStart < bookingEnd && slotEnd > bookingStart);
          });

          if (!hasConflict) {
            slots.push(timeSlot);
          }
        }
      }

      return slots;
    } catch (error: any) {
      console.error('Error getting available slots:', error);
      return [];
    }
  };

  return {
    bookings,
    loading,
    createBooking,
    updateBookingStatus,
    getAvailableSlots,
    refetch: fetchBookings,
  };
}