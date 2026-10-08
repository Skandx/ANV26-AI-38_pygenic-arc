import type { ScenarioData } from '../../data';
import { FlaskConical, CheckCircle, XCircle, ArrowRight, AlertTriangle, Info } from 'lucide-react';

export function WhatIfTab({ scenario }: { scenario: ScenarioData }) {
  const cf = scenario.counterfactual;
  const disappear = cf.symptoms.filter((s) => !s.stillOccurs);
  const remain = cf.symptoms.filter((s) => s.stillOccurs);

  return (
    <div className="space-y-6">
      {/* Hypothesis card */}
      <div className="bg-white rounded-lg border-2 border-cyan-300 shadow-sm overflow-hidden">
        <div className="bg-cyan-50 px-5 py-4 border-b border-cyan-200">
          <div className="flex items-center gap-3">
            <FlaskConical size={24} className="text-cyan-600" />
            <div className="flex-1">
              <div className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider">Counterfactual Hypothesis</div>
              <h3 className="text-base font-bold text-gray-800">
                "What if <span className="text-red-600">{cf.removedEventLabel}</span> had never occurred?"
              </h3>
            </div>
            <div className={`px-4 py-2 rounded-lg border-2 font-bold text-sm ${cf.verdict === 'NECESSARY' ? 'border-green-400 bg-green-50 text-green-700' : 'border-amber-400 bg-amber-50 text-amber-700'}`}>
              {cf.verdict === 'NECESSARY' ? '✓ NECESSARY CAUSE' : '⚠ INSUFFICIENT'}
            </div>
          </div>
        </div>
      </div>

      {/* Before / After comparison */}
      <div className="grid grid-cols-2 gap-4">
        {/* With the event (actual) */}
        <div className="bg-white rounded-lg border border-red-200 shadow-sm overflow-hidden">
          <div className="bg-red-50 px-4 py-2.5 border-b border-red-200 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-600" />
            <h4 className="text-sm font-bold text-red-700">With {cf.removedEventId} (Actual)</h4>
          </div>
          <div className="p-4 space-y-2">
            {cf.symptoms.map((s, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded bg-red-50 border border-red-100">
                <XCircle size={14} className="text-red-500 shrink-0" />
                <span className="text-sm text-red-800">{s.symptom}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Without the event (counterfactual) */}
        <div className="bg-white rounded-lg border border-green-200 shadow-sm overflow-hidden">
          <div className="bg-green-50 px-4 py-2.5 border-b border-green-200 flex items-center gap-2">
            <FlaskConical size={16} className="text-green-600" />
            <h4 className="text-sm font-bold text-green-700">Without {cf.removedEventId} (Simulated)</h4>
          </div>
          <div className="p-4 space-y-2">
            {disappear.map((s, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded bg-green-50 border border-green-100">
                <CheckCircle size={14} className="text-green-500 shrink-0" />
                <span className="text-sm text-green-800 line-through opacity-60">{s.symptom}</span>
                <span className="text-[10px] font-bold text-green-600 ml-auto">RESOLVED</span>
              </div>
            ))}
            {remain.map((s, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded bg-amber-50 border border-amber-100">
                <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                <span className="text-sm text-amber-800">{s.symptom}</span>
                <span className="text-[10px] font-bold text-amber-600 ml-auto">STILL OCCURS</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual impact summary */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
        <h4 className="text-sm font-bold text-gray-800 mb-3">Impact Analysis</h4>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="text-3xl font-black text-green-700">{disappear.length}</div>
            <div className="text-xs font-bold text-green-600 mt-1">Symptoms Resolved</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-amber-50 border border-amber-200">
            <div className="text-3xl font-black text-amber-700">{remain.length}</div>
            <div className="text-xs font-bold text-amber-600 mt-1">Still Occurring</div>
            <div className="text-[10px] text-amber-500 mt-0.5">(independent issues)</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="text-3xl font-black text-blue-700">{((disappear.length / cf.symptoms.length) * 100).toFixed(0)}%</div>
            <div className="text-xs font-bold text-blue-600 mt-1">Blast Coverage</div>
          </div>
        </div>

        {/* Flow: what the removal proves */}
        <div className="flex items-center gap-2 flex-wrap justify-center py-3">
          <div className="rounded-lg border-2 border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
            Remove: {cf.removedEventId}
          </div>
          <ArrowRight size={16} className="text-gray-400" />
          <div className="rounded-lg border-2 border-green-300 bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
            {disappear.length} symptoms disappear
          </div>
          <ArrowRight size={16} className="text-gray-400" />
          <div className="rounded-lg border-2 border-blue-300 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
            ∴ {cf.removedEventId} is a {cf.verdict === 'NECESSARY' ? 'necessary' : 'contributing'} cause
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <h4 className="text-sm font-bold text-gray-800 mb-2">Analysis Summary</h4>
        <p className="text-sm text-gray-700 leading-relaxed">{cf.summary}</p>
      </div>

      {/* Caveat */}
      <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 flex gap-3">
        <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-amber-700 mb-1">Methodology Caveat</h4>
          <p className="text-xs text-amber-700 leading-relaxed">{cf.caveat}</p>
        </div>
      </div>
    </div>
  );
}
