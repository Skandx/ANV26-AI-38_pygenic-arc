import type { ReactNode } from 'react';
import { FileInput, Search, Stethoscope, Target, FlaskConical } from 'lucide-react';
import type { TabId } from '../types';
import { TABS } from '../types';

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const ICONS: Record<string, ReactNode> = {
  FileInput: <FileInput size={20} />,
  Search: <Search size={20} />,
  Stethoscope: <Stethoscope size={20} />,
  Target: <Target size={20} />,
  FlaskConical: <FlaskConical size={20} />,
};

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-[220px] bg-white border-r border-gray-200 h-full flex flex-col shrink-0">
      <div className="flex-1 py-4 flex flex-col gap-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-start gap-3 w-full text-left px-4 py-3 transition-colors duration-200 ${
                isActive
                  ? 'border-l-4 border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-l-4 border-transparent text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className={`mt-0.5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                {ICONS[tab.icon]}
              </div>
              <div>
                <div className={`font-semibold text-sm ${isActive ? 'text-blue-800' : 'text-gray-800'}`}>
                  {tab.label}
                </div>
                <div className={`text-xs mt-0.5 leading-snug ${isActive ? 'text-blue-600/80' : 'text-gray-500'}`}>
                  {tab.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="p-4 border-t border-gray-100 text-center">
        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Anvation 2026 · AI-03</span>
      </div>
    </div>
  );
}
