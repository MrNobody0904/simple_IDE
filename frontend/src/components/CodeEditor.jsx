import React, { useRef, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';

export default function CodeEditor({
  code,
  onChange,
  language = 'cpp',
  fontSize = 14,
  theme = 'dark',
  restrictedMode = true,
  onPasteBlocked,
  onRunCode,
  onSaveCode
}) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const restrictedModeRef = useRef(restrictedMode);

  // Keep restrictedModeRef updated
  useEffect(() => {
    restrictedModeRef.current = restrictedMode;
  }, [restrictedMode]);

  const handleEditorWillMount = (monaco) => {
    monacoRef.current = monaco;

    // OA Dark Theme
    monaco.editor.defineTheme('oa-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '626B77', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'C6F432', fontStyle: 'bold' },
        { token: 'identifier', foreground: 'F4F4F5' },
        { token: 'string', foreground: '86E18B' },
        { token: 'number', foreground: 'F7A258' },
        { token: 'type', foreground: '64B5F6' },
        { token: 'delimiter', foreground: '9299A3' },
        { token: 'operator', foreground: 'C6F432' }
      ],
      colors: {
        'editor.background': '#111418',
        'editor.foreground': '#F4F4F5',
        'editorCursor.foreground': '#C6F432',
        'editor.lineHighlightBackground': '#171B20',
        'editorLineNumber.foreground': '#4E5562',
        'editorLineNumber.activeForeground': '#C6F432',
        'editor.selectionBackground': '#253518',
        'editor.inactiveSelectionBackground': '#1B2414',
        'editorBracketMatch.background': '#292D34',
        'editorBracketMatch.border': '#C6F432',
        'editorGutter.background': '#111418',
        'editorWidget.background': '#171B20',
        'editorWidget.border': '#292D34',
        'editorSuggestWidget.background': '#171B20',
        'editorSuggestWidget.border': '#292D34',
        'editorSuggestWidget.foreground': '#F4F4F5',
        'editorSuggestWidget.selectedBackground': '#292D34'
      }
    });

    // OA Light Theme
    monaco.editor.defineTheme('oa-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '8C95A6', fontStyle: 'italic' },
        { token: 'keyword', foreground: '1E6B23', fontStyle: 'bold' },
        { token: 'identifier', foreground: '111418' },
        { token: 'string', foreground: '0D7D4D' },
        { token: 'number', foreground: 'C25D00' },
        { token: 'type', foreground: '026AA7' }
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#111418',
        'editorCursor.foreground': '#2E7D32',
        'editor.lineHighlightBackground': '#F3F4F6',
        'editorLineNumber.foreground': '#9E9E9E',
        'editorLineNumber.activeForeground': '#2E7D32',
        'editor.selectionBackground': '#C8E6C9',
        'editorBracketMatch.border': '#2E7D32'
      }
    });
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Apply active theme
    monaco.editor.setTheme(theme === 'dark' ? 'oa-dark' : 'oa-light');

    // 1. Intercept Monaco internal trigger for clipboard paste (context menu item)
    const originalTrigger = editor.trigger.bind(editor);
    editor.trigger = (source, handlerId, payload) => {
      if (
        restrictedModeRef.current &&
        (handlerId === 'editor.action.clipboardPasteAction' ||
         handlerId === 'paste' ||
         handlerId?.toLowerCase().includes('paste'))
      ) {
        if (onPasteBlocked) onPasteBlocked('Context Menu Paste');
        return;
      }
      return originalTrigger(source, handlerId, payload);
    };

    // 2. Intercept Monaco KeyMod.CtrlCmd | KeyCode.KeyV keybinding
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      if (restrictedModeRef.current) {
        if (onPasteBlocked) onPasteBlocked('Keyboard Shortcut (Ctrl+V)');
      } else {
        originalTrigger('keyboard', 'editor.action.clipboardPasteAction', null);
      }
    });

    // 3. Fallback Safety Net: onDidPaste
    // If any paste operation somehow bypassed the event listeners, immediately undo it!
    editor.onDidPaste(() => {
      if (restrictedModeRef.current) {
        originalTrigger('anti-paste', 'undo', null);
        if (onPasteBlocked) onPasteBlocked('Clipboard Event');
      }
    });

    // 4. Ctrl + Enter = Run Code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRunCode) onRunCode();
    });

    // 5. Ctrl + S = Save Code Locally
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onSaveCode) onSaveCode();
    });

    // Focus editor
    editor.focus();
  };

  // Synchronize theme changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === 'dark' ? 'oa-dark' : 'oa-light');
    }
  }, [theme]);

  // DOM Event Listeners attached directly to the editor container in capturing phase (useCapture: true)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // 1. Intercept DOM 'paste' event (fires when pasting via context menu or browser paste)
    const handlePaste = (e) => {
      if (restrictedModeRef.current) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (onPasteBlocked) onPasteBlocked('Right-Click / Clipboard Paste');
      }
    };

    // 2. Intercept keyboard shortcuts in capturing phase: Ctrl+V, Cmd+V, Ctrl+Shift+V, Shift+Insert
    const handleKeyDown = (e) => {
      if (!restrictedModeRef.current) return;

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isKeyV = e.key === 'v' || e.key === 'V' || e.code === 'KeyV' || e.keyCode === 86;
      const isShiftInsert = e.shiftKey && (e.key === 'Insert' || e.code === 'Numpad0' || e.keyCode === 45);

      if ((isCtrlOrCmd && isKeyV) || isShiftInsert) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (onPasteBlocked) onPasteBlocked(isShiftInsert ? 'Shift+Insert' : 'Keyboard Shortcut (Ctrl+V)');
      }
    };

    // 3. Intercept Drag-and-Drop text into editor
    const handleDragOver = (e) => {
      if (restrictedModeRef.current) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'none';
      }
    };

    const handleDrop = (e) => {
      if (restrictedModeRef.current) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (onPasteBlocked) onPasteBlocked('Drag and Drop');
      }
    };

    // Attach with capture: true so we intercept events BEFORE Monaco processes them
    el.addEventListener('paste', handlePaste, true);
    el.addEventListener('keydown', handleKeyDown, true);
    el.addEventListener('dragover', handleDragOver, true);
    el.addEventListener('dragenter', handleDragOver, true);
    el.addEventListener('drop', handleDrop, true);

    return () => {
      el.removeEventListener('paste', handlePaste, true);
      el.removeEventListener('keydown', handleKeyDown, true);
      el.removeEventListener('dragover', handleDragOver, true);
      el.removeEventListener('dragenter', handleDragOver, true);
      el.removeEventListener('drop', handleDrop, true);
    };
  }, [onPasteBlocked]);

  const getMonacoLanguage = (lang) => {
    switch (lang) {
      case 'cpp':
      case 'cpp20':
        return 'cpp';
      case 'python':
        return 'python';
      case 'java':
        return 'java';
      case 'c':
        return 'c';
      default:
        return 'cpp';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-[#111418]"
    >
      <MonacoEditor
        height="100%"
        width="100%"
        language={getMonacoLanguage(language)}
        value={code}
        onChange={(val) => onChange(val || '')}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        theme={theme === 'dark' ? 'oa-dark' : 'oa-light'}
        options={{
          fontSize: fontSize,
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
          fontLigatures: true,
          lineNumbers: 'on',
          lineNumbersMinChars: 3,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: true,
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          matchBrackets: 'always',
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          autoIndent: 'full',
          formatOnPaste: false,
          formatOnType: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          contextmenu: true,
          copyWithSyntaxHighlighting: true,
          padding: { top: 12, bottom: 12 },
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true
        }}
        loading={
          <div className="flex items-center justify-center h-full text-[#9299A3] text-xs font-mono bg-[#111418]">
            Loading Monaco Editor...
          </div>
        }
      />
    </div>
  );
}
