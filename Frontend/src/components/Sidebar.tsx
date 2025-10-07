import { X, AlertCircle, Activity, Dna } from 'lucide-react';
import virusData from '../data/virusData.json';

interface SidebarProps {
  selectedCountry: string | null;
  onClose: () => void;
}

interface CountryData {
  sequences: number;
  mutations: string[];
  risk: 'High' | 'Medium' | 'Low';
}

export default function Sidebar({ selectedCountry, onClose }: SidebarProps) {
  if (!selectedCountry) return null;

  const countryData = virusData[selectedCountry as keyof typeof virusData] as CountryData | undefined;

  if (!countryData) return null;

  const getRiskColorClass = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'bg-red-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'Low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskBgClass = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'bg-red-50 border-red-200';
      case 'Medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'Low':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedCountry}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-semibold ${getRiskColorClass(countryData.risk)}`}>
                {countryData.risk} Risk
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className={`border rounded-lg p-4 mb-6 ${getRiskBgClass(countryData.risk)}`}>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
          </div>
          <p className="text-gray-700 text-sm">
            This country has been classified as <strong>{countryData.risk} Risk</strong> based on the number of virus sequences detected and mutation patterns.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Sequence Data</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-blue-600">{countryData.sequences}</span>
              <span className="text-gray-600">sequences detected</span>
            </div>
            <div className="mt-3 h-2 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((countryData.sequences / 30) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Dna className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Detected Mutations</h3>
            </div>
            {countryData.mutations.length > 0 ? (
              <div className="space-y-2">
                {countryData.mutations.map((mutation, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-200"
                  >
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="font-mono text-sm font-semibold text-purple-900">{mutation}</span>
                  </div>
                ))}
                <p className="text-xs text-gray-600 mt-3">
                  {countryData.mutations.length} unique mutation{countryData.mutations.length !== 1 ? 's' : ''} identified in viral samples
                </p>
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No mutations detected in this region.</p>
            )}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Data Summary</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Total Sequences:</span>
                <span className="font-semibold text-gray-900">{countryData.sequences}</span>
              </div>
              <div className="flex justify-between">
                <span>Mutations Found:</span>
                <span className="font-semibold text-gray-900">{countryData.mutations.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Risk Level:</span>
                <span className={`font-semibold ${
                  countryData.risk === 'High' ? 'text-red-600' :
                  countryData.risk === 'Medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {countryData.risk}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-gray-600">
              <strong>Note:</strong> This data is for demonstration purposes. In a production environment, this would connect to real-time genomic surveillance databases and update dynamically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
