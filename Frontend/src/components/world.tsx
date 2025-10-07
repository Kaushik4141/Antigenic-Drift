import WorldMap from './WorldMap';
import { Globe } from 'lucide-react';

function World() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700 py-6 px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Globe className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Interactive World Map</h1>
        </div>
        <p className="text-slate-300 text-sm mt-2 max-w-7xl mx-auto">
          Click on any country to view details, hover to preview, and use scroll to zoom
        </p>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full h-full max-w-7xl bg-white/5 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700 p-8">
          <WorldMap />
        </div>
      </main>

      <footer className="bg-slate-900/50 backdrop-blur-sm border-t border-slate-700 py-4 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-400 text-sm">
            Explore countries around the world with an interactive experience
          </p>
        </div>
      </footer>
    </div>
  );
}

export default World;
