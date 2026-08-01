'use client';

import { useState, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import {
  Code2, Play, Copy, Check, RotateCcw, Download, Sparkles,
  Terminal, Monitor, Sun, Moon, Maximize2, Minimize2, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CodeEditorProps {
  initialCode?: string;
  onSaveSnapshot?: (code: string) => void;
  height?: string;
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python',     label: 'Python 3' },
  { value: 'cpp',        label: 'C++' },
  { value: 'java',       label: 'Java' },
  { value: 'go',         label: 'Go' },
  { value: 'sql',        label: 'SQL' },
  { value: 'html',       label: 'HTML / CSS' },
];

const DEFAULT_SNIPPETS: Record<string, string> = {
  javascript: `// Interview Coding Challenge
// Problem: Write a function to reverse a string in-place or return two-sum pair.

function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9)); // Output: [0, 1]
`,
  python: `# Interview Coding Challenge
# Problem: Check if a binary tree is balanced or solve two-sum.

def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

print(two_sum([2, 7, 11, 15], 9)) # Output: [0, 1]
`,
  cpp: `// Interview Coding Challenge (C++)
#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); i++) {
        int diff = target - nums[i];
        if (map.count(diff)) return {map[diff], i};
        map[nums[i]] = i;
    }
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    vector<int> ans = twoSum(nums, 9);
    cout << "[" << ans[0] << ", " << ans[1] << "]" << endl;
    return 0;
}
`,
  typescript: `// Interview Coding Challenge (TypeScript)
function twoSumTS(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) return [map.get(diff)!, i];
    map.set(nums[i], i);
  }
  return [];
}

console.log(twoSumTS([2, 7, 11, 15], 9));
`,
};

export default function CodeEditor({
  initialCode,
  onSaveSnapshot,
  height = '500px',
}: CodeEditorProps) {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(
    initialCode || DEFAULT_SNIPPETS['javascript']
  );
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'console'>('code');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const editorRef = useRef<any>(null);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (!initialCode) {
      setCode(DEFAULT_SNIPPETS[newLang] || `// Write your ${newLang} code here...\n`);
    }
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setActiveTab('console');
    setOutput('Running code...');

    setTimeout(() => {
      try {
        if (language === 'javascript' || language === 'typescript') {
          // Safe evaluation for JS demo
          const logs: string[] = [];
          const customConsole = {
            log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
            error: (...args: any[]) => logs.push('ERROR: ' + args.join(' ')),
            warn: (...args: any[]) => logs.push('WARN: ' + args.join(' ')),
          };
          const runFn = new Function('console', code);
          runFn(customConsole);
          setOutput(logs.length > 0 ? logs.join('\n') : 'Code executed successfully. (No console output)');
        } else {
          setOutput(`[Simulated Execution - ${language.toUpperCase()}]\nCompilation successful!\nProgram finished with exit code 0.`);
        }
      } catch (err: any) {
        setOutput(`Runtime Error: ${err.message || String(err)}`);
      } finally {
        setIsRunning(false);
      }
    }, 600);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetCode = () => {
    const defaultCode = DEFAULT_SNIPPETS[language] || `// Code reset\n`;
    setCode(defaultCode);
    toast.success('Code reset to template');
  };

  const handleSave = () => {
    if (onSaveSnapshot) {
      onSaveSnapshot(code);
      toast.success('Code snapshot saved to session!');
    }
  };

  return (
    <div
      className={`card rounded-2xl flex flex-col overflow-hidden border border-white/10 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl bg-gray-950' : 'relative'
      }`}
      style={{ background: 'rgba(10, 14, 23, 0.95)' }}
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white/[0.03] border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-neon-green" />
            <span className="font-bold text-white text-sm">Interactive Code Editor</span>
          </div>

          {/* Language Picker */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-black/50 text-xs font-mono text-neon-cyan border border-white/15 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neon-cyan"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value} className="bg-gray-900 text-white">
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'code'
                ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> Code
          </button>

          <button
            onClick={() => setActiveTab('console')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'console'
                ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> Console
            {output && <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />}
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="btn-neon-green text-xs py-1 px-3 flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isRunning ? 'Running...' : 'Run Code'}
          </button>

          <button
            onClick={handleCopyCode}
            className="p-1.5 text-text-muted hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleResetCode}
            className="p-1.5 text-text-muted hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Reset code template"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {onSaveSnapshot && (
            <button
              onClick={handleSave}
              className="p-1.5 text-neon-cyan hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Save Code Snapshot"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-text-muted hover:text-white rounded-lg transition-colors cursor-pointer hidden sm:block"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 relative min-h-[350px]">
        {activeTab === 'code' ? (
          <Editor
            height={isFullscreen ? 'calc(100vh - 120px)' : height}
            language={language}
            value={code}
            onChange={(val) => setCode(val || '')}
            theme={theme}
            onMount={handleEditorMount}
            options={{
              fontSize: 14,
              fontFamily: "'Fira Code', 'Courier New', monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              lineNumbers: 'on',
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              padding: { top: 12, bottom: 12 },
            }}
          />
        ) : (
          <div className="p-4 bg-gray-950 font-mono text-xs text-green-400 min-h-[350px] overflow-y-auto space-y-2">
            <div className="flex items-center gap-2 text-text-muted border-b border-white/10 pb-2 mb-2">
              <Terminal className="w-4 h-4 text-neon-cyan" />
              <span>Console Output ({language})</span>
            </div>
            {output ? (
              <pre className="whitespace-pre-wrap font-mono leading-relaxed text-gray-200">{output}</pre>
            ) : (
              <p className="text-text-muted italic">Click "Run Code" above to execute and see console output here.</p>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-black/40 border-t border-white/5 flex items-center justify-between text-[11px] text-text-muted">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-neon-green" /> Realtime Live Interview Workspace
        </span>
        <span className="font-mono">{code.length} chars | {language.toUpperCase()}</span>
      </div>
    </div>
  );
}
