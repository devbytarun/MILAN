import React, { useState, useRef, useEffect } from 'react';
import { useI18n, SUPPORTED_LANGUAGES, LanguageCode } from '../../context/I18nContext.tsx';
import { Languages, Check, Search, X } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'pill' | 'compact' | 'footer';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'pill',
  className = '',
}) => {
  const { language, setLanguage, currentLanguageInfo } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.englishName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      {variant === 'footer' ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium hover:border-slate-400 transition-colors shadow-sm"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          title="Select Language / भाषा चुनें"
        >
          <Languages className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>{currentLanguageInfo.label}</span>
          <span className="text-[10px] text-slate-400">({currentLanguageInfo.englishName})</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill border border-slate-200 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold hover:border-slate-400 hover:bg-white transition-all shadow-sm active:scale-95"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          title="Select Language / भाषा चुनें"
        >
          <Languages className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>{currentLanguageInfo.label}</span>
        </button>
      )}

      {/* Language Selection Modal / Dropdown */}
      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 sm:bottom-auto sm:top-full sm:mt-2 z-modal w-72 max-h-96 bg-white border border-slate-200 rounded-xl shadow-elevation-4 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          {/* Search Bar */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search language / भाषा खोजें..."
              className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Language Options Grid */}
          <div className="overflow-y-auto p-1.5 divide-y divide-slate-50 max-h-64">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((l) => {
                const isSelected = l.code === language;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => handleSelect(l.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-[#f8fafc] text-[#181d26] font-semibold border border-[#dddddd]'
                        : 'text-[#333840] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold leading-tight">{l.label}</div>
                      <div className="text-[10px] text-[#9297a0] font-normal">{l.englishName} {l.isRTL ? '(RTL)' : ''}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#181d26] shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-[#9297a0]">
                No matching language found
              </div>
            )}
          </div>

          <div className="p-2 bg-[#f8fafc] border-t border-[#dddddd] text-center">
            <span className="text-[10px] text-[#41454d] font-medium">
              22 Eighth Schedule Languages + English (23 Total)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
