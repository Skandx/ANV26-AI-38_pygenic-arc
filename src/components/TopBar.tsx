import { Zap, Database } from 'lucide-react';
import type { ScenarioId } from '../types';
import { SCENARIO_DATA } from '../data';

interface TopBarProps {
  selectedScenario: ScenarioId;
  onScenarioChange: (id: ScenarioId) => void;
}

export function TopBar({ selectedScenario, onScenarioChange }: TopBarProps) {
  const scenario = SCENARIO_DATA[selectedScenario];

  return (
    <div className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center bg-blue-100 p-1.5 rounded-lg text-blue-600">
          <Zap size={20} className="fill-current" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-none">Pygenic Arc</h1>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">Production Incident Intelligence System</p>
        </div>
      </div>

      <div className="flex-1 flex justify-center max-w-xl px-4">
        <div className="relative w-full">
          <select
            value={selectedScenario}
            onChange={(e) => onScenarioChange(e.target.value as ScenarioId)}
            className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm font-medium pr-8"
          >
            {Object.values(SCENARIO_DATA).map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} · {s.title} — {s.subtitle}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right mr-2 hidden md:block">
          <span className="text-xs text-gray-400 font-medium">{scenario.domain}</span>
          <span className="block text-xs font-bold text-gray-700">{scenario.incidentWindow}</span>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1">
          <Database size={14} className="text-green-600" />
          <span className="text-xs font-bold text-green-700">SYNTHETIC DATA</span>
        </div>
      </div>
    </div>
  );
}
