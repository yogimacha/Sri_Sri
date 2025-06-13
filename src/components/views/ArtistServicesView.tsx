import React, { useState } from 'react';
import { Plus, Edit, Trash2, Scissors } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useServices } from '../../hooks/useServices';
import { useAuth } from '../../hooks/useAuth';
import { ServiceModal } from '../services/ServiceModal';
import { Database } from '../../types/database';

type Service = Database['public']['Tables']['services']['Row'];

export function ArtistServicesView() {
  const { user } = useAuth();
  const { services, loading, deleteService } = useServices();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const artistServices = services.filter(service => service.artist_id === user?.id);

  const handleCreateService = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      await deleteService(serviceId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Services</h1>
          <p className="text-gray-600">Manage your service offerings</p>
        </div>
        <Button onClick={handleCreateService}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artistServices.map((service) => (
          <Card key={service.id} hover>
            {service.image_url && (
              <div className="h-48 overflow-hidden">
                <img
                  src={service.image_url}
                  alt={service.name}
                  className="w-full h-full object-cover"
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

              <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                <span>{service.duration} mins</span>
                <span className="font-semibold text-lg text-gray-900">${service.price}</span>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditService(service)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteService(service.id)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {artistServices.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <Scissors className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No services yet</p>
                <p className="mb-4">Create your first service to start accepting bookings</p>
                <Button onClick={handleCreateService}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Service
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Service Modal */}
      {isModalOpen && (
        <ServiceModal
          service={selectedService}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}