import React from 'react';
import { Calendar, Clock, DollarSign, Phone, Mail } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useBookings } from '../../hooks/useBookings';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';

export function RecentBookings() {
  const { user } = useAuth();
  const { bookings, updateBookingStatus } = useBookings(user?.id);
  
  const recentBookings = bookings
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

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

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentBookings.map((booking) => (
          <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">
                  {booking.client_profile?.full_name || 'Unknown Client'}
                </h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{booking.services?.name}</p>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {format(new Date(booking.appointment_date), 'MMM dd, yyyy')}
                </span>
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {booking.start_time}
                </span>
                <span className="flex items-center">
                  <DollarSign className="w-3 h-3 mr-1" />
                  ${booking.total_amount}
                </span>
              </div>

              <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                {booking.client_profile?.email && (
                  <a href={`mailto:${booking.client_profile.email}`} className="flex items-center hover:text-pink-600">
                    <Mail className="w-3 h-3 mr-1" />
                    {booking.client_profile.email}
                  </a>
                )}
                {booking.client_profile?.phone && (
                  <a href={`tel:${booking.client_profile.phone}`} className="flex items-center hover:text-pink-600">
                    <Phone className="w-3 h-3 mr-1" />
                    {booking.client_profile.phone}
                  </a>
                )}
              </div>
            </div>

            {booking.status === 'pending' && (
              <div className="flex space-x-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        ))}

        {recentBookings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No bookings yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}