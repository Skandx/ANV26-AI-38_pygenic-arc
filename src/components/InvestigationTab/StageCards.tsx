import { useState, useRef, useEffect } from 'react';
import type { InvestigationStage, ScenarioData } from '../../data';
import { ChevronDown, ChevronRight, ArrowRight, CheckCircle2, Play, Terminal } from 'lucide-react';

const STAGE_COLORS = [
  'border-blue-300 bg-blue-50', 'border-indigo-300 bg-indigo-50', 'border-violet-300 bg-violet-50',
  'border-amber-300 bg-amber-50', 'border-teal-300 bg-teal-50', 'border-cyan-300 bg-cyan-50',
  'border-orange-300 bg-orange-50', 'border-emerald-300 bg-emerald-50', 'border-red-300 bg-red-50',
  'border-green-400 bg-green-50',
];

interface LogLine { time: string; stage: string; text: string; }

function buildLogLines(scenario: ScenarioData): LogLine[] {
  const lines: LogLine[] = [];
  let sec = 10;
  const t = () => `10:01:${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`;

  lines.push({ time: t(), stage: 'INGEST', text: `INGEST started for ${scenario.id}` });
  sec += 1;
  lines.push({ time: t(), stage: 'INGEST', text: `Loading ${scenario.logs.length} log entries...` });
  sec += 1;
  lines.push({ time: t(), stage: 'INGEST', text: `Loading ${scenario.metrics.length} metric series (${scenario.metrics.reduce((a, m) => a + m.points.length, 0)} points)...` });
  sec += 1;
  lines.push({ time: t(), stage: 'INGEST', text: `Loading ${scenario.traces.length} traces, ${scenario.changes.length} change events...` });
  sec += 1;
  lines.push({ time: t(), stage: 'INGEST', text: `INGEST completed. ${scenario.investigationStages[0]?.outputCount ?? 0} raw events.` });
  sec += 2;
  lines.push({ time: t(), stage: 'NORMALIZE', text: 'NORMALIZE started' });
  sec += 1;
  lines.push({ time: t(), stage: 'NORMALIZE', text: 'Normalizing logs and metrics...' });
  sec += 1;
  lines.push({ time: t(), stage: 'NORMALIZE', text: 'Normalizing traces and deployments...' });
  sec += 2;
  lines.push({ time: t(), stage: 'NORMALIZE', text: `NORMALIZE completed. ${scenario.investigationStages[1]?.outputCount ?? 0} canonical events.` });
  sec += 3;
  lines.push({ time: t(), stage: 'BASELINE', text: 'BASELINE started' });
  sec += 2;
  lines.push({ time: t(), stage: 'BASELINE', text: `BASELINE completed. established normal thresholds for ${scenario.servicesAffected.length} services.` });
  sec += 3;
  lines.push({ time: t(), stage: 'DETECT', text: 'DETECT started' });
  sec += 2;
  lines.push({ time: t(), stage: 'DETECT', text: `DETECT found ${scenario.investigationStages[3]?.outputCount ?? 0} anomalies across services` });
  sec += 3;
  lines.push({ time: t(), stage: 'MAP', text: 'MAP started' });
  sec += 2;
  lines.push({ time: t(), stage: 'MAP', text: `MAP completed. Service topology constructed. ${scenario.topology.nodes.length} nodes, ${scenario.topology.edges.length} edges.` });
  sec += 1;
  lines.push({ time: t(), stage: 'HYPOTHESIZE', text: 'HYPOTHESIZE started' });
  scenario.candidates.forEach((c) => {
    sec += 1;
    lines.push({ time: t(), stage: 'HYPOTHESIZE', text: `HYPOTHESIZE generated H: ${c.label}` });
  });
  sec += 1;
  lines.push({ time: t(), stage: 'TEST', text: 'TEST started' });
  scenario.candidates.forEach((c) => {
    sec += 1;
    lines.push({ time: t(), stage: 'TEST', text: `TEST completed for ${c.id}. Score: ${c.composite.toFixed(2)}` });
  });
  sec += 1;
  scenario.candidates.filter((c) => c.verdict === 'REJECTED').forEach((c) => {
    lines.push({ time: t(), stage: 'RED_HERRING', text: `RED_HERRING classified ${c.id} (${c.label}) as REJECTED` });
    sec += 1;
  });
  lines.push({ time: t(), stage: 'COUNTERFACTUAL', text: `COUNTERFACTUAL CHECK: removed ${scenario.counterfactual.removedEventId}` });
  sec += 1;
  lines.push({ time: t(), stage: 'COUNTERFACTUAL', text: `Result: ${scenario.counterfactual.verdict}. ${scenario.counterfactual.symptoms.filter(s => !s.stillOccurs).length} symptoms resolved.` });
  sec += 1;
  lines.push({ time: t(), stage: 'RCA', text: 'RCA started' });
  sec += 1;
  const root = scenario.candidates.find((c) => c.verdict === 'PROBABLE_ROOT_CAUSE');
  if (root) {
    lines.push({ time: t(), stage: 'RCA', text: `RCA finalized: ${root.label} -> Confidence ${root.composite.toFixed(2)}` });
  }
  sec += 1;
  lines.push({ time: t(), stage: 'RCA', text: 'RCA stage completed' });
  sec += 1;
  lines.push({ time: t(), stage: 'ACTION', text: `ACTION: ${scenario.nextActions.length} recommended actions generated` });
  sec += 4;
  lines.push({ time: t(), stage: 'RECOVERY', text: `RECOVERY observed. ${scenario.title} resolved. MTTR: ${scenario.mttr}` });

  return lines;
}

export function StageCards({ stages, scenario }: { stages: InvestigationStage[]; scenario: ScenarioData }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [visibleLines, setVisibleLines] = useState<LogLine[]>([]);
  const [hasRun, setHasRun] = useState(false);
  const isRunningRef = useRef(false);
  const [runningFlag, setRunningFlag] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  // Reset when scenario changes
  useEffect(() => {
    setVisibleLines([]);
    setHasRun(false);
    setRunningFlag(false);
    isRunningRef.current = false;
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, [scenario.id]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [visibleLines.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  function runSimulation() {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setRunningFlag(true);
    setHasRun(true);
    setVisibleLines([]);

    const lines = buildLogLines(scenario);
    let idx = 0;

    function tick() {
      if (idx < lines.length && isRunningRef.current) {
        const line = lines[idx];
        idx++;
        setVisibleLines((prev) => [...prev, line]);
        const delay = 150 + Math.random() * 200;
        timerRef.current = window.setTimeout(tick, delay);
      } else {
        isRunningRef.current = false;
        setRunningFlag(false);
        timerRef.current = null;
      }
    }
    timerRef.current = window.setTimeout(tick, 400);
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <CheckCircle2 size={16} className="text-green-500" />
        <h3 className="font-bold text-sm text-gray-800">Investigation Stages</h3>
        <span className="text-xs text-gray-400 ml-auto">Click stages to expand · Run to simulate</span>
      </div>

      {/* RUN button + Terminal */}
      <div className="px-4 py-3 border-b border-gray-50">
        <button
          onClick={runSimulation}
          disabled={runningFlag}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all mb-3 ${
            runningFlag
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow'
          }`}
        >
          {runningFlag ? (
            <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Running...</>
          ) : (
            <><Play size={14} /> {hasRun ? 'Re-run Investigation' : 'Run Investigation'}</>
          )}
        </button>

        {/* CLI Terminal */}
        {hasRun && (
          <div className="rounded-lg border border-gray-700 bg-[#0d1117] overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#161b22] border-b border-gray-700">
              <Terminal size={12} className="text-gray-500" />
              <span className="text-[10px] font-mono text-gray-400">LIVE ENGINE LOG</span>
              {runningFlag && <span className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
            </div>
            <div ref={terminalRef} className="p-3 max-h-[320px] overflow-y-auto font-mono text-xs leading-relaxed">
              {visibleLines.map((line, i) => (
                <div key={i} className="flex gap-2 mb-0.5">
                  <span className="text-gray-500 shrink-0">[{line.time}]</span>
                  <span className="text-cyan-400 font-bold shrink-0">{line.stage}:</span>
                  <span className="text-green-400">{line.text}</span>
                </div>
              ))}
              {runningFlag && <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-1" />}
            </div>
          </div>
        )}
      </div>

      {/* Pipeline flow */}
      <div className="px-4 py-3 border-b border-gray-50 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-[700px]">
          {stages.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1">
              <button
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                className={`rounded px-2 py-1 text-[10px] font-bold border transition-all ${
                  expanded === s.id ? 'ring-2 ring-blue-400 scale-105' : ''
                } ${STAGE_COLORS[i % STAGE_COLORS.length]}`}
              >
                {s.label}
              </button>
              {i < stages.length - 1 && <ArrowRight size={12} className="text-gray-300 shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Stage cards */}
      <div className="divide-y divide-gray-100">
        {stages.map((stage, i) => {
          const isExpanded = expanded === stage.id;
          return (
            <div key={stage.id}>
              <button
                onClick={() => setExpanded(isExpanded ? null : stage.id)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${STAGE_COLORS[i % STAGE_COLORS.length]}`}>
                  {stage.id}
                </span>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-800">{stage.label}</span>
                  <span className="text-xs text-gray-500 ml-2">{stage.description}</span>
                </div>
                {stage.inputCount != null && (
                  <div className="flex items-center gap-1 text-[10px] font-mono text-gray-400">
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded">{stage.inputCount} in</span>
                    <ArrowRight size={10} />
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded">{stage.outputCount} out</span>
                  </div>
                )}
                {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 pl-14">
                  <div className={`rounded-lg border p-3 text-sm text-gray-700 ${STAGE_COLORS[i % STAGE_COLORS.length]}`}>
                    {stage.detail}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
