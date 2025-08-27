import { formatCalendarLink, formatMapLink } from '@/src/utils/links';

describe('formatCalendarLink', () => {
  it('generates correct URL for US timezone', () => {
    const url = formatCalendarLink({
      title: 'Pickup Game',
      start: new Date('2023-03-25T10:00:00-05:00'),
      end: new Date('2023-03-25T12:00:00-05:00'),
      location: '123 Main St, New York',
    });
    expect(url).toBe(
      'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pickup+Game&dates=20230325T150000Z%2F20230325T170000Z&location=123+Main+St%2C+New+York',
    );
  });

  it('generates correct URL for European timezone', () => {
    const url = formatCalendarLink({
      title: 'Match',
      start: new Date('2023-06-01T10:00:00+02:00'),
      end: new Date('2023-06-01T12:30:00+02:00'),
      location: 'Berlin',
    });
    expect(url).toBe(
      'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Match&dates=20230601T080000Z%2F20230601T103000Z&location=Berlin',
    );
  });
});

describe('formatMapLink', () => {
  it('encodes address string', () => {
    const url = formatMapLink('123 Main St, Springfield');
    expect(url).toBe(
      'https://www.google.com/maps/search/?api=1&query=123%20Main%20St%2C%20Springfield',
    );
  });

  it('encodes coordinates', () => {
    const url = formatMapLink({ lat: 40.7128, lng: -74.006 });
    expect(url).toBe(
      'https://www.google.com/maps/search/?api=1&query=40.7128%2C-74.006',
    );
  });
});

