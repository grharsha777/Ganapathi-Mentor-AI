'use client';

import { useMemo } from 'react';
import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';

interface EntityGraphProps {
  text: string;
}

interface GraphNode extends SimulationNodeDatum {
  id: string;
  x: number;
  y: number;
}

interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

function extractEntities(text: string): string[] {
  const tokens = text
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => token.trim())
    .filter((token) => token.length > 3);

  const counts = new Map<string, number>();
  for (const token of tokens) {
    const normalized = token.toLowerCase();
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([token]) => token);
}

function buildGraph(text: string): { nodes: GraphNode[]; links: GraphLink[] } {
  const entities = extractEntities(text);
  const nodes: GraphNode[] = entities.map((entity, index) => ({
    id: entity,
    x: 80 + (index % 4) * 120,
    y: 70 + Math.floor(index / 4) * 110,
  }));

  const links: GraphLink[] = [];
  for (let index = 0; index < entities.length - 1; index += 1) {
    links.push({ source: entities[index], target: entities[index + 1] });
  }

  if (entities.length > 2) {
    links.push({ source: entities[0], target: entities[entities.length - 1] });
  }

  return { nodes, links };
}

export function EntityGraph({ text }: EntityGraphProps) {
  const graph = useMemo(() => {
    const { nodes, links } = buildGraph(text);
    if (nodes.length < 2) {
      return { nodes, links };
    }

    const simulation = forceSimulation<GraphNode>(nodes)
      .force('charge', forceManyBody<GraphNode>().strength(-90))
      .force('link', forceLink<GraphNode, GraphLink>(links).id((node) => node.id).distance(110))
      .force('center', forceCenter(240, 140))
      .stop();

    for (let tick = 0; tick < 70; tick += 1) {
      simulation.tick();
    }

    return { nodes, links };
  }, [text]);

  if (graph.nodes.length < 2) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#111118]/85 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Related Entity Graph</p>
      <svg viewBox="0 0 480 280" className="mt-3 w-full rounded-xl border border-white/10 bg-black/35">
        {graph.links.map((link, index) => {
          const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
          const targetId = typeof link.target === 'string' ? link.target : link.target.id;
          const source = graph.nodes.find((node) => node.id === sourceId);
          const target = graph.nodes.find((node) => node.id === targetId);
          if (!source || !target) return null;

          return (
            <line
              key={`${sourceId}-${targetId}-${index}`}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke="rgba(0,212,170,0.35)"
              strokeWidth="1.2"
            />
          );
        })}

        {graph.nodes.map((node) => (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r={18} fill="rgba(0,212,170,0.15)" stroke="rgba(0,212,170,0.65)" />
            <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="9" fill="#d4d4d8">
              {node.id.slice(0, 8)}
            </text>
          </g>
        ))}
      </svg>
    </section>
  );
}
