import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchVenueBookings, 
  fetchVenueBooking, 
  createVenueBooking, 
  cancelVenueBooking 
} from '../api';
import type { CreateVenueBookingRequest } from '@/src/types/api';

export function useVenueBookings() {
  return useQuery({
    queryKey: ['venue-bookings'],
    queryFn: fetchVenueBookings,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useVenueBooking(id: number) {
  return useQuery({
    queryKey: ['venue-booking', id],
    queryFn: () => fetchVenueBooking(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateVenueBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (booking: CreateVenueBookingRequest) => createVenueBooking(booking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-bookings'] });
    },
  });
}

export function useCancelVenueBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => cancelVenueBooking(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['venue-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['venue-booking', id] });
    },
  });
}