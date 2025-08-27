import React from 'react';
import Banner from './Banner';
import { useOnline } from './OfflineBanner';

export default function CachedDataBanner() {
  const online = useOnline();
  if (online) return null;
  return <Banner text="Showing cached data" backgroundColor="#4b5563" top={90} />;
}
