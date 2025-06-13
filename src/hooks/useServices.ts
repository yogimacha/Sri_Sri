import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import toast from 'react-hot-toast';

type Service = Database['public']['Tables']['services']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'];
};

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      toast.error('Error loading services');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: Database['public']['Tables']['services']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert(serviceData)
        .select()
        .single();

      if (error) throw error;
      
      await fetchServices();
      toast.success('Service created successfully!');
      return data;
    } catch (error: any) {
      toast.error('Error creating service');
      throw error;
    }
  };

  const updateService = async (id: string, updates: Database['public']['Tables']['services']['Update']) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      await fetchServices();
      toast.success('Service updated successfully!');
    } catch (error: any) {
      toast.error('Error updating service');
      throw error;
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      await fetchServices();
      toast.success('Service deleted successfully!');
    } catch (error: any) {
      toast.error('Error deleting service');
      throw error;
    }
  };

  return {
    services,
    loading,
    createService,
    updateService,
    deleteService,
    refetch: fetchServices,
  };
}