'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getPlacesFromDB, Place } from '@/data/places';
import { Compass } from 'lucide-react';
import PlatformHeader from '@/components/platform/PlatformHeader';

const SoufMap = dynamic(() => import('@/components/map/SoufMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[100dvh] w-full flex items-center justify-center bg-[#0f172a] text-white">
      <div className="text-center space-y-3 p-4">
        <Compass className="mx-auto text-amber-400 animate-spin-slow" size={40} />
        <p className="text-sm sm:text-base">جاري تحميل الخريطة التفاعلية...</p>
      </div>
    </div>
  ),
});

function MapContent() {
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
      <div className="min-h-[100dvh] bg-[#0f172a] flex items-center justify-center text-white">
        <div className="text-center px-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm sm:text-lg">جاري جلب المعالم الحقيقية من قاعدة البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[#0f172a] text-white flex flex-col overflow-hidden">
      <div className="app-map-shell"><PlatformHeader active="/map" /><div className="app-map-canvas"><SoufMap places={places} embedded initialDestinationQuery={destinationParam} initialPlaceId={placeIdParam} initialLat={Number.isFinite(latParam) ? latParam : null} initialLng={Number.isFinite(lngParam) ? lngParam : null} /></div></div>
      {error && <div role="alert" className="platform-error-state"><span>{error}</span><button type="button" onClick={() => window.location.reload()}>إعادة المحاولة</button></div>}
    </main>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-[#0f172a] flex items-center justify-center text-white">
          جاري التحميل...
        </div>
      }
    >
      <MapContent />
    </Suspense>
  );
}
