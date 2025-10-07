import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { CovidData } from '../lib/supabase';

interface CountryProperties {
  name: string;
  [key: string]: any;
}

interface CountryInfo {
  name: string;
  code: string;
  covidData?: CovidData | null;
  loading?: boolean;
  error?: string;
}

export default function WorldMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

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

    d3.json<Topology>('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((world) => {
        if (!world) return;

        const countries = feature(
          world,
          world.objects.countries as GeometryCollection<CountryProperties>
        );

        g.selectAll('path')
          .data(countries.features)
          .enter()
          .append('path')
          .attr('d', path as any)
          .attr('class', 'country')
          .attr('fill', '#e0e0e0')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 0.5)
          .style('cursor', 'pointer')
          .on('mouseenter', function (event, d) {
            const countryName = d.properties?.name || 'Unknown';
            setHoveredCountry(countryName);

            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', '#4a90e2');
          })
          .on('mouseleave', function (event, d) {
            setHoveredCountry(null);

            const countryName = d.properties?.name || '';
            const isSelected = selectedCountry?.name === countryName;

            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', isSelected ? '#2c5aa0' : '#e0e0e0');
          })
          .on('click', async function (event, d) {
            const countryName = d.properties?.name || 'Unknown';
            const countryCode = d.id?.toString() || '';

            setSelectedCountry({
              name: countryName,
              code: countryCode,
              loading: true
            });

            g.selectAll('path')
              .transition()
              .duration(200)
              .attr('fill', '#e0e0e0');

            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', '#2c5aa0');

            try {
              const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
              const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

              const apiUrl = `${supabaseUrl}/functions/v1/fetch-covid-data?country=${encodeURIComponent(countryName)}`;

              const response = await fetch(apiUrl, {
                headers: {
                  'Authorization': `Bearer ${supabaseAnonKey}`,
                  'Content-Type': 'application/json',
                },
              });

              if (!response.ok) {
                throw new Error(`Failed to fetch COVID data: ${response.status}`);
              }

              const covidData = await response.json();

              setSelectedCountry({
                name: countryName,
                code: countryCode,
                covidData,
                loading: false
              });
            } catch (error) {
              console.error('Error fetching COVID data:', error);
              setSelectedCountry({
                name: countryName,
                code: countryCode,
                loading: false,
                error: 'Failed to load COVID-19 data'
              });
            }
          });
      });
  }, [selectedCountry]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 1200 700"
        className="max-w-full"
      />

      {hoveredCountry && !selectedCountry && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-gray-800 font-medium">{hoveredCountry}</p>
        </div>
      )}

      {selectedCountry && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white px-8 py-6 rounded-xl shadow-2xl border border-gray-200 min-w-[400px] max-w-[500px]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-bold text-gray-900">{selectedCountry.name}</h3>
            <button
              onClick={() => setSelectedCountry(null)}
              className="text-gray-500 hover:text-gray-700 transition-colors text-xl"
            >
              ✕
            </button>
          </div>

          {selectedCountry.loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="ml-3 text-gray-600">Loading COVID-19 data...</p>
            </div>
          )}

          {selectedCountry.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{selectedCountry.error}</p>
            </div>
          )}

          {selectedCountry.covidData && !selectedCountry.loading && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-blue-600 font-medium mb-1">Total Cases</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {selectedCountry.covidData.total_cases.toLocaleString()}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-xs text-red-600 font-medium mb-1">Total Deaths</p>
                  <p className="text-2xl font-bold text-red-900">
                    {selectedCountry.covidData.total_deaths.toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedCountry.covidData.total_cases > 0 && (
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
                  <p className="text-xs font-medium mb-1">Mortality Rate</p>
                  <p className="text-3xl font-bold">
                    {((selectedCountry.covidData.total_deaths / selectedCountry.covidData.total_cases) * 100).toFixed(2)}%
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Cases per Million</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {Math.round(selectedCountry.covidData.cases_per_million).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Deaths per Million</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {Math.round(selectedCountry.covidData.deaths_per_million).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedCountry.covidData.new_cases > 0 && (
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500 mb-2">Recent Changes</p>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-orange-50 rounded p-2">
                      <p className="text-xs text-orange-600">New Cases</p>
                      <p className="text-sm font-semibold text-orange-900">
                        +{selectedCountry.covidData.new_cases.toLocaleString()}
                      </p>
                    </div>
                    {selectedCountry.covidData.new_deaths > 0 && (
                      <div className="flex-1 bg-red-50 rounded p-2">
                        <p className="text-xs text-red-600">New Deaths</p>
                        <p className="text-sm font-semibold text-red-900">
                          +{selectedCountry.covidData.new_deaths.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-400 text-center pt-2">
                Updated: {new Date(selectedCountry.covidData.updated_at).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
