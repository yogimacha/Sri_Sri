import React from 'react';
import { StatsGrid } from '../dashboard/StatsGrid';
import { RecentBookings } from '../dashboard/RecentBookings';

export function ArtistDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's an overview of your business.</p>
      </div>

      <StatsGrid />
      <RecentBookings />
    </div>
  );
}