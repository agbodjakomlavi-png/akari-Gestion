import React from 'react';
import { Search, X, Filter } from 'lucide-react';

export type FilterType = 'all' | 'unread' | 'favorites' | 'groups';

interface SidebarSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export const SidebarSearch: React.FC<SidebarSearchProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
}) => {
  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'unread', label: 'Non lus' },
    { id: 'favorites', label: 'Favoris' },
    { id: 'groups', label: 'Groupes' },
  ];

  return (
    <div id="sidebar-search-container" className="px-3 pt-2 pb-2 bg-[#ffffff] dark:bg-[#111b21] border-b border-[#e9edef] dark:border-[#222d34] flex flex-col gap-2">
      {/* Search Input Bar */}
      <div className="relative flex items-center bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-[#00a884]">
        <Search className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0 mr-2.5" />
        <input
          id="chat-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher ou démarrer une discussion"
          className="w-full bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {filters.map((f) => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(f.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#00a884] text-white'
                  : 'bg-[#f0f2f5] dark:bg-[#202c33] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2b3942]'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
