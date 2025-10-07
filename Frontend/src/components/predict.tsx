import { useEffect, useMemo, useState } from 'react';
import { Activity, Dna } from 'lucide-react';
import Header from './navigation/Header';
import { getLatestAnalysis, type AnalysisResultDoc } from '../lib/api';

interface MutationData {
  id: string;
  position: string;
  impact: 'Low' | 'Moderate' | 'High';
  probability: number;
  explanation: string;
  baseSequenceSnippet?: string;
  futureSequenceSnippet?: string;
}

interface PredictionData {
  disease: string;
  overallRisk: 'Low' | 'Moderate' | 'High';
  combinedProbability: number;
  confidence: number;
  summary: string;
  mutations: MutationData[];
  baseSequenceSnippet: string;
  futureSequenceSnippet: string;
}

function Predict() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Selected disease is not needed beyond the derived `prediction` state
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResultDoc | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load latest analysis from backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const doc = await getLatestAnalysis();
        if (mounted) {
          setAnalysis(doc);
          setError(null);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load predictions');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const diseases = useMemo(() => {
    const names = (analysis?.predictions || []).map(p => p.virus_name);
    return Array.from(new Set(names));
  }, [analysis]);

  function riskFromProb(prob: number): 'Low' | 'Moderate' | 'High' {
    if (prob >= 0.75) return 'High';
    if (prob >= 0.5) return 'Moderate';
    return 'Low';
  }

  function aggregateForVirus(virus: string) {
    const group = (analysis?.predictions || []).filter(p => p.virus_name === virus);
    if (group.length === 0) return null;
    const avgProb = group.reduce((s, p) => s + (p.predicted_escape_probability || 0), 0) / group.length;
    const combinedProbability = Math.round(avgProb * 100);
    const overallRisk = riskFromProb(avgProb);
    const confidence = Math.max(0, Math.min(100, Math.round((analysis?.model_accuracy ?? 0.5) * 100)));
    // choose representative (highest prob) for summary snippet
    const top = [...group].sort((a, b) => (b.predicted_escape_probability || 0) - (a.predicted_escape_probability || 0))[0];

    // build cards: top 5 sequence entries for this virus
    const top5 = [...group]
      .sort((a, b) => (b.predicted_escape_probability || 0) - (a.predicted_escape_probability || 0))
      .slice(0, 5)
      .map((p, idx) => {
        // find first differing position for labeling
        const base = p.base_sequence_snippet || '';
        const fut = p.future_sequence_snippet || '';
        const n = Math.min(base.length, fut.length);
        let firstPos: number | null = null;
        for (let i = 0; i < n; i++) { if (base[i] !== fut[i]) { firstPos = i + 1; break; } }
        const probability = Math.round((p.predicted_escape_probability || 0) * 100);
        const impact = (p.risk_level as 'Low'|'Moderate'|'High') || riskFromProb(p.predicted_escape_probability || 0);
        return {
          id: `${virus} #${idx + 1}`,
          position: firstPos ? `First diff at position ${firstPos}` : 'No differing positions in snippet',
          impact,
          probability,
          explanation: `Sequence pair with predicted escape probability ≈ ${probability}% and risk ${impact}.`,
          baseSequenceSnippet: base,
          futureSequenceSnippet: fut,
        } as MutationData;
      });

    const summary = `Aggregated ${group.length} sequences for ${virus.replace(/_/g, ' ')}. Combined escape probability ≈ ${combinedProbability}%.`;

    return {
      combinedProbability,
      overallRisk,
      confidence,
      summary,
      top,
      cards: top5,
    };
  }

  const handleDiseaseSelect = (disease: string) => {
    setIsDropdownOpen(false);
    const agg = aggregateForVirus(disease);
    if (!agg) {
      setPrediction(null);
      return;
    }
    const combinedProbability = agg.combinedProbability;
    const overallRisk = agg.overallRisk;
    const confidence = agg.confidence;
    const diffs = agg.cards; // repurpose cards list for UI grid
    const summary = agg.summary;

    setPrediction({
      disease,
      overallRisk,
      combinedProbability,
      confidence,
      summary,
      mutations: diffs,
      baseSequenceSnippet: agg.top?.base_sequence_snippet || '',
      futureSequenceSnippet: agg.top?.future_sequence_snippet || '',
    });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Moderate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'High':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header
        diseases={diseases}
        isDropdownOpen={isDropdownOpen}
        onToggleDropdown={() => setIsDropdownOpen(!isDropdownOpen)}
        onDiseaseSelect={handleDiseaseSelect}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {prediction && (
          <div className="animate-fadeIn space-y-6">
            {/* Overall Prediction Summary Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-xl border border-blue-800 overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Activity className="w-7 h-7 text-white" />
                  <h2 className="text-2xl font-bold text-white">
                    Overall Prediction Summary
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-blue-100 uppercase tracking-wide">
                      Disease
                    </label>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {prediction.disease.replace(/_/g, ' ')}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-blue-100 uppercase tracking-wide">
                      Overall Drift Risk
                    </label>
                    <div className="mt-1">
                      <span className={`inline-block px-4 py-2 rounded-lg border-2 font-bold text-lg ${
                        prediction.overallRisk === 'High' ? 'bg-red-100 text-red-700 border-red-300' :
                        prediction.overallRisk === 'Moderate' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                        'bg-green-100 text-green-700 border-green-300'
                      }`}>
                        {prediction.overallRisk}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-blue-100 uppercase tracking-wide">
                      Combined Probability
                    </label>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-4xl font-bold text-white">
                        {prediction.combinedProbability}%
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-blue-900 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-1000 ease-out"
                        style={{ width: `${prediction.combinedProbability}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-blue-100 uppercase tracking-wide">
                      Confidence
                    </label>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-4xl font-bold text-white">
                        {prediction.confidence}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-blue-500">
                  <label className="text-sm font-medium text-blue-100 uppercase tracking-wide">
                    Summary
                  </label>
                  <p className="mt-2 text-white text-lg leading-relaxed">
                    {prediction.summary}
                  </p>
                </div>

                {/* Sequence Snippets */}
                <div className="pt-4 border-t border-blue-500">
                  <label className="text-sm font-medium text-blue-100 uppercase tracking-wide">
                    Sequence Snippets
                  </label>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-800/40 rounded-lg p-3 border border-blue-600">
                      <div className="text-blue-100 text-xs font-semibold uppercase mb-1">Base</div>
                      <pre className="text-blue-50 text-sm font-mono whitespace-pre-wrap break-all">{prediction.baseSequenceSnippet || '—'}</pre>
                    </div>
                    <div className="bg-blue-800/40 rounded-lg p-3 border border-blue-600">
                      <div className="text-blue-100 text-xs font-semibold uppercase mb-1">Future</div>
                      <pre className="text-blue-50 text-sm font-mono whitespace-pre-wrap break-all">{prediction.futureSequenceSnippet || '—'}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top 5 Sequence Changes */}
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center space-x-2">
                <Dna className="w-6 h-6 text-blue-600" />
                <span>Top 5 Sequences</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {prediction.mutations.map((mutation, index) => (
                  <div
                    key={mutation.id}
                    className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className={`px-4 py-3 border-b ${
                      mutation.impact === 'High' ? 'bg-red-50 border-red-200' :
                      mutation.impact === 'Moderate' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-green-50 border-green-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase">
                          Mutation #{index + 1}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getRiskColor(mutation.impact)}`}>
                          {mutation.impact}
                        </span>
                      </div>
                      <h4 className="mt-1 text-lg font-bold text-slate-800">
                        {mutation.id}
                      </h4>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Position</label>
                        <p className="mt-1 text-sm font-medium text-slate-700">{mutation.position}</p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Drift Probability
                        </label>
                        <div className="mt-1 flex items-baseline space-x-2">
                          <span className="text-2xl font-bold text-blue-600">
                            {mutation.probability}%
                          </span>
                        </div>
                        <div className="mt-2 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000 ease-out"
                            style={{ width: `${mutation.probability}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">AI Explanation</label>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed">{mutation.explanation}</p>
                      </div>

                      {/* Sequence pair */}
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-slate-50 rounded border border-slate-200 p-2">
                          <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Base</div>
                          <pre className="text-[11px] font-mono break-all whitespace-pre-wrap">{mutation.baseSequenceSnippet || '—'}</pre>
                        </div>
                        <div className="bg-slate-50 rounded border border-slate-200 p-2">
                          <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Future</div>
                          <pre className="text-[11px] font-mono break-all whitespace-pre-wrap">{mutation.futureSequenceSnippet || '—'}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!prediction && (
          <div className="text-center py-16">
            <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            {loading ? (
              <>
                <h3 className="text-xl font-medium text-slate-600 mb-2">Loading predictions…</h3>
                <p className="text-slate-500">Fetching latest analysis from backend</p>
              </>
            ) : error ? (
              <>
                <h3 className="text-xl font-medium text-red-600 mb-2">Failed to load predictions</h3>
                <p className="text-slate-500">{error}</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-medium text-slate-600 mb-2">No Disease Selected</h3>
                <p className="text-slate-500">Select a disease from the dropdown above to view AI predictions</p>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Predict;
