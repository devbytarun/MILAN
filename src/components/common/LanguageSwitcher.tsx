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
    <div className={`relative inline-block text-start ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      {variant === 'footer' ? (
        <button
          type="button"
          ref={triggerRef}
          onClick={() => setIsOpen((open) => !open)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs font-medium hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-orange-500/20 outline-none"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={isOpen ? menuId : undefined}
          aria-label={triggerLabel}
          title={triggerLabel}
        >
          <Languages className="w-3.5 h-3.5 text-slate-700 shrink-0" aria-hidden="true" />
          <span>{currentLanguageInfo.label}</span>
          <span className="text-[10px] text-slate-400">({currentLanguageInfo.englishName})</span>
        </button>
      ) : (
        <button
          type="button"
          ref={triggerRef}
          onClick={() => setIsOpen((open) => !open)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-800 text-xs font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-orange-500/20 outline-none"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={isOpen ? menuId : undefined}
          aria-label={triggerLabel}
          title={triggerLabel}
        >
          <Languages className="w-3.5 h-3.5 text-slate-700 shrink-0" aria-hidden="true" />
          <span>{currentLanguageInfo.label}</span>
        </button>
      )}

      {/* Language Selection Modal / Dropdown */}
      {isOpen && (
        <div
          id={menuId}
          role="dialog"
          aria-label="Choose a language"
          className={`absolute ${placementClasses} z-[60] w-[calc(100vw-2rem)] max-w-72 max-h-[calc(100dvh-5rem)] bg-white border border-slate-200 rounded-xl shadow-dropdown overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Integrated Search Bar */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search language / भाषा खोजें..."
                className="w-full !h-8 !min-h-0 !pl-8 !pr-7 !py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:!border-orange-500 focus:!ring-2 focus:!ring-orange-500/10 outline-none !shadow-none transition-colors"
                aria-label="Search languages"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 p-0.5"
                  aria-label="Clear language search"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Language Options Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto p-1.5 divide-y divide-slate-100">
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
                        ? 'bg-orange-50/80 text-orange-800 font-semibold border border-orange-200/60'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold leading-tight">{l.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{l.englishName} {l.isRTL ? '(RTL)' : ''}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-orange-600 shrink-0" aria-hidden="true" />}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching language found
              </div>
            )}
          </div>

          <div className="p-2 bg-slate-50/70 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-500 font-medium">
              English & हिन्दी (Hindi) Localization
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
