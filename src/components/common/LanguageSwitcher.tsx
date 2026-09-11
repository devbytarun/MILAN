import React, { useEffect, useId, useRef, useState } from 'react';
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const closeDropdown = (restoreFocus = false) => {
    setIsOpen(false);
    setSearchQuery('');

    if (restoreFocus) {
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDropdown(true);
      }
    };

    if (isOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.englishName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    closeDropdown(true);
  };

  // Header controls must open down into the viewport; the footer control opens up.
  // A shared responsive rule made the mobile header and desktop footer render off-screen.
  const placementClasses =
    variant === 'footer'
      ? 'right-0 bottom-full mb-2 origin-bottom-right'
      : 'right-0 top-full mt-2 origin-top-right';
  const triggerLabel = `Choose language. Current language: ${currentLanguageInfo.englishName}`;

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      {variant === 'footer' ? (
        <button
          type="button"
          ref={triggerRef}
          onClick={() => setIsOpen((open) => !open)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium hover:border-slate-400 transition-colors shadow-sm"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={isOpen ? menuId : undefined}
          aria-label={triggerLabel}
          title={triggerLabel}
        >
          <Languages className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
          <span>{currentLanguageInfo.label}</span>
          <span className="text-[10px] text-slate-400">({currentLanguageInfo.englishName})</span>
        </button>
      ) : (
        <button
          type="button"
          ref={triggerRef}
          onClick={() => setIsOpen((open) => !open)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill border border-slate-200 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold hover:border-slate-400 hover:bg-white transition-all shadow-sm active:scale-95"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={isOpen ? menuId : undefined}
          aria-label={triggerLabel}
          title={triggerLabel}
        >
          <Languages className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
          <span>{currentLanguageInfo.label}</span>
        </button>
      )}

      {/* Language Selection Modal / Dropdown */}
      {isOpen && (
        <div
          id={menuId}
          role="dialog"
          aria-label="Choose a language"
          className={`absolute ${placementClasses} z-[60] w-[calc(100vw-2rem)] max-w-72 max-h-[calc(100dvh-5rem)] bg-white border border-slate-200 rounded-xl shadow-elevation-4 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Search Bar */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search language / भाषा खोजें..."
              className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none"
              aria-label="Search languages"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Clear language search"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Language Options Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto p-1.5 divide-y divide-slate-50">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((l) => {
                const isSelected = l.code === language;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => handleSelect(l.code)}
                    lang={l.code}
                    dir={l.isRTL ? 'rtl' : 'ltr'}
                    aria-current={isSelected ? 'true' : undefined}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-start text-xs transition-colors ${
                      isSelected
                        ? 'bg-[#f8fafc] text-[#181d26] font-semibold border border-[#dddddd]'
                        : 'text-[#333840] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold leading-tight">{l.label}</div>
                      <div className="text-[10px] text-[#9297a0] font-normal">{l.englishName} {l.isRTL ? '(RTL)' : ''}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#181d26] shrink-0" aria-hidden="true" />}
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
