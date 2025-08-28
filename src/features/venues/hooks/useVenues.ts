import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchVenues, fetchVenue, createVenue, updateVenue, deleteVenue } from '../api';
import type { VenuesQuery, CreateVenueRequest } from '@/src/types/api';

export function useVenues(query: VenuesQuery = {}) {
  return useQuery({
    queryKey: ['venues', query],
    queryFn: () => fetchVenues(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useVenue(id: number) {
  return useQuery({
    queryKey: ['venue', id],
    queryFn: () => fetchVenue(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateVenue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (venue: CreateVenueRequest) => createVenue(venue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
}

export function useUpdateVenue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, venue }: { id: number; venue: Partial<CreateVenueRequest> }) => 
      updateVenue(id, venue),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.setQueryData(['venue', variables.id], data);
    },
  });
}

export function useDeleteVenue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => deleteVenue(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.removeQueries({ queryKey: ['venue', id] });
    },
  });
}