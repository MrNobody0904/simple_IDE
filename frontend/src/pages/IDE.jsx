import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Toolbar from '../components/Toolbar';
import CodeEditor from '../components/CodeEditor';
import InputPanel from '../components/InputPanel';
import OutputPanel from '../components/OutputPanel';
import { executeCode, DEFAULT_TEMPLATES } from '../services/api';

const STORAGE_KEY_PREFIX = 'oa_ide_code_';
const STORAGE_INPUT_KEY = 'oa_ide_input';
const STORAGE_LANG_KEY = 'oa_ide_lang';
const STORAGE_FONT_KEY = 'oa_ide_fontsize';
const STORAGE_THEME_KEY = 'oa_ide_theme';
const STORAGE_RESTRICTED_KEY = 'oa_restricted_mode';
const STORAGE_BLOCKED_LOG_KEY = 'oa_blocked_paste_log';

export default function IDE() {
  // 1. Language state (C++17 default)
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem(STORAGE_LANG_KEY) || 'cpp';
  });

  // 2. Code state per language
  const [code, setCode] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${language}`);
    return saved !== null ? saved : (DEFAULT_TEMPLATES[language] || DEFAULT_TEMPLATES.cpp);
  });

  // 3. Custom input state (Unrestricted)
  const [customInput, setCustomInput] = useState(() => {
    return localStorage.getItem(STORAGE_INPUT_KEY) || '';
  });

  // 4. Editor settings
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem(STORAGE_FONT_KEY);
    return saved ? Number(saved) : 14;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_THEME_KEY) || 'dark';
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  const [notification, setNotification] = useState('');

  // 5. Anti-Paste Protection (Active by default on editor pad; no visual button on site)
  const [restrictedMode, setRestrictedMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_RESTRICTED_KEY);
    return saved !== null ? saved === 'true' : true; // Always ON by default
  });

  const [blockedPasteLog, setBlockedPasteLog] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BLOCKED_LOG_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [pasteBlockedToast, setPasteBlockedToast] = useState(false);
  const lastToastTimeRef = useRef(0);

  // 6. Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [outputData, setOutputData] = useState(null);
  const [activeOutputTab, setActiveOutputTab] = useState('output');

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_THEME_KEY, theme);
  }, [theme]);

  // Save Restricted Mode setting
  useEffect(() => {
    localStorage.setItem(STORAGE_RESTRICTED_KEY, restrictedMode.toString());
  }, [restrictedMode]);

  // Save Blocked Paste Log
  useEffect(() => {
    localStorage.setItem(STORAGE_BLOCKED_LOG_KEY, JSON.stringify(blockedPasteLog.slice(0, 50)));
  }, [blockedPasteLog]);

  // Save code to localStorage per language
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${language}`, code);
  }, [code, language]);

  // Save custom input
  useEffect(() => {
    localStorage.setItem(STORAGE_INPUT_KEY, customInput);
  }, [customInput]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 2500);
  };

  // Intercept blocked paste: show non-intrusive toast & log attempt
  const handlePasteBlocked = useCallback((method = 'External Paste') => {
    const now = Date.now();
    const entry = {
      method,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setBlockedPasteLog((prev) => [entry, ...prev].slice(0, 50));

    // Toast with 1.6s cooldown
    if (now - lastToastTimeRef.current > 1600) {
      lastToastTimeRef.current = now;
      setPasteBlockedToast(true);
      setTimeout(() => setPasteBlockedToast(false), 2600);
    }
  }, []);

  // Language switch
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem(STORAGE_LANG_KEY, newLang);

    const savedCode = localStorage.getItem(`${STORAGE_KEY_PREFIX}${newLang}`);
    setCode(savedCode !== null ? savedCode : (DEFAULT_TEMPLATES[newLang] || ''));
  };

  // Reset code to default starter template
  const handleResetCode = () => {
    const template = DEFAULT_TEMPLATES[language] || '';
    if (window.confirm('Reset code to default template? Any unsaved edits for this language will be overwritten.')) {
      setCode(template);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${language}`, template);
      showNotification('Code reset to default template');
    }
  };

  // Copy entire code (Ctrl+C allowed)
  const handleCopyAllCode = () => {
    navigator.clipboard.writeText(code);
    showNotification('Code copied to clipboard');
  };

  // Manual save code
  const handleSaveCode = () => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${language}`, code);
    showNotification('Code saved locally');
  };

  // Full-screen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  // Run Code execution handler (Ctrl + Enter)
  const handleRunCode = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    setActiveOutputTab('output');

    try {
      const result = await executeCode(code, language, customInput);
      setOutputData(result);

      if (result.status === 'compilation_error' || result.status === 'runtime_error' || (!result.stdout && (result.compile_output || result.stderr))) {
        setActiveOutputTab('error');
      } else {
        setActiveOutputTab('output');
      }
    } catch (err) {
      setOutputData({
        status: 'error',
        stdout: '',
        stderr: err.message || 'Execution failed',
        time: '0.00s',
        memory: 0,
        exitCode: 1,
        statusDescription: 'Run Failed'
      });
      setActiveOutputTab('error');
    } finally {
      setIsRunning(false);
    }
  }, [code, language, customInput, isRunning]);

  // Expose toggle programmatically for testing Criteria #8 without showing a button on the UI:
  // Can be triggered via Ctrl + Alt + P or window.toggleRestrictedMode()
  useEffect(() => {
    window.toggleRestrictedMode = (state) => {
      setRestrictedMode((prev) => {
        const next = typeof state === 'boolean' ? state : !prev;
        showNotification(`Restricted Mode: ${next ? 'ON (Pasting Blocked)' : 'OFF (Paste Enabled)'}`);
        return next;
      });
    };
    return () => {
      delete window.toggleRestrictedMode;
    };
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. Ctrl + Enter = Run Code
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
        return;
      }

      // 2. Ctrl + Shift + Enter = Run / Submit Code
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
        return;
      }

      // 3. Ctrl + S = Save Code
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveCode();
        return;
      }

      // 4. Ctrl + Alt + P = Dev shortcut to toggle Restricted Mode (Criterion #8 test)
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setRestrictedMode((prev) => {
          const next = !prev;
          showNotification(`Restricted Mode: ${next ? 'ON (Pasting Blocked)' : 'OFF (Paste Enabled)'}`);
          return next;
        });
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRunCode, handleSaveCode]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0B0D0F] text-[#F4F4F5]">
      {/* Top Navigation - Clean: NO Anti-Paste Button */}
      <Toolbar
        language={language}
        onLanguageChange={handleLanguageChange}
        fontSize={fontSize}
        onFontSizeChange={(size) => {
          setFontSize(size);
          localStorage.setItem(STORAGE_FONT_KEY, size.toString());
        }}
        onResetCode={handleResetCode}
        onCopyAllCode={handleCopyAllCode}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        onRunCode={handleRunCode}
        isRunning={isRunning}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
      />

      {/* Floating Notification */}
      {notification && (
        <div className="absolute top-16 right-6 z-50 bg-[#171B20] border border-[#C6F432] text-[#C6F432] text-xs font-semibold px-3 py-1.5 rounded shadow-lg flex items-center gap-1.5 animate-fade-in select-none">
          <span>✓</span>
          <span>{notification}</span>
        </div>
      )}

      {/* External Paste Blocked Toast (When user attempts to paste into editor pad) */}
      {pasteBlockedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#171B20] border border-amber-500/70 text-amber-300 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2.5 select-none animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="p-1 rounded bg-amber-500/20 text-amber-400">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <span>External code pasting is disabled in OA Assessment Mode.</span>
        </div>
      )}

      {/* Main Workspace (Monaco Editor ~70%, Custom Input & Output ~30%) */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-2 gap-2">
        {/* Editor Section: ~70% width */}
        <section className="flex-[7] min-h-[50vh] md:min-h-0 flex flex-col border border-[#292D34] rounded overflow-hidden bg-[#111418]">
          <CodeEditor
            code={code}
            onChange={setCode}
            language={language}
            fontSize={fontSize}
            theme={theme}
            restrictedMode={restrictedMode}
            onPasteBlocked={handlePasteBlocked}
            onRunCode={handleRunCode}
            onSaveCode={handleSaveCode}
          />
        </section>

        {/* Side Panel: Custom Input & Output Section: ~30% width */}
        <section className="flex-[3.5] min-w-[320px] max-w-full flex flex-col gap-2 overflow-y-auto">
          {/* Custom Input Section (Unrestricted: candidates can paste test cases normally) */}
          <InputPanel
            input={customInput}
            onChange={setCustomInput}
            onClear={() => setCustomInput('')}
            isCollapsed={isInputCollapsed}
            onToggleCollapse={() => setIsInputCollapsed((prev) => !prev)}
          />

          {/* Output Section */}
          <OutputPanel
            outputData={outputData}
            isRunning={isRunning}
            activeTab={activeOutputTab}
            onTabChange={setActiveOutputTab}
          />
        </section>
      </main>

      {/* Bottom Footer Status Bar */}
      <footer className="h-7 border-t border-[#292D34] bg-[#171B20] px-4 flex items-center justify-between text-[11px] text-[#9299A3] select-none font-mono">
        {/* Left Footer: Copyright & Engine Status */}
        <div className="flex items-center space-x-3">
          <span className="text-[#9299A3]">
            © 2026 OA IDE. All rights reserved.
          </span>
          <span className="hidden md:inline text-[#292D34]">|</span>
          <span className="hidden md:flex items-center gap-1 text-[#9299A3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6F432]" />
            <span>Judge0 Connected</span>
          </span>
          <span className="hidden lg:inline text-[#292D34]">|</span>
          <span className="hidden lg:inline">Lines: {code.split('\n').length}</span>
        </div>

        {/* Right Footer: Created by OG yng.pranav4 ↗ */}
        <div className="flex items-center space-x-4">
          <Link
            to="/creator"
            className="group relative inline-flex items-center gap-1 text-xs text-[#9299A3] hover:text-[#C6F432] transition-colors cursor-pointer py-0.5"
            title="Explore Creator Experience"
          >
            <span>Created by OG <strong className="font-bold text-[#F4F4F5] group-hover:text-[#C6F432] transition-colors">yng.pranav4</strong> ↗</span>
            <span className="absolute bottom-0 left-0 w-0 h-px bg-[#C6F432] transition-all duration-300 group-hover:w-full" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
