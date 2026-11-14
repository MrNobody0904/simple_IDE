import React from 'react';
import { LANGUAGES } from '../services/api';

export default function LanguageSelector({ language, onLanguageChange, disabled = false }) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
        disabled={disabled}
        className="appearance-none bg-[#111418] text-[#F4F4F5] text-xs font-semibold border border-[#292D34] rounded px-3 py-1.5 pr-7 focus:outline-none focus:border-[#C6F432] cursor-pointer hover:border-[#40454f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none"
        title="Select Programming Language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.id} value={lang.id} className="bg-[#171B20] text-[#F4F4F5]">
            {lang.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9299A3] text-[9px]">
        ▼
      </div>
    </div>
  );
}
