import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { getBatch, type BackendCountry, getTimeSeries, type TimeSeriesResponse } from '../lib/api';
import TimeSeriesChart from './TimeSeriesChart';

interface CountryProperties {
  name: string;
  [key: string]: any;
}

type DataMap = Record<string, BackendCountry>;

export default function WorldMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
  const [dataMap, setDataMap] = useState<DataMap>({});
  const [seriesResp, setSeriesResp] = useState<TimeSeriesResponse | null>(null);
  const [metric, setMetric] = useState<'cases' | 'deaths'>('cases');
  // maxValue is computed on backend for coloring; not needed in UI state

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 1200;
    const height = 700;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    const projection = d3.geoMercator()
      .scale(190)
      .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });

    svg.call(zoom);

    // Background click to clear selection
    svg.on('click', () => {
      setSelectedCountryName(null);
    });

    d3.json<Topology>('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((world) => {
        if (!world) return;

        const countries = feature(
          world,
          world.objects.countries as GeometryCollection<CountryProperties>
        );

        const paths = g.selectAll('path')
          .data(countries.features)
          .enter()
          .append('path')
          .attr('d', path as any)
          .attr('class', 'country')
          .attr('fill', '#B0B0B0')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 0.5)
          .style('cursor', 'pointer')
          .on('mouseenter', function (_event, d) {
            const countryName = d.properties?.name || 'Unknown';
            setHoveredCountry(countryName);
            // emphasize border on hover
            d3.select(this).raise().attr('stroke-width', 1.2);
          })
          .on('mouseleave', function (_event, _d) {
            setHoveredCountry(null);
            d3.select(this).attr('stroke-width', 0.5);
          })
          .on('click', async function (event, d) {
            // prevent background svg click
            event.stopPropagation();
            const countryName = d.properties?.name || 'Unknown';
            setSelectedCountryName(countryName);
            // fetch timeseries for selected country
            try {
              const ts = await getTimeSeries(countryName);
              setSeriesResp(ts);
              setMetric('cases');
            } catch (e) {
              console.error('Timeseries fetch failed:', e);
              setSeriesResp({ country: countryName, series: { cases: [], deaths: [] }, stats: null });
            }
          });

        // Fetch batch COVID data for coloring
        const countryNames = countries.features.map((f: any) => f.properties?.name).filter(Boolean);
        getBatch(countryNames as string[])
          .then(({ maxValue: _max, results }) => {
            const map: DataMap = {};
            for (const r of results) {
              map[r.country] = r;
            }
            setDataMap(map);
            // Apply fills based on returned colors
            paths.attr('fill', (d: any) => {
              const name = d.properties?.name || '';
              const entry = map[name];
              return entry?.colorHex || '#B0B0B0';
            });
          })
          .catch((err) => {
            console.error('Batch COVID fetch failed:', err);
          });
      });
  }, []);

  // Keep paths colored if dataMap updates later (optional)
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg
      .selectAll('path.country')
      .attr('fill', (d: any) => {
        const name = (d as any)?.properties?.name || '';
        const entry = dataMap[name];
        return entry?.colorHex || '#B0B0B0';
      });
  }, [dataMap]);

  // Derived overlay info
  const activeName = selectedCountryName ?? hoveredCountry;
  const activeEntry = activeName ? dataMap[activeName] : undefined;
  const cases = activeEntry?.casesTotal ?? null;
  const deaths = activeEntry?.deathsTotal ?? null;
  const chartSeries = selectedCountryName && seriesResp && seriesResp.country === selectedCountryName
    ? (metric === 'cases' ? (seriesResp.series.cases || []) : (seriesResp.series.deaths || []))
    : [];
  const stats = selectedCountryName && seriesResp && seriesResp.country === selectedCountryName ? seriesResp.stats : null;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 1200 700"
        className="max-w-full"
      />

      {activeName ? (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white px-6 py-4 rounded-lg shadow-lg border border-gray-200 min-w-[320px]">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{activeName}</h3>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Total Cases</p>
                  <p className="font-semibold text-gray-900">{cases != null ? cases.toLocaleString() : '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Deaths</p>
                  <p className="font-semibold text-gray-900">{deaths != null ? deaths.toLocaleString() : '—'}</p>
                </div>
              </div>
            </div>
            {selectedCountryName && (
              <button
                onClick={() => { setSelectedCountryName(null); setSeriesResp(null); }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            )}
          </div>
          {selectedCountryName && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <button
                  className={`px-3 py-1 rounded text-sm border ${metric === 'cases' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700'}`}
                  onClick={() => setMetric('cases')}
                >
                  Total Cases
                </button>
                <button
                  className={`px-3 py-1 rounded text-sm border ${metric === 'deaths' ? 'bg-rose-600 text-white border-rose-600' : 'border-gray-300 text-gray-700'}`}
                  onClick={() => setMetric('deaths')}
                >
                  Total Deaths
                </button>
                {stats && (
                  <div className="ml-auto text-xs text-gray-600">
                    <span className="mr-4">Range: {stats.startDate || '—'} → {stats.endDate || '—'}</span>
                    <span className="mr-4">Peak Daily Cases: {stats.peakDailyCases?.toLocaleString?.() || '—'} ({stats.peakCasesDate || '—'})</span>
                    <span>Peak Daily Deaths: {stats.peakDailyDeaths?.toLocaleString?.() || '—'} ({stats.peakDeathsDate || '—'})</span>
                  </div>
                )}
              </div>
              <TimeSeriesChart series={chartSeries} width={640} height={260} />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
