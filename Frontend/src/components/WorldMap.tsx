import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';

interface CountryProperties {
  name: string;
  [key: string]: any;
}

interface CountryInfo {
  name: string;
  code: string;
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
          .on('click', function (event, d) {
            const countryName = d.properties?.name || 'Unknown';
            const countryCode = d.id?.toString() || '';

            setSelectedCountry({ name: countryName, code: countryCode });

            g.selectAll('path')
              .transition()
              .duration(200)
              .attr('fill', '#e0e0e0');

            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', '#2c5aa0');
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
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white px-8 py-6 rounded-xl shadow-2xl border border-gray-200 min-w-[300px]">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-2xl font-bold text-gray-900">{selectedCountry.name}</h3>
            <button
              onClick={() => setSelectedCountry(null)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600">Country Code: {selectedCountry.code}</p>
        </div>
      )}
    </div>
  );
}
