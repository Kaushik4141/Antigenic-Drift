import * as d3 from 'd3';
import { useEffect, useMemo, useRef } from 'react';
import type { TimePoint } from '../lib/api';
import { gsap } from 'gsap';

interface Props {
  series: TimePoint[];
  width?: number;
  height?: number;
}

export default function TimeSeriesChart({ series, width = 600, height = 240 }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const data = useMemo(() => {
    return (series || [])
      .filter(d => d && d.date)
      .map(d => ({
        date: d3.timeParse('%Y-%m-%d')(d.date) as Date,
        total: Number(d.total) || 0,
        inc: Number(d.new) || 0,
      }))
      .filter(d => d.date instanceof Date && !isNaN(d.date.getTime()))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [series]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 24, bottom: 30, left: 56 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    if (data.length === 0) {
      g.append('text')
        .attr('x', innerW / 2)
        .attr('y', innerH / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#666')
        .text('No time series data');
      return;
    }

    const x = d3.scaleUtc()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, innerW]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.total)!]).nice()
      .range([innerH, 0]);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x).ticks(6));

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('~s') as any));

    // Axis label and legend
    g.append('text')
      .attr('x', 0)
      .attr('y', -8)
      .attr('fill', '#6b7280')
      .attr('font-size', 11)
      .text('Cumulative total (line) and daily new (bars)');

    const legend = g.append('g').attr('transform', `translate(${innerW - 180}, -8)`);
    legend.append('rect').attr('x', 0).attr('y', -10).attr('width', 10).attr('height', 10).attr('fill', '#f59e0b').attr('opacity', 0.45);
    legend.append('text').attr('x', 16).attr('y', 0).attr('fill', '#374151').attr('font-size', 11).text('Daily new');
    legend.append('line').attr('x1', 90).attr('y1', -5).attr('x2', 130).attr('y2', -5).attr('stroke', '#2563eb').attr('stroke-width', 2);
    legend.append('text').attr('x', 136).attr('y', 0).attr('fill', '#374151').attr('font-size', 11).text('Total');

    // Line for total
    const line = d3.line<{ date: Date; total: number }>()
      .x(d => x(d.date))
      .y(d => y(d.total))
      .curve(d3.curveMonotoneX);

    const path = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#2563eb') // blue-600
      .attr('stroke-width', 2)
      .attr('d', line as any)
      .attr('stroke-dasharray', function() {
        const len = (this as SVGPathElement).getTotalLength();
        return `${len} ${len}`;
      })
      .attr('stroke-dashoffset', function() {
        const len = (this as SVGPathElement).getTotalLength();
        return `${len}`;
      });

    // Optional bars for new cases (small, behind the line)
    const barW = Math.max(1, innerW / data.length * 0.6);
    const yInc = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.inc)!]).nice()
      .range([innerH, innerH * 0.4]);

    const bars = g.append('g')
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => x(d.date) - barW / 2)
      .attr('y', innerH)
      .attr('width', barW)
      .attr('height', 0)
      .attr('fill', '#f59e0b') // amber-500
      .attr('opacity', 0.45);

    // Tooltip overlay
    const tooltip = g.append('g').style('display', 'none');
    const focusLine = tooltip.append('line').attr('stroke', '#9ca3af').attr('y1', 0).attr('y2', innerH);
    const focusDot = tooltip.append('circle').attr('r', 3.5).attr('fill', '#2563eb');
    const tooltipBox = g.append('foreignObject').style('display', 'none').attr('width', 180).attr('height', 60);
    const tooltipDiv = tooltipBox.append('xhtml:div')
      .style('background', 'rgba(255,255,255,0.95)')
      .style('border', '1px solid #e5e7eb')
      .style('border-radius', '6px')
      .style('padding', '6px 8px')
      .style('font', '12px system-ui, sans-serif')
      .style('color', '#111827');

    const bisect = d3.bisector<{date: Date}, Date>(d => d.date).left;
    g.append('rect')
      .attr('fill', 'transparent')
      .attr('pointer-events', 'all')
      .attr('x', 0).attr('y', 0)
      .attr('width', innerW).attr('height', innerH)
      .on('mouseenter', () => { tooltip.style('display', null as any); tooltipBox.style('display', null as any); })
      .on('mouseleave', () => { tooltip.style('display', 'none'); tooltipBox.style('display', 'none'); })
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event);
        const xDate = x.invert(mx);
        let idx = bisect(data, xDate);
        idx = Math.max(0, Math.min(data.length - 1, idx));
        const d0 = data[Math.max(0, idx - 1)];
        const d1 = data[idx];
        const d = !d0 ? d1 : (!d1 ? d0 : (xDate.getTime() - d0.date.getTime() < d1.date.getTime() - xDate.getTime() ? d0 : d1));

        const tx = x(d.date);
        const ty = y(d.total);
        tooltip.attr('transform', `translate(${tx},0)`);
        focusDot.attr('cy', ty);
        focusLine.attr('x1', 0).attr('x2', 0);
        tooltipBox.attr('x', Math.min(Math.max(0, tx + 8), innerW - 180)).attr('y', Math.max(0, ty - 40));
        tooltipDiv.html(`
          <div><strong>${d3.timeFormat('%b %d, %Y')(d.date)}</strong></div>
          <div>Total: ${d.total.toLocaleString()}</div>
          <div>New: ${d.inc.toLocaleString()}</div>
        `);
      });

    // GSAP animations
    bars.each(function(d) {
      const h = innerH - yInc(d.inc);
      gsap.fromTo(this as SVGRectElement,
        { y: innerH, height: 0, opacity: 0 },
        { y: yInc(d.inc), height: h, opacity: 0.45, duration: 0.6, ease: 'power2.out' }
      );
    });
    gsap.to(path.node(), { strokeDashoffset: 0, duration: 1.0, ease: 'power2.out' });

  }, [data, width, height]);

  return (
    <svg ref={svgRef} />
  );
}
