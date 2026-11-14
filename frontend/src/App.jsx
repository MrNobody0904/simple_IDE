import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import IDE from './pages/IDE';

const Creator = lazy(() => import('./pages/Creator'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#080B0A] flex flex-col items-center justify-center font-mono text-[#C6F432] text-xs space-y-2 select-none">
            <img
              src="/oa-logo.jpg"
              alt="OA Logo"
              className="h-10 w-auto object-contain rounded shadow-lg"
            />
            <span>INITIALIZING CREATOR ENVIRONMENT...</span>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<IDE />} />
          <Route path="/creator" element={<Creator />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
