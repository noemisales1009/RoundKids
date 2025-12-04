import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface SecondaryNavigationProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
}

export const SecondaryNavigation: React.FC<SecondaryNavigationProps> = ({
  tabs,
  activeTabId,
  onTabChange,
}) => {
  return (
    <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 overflow-x-auto px-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition flex items-center gap-2 ${
            activeTabId === tab.id
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
};
