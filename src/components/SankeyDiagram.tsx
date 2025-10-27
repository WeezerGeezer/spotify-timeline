import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  sankey,
  sankeyLinkHorizontal,
  SankeyGraph,
} from 'd3-sankey';
import { SankeyData, SankeyNode, Track } from '../types';

interface SankeyDiagramProps {
  data: SankeyData;
  width?: number;
  height?: number;
  onNodeHover?: (track: Track | null, position?: { x: number; y: number }) => void;
  onNodeClick?: (track: Track) => void;
  highlightedTrackId?: string | null;
  playlistNames?: string[];
  playlistPlatforms?: ('spotify' | 'apple' | undefined)[];
}

export const SankeyDiagram: React.FC<SankeyDiagramProps> = ({
  data,
  width = 1200,
  height = 700,
  onNodeHover,
  onNodeClick,
  highlightedTrackId,
  playlistNames = [],
  playlistPlatforms = [],
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });

  // Handle responsive sizing
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: containerWidth } = entry.contentRect;
        setDimensions({
          width: containerWidth,
          height: Math.max(600, Math.min(800, containerWidth * 0.6)),
        });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`);

    const margin = { top: 40, right: 100, bottom: 20, left: 100 };
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create sankey generator
    const sankeyGenerator = sankey<SankeyNode, any>()
      .nodeId((d: any) => d.id)
      .nodeWidth(20)
      .nodePadding(8)
      .extent([
        [0, 0],
        [innerWidth, innerHeight],
      ]);

    // Generate layout
    const graph: SankeyGraph<SankeyNode, any> = sankeyGenerator({
      nodes: data.nodes.map((d) => ({ ...d })),
      links: data.links.map((d) => ({ ...d })),
    });

    // Draw links with gradient
    const linkGroup = g.append('g').attr('class', 'links').attr('fill', 'none');

    linkGroup
      .selectAll('path')
      .data(graph.links)
      .enter()
      .append('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', (d: any) => d.color || '#999')
      .attr('stroke-width', (d: any) => Math.max(1, d.width || 0))
      .attr('opacity', (d: any) => {
        if (!highlightedTrackId) return 0.3;
        const sourceNode = d.source as SankeyNode;
        return sourceNode.trackData.id === highlightedTrackId ? 0.7 : 0.1;
      })
      .attr('class', 'sankey-link')
      .on('mouseover', function () {
        d3.select(this).attr('opacity', 0.6);
      })
      .on('mouseout', function (_event, d: any) {
        if (!highlightedTrackId) {
          d3.select(this).attr('opacity', 0.3);
        } else {
          const sourceNode = d.source as SankeyNode;
          d3.select(this).attr('opacity', sourceNode.trackData.id === highlightedTrackId ? 0.7 : 0.1);
        }
      });

    // Draw nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');

    nodeGroup
      .selectAll('rect')
      .data(graph.nodes)
      .enter()
      .append('rect')
      .attr('x', (d: any) => d.x0)
      .attr('y', (d: any) => d.y0)
      .attr('height', (d: any) => Math.max(1, d.y1 - d.y0))
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('fill', (d: any) => d.color || '#888')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('opacity', (d: any) => {
        if (!highlightedTrackId) return 1;
        return d.trackData.id === highlightedTrackId ? 1 : 0.2;
      })
      .attr('cursor', 'pointer')
      .on('mouseover', function (_event, d: any) {
        d3.select(this).attr('stroke-width', 3).attr('stroke', '#333');

        if (onNodeHover) {
          const rect = (this as SVGRectElement).getBoundingClientRect();
          onNodeHover(d.trackData, { x: rect.right, y: rect.top });
        }
      })
      .on('mouseout', function () {
        d3.select(this).attr('stroke-width', 1).attr('stroke', '#fff');

        if (onNodeHover) {
          onNodeHover(null);
        }
      })
      .on('click', function (_event, d: any) {
        if (onNodeClick) {
          onNodeClick(d.trackData);
        }
      });

    // Add playlist labels at the top with platform icons
    const playlistGroups = Array.from(new Set(graph.nodes.map((n: any) => n.playlist)));

    playlistGroups.forEach((playlistIndex) => {
      const nodesInPlaylist = graph.nodes.filter((n: any) => n.playlist === playlistIndex);
      if (nodesInPlaylist.length === 0) return;

      const firstNode = nodesInPlaylist[0] as any;
      const x = (firstNode.x0 + firstNode.x1) / 2;
      const platform = playlistPlatforms[playlistIndex];
      const platformIcon = platform === 'spotify' ? '🟢' : platform === 'apple' ? '🍎' : '';
      const playlistName = playlistNames[playlistIndex] || `Playlist ${playlistIndex + 1}`;

      g.append('text')
        .attr('x', x)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text(`${platformIcon} ${playlistName}`);
    });

    // Add track count for each playlist
    playlistGroups.forEach((playlistIndex) => {
      const nodesInPlaylist = graph.nodes.filter((n: any) => n.playlist === playlistIndex);
      if (nodesInPlaylist.length === 0) return;

      const firstNode = nodesInPlaylist[0] as any;
      const x = (firstNode.x0 + firstNode.x1) / 2;

      g.append('text')
        .attr('x', x)
        .attr('y', innerHeight + 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#666')
        .text(`${nodesInPlaylist.length} tracks`);
    });
  }, [data, dimensions, highlightedTrackId, onNodeHover, onNodeClick, playlistNames, playlistPlatforms]);

  if (data.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-lg">No data to display. Please add playlists.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
    </div>
  );
};
