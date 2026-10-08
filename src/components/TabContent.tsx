import type { ReactNode } from 'react';
import type { TabId, ScenarioId } from '../types';
import { TABS } from '../types';
import { SCENARIO_DATA } from '../data';
import { RawEvidenceTab } from './RawEvidenceTab';
import { InvestigationTab } from './InvestigationTab';
import { DiagnosticsTab } from './DiagnosticsTab';
import { OutputTab } from './OutputTab';
import { WhatIfTab } from './WhatIfTab';
import { FileInput, Search, Stethoscope, Target, FlaskConical, Clock, Server, AlertTriangle, Timer } from 'lucide-react';

interface TabContentProps {
  activeTab: TabId;
  selectedScenario: ScenarioId;
}

const ICONS: Record<string, ReactNode> = {
  FileInput: <FileInput className="text-purple-600" size={24} />,
  Search: <Search className="text-orange-600" size={24} />,
  Stethoscope: <Stethoscope className="text-emerald-600" size={24} />,
  Target: <Target className="text-rose-600" size={24} />,
  FlaskConical: <FlaskConical className="text-cyan-600" size={24} />,
};

const BORDERS: Record<TabId, string> = {
  'raw-evidence': 'border-purple-300 bg-purple-50/30 text-purple-800',
  'investigation': 'border-orange-300 bg-orange-50/30 text-orange-800',
  'diagnostics': 'border-emerald-300 bg-emerald-50/30 text-emerald-800',
  'output': 'border-rose-300 bg-rose-50/30 text-rose-800',
  'what-if': 'border-cyan-300 bg-cyan-50/30 text-cyan-800',
};

const CONTENT_MSG: Record<TabId, string> = {
  'raw-evidence': '',
  'investigation': 'Pipeline & Dependency Graphs will appear here',
  'diagnostics': 'Hypotheses & Scoring details will appear here',
  'output': 'Root Cause Analysis, Evidence & Action Items will appear here',
  'what-if': 'Counterfactual Tests & Simulation scenarios will appear here',
};

export function TabContent({ activeTab, selectedScenario }: TabContentProps) {
  const tabInfo = TABS.find((t) => t.id === activeTab);
  const scenario = SCENARIO_DATA[selectedScenario];

  if (!tabInfo) return null;

  // Raw Evidence tab — fully built
  if (activeTab === 'raw-evidence') {
    return (
      <div className="flex-1 h-full p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
              {ICONS[tabInfo.icon]}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{tabInfo.label}</h2>
              <p className="text-gray-500 mt-0.5">{tabInfo.description}</p>
            </div>
            <div className="ml-auto flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-gray-500"><Clock size={14} /> {scenario.incidentWindow}</div>
              <div className="flex items-center gap-1 text-gray-500"><Server size={14} /> {scenario.servicesAffected.length} services</div>
              <div className="flex items-center gap-1 text-red-500 font-bold"><AlertTriangle size={14} /> {scenario.peakErrorRate}</div>
              <div className="flex items-center gap-1 text-gray-500"><Timer size={14} /> {scenario.mttr}</div>
            </div>
          </div>
          <RawEvidenceTab scenario={scenario} />
        </div>
      </div>
    );
  }

  // Investigation tab — fully built
  if (activeTab === 'investigation') {
    return (
      <div className="flex-1 h-full p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
              {ICONS[tabInfo.icon]}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{tabInfo.label}</h2>
              <p className="text-gray-500 mt-0.5">{tabInfo.description}</p>
            </div>
            <div className="ml-auto flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-gray-500"><Clock size={14} /> {scenario.incidentWindow}</div>
              <div className="flex items-center gap-1 text-gray-500"><Server size={14} /> {scenario.servicesAffected.length} services</div>
              <div className="flex items-center gap-1 text-red-500 font-bold"><AlertTriangle size={14} /> {scenario.peakErrorRate}</div>
              <div className="flex items-center gap-1 text-gray-500"><Timer size={14} /> {scenario.mttr}</div>
            </div>
          </div>
          <InvestigationTab scenario={scenario} />
        </div>
      </div>
    );
  }

  // Diagnostics or Output tab
  if (activeTab === 'diagnostics' || activeTab === 'output') {
    return (
      <div className="flex-1 h-full p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">{ICONS[tabInfo.icon]}</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{tabInfo.label}</h2>
              <p className="text-gray-500 mt-0.5">{tabInfo.description}</p>
            </div>
            <div className="ml-auto flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-gray-500"><Clock size={14} /> {scenario.incidentWindow}</div>
              <div className="flex items-center gap-1 text-red-500 font-bold"><AlertTriangle size={14} /> {scenario.peakErrorRate}</div>
            </div>
          </div>
          {activeTab === 'diagnostics' ? <DiagnosticsTab scenario={scenario} /> : <OutputTab scenario={scenario} />}
        </div>
      </div>
    );
  }

  // What-If tab
  return (
    <div className="flex-1 h-full p-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">{ICONS[tabInfo.icon]}</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{tabInfo.label}</h2>
            <p className="text-gray-500 mt-0.5">{tabInfo.description}</p>
          </div>
          <div className="ml-auto flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1 text-gray-500"><Clock size={14} /> {scenario.incidentWindow}</div>
            <div className="flex items-center gap-1 text-red-500 font-bold"><AlertTriangle size={14} /> {scenario.peakErrorRate}</div>
          </div>
        </div>
        <WhatIfTab scenario={scenario} />
      </div>
    </div>
  );
}

