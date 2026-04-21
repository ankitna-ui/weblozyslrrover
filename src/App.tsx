import { Routes, Route, useLocation } from 'react-router-dom';
import React, { useEffect, useState, Suspense } from 'react';
import { useLicence } from '@/hooks/useLicence';
import TopBar from '@/components/TopBar';
import LicenceGate from '@/components/LicenceGate';
import { Toaster } from 'sonner';
import AlertManager from '@/components/AlertManager';

import FullScreenLoader from '@/components/loaders/FullScreenLoader';
import TopProgressBar from '@/components/loaders/TopProgressBar';
import SkeletonDashboard from '@/components/loaders/SkeletonDashboard';

const StateOverview = React.lazy(() => import('@/pages/StateOverview'));
const DistrictDetail = React.lazy(() => import('@/pages/DistrictDetail'));
const RoverDetail = React.lazy(() => import('@/pages/RoverDetail'));
const PerformanceDashboard = React.lazy(() => import('@/pages/PerformanceDashboard'));

export default function App() {
  const { isValidated, error, isLocked, validate, attempts } = useLicence();
  const location = useLocation();
  const [showGate, setShowGate] = useState(!isValidated);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Initial Full-Screen Loader Data Fetch Mock
    Promise.all([
      new Promise(resolve => setTimeout(resolve, 1200)), // Artificial delay
      // fetchDistricts(), fetchRovers(), etc. (mocked locally)
    ]).then(() => {
      setIsAppReady(true);
    });
  }, []);

  useEffect(() => {
    if (isValidated) {
      setShowGate(false);
    }
  }, [isValidated]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleValidate = (key: string) => {
    const success = validate(key);
    if (success) {
      setShowGate(false);
    }
    return success;
  };

  return (
    <div style={{ backgroundColor: 'var(--void)', minHeight: '100vh' }}>
      {!isAppReady && <FullScreenLoader />}

      {isAppReady && showGate && (
        <LicenceGate
          onValidate={handleValidate}
          error={error}
          isLocked={isLocked}
          attempts={attempts}
        />
      )}

      {isAppReady && isValidated && (
        <>
          <TopBar />
          <TopProgressBar />
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
            <Suspense fallback={<SkeletonDashboard />}>
              <Routes>
                <Route path="/" element={<StateOverview />} />
                <Route path="/district/:districtId" element={<DistrictDetail />} />
                <Route path="/rover/:roverId" element={<RoverDetail />} />
                <Route path="/performance" element={<PerformanceDashboard />} />
              </Routes>
            </Suspense>
          </div>
          <Toaster position="bottom-right" richColors />
          <AlertManager />
        </>
      )}
    </div>
  );
}
