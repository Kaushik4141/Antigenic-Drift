import { useState, Suspense } from 'react';
import './App.css'
import { Canvas } from '@react-three/fiber';
import Globe from './components/Globe';
import Sidebar from './components/Sidebar';
import { Globe as Globe2, Info } from 'lucide-react';

function App() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const handleCountryClick = (countryName: string) => {
    setSelectedCountry(countryName);
  };

  const handleCloseSidebar = () => {
    setSelectedCountry(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <header className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe2 className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Global Virus Tracker</h1>
              <p className="text-sm text-blue-200">Interactive 3D Genomic Surveillance</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-950/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-blue-400/30">
            <Info className="w-4 h-4 text-blue-300" />
            <span className="text-sm text-blue-100">Click countries to view virus data</span>
          </div>
        </div>
      </header>

      <div className="absolute bottom-6 left-6 z-10 bg-slate-900/80 backdrop-blur-sm p-4 rounded-lg border border-slate-700 max-w-xs">
        <h3 className="text-sm font-semibold text-white mb-2">Risk Levels</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-xs text-gray-300">High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span className="text-xs text-gray-300">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-xs text-gray-300">Low Risk</span>
          </div>
        </div>
      </div>

      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <Suspense fallback={null}>
          <Globe onCountryClick={handleCountryClick} />
        </Suspense>
      </Canvas>

      <Sidebar selectedCountry={selectedCountry} onClose={handleCloseSidebar} />
    </div>
  );
}

export default App
