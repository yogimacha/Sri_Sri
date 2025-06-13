import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Search } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { useBooking } from '../../contexts/BookingContext';
import { format } from 'date-fns';

export function ClientsView() {
  const { clients } = useBooking();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Clients</h1>
          <p className="text-gray-600">Manage your client relationships and history</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} hover>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                {client.avatar ? (
                  <img
                    src={client.avatar}
                    alt={client.name}
                    className="w-12 h-12 rounded-full object-cover mr-3"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mr-3">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{client.name}</h3>
                  <p className="text-sm text-gray-600">
                    {client.bookingHistory.length} booking(s)
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {client.email}
                </div>
                {client.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {client.phone}
                  </div>
                )}
                {client.lastVisit && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Last visit: {format(client.lastVisit, 'MMM dd, yyyy')}
                  </div>
                )}
              </div>

              {client.preferences && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Preferences</h4>
                  <p className="text-sm text-gray-600">{client.preferences}</p>
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Services</h4>
                <div className="space-y-1">
                  {client.bookingHistory.slice(0, 3).map((booking, index) => (
                    <div key={index} className="text-xs text-gray-600">
                      {booking.serviceName} - {format(booking.date, 'MMM dd')}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredClients.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No clients found</p>
                <p>Clients will appear here as they make bookings</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}