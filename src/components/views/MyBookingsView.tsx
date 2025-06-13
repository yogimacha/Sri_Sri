import React from 'react';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';
import { format, isFuture } from 'date-fns';

export function MyBookingsView() {
  const { bookings, updateBooking } = useBooking();
  const { user } = useAuth();
  
  const userBookings = bookings.filter(booking => booking.clientId === user?.id);
  const upcomingBookings = userBookings.filter(booking => isFuture(booking.date));
  const pastBookings = userBookings.filter(booking => !isFuture(booking.date));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const BookingCard = ({ booking, showActions = false }: { booking: any; showActions?: boolean }) => (
    <Card key={booking.id} hover>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{booking.serviceName}</h3>
            <p className="text-sm text-gray-600">Booking #{booking.id}</p>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${getStatusColor(booking.status)}`}>
            {booking.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            {format(booking.date, 'MMM dd, yyyy')}
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            {booking.startTime} - {booking.endTime}
          </div>
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
            ${booking.price}
          </div>
        </div>

        {booking.notes && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{booking.notes}</p>
          </div>
        )}

        {showActions && booking.status !== 'cancelled' && booking.status !== 'completed' && (
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateBooking(booking.id, { status: 'cancelled' })}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Cancel Booking
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600">View and manage your appointments</p>
      </div>

      {/* Upcoming Bookings */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
        <div className="space-y-4">
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} showActions={true} />
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No upcoming appointments</p>
                <p>Book a service to see your appointments here</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Appointments</h2>
          <div className="space-y-4">
            {pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}