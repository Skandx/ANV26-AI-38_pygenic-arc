import type { TopologyNode, TopologyEdge, ScenarioId } from '../../data';
import { Server, Database, Globe, HardDrive, Cog } from 'lucide-react';
import type { ReactNode } from 'react';

const TYPE_STYLE: Record<TopologyNode['type'], { icon: ReactNode; fill: string; stroke: string; text: string }> = {
  service: { icon: <Server size={14} />, fill: '#EFF6FF', stroke: '#93C5FD', text: '#1D4ED8' },
  cache: { icon: <HardDrive size={14} />, fill: '#F5F3FF', stroke: '#C4B5FD', text: '#6D28D9' },
  database: { icon: <Database size={14} />, fill: '#FFFBEB', stroke: '#FCD34D', text: '#B45309' },
  external: { icon: <Globe size={14} />, fill: '#F9FAFB', stroke: '#9CA3AF', text: '#374151' },
  worker: { icon: <Cog size={14} />, fill: '#ECFDF5', stroke: '#6EE7B7', text: '#047857' },
};

// Different layouts for each scenario so they look distinct
const LAYOUT_1042: Record<string, { x: number; y: number }> = {
  'upi-gateway':       { x: 320, y: 30 },
  'vpa-lookup-service': { x: 120, y: 130 },
  'redis-vpa-cache':   { x: 30, y: 240 },
  'txn-orchestrator':  { x: 420, y: 130 },
  'cbs-connector':     { x: 320, y: 240 },
  'core-banking':      { x: 320, y: 350 },
  'notify-service':    { x: 540, y: 240 },
  'settlement-worker': { x: 540, y: 350 },
};

const LAYOUT_2057: Record<string, { x: number; y: number }> = {
  'app-gateway':        { x: 60, y: 30 },
  'restaurant-catalog': { x: 300, y: 30 },
  'redis-menu-cache':   { x: 480, y: 30 },
  'order-service':      { x: 60, y: 150 },
  'cart-service':       { x: 220, y: 250 },
  'pricing-service':    { x: 60, y: 280 },
  'promo-engine':       { x: 60, y: 400 },
  'payment-service':    { x: 350, y: 340 },
  'dispatch-service':   { x: 500, y: 250 },
  'notify-worker':      { x: 500, y: 380 },
};

const NODE_W = 130;
const NODE_H = 44;

function getEdgePath(fromPos: { x: number; y: number }, toPos: { x: number; y: number }) {
  const fx = fromPos.x + NODE_W / 2;
  const fy = fromPos.y + NODE_H / 2;
  const tx = toPos.x + NODE_W / 2;
  const ty = toPos.y + NODE_H / 2;

  // Clamp to node edges
  const angle = Math.atan2(ty - fy, tx - fx);
  const sx = fx + Math.cos(angle) * (NODE_W / 2 + 4);
  const sy = fy + Math.sin(angle) * (NODE_H / 2 + 4);
  const ex = tx - Math.cos(angle) * (NODE_W / 2 + 10);
  const ey = ty - Math.sin(angle) * (NODE_H / 2 + 10);

  // Curved path
  const mx = (sx + ex) / 2;
  const my = (sy + ey) / 2;
  const dx = ex - sx;
  const dy = ey - sy;
  const perpX = -dy * 0.15;
  const perpY = dx * 0.15;

  return { path: `M ${sx} ${sy} Q ${mx + perpX} ${my + perpY} ${ex} ${ey}`, ex, ey, angle };
}

export function DependencyGraph({ nodes, edges, scenarioId }: { nodes: TopologyNode[]; edges: TopologyEdge[]; scenarioId: ScenarioId }) {
  const layout = scenarioId === 'INC-1042' ? LAYOUT_1042 : LAYOUT_2057;
  const svgW = scenarioId === 'INC-1042' ? 680 : 640;
  const svgH = scenarioId === 'INC-1042' ? 420 : 450;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <Server size={16} className="text-gray-500" />
        <h3 className="font-bold text-sm text-gray-800">Service Dependency Graph</h3>
        <span className="text-xs text-gray-400 ml-auto">{nodes.length} nodes · {edges.length} edges</span>
      </div>
      <div className="p-4 overflow-x-auto">
        <svg width={svgW} height={svgH} className="mx-auto" style={{ minWidth: svgW }}>
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#9CA3AF" />
            </marker>
            <filter id="shadow" x="-4%" y="-4%" width="108%" height="116%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.08" />
            </filter>
          </defs>

          {/* Edges */}
          {edges.map((edge, i) => {
            const fromPos = layout[edge.from];
            const toPos = layout[edge.to];
            if (!fromPos || !toPos) return null;
            const { path, ex, ey } = getEdgePath(fromPos, toPos);
            const mx = (fromPos.x + NODE_W / 2 + toPos.x + NODE_W / 2) / 2;
            const my = (fromPos.y + NODE_H / 2 + toPos.y + NODE_H / 2) / 2;
            return (
              <g key={i}>
                <path d={path} fill="none" stroke="#D1D5DB" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                {edge.label && (
                  <text x={mx} y={my - 6} textAnchor="middle" fontSize="8" fill="#9CA3AF" fontWeight="600">{edge.label}</text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const pos = layout[node.id];
            if (!pos) return null;
            const style = TYPE_STYLE[node.type];
            return (
              <g key={node.id}>
                <rect x={pos.x} y={pos.y} width={NODE_W} height={NODE_H} rx="8" ry="8"
                  fill={style.fill} stroke={style.stroke} strokeWidth="2" filter="url(#shadow)" />
                <text x={pos.x + NODE_W / 2} y={pos.y + NODE_H / 2 + 1} textAnchor="middle" dominantBaseline="middle"
                  fontSize="10" fontWeight="700" fill={style.text}>
                  {node.label}
                </text>
                {/* Type indicator dot */}
                <circle cx={pos.x + 12} cy={pos.y + NODE_H / 2} r="4" fill={style.stroke} />
              </g>
            );
          })}
        </svg>
      </div>
      {/* Legend */}
      <div className="px-4 py-2 border-t border-gray-100 flex gap-4 flex-wrap">
        {Object.entries(TYPE_STYLE).map(([type, style]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: style.fill, border: `2px solid ${style.stroke}` }} />
            <span className="text-[10px] text-gray-500 capitalize">{type}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-auto">
          <svg width="20" height="10"><line x1="0" y1="5" x2="15" y2="5" stroke="#D1D5DB" strokeWidth="1.5" markerEnd="url(#arrowhead)" /></svg>
          <span className="text-[10px] text-gray-500">dependency</span>
        </div>
      </div>
    </div>
  );
}
