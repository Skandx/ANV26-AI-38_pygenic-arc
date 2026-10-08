import type { ScenarioData } from '../../data';
import { Target, CheckCircle, AlertTriangle, Lightbulb, ArrowDown, Eye, FlaskConical } from 'lucide-react';

const ROLE_COLORS = {
  supporting: 'bg-green-50 border-green-200 text-green-700',
  contradicting: 'bg-red-50 border-red-200 text-red-600',
  misleading: 'bg-violet-50 border-violet-200 text-violet-700',
  missing: 'bg-gray-50 border-gray-200 text-gray-500',
};

const SOURCE_BADGE = {
  log: 'bg-blue-100 text-blue-700',
  metric: 'bg-amber-100 text-amber-700',
  trace: 'bg-cyan-100 text-cyan-700',
  change: 'bg-green-100 text-green-700',
};

export function OutputTab({ scenario }: { scenario: ScenarioData }) {
  const rootCandidate = scenario.candidates.find((c) => c.verdict === 'PROBABLE_ROOT_CAUSE');
  const supporting = scenario.evidenceLedger.filter((e) => e.role === 'supporting');
  const misleading = scenario.evidenceLedger.filter((e) => e.role === 'misleading' || e.role === 'contradicting');

  return (
    <div className="space-y-5">
      {/* Top row: Root Cause + Recommended Action */}
      <div className="grid grid-cols-5 gap-4">
        {/* Root cause — 3 cols */}
        <div className="col-span-3 rounded-lg border-2 border-red-300 bg-gradient-to-br from-red-50 to-white p-5">
          <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Most Probable Root Cause</div>
          <h3 className="text-xl font-black text-gray-900 mb-1">{scenario.rootCauseLabel}</h3>
          <p className="text-xs text-gray-500 mb-3">{scenario.subtitle} — identified during {scenario.incidentWindow}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-red-700">{Math.round(scenario.rootCauseConfidence * 100)}%</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Confidence<br/>Evidence-Weighted</span>
          </div>
        </div>

        {/* Recommended action — 2 cols */}
        <div className="col-span-2 rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Recommended Next Action</div>
          {scenario.nextActions[0] && (
            <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-3 mb-3">
              <div className="text-[10px] font-bold text-blue-600 uppercase mb-1">Action</div>
              <div className="text-sm font-bold text-gray-900">{scenario.nextActions[0].action}</div>
              <div className="text-xs text-gray-600 mt-1">
                Verification signal: <span className="font-mono text-blue-700">{scenario.nextActions[0].verifySignal}</span>
              </div>
            </div>
          )}
          <p className="text-[10px] text-gray-400 italic">
            {scenario.id === 'INC-1042'
              ? 'Tuning Redis is the tempting move — and it would not have fixed anything.'
              : 'Flushing the menu cache is the tempting move — and it would not have fixed anything.'}
          </p>
        </div>
      </div>

      {/* Middle row: Causal Chain + Evidence */}
      <div className="grid grid-cols-5 gap-4">
        {/* Causal chain — 2 cols */}
        <div className="col-span-2 rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Causal Chain</div>
          <div className="space-y-0">
            {scenario.causalChain.map((step, i) => (
              <div key={i}>
                <div className="flex items-start gap-2">
                  <span className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${i === 0 ? 'bg-red-500' : i === scenario.causalChain.length - 1 ? 'bg-amber-500' : 'bg-blue-400'}`} />
                  <div>
                    <div className={`text-sm ${i === 0 ? 'font-bold text-red-700' : 'font-medium text-gray-800'}`}>{step}</div>
                  </div>
                </div>
                {i < scenario.causalChain.length - 1 && (
                  <div className="ml-1 flex items-center gap-1 py-1">
                    <div className="w-px h-4 bg-gray-200 ml-[4px]" />
                    <ArrowDown size={10} className="text-gray-300 ml-1" />
                    <span className="text-[10px] text-gray-400 font-mono ml-1">propagates</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Supporting evidence — 3 cols */}
        <div className="col-span-3 rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
            <CheckCircle size={14} className="text-green-500" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Supporting Evidence · {supporting.length} of {supporting.length} Symptoms Explained
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {supporting.map((e) => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-xs">
                <span className={`font-mono font-bold px-2 py-0.5 rounded border text-[10px] ${SOURCE_BADGE[e.sourceType]}`}>
                  {e.id}-{e.sourceType}
                </span>
                <span className="text-gray-700 flex-1">{e.claim}</span>
              </div>
            ))}
          </div>

          {/* Misleading signal */}
          {misleading.length > 0 && (
            <>
              <div className="px-4 py-2 border-t border-gray-200 flex items-center gap-2 bg-violet-50/50">
                <Eye size={14} className="text-violet-500" />
                <span className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">Misleading Signal</span>
              </div>
              {misleading.map((e) => (
                <div key={e.id} className="flex items-center gap-3 px-4 py-2 bg-violet-50/30 border-t border-violet-100 text-xs">
                  <span className="font-mono font-bold px-2 py-0.5 rounded border border-violet-200 bg-violet-50 text-violet-700 text-[10px]">
                    {e.id}
                  </span>
                  <span className="text-gray-600">{e.claim}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Counterfactual Check */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
          <FlaskConical size={14} className="text-cyan-600" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Counterfactual Check</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ml-2 ${scenario.counterfactual.verdict === 'NECESSARY' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-amber-100 text-amber-700 border border-amber-300'}`}>
            {scenario.counterfactual.verdict}
          </span>
        </div>
        <div className="px-5 py-4 border-l-4 border-cyan-400 mx-4 my-3 bg-cyan-50/30 rounded-r">
          <p className="text-sm text-gray-700 italic leading-relaxed">
            "Remove {scenario.counterfactual.removedEventLabel} — {scenario.counterfactual.summary}"
          </p>
        </div>
      </div>

      {/* Remaining actions */}
      {scenario.nextActions.length > 1 && (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
            <Lightbulb size={14} className="text-amber-500" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Additional Actions</span>
          </div>
          <div className="divide-y divide-gray-100">
            {scenario.nextActions.slice(1).map((a, i) => (
              <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 2}</span>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-800">{a.action}</span>
                  <span className="text-xs text-gray-500 ml-2">{a.rationale}</span>
                </div>
                <span className="text-[10px] text-green-600 font-mono">✓ {a.verifySignal}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
