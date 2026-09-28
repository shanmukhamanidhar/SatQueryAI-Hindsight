import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../i18n/types';

interface LanguageSelectorProps {
  variant?: 'header' | 'mobile';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'header' }) => {
  const { language, setLanguage, currentLanguageInfo } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  if (variant === 'mobile') {
    return (
      <div className="w-full">
        <label className="text-[11px] font-mono font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
          <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Language / భాష / भाषा</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1 bg-slate-50 dark:bg-zinc-900/90 rounded-xl border border-slate-200 dark:border-zinc-800">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isActive = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-sans transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-white dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/60'
                }`}
              >
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-xs">{lang.nativeName}</span>
                  <span className="text-[10px] opacity-75">{lang.name}</span>
                </div>
                {isActive && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-sans font-medium transition-all shadow-xs bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 cursor-pointer"
        aria-expanded={isOpen}
        aria-label="Select Language"
        title="Change application language (13 languages supported)"
      >
        <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span className="font-semibold">{currentLanguageInfo.nativeName}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-64 rounded-2xl bg-white/98 dark:bg-zinc-900/98 border border-slate-200 dark:border-zinc-800 shadow-2xl backdrop-blur-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-zinc-800 mb-1 flex items-center justify-between">
            <span className="text-[10.5px] font-mono uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400">
              Select Language (13)
            </span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-bold">
              Real i18n
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isActive = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900/60'
                      : 'hover:bg-slate-100/80 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="text-sm font-sans font-semibold text-slate-900 dark:text-white">
                      {lang.nativeName}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                      ({lang.name})
                    </span>
                    {lang.isRTL && (
                      <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                        RTL
                      </span>
                    )}
                  </div>
                  {isActive && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
