import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import World from './components/world';
import Predict from './components/predict';
import Research from './components/research';
import Mainlanding from './components/landingpage/mainlanding';
import Navigation from './components/landingpage/Navigation';

function NotFoundPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">404 - Page Not Found</h2>
        <p className="text-slate-600 mb-4">The page you are looking for does not exist.</p>
        <Link to="/" className="text-blue-600 hover:underline">Go back home</Link>
      </div>
    </div>
  );
}

function TopSpacer() {
  const location = useLocation();
  // No spacer on landing page to preserve hero design; add spacer elsewhere
  if (location.pathname === '/') return null;
  return <div className="h-[90px] md:h-[110px]" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <TopSpacer />
      <Routes>
        <Route path="/" element={<Mainlanding/>} />
        <Route path="/world" element={<World />} />
        {/* Back-compat alias */}
        <Route path="/map" element={<Navigate to="/world" replace />} />
        {/* Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/research" element={<Research />} />
      </Routes>
    </BrowserRouter>
  );
}


