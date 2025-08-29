import { api } from '@/src/api/client';
import type { 
  Venue, 
  VenueBooking, 
  CreateVenueRequest, 
  CreateVenueBookingRequest,
  PaginatedResponse,
  VenuesQuery 
} from '@/src/types/api';

// Venue Management APIs
export async function fetchVenues(query: VenuesQuery = {}): Promise<PaginatedResponse<Venue>> {
  const { data } = await api.get('/venues', {
    params: {
      name: query.name,
      city: query.city,
      sport: query.sport,
      page: query.page || 0,
      size: query.size || 10
    },
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

export async function fetchVenue(id: number): Promise<Venue> {
  const { data } = await api.get(`/venues/${id}`, {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

export async function createVenue(venue: CreateVenueRequest): Promise<Venue> {
  const { data } = await api.post('/venues', venue, {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

export async function updateVenue(id: number, venue: Partial<CreateVenueRequest>): Promise<Venue> {
  const { data } = await api.put(`/venues/${id}`, venue, {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

export async function deleteVenue(id: number): Promise<void> {
  await api.delete(`/venues/${id}`, {
    headers: { 'Cache-Control': 'no-store' }
  });
}

// Venue Booking APIs
export async function fetchVenueBookings(): Promise<VenueBooking[]> {
  const { data } = await api.get('/api/v1/venue-bookings', {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

export async function fetchVenueBooking(id: number): Promise<VenueBooking> {
  const { data } = await api.get(`/api/v1/venue-bookings/${id}`, {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

export async function createVenueBooking(booking: CreateVenueBookingRequest): Promise<VenueBooking> {
  const { data } = await api.post('/api/v1/venue-bookings', booking, {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

export async function cancelVenueBooking(id: number): Promise<void> {
  await api.put(`/api/v1/venue-bookings/${id}/cancel`, null, {
    headers: { 'Cache-Control': 'no-store' }
  });
}

// Search nearby venues
export async function searchNearbyVenues(
  latitude: number, 
  longitude: number, 
  radiusKm: number = 10,
  sport?: string
): Promise<Venue[]> {
  const { data } = await api.get('/venues/search', {
    params: {
      sport,
      radius: radiusKm
    },
    headers: { 'Cache-Control': 'no-store' }
  });
  
  return Array.isArray(data) ? data : data.content || [];
}