import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import World from './components/world';
import Predict from './components/predict';
import Research from './components/research';

function HomePage() {
  const routes = [
    { path: '/', label: 'Home' },
    { path: '/world', label: 'World Map' },
    { path: '/predict', label: 'Predict' },
  ];
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Antigenic Drift Dashboard</h1>
        <p className="text-slate-600 mb-6">
          Choose a page below to explore.
        </p>
        <ul className="space-y-3">
          {routes.map(r => (
            <li key={r.path}>
              <Link
                to={r.path}
                className="inline-block px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 transition"
              >
                {r.label} <span className="text-slate-400">({r.path || '/'})</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
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


