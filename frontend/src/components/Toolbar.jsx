import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  Moon, 
  Sun, 
  Loader2 
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';

export default function Toolbar({
  language,
  onLanguageChange,
  fontSize,
  onFontSizeChange,
  onResetCode,
  onCopyAllCode,
  theme,
  onToggleTheme,
  onRunCode,
  isRunning,
  onToggleFullscreen,
  isFullscreen
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyAllCode();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-14 border-b border-[#292D34] bg-[#171B20] px-4 flex items-center justify-between select-none">
      {/* Left: Branding & Subtitle */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {/* Official OA Logo */}
          <div className="h-9 px-1.5 py-0.5 rounded flex items-center bg-[#080B0A] border border-[#292D34] shadow-sm">
            <img
              src="/oa-logo.jpg"
              alt="OA Logo"
              className="h-6 w-auto object-contain select-none"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wide text-[#F4F4F5] flex items-center gap-1.5">
              OA IDE
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#292D34] text-[#9299A3]">
                Compiler
              </span>
            </span>
          </div>
        </div>

        <div className="h-5 w-px bg-[#292D34] mx-1 hidden sm:block" />

        <span className="text-xs text-[#9299A3] hidden md:inline font-medium">
          Online Compiler
        </span>
      </div>

      {/* Center: Language & Editor Controls */}
      <div className="flex items-center space-x-2">
        {/* Language Selector */}
        <LanguageSelector
          language={language}
          onLanguageChange={onLanguageChange}
          disabled={isRunning}
        />

        {/* Font size control */}
        <div className="relative hidden sm:block">
          <select
            value={fontSize}
            onChange={(e) => onFontSizeChange(Number(e.target.value))}
            className="appearance-none bg-[#111418] text-[#9299A3] hover:text-[#F4F4F5] text-xs font-semibold border border-[#292D34] rounded px-2.5 py-1.5 pr-6 focus:outline-none focus:border-[#C6F432] cursor-pointer hover:border-[#40454f] transition-colors"
            title="Editor Font Size"
          >
            <option value={12}>12 px</option>
            <option value={14}>14 px</option>
            <option value={16}>16 px</option>
            <option value={18}>18 px</option>
            <option value={20}>20 px</option>
          </select>
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#9299A3] text-[9px]">
            ▼
          </div>
        </div>

        {/* Copy Entire Code Button (Ctrl+C / Copy allowed) */}
        <button
          onClick={handleCopy}
          className="p-1.5 text-[#9299A3] hover:text-[#F4F4F5] hover:bg-[#292D34] rounded border border-transparent hover:border-[#292D34] transition-colors flex items-center gap-1 text-xs"
          title="Copy Code to Clipboard (Ctrl+C)"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#C6F432]" /> : <Copy className="w-3.5 h-3.5 text-[#9299A3]" />}
          <span className="hidden xl:inline">{copied ? 'Copied' : 'Copy'}</span>
        </button>

        {/* Reset Code Button */}
        <button
          onClick={onResetCode}
          disabled={isRunning}
          className="p-1.5 text-[#9299A3] hover:text-[#F4F4F5] hover:bg-[#292D34] rounded border border-transparent hover:border-[#292D34] transition-colors flex items-center gap-1 text-xs disabled:opacity-50"
          title="Reset Code to Default Template"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Reset</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 text-[#9299A3] hover:text-[#F4F4F5] hover:bg-[#292D34] rounded border border-transparent hover:border-[#292D34] transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Full-screen Button */}
        <button
          onClick={onToggleFullscreen}
          className="p-1.5 text-[#9299A3] hover:text-[#F4F4F5] hover:bg-[#292D34] rounded border border-transparent hover:border-[#292D34] transition-colors hidden sm:block"
          title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Right: Run Code Button */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onRunCode}
          disabled={isRunning}
          className="flex items-center space-x-2 bg-[#C6F432] hover:bg-[#b4e326] active:scale-[0.98] text-[#0B0D0F] font-bold text-xs uppercase px-4 py-2 rounded shadow-md shadow-[#C6F432]/20 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed select-none"
          title="Run Code with Custom Input (Ctrl + Enter)"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0B0D0F]" />
              <span>Executing...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-[#0B0D0F] text-[#0B0D0F]" />
              <span>▶ RUN CODE</span>
              <span className="hidden md:inline text-[10px] font-mono text-[#0B0D0F]/70 ml-1">
                (Ctrl+↵)
              </span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
