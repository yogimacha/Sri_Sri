import React from 'react';
import { Clock, DollarSign } from 'lucide-react';
import { Service } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface ServiceCardProps {
  service: Service;
  onBook: (service: Service) => void;
}

export function ServiceCard({ service, onBook }: ServiceCardProps) {
  return (
    <Card hover className="overflow-hidden">
      {service.imageUrl && (
        <div className="h-48 overflow-hidden">
          <img
            src={service.imageUrl}
            alt={service.name}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded-full mb-2">
            {service.category}
          </span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
          <p className="text-gray-600 text-sm mb-4">{service.description}</p>
        </div>

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