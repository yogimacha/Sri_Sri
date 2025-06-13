import React from 'react';
import { Clock, DollarSign, User } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Database } from '../../types/database';

type Service = Database['public']['Tables']['services']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'];
};

interface ServiceCardProps {
  service: Service;
  onBook: (service: Service) => void;
  showArtist?: boolean;
}

export function ServiceCard({ service, onBook, showArtist = true }: ServiceCardProps) {
  return (
    <Card hover className="overflow-hidden">
      {service.image_url && (
        <div className="h-48 overflow-hidden">
          <img
            src={service.image_url}
            alt={service.name}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 text-xs font-medium text-pink-700 bg-pink-100 rounded-full mb-2">
            {service.category}
          </span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
          <p className="text-gray-600 text-sm mb-4">{service.description}</p>
        </div>

        {showArtist && service.profiles && (
          <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
            {service.profiles.avatar_url ? (
              <img
                src={service.profiles.avatar_url}
                alt={service.profiles.full_name}
                className="w-8 h-8 rounded-full object-cover mr-3"
              />
            ) : (
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center mr-3">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">{service.profiles.full_name}</p>
              <p className="text-xs text-gray-600">Makeup Artist</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {service.duration} mins
          </div>
          <div className="flex items-center font-semibold text-lg text-gray-900">
            <DollarSign className="w-4 h-4 mr-1" />
            {service.price}
          </div>
        </div>

        <Button 
          onClick={() => onBook(service)}
          className="w-full"
        >
          Book Now
        </Button>
      </CardContent>
    </Card>
  );
}