export type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  location?: string;
  details?: string;
};

function formatDate(d: Date): string {
  return d.toISOString().replace(/[-:]|\.\d{3}/g, '');
}

/**
 * Build a Google Calendar event URL for an event.
 * Dates are converted to UTC as required by the calendar URL format.
 */
export function formatCalendarLink(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(event.start)}/${formatDate(event.end)}`,
  });
  if (event.details) params.set('details', event.details);
  if (event.location) params.set('location', event.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Format a Google Maps link for a string address or lat/lng pair.
 */
export function formatMapLink(location: string | { lat: number; lng: number }): string {
  let query: string;
  if (typeof location === 'string') {
    query = location;
  } else {
    query = `${location.lat},${location.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

