'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getPlacesFromDB, Place } from '@/data/places';
import { Compass } from 'lucide-react';
import PlatformHeader from '@/components/platform/PlatformHeader';
import { useLanguage } from '@/lib/i18n';

const SoufMap = dynamic(() => import('@/components/map/SoufMap'), {
  ssr: false,
    loading: () => (
    <div className="app-map-loading">
      <div className="text-center space-y-3 p-4">
        <Compass className="mx-auto text-amber-400 animate-spin-slow" size={40} />
        <p className="text-sm sm:text-base">جاري تحميل الخريطة التفاعلية...</p>
      </div>
    </div>
  ),
});

function MapContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const destinationParam = searchParams.get('destination');
  const placeIdParam = searchParams.get('placeId');
  const latParam = Number(searchParams.get('lat'));
  const lngParam = Number(searchParams.get('lng'));

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getPlacesFromDB();
        setPlaces(data);
      } catch (error) {
        console.error('تعذر تحميل معالم الخريطة:', error);
        setPlaces([]);
        setError(error instanceof Error ? error.message : 'تعذر تحميل بيانات الخريطة');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <main className="app-map-page text-white"><div className="app-map-loading">
        <div className="text-center px-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm sm:text-lg">{t('mapLoading')}</p>
        </div>
      </div></main>
    );
  }

  return (
    <main className="app-map-page text-white flex flex-col overflow-hidden">
      <div className="app-map-shell"><PlatformHeader active="/map" /><div className="app-map-canvas"><SoufMap places={places} embedded initialDestinationQuery={destinationParam} initialPlaceId={placeIdParam} initialLat={Number.isFinite(latParam) ? latParam : null} initialLng={Number.isFinite(lngParam) ? lngParam : null} /></div></div>
      {error && <div role="alert" className="platform-error-state"><span>{t('mapLoadError')}</span><button type="button" onClick={() => window.location.reload()}>{t('retry')}</button></div>}
    </main>
  );
}

export default function MapPage() {
  const { t } = useLanguage();
  return (
    <Suspense
      fallback={
        <main className="app-map-page text-white"><div className="app-map-loading">{t('mapLoadingShort')}</div></main>
      }
    >
      <MapContent />
    </Suspense>
  );
}
