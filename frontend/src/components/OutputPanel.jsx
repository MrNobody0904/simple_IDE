import React, { useState } from 'react';
import { 
  Terminal, 
  AlertTriangle, 
  Info, 
  Copy, 
  Check, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  Loader2 
} from 'lucide-react';

export default function OutputPanel({
  outputData,
  isRunning = false,
  activeTab = 'output',
  onTabChange
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    let text = '';
    if (activeTab === 'output') {
      text = outputData?.stdout || '';
    } else if (activeTab === 'error') {
      text = outputData?.compile_output || outputData?.stderr || '';
    } else {
      text = JSON.stringify(outputData, null, 2);
    }

    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadge = () => {
    if (isRunning) {
      return (
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-[#C6F432]/10 text-[#C6F432] border border-[#C6F432]/30">
          <Loader2 className="w-3 h-3 animate-spin" />
          Executing code...
        </span>
      );
    }

    if (!outputData) {
      return (
        <span className="text-[11px] text-[#9299A3] font-medium">
          Ready
        </span>
      );
    }

    const { status, exitCode, statusDescription } = outputData;

    if (status === 'success' && exitCode === 0) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#C6F432]/15 text-[#C6F432] border border-[#C6F432]/40">
          <CheckCircle2 className="w-3 h-3" />
          {statusDescription || 'Success (Exit 0)'}
        </span>
      );
    }

    if (status === 'compilation_error') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
          <XCircle className="w-3 h-3" />
          Compilation Error
        </span>
      );
    }

    if (status === 'time_limit_exceeded') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-3 h-3" />
          Time Limit Exceeded
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
        <XCircle className="w-3 h-3" />
        {statusDescription || `Error (Exit ${exitCode ?? 1})`}
      </span>
    );
  };

  const hasErrors = Boolean(outputData?.compile_output || outputData?.stderr);

  return (
    <div className="flex flex-col border border-[#292D34] rounded bg-[#171B20] overflow-hidden flex-1 min-h-[170px]">
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#171B20] border-b border-[#292D34] select-none">
        <div className="flex items-center space-x-1">
          {/* Tab 1: Output */}
          <button
            onClick={() => onTabChange('output')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold tracking-wide transition-colors ${
              activeTab === 'output'
                ? 'bg-[#111418] text-[#C6F432] border border-[#292D34]'
                : 'text-[#9299A3] hover:text-[#F4F4F5] hover:bg-[#111418]/60'
            }`}
          >
            <Terminal className="w-3 h-3" />
            <span>Output</span>
          </button>

          {/* Tab 2: Error */}
          <button
            onClick={() => onTabChange('error')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold tracking-wide transition-colors relative ${
              activeTab === 'error'
                ? 'bg-[#111418] text-red-400 border border-[#292D34]'
                : 'text-[#9299A3] hover:text-[#F4F4F5] hover:bg-[#111418]/60'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Error</span>
            {hasErrors && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>

          {/* Tab 3: Execution Details */}
          <button
            onClick={() => onTabChange('details')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold tracking-wide transition-colors ${
              activeTab === 'details'
                ? 'bg-[#111418] text-[#F4F4F5] border border-[#292D34]'
                : 'text-[#9299A3] hover:text-[#F4F4F5] hover:bg-[#111418]/60'
            }`}
          >
            <Info className="w-3 h-3" />
            <span>Execution Details</span>
          </button>
        </div>

        {/* Right Status Badge & Copy */}
        <div className="flex items-center space-x-2">
          {getStatusBadge()}

          <button
            onClick={handleCopy}
            className="p-1 text-[#9299A3] hover:text-[#F4F4F5] rounded hover:bg-[#292D34] transition-colors"
            title="Copy Current Tab"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#C6F432]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      {outputData && !isRunning && (
        <div className="px-3 py-1 bg-[#111418] border-b border-[#292D34] flex items-center justify-between text-[11px] text-[#9299A3] font-mono">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#C6F432]" />
              Time: <strong className="text-[#F4F4F5]">{outputData.time || '0.00s'}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-[#C6F432]" />
              Memory: <strong className="text-[#F4F4F5]">{outputData.memory || 'N/A'}</strong>
            </span>
          </div>
          <div>
            Exit Code: <strong className={outputData.exitCode === 0 ? 'text-[#C6F432]' : 'text-red-400'}>{outputData.exitCode ?? 0}</strong>
          </div>
        </div>
      )}

      {/* Tab Contents */}
      <div className="flex-1 bg-[#111418] p-3 overflow-auto font-mono text-xs select-text">
        {isRunning ? (
          <div className="flex flex-col items-center justify-center h-full text-[#9299A3] py-8 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#C6F432]" />
            <span className="text-sm font-medium text-[#F4F4F5]">Executing code in isolated environment...</span>
            <span className="text-[11px] text-[#9299A3]">Submitting to Judge0 sandbox</span>
          </div>
        ) : !outputData ? (
          <div className="text-[#9299A3]/60 italic py-4">
            Press <strong className="text-[#C6F432] not-italic">▶ RUN CODE</strong> or <kbd className="px-1.5 py-0.5 rounded bg-[#292D34] text-[#F4F4F5] not-italic">Ctrl + Enter</kbd> to execute your code.
          </div>
        ) : activeTab === 'output' ? (
          /* Output Tab */
          outputData.stdout ? (
            <pre className="text-[#F4F4F5] whitespace-pre-wrap break-words leading-relaxed">
              {outputData.stdout}
            </pre>
          ) : outputData.compile_output || outputData.stderr ? (
            <div className="text-red-400/90 space-y-2">
              <p className="font-semibold text-xs flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                Execution produced errors instead of standard output.
              </p>
              <pre className="text-red-300/80 whitespace-pre-wrap break-words bg-red-950/20 p-2 rounded border border-red-900/30">
                {outputData.compile_output || outputData.stderr}
              </pre>
            </div>
          ) : (
            <div className="text-[#9299A3] italic">
              Program completed successfully with no standard output.
            </div>
          )
        ) : activeTab === 'error' ? (
          /* Error Tab */
          hasErrors ? (
            <div className="space-y-3">
              {outputData.compile_output && (
                <div>
                  <div className="text-red-400 font-bold mb-1">Compilation Output:</div>
                  <pre className="text-red-300 whitespace-pre-wrap break-words bg-red-950/20 p-2.5 rounded border border-red-900/40">
                    {outputData.compile_output}
                  </pre>
                </div>
              )}
              {outputData.stderr && (
                <div>
                  <div className="text-amber-400 font-bold mb-1">Standard Error (stderr):</div>
                  <pre className="text-amber-300 whitespace-pre-wrap break-words bg-amber-950/20 p-2.5 rounded border border-amber-900/40">
                    {outputData.stderr}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="text-[#9299A3] italic">
              No compilation or runtime errors reported.
            </div>
          )
        ) : (
          /* Execution Details Tab */
          <div className="space-y-2 text-[#F4F4F5]">
            <div className="grid grid-cols-2 gap-2 text-xs border border-[#292D34] rounded p-2 bg-[#171B20]/50">
              <div>
                <span className="text-[#9299A3]">Status:</span>{' '}
                <span className="font-semibold">{outputData.statusDescription || outputData.status}</span>
              </div>
              <div>
                <span className="text-[#9299A3]">Exit Code:</span>{' '}
                <span className="font-semibold">{outputData.exitCode ?? 0}</span>
              </div>
              <div>
                <span className="text-[#9299A3]">Wall Time:</span>{' '}
                <span className="font-semibold">{outputData.time || '0.00s'}</span>
              </div>
              <div>
                <span className="text-[#9299A3]">Memory:</span>{' '}
                <span className="font-semibold">{outputData.memory || 'N/A'}</span>
              </div>
            </div>

            {outputData.message && (
              <div className="mt-2 p-2 rounded bg-[#292D34]/50 text-xs">
                <span className="text-[#9299A3] block font-bold mb-1">System Message:</span>
                <span>{outputData.message}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
