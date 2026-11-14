import React from 'react';
import { Trash2, ChevronDown, ChevronUp, FileText } from 'lucide-react';

const SAMPLE_INPUT = `5
1 2
3 4
5 6
7 8
9 10`;

export default function InputPanel({
  input,
  onChange,
  onClear,
  isCollapsed = false,
  onToggleCollapse
}) {
  const handleLoadSample = () => {
    onChange(SAMPLE_INPUT);
  };

  return (
    <div className="flex flex-col border border-[#292D34] rounded bg-[#171B20] overflow-hidden transition-all duration-150">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#171B20] border-b border-[#292D34] select-none">
        <div 
          onClick={onToggleCollapse}
          className="flex items-center space-x-2 cursor-pointer text-xs font-bold tracking-wider text-[#F4F4F5] hover:text-[#C6F432] transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-[#C6F432]" />
          <span>CUSTOM INPUT</span>
          <span className="text-[10px] text-[#9299A3] font-normal lowercase">
            ({input ? `${input.split('\n').length} lines` : 'empty'})
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {/* Sample testcase button */}
          <button
            onClick={handleLoadSample}
            className="text-[11px] text-[#9299A3] hover:text-[#F4F4F5] px-2 py-0.5 rounded hover:bg-[#292D34] transition-colors"
            title="Load sample input (5 pairs)"
          >
            Sample
          </button>

          {/* Clear input button */}
          {input && (
            <button
              onClick={onClear}
              className="p-1 text-[#9299A3] hover:text-red-400 rounded hover:bg-[#292D34] transition-colors"
              title="Clear custom input"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Expand/collapse button */}
          <button
            onClick={onToggleCollapse}
            className="p-1 text-[#9299A3] hover:text-[#F4F4F5] rounded hover:bg-[#292D34] transition-colors"
            title={isCollapsed ? 'Expand Custom Input' : 'Collapse Custom Input'}
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Textarea Body */}
      {!isCollapsed && (
        <div className="relative p-2 bg-[#111418]">
          <textarea
            value={input}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Paste your input test cases here...\n\nExample:\n5\n1 2\n3 4\n5 6\n7 8\n9 10`}
            rows={5}
            spellCheck={false}
            className="w-full bg-[#111418] text-[#F4F4F5] font-mono text-xs p-2 rounded border border-[#292D34] focus:border-[#C6F432] focus:outline-none resize-y placeholder:text-[#9299A3]/50 leading-relaxed min-h-[90px]"
          />
        </div>
      )}
    </div>
  );
}
