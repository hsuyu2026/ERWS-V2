import React, { useState } from 'react';
import { ViewMode } from '../types/erws';
import {
  LayoutDashboard,
  Zap,
  Brain,
  ListFilter,
  TrendingUp,
  Lightbulb,
  Sparkles,
  Settings,
  Menu,
  X,
} from 'lucide-react';

interface NavigationProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  recordCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onSelectView,
  recordCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: '儀表板', icon: <LayoutDashboard size={18} /> },
    { id: 'quick-record', label: '快速紀錄', icon: <Zap size={18} /> },
    { id: 'deep-record', label: '深入紀錄', icon: <Brain size={18} /> },
    { id: 'records', label: '紀錄列表', icon: <ListFilter size={18} /> },
    { id: 'trends', label: '趨勢分析', icon: <TrendingUp size={18} /> },
    { id: 'cognitive-patterns', label: '認知模式', icon: <Lightbulb size={18} /> },
    { id: 'ai-export', label: 'AI 分析複製', icon: <Sparkles size={18} /> },
    { id: 'settings', label: '資料管理', icon: <Settings size={18} /> },
  ];

  return (
    <>
      {/* Desktop Top Header adhering to Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectView('dashboard')}
              className="text-lg font-bold tracking-tight text-white hover:text-stone-200 transition-colors flex items-center gap-2"
            >
              <span>ERWS</span>
              <span className="hidden sm:inline text-xs font-normal text-stone-400 border-l border-stone-700 pl-2">
                身心認知紀錄
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links for Desktop */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-medium">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-stone-800 text-white font-semibold'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.id === 'records' && recordCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-stone-800 text-stone-300 font-mono">
                      {recordCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectView('quick-record')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-stone-900 rounded-lg hover:bg-stone-100 transition-all shadow-sm active:scale-95"
            >
              <Zap size={14} className="fill-stone-900" />
              <span>30秒快速紀錄</span>
            </button>

            {/* Mobile menu toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="選單"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-800 bg-stone-900 px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between min-h-[44px] ${
                    isActive
                      ? 'bg-stone-800 text-white font-semibold'
                      : 'text-stone-300 hover:bg-stone-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'records' && (
                    <span className="text-xs font-mono text-stone-400">
                      {recordCount} 筆
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 pb-safe">
        <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
          <button
            onClick={() => onSelectView('dashboard')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] ${
              currentView === 'dashboard' ? 'text-white font-medium' : 'text-stone-400'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="text-[10px] mt-1">儀表板</span>
          </button>

          <button
            onClick={() => onSelectView('quick-record')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] ${
              currentView === 'quick-record' ? 'text-white font-medium' : 'text-stone-400'
            }`}
          >
            <div className="p-1 rounded-md bg-stone-800 text-amber-400">
              <Zap size={18} />
            </div>
            <span className="text-[10px] mt-0.5">快速紀錄</span>
          </button>

          <button
            onClick={() => onSelectView('deep-record')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] ${
              currentView === 'deep-record' ? 'text-white font-medium' : 'text-stone-400'
            }`}
          >
            <Brain size={20} />
            <span className="text-[10px] mt-1">深入檢視</span>
          </button>

          <button
            onClick={() => onSelectView('records')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] ${
              currentView === 'records' ? 'text-white font-medium' : 'text-stone-400'
            }`}
          >
            <ListFilter size={20} />
            <span className="text-[10px] mt-1">紀錄列表</span>
          </button>

          <button
            onClick={() => onSelectView('ai-export')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] ${
              currentView === 'ai-export' ? 'text-white font-medium' : 'text-stone-400'
            }`}
          >
            <Sparkles size={20} />
            <span className="text-[10px] mt-1">AI 複製</span>
          </button>
        </div>
      </div>
    </>
  );
};
