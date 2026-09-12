import React from 'react';
import { useI18n } from '../../context/I18nContext.tsx';
import { Languages } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'pill' | 'compact' | 'footer';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'pill',
  className = '',
}) => {
  const { language, setLanguage } = useI18n();

  if (variant === 'compact') {
    return (
      <div className={`flex items-center p-1 rounded-xl border border-slate-200 bg-slate-100/80 w-full ${className}`}>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-center transition-all ${
            language === 'en'
              ? 'bg-white text-orange-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-pressed={language === 'en'}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLanguage('hi')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-center transition-all ${
            language === 'hi'
              ? 'bg-white text-orange-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-pressed={language === 'hi'}
        >
          हिन्दी
        </button>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`inline-flex items-center gap-1.5 p-1 rounded-lg border border-slate-200 bg-white shadow-xs ${className}`}>
        <Languages className="w-3.5 h-3.5 text-slate-500 ml-1 shrink-0" aria-hidden="true" />
        <div className="flex items-center p-0.5 rounded-md bg-slate-100/90">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              language === 'en'
                ? 'bg-white text-orange-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-pressed={language === 'en'}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('hi')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              language === 'hi'
                ? 'bg-white text-orange-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-pressed={language === 'hi'}
          >
            हिन्दी
          </button>
        </div>
      </div>
    );
  }

  // Default 'pill' variant (Navbar Desktop)
  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-full border border-slate-200 bg-slate-100/90 shadow-xs select-none ${className}`}
      role="group"
      aria-label="Language selector"
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-150 ${
          language === 'en'
            ? 'bg-white text-orange-700 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        aria-pressed={language === 'en'}
        title="Switch to English"
      >
        <span>EN</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-150 ${
          language === 'hi'
            ? 'bg-white text-orange-700 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        aria-pressed={language === 'hi'}
        title="हिन्दी में बदलें (Switch to Hindi)"
      >
        <span>हिन्दी</span>
      </button>
    </div>
  );
};
