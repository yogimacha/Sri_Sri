import React from 'react';
import { Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { useBooking } from '../../contexts/BookingContext';
import { format, isThisMonth, isToday } from 'date-fns';

export function StatsGrid() {
  const { bookings, clients } = useBooking();

  const todayBookings = bookings.filter(b => isToday(b.date)).length;
  const monthlyBookings = bookings.filter(b => isThisMonth(b.date)).length;
  const monthlyRevenue = bookings
    .filter(b => isThisMonth(b.date) && b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.price, 0);
  const totalClients = clients.length;

  const stats = [
    {
      name: "Today's Bookings",
      value: todayBookings,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      name: 'Monthly Revenue',
      value: `$${monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      name: 'Total Clients',
      value: totalClients,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      name: 'Monthly Bookings',
      value: monthlyBookings,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.name} hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}