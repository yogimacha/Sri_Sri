import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, DollarSign, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { useBookings } from '../../hooks/useBookings';
import { useAuth } from '../../hooks/useAuth';
import { Database } from '../../types/database';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import toast from 'react-hot-toast';

type Service = Database['public']['Tables']['services']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'];
};

interface BookingModalProps {
  service: Service;
  onClose: () => void;
}

export function BookingModal({ service, onClose }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const { user } = useAuth();
  const { createBooking, getAvailableSlots } = useBookings();

  // Generate next 30 days for date selection
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, 'MMM dd, yyyy'),
      disabled: isBefore(date, startOfDay(new Date()))
    };
  });

  useEffect(() => {
    if (selectedDate && service.artist_id) {
      fetchAvailableSlots();
    }
  }, [selectedDate, service.artist_id]);

  const fetchAvailableSlots = async () => {
    if (!selectedDate || !service.artist_id) return;

    setLoadingSlots(true);
    try {
      const slots = await getAvailableSlots(service.artist_id, selectedDate, service.id);
      setAvailableSlots(slots);
      setSelectedTime(''); // Reset selected time when date changes
    } catch (error) {
      toast.error('Error loading available slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('Please sign in to book an appointment');
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }

    setLoading(true);
    try {
      await createBooking({
        serviceId: service.id,
        artistId: service.artist_id,
        appointmentDate: selectedDate,
        startTime: selectedTime,
        notes: notes.trim() || undefined,
      });
      
      toast.success('Booking created successfully!');
      onClose();
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Book Appointment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Service Details */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                {service.image_url && (
                  <img
                    src={service.image_url}
                    alt={service.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {service.duration} mins
                    </span>
                    <span className="flex items-center font-semibold text-gray-900">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {service.price}
                    </span>
                  </div>

                  {service.profiles && (
                    <div className="flex items-center mt-3 p-2 bg-gray-50 rounded-lg">
                      {service.profiles.avatar_url ? (
                        <img
                          src={service.profiles.avatar_url}
                          alt={service.profiles.full_name}
                          className="w-6 h-6 rounded-full object-cover mr-2"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center mr-2">
                          <User className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900">{service.profiles.full_name}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              >
                <option value="">Choose a date</option>
                {availableDates.map((date) => (
                  <option key={date.value} value={date.value} disabled={date.disabled}>
                    {date.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Time Slots
                </label>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`p-2 text-sm rounded-lg border transition-all ${
                          selectedTime === slot
                            ? 'bg-pink-500 text-white border-pink-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-pink-300 hover:bg-pink-50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No available slots for this date</p>
                    <p className="text-sm">Please try another date</p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests or Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Any special requests, skin concerns, or preferences..."
              />
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                loading={loading}
                disabled={!selectedDate || !selectedTime}
              >
                Book Appointment
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}