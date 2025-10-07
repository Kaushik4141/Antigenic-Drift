import { Activity, ChevronDown } from 'lucide-react';

interface HeaderProps {
  diseases: string[];
  isDropdownOpen: boolean;
  onToggleDropdown: () => void;
  onDiseaseSelect: (disease: string) => void;
}

export default function Header({
  diseases,
  isDropdownOpen,
  onToggleDropdown,
  onDiseaseSelect
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-800">
              AI Antigenic Drift Predictor
            </h1>
          </div>

          <div className="relative">
            <button
              onClick={onToggleDropdown}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
            >
              <span className="font-medium">Select Disease</span>
              <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 z-10 overflow-hidden">
                {diseases.map((disease) => (
                  <button
                    key={disease}
                    onClick={() => onDiseaseSelect(disease)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-150 text-slate-700 border-b border-slate-100 last:border-b-0"
                  >
                    {disease.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
