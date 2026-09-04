import React, { useState, useCallback, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import { PlayCircle, Terminal, Trash2, Copy, CheckCircle, Loader2 } from './Icons';
import toast from 'react-hot-toast';

// Define Pyodide types globally since we load via CDN
declare global {
  interface Window {
    loadPyodide: (config: {
      indexURL: string;
      stdout?: (text: string) => void;
      stderr?: (text: string) => void;
    }) => Promise<any>;
  }
}

interface CodeEditorProps {
  initialCode?: string;
  language?: 'javascript' | 'python' | 'html';
  onChange?: (val: string) => void;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode = '// Write your code here...',
  language = 'javascript',
  onChange,
  readOnly = false,
}) => {
  const [state, setState] = useState({
    code: initialCode,
    prevInitialCode: initialCode,
    output: [] as { id: number; text: string }[],
    isRunning: false,
    isPyodideLoading: false,
  });

  const nextId = useRef(0);

  const addLog = (msg: string) => {
    setState((s) => ({ ...s, output: [...s.output, { id: nextId.current++, text: msg }] }));
  };
  const setLogs = (msgs: string[]) => {
    setState((s) => ({ ...s, output: msgs.map((text) => ({ id: nextId.current++, text })) }));
  };
  const clearLogs = () => setState((s) => ({ ...s, output: [] }));

  // Pyodide State
  const pyodideRef = useRef<any>(null);

  // Sync local state when initialCode changes
  if (initialCode !== state.prevInitialCode) {
    setState((s) => ({ ...s, prevInitialCode: initialCode, code: initialCode }));
  }

  // Determine extension based on language
  const getExtension = () => {
    switch (language) {
      case 'python':
        return python();
      case 'html':
        return html();
      default:
        return javascript({ jsx: true });
    }
  };

  const handleChange = useCallback(
    (val: string) => {
      setState((s) => ({ ...s, code: val }));
      if (onChange) onChange(val);
    },
    [onChange]
  );

  // --- PYTHON ENGINE ---
  const initPyodide = async () => {
    if (pyodideRef.current) return pyodideRef.current;

    setState((s) => ({ ...s, isPyodideLoading: true }));
    addLog('> Initializing Python Engine...');

    try {
      if (!window.loadPyodide) {
        throw new Error('Pyodide script not loaded. Please refresh.');
      }

      const pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
      });

      // Redirect stdout
      pyodide.setStdout({
        batched: (msg: string) => {
          addLog(msg);
        },
      });

      // Redirect stderr
      pyodide.setStderr({
        batched: (msg: string) => {
          // Filter out internal Pyodide warnings if needed
          addLog(`Error: ${msg}`);
        },
      });

      pyodideRef.current = pyodide;
      addLog('> Python Ready!');
      return pyodide;
    } catch (e: any) {
      addLog(`> Failed to load Python: ${e.message}`);
      return null;
    } finally {
      setState((s) => ({ ...s, isPyodideLoading: false }));
    }
  };

  const runPython = async () => {
    let pyodide = pyodideRef.current;
    if (!pyodide) {
      pyodide = await initPyodide();
    }
    if (!pyodide) return;

    try {
      // Run the code
      // We use runPythonAsync to support top-level await
      await pyodide.runPythonAsync(state.code);
    } catch (err: any) {
      // Clean up the error message
      let msg = err.message || String(err);

      // Remove internal Pyodide traceback lines to make it less scary for students
      // Example: File "/lib/python3.11.zip/_pyodide/_base.py", line 573, in eval_code_async
      msg = msg.replace(/File "\/lib\/.*?\n/g, '');
      msg = msg.replace(/line \d+, in eval_code_async\n/g, '');
      msg = msg.replace(/PythonError: /, '');

      addLog(`⚠️ Error:\n${msg.trim()}`);
    }
  };

  const runCode = async () => {
    clearLogs(); // Clear previous run
    setState((s) => ({ ...s, isRunning: true }));

    try {
      if (language === 'javascript') {
        // Javascript Sandbox
        const logs: string[] = [];
        const originalLog = console.log;

        // Intercept console.log
        console.log = (...args) => {
          logs.push(
            args
              .map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)))
              .join(' ')
          );
        };

        try {
          const asyncCode = `(async () => { ${state.code} })()`;
          const blob = new Blob([asyncCode], { type: 'text/javascript' });
          const url = URL.createObjectURL(blob);
          await import(/* @vite-ignore */ url);
          URL.revokeObjectURL(url);
        } catch (e: any) {
          logs.push(`Error: ${e.message}`);
        }

        console.log = originalLog;
        setLogs(logs.length ? logs : ['> Code ran successfully (No output)']);
      } else if (language === 'python') {
        await runPython();
      } else {
        setLogs(['> HTML Preview is not supported in the console.']);
      }
    } catch (e: any) {
      addLog(`System Error: ${e.message}`);
    } finally {
      setState((s) => ({ ...s, isRunning: false }));
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(state.code);
    toast.success('Code copied!');
  };

  return (
    <div className="flex flex-col h-full bg-[#282c34] rounded-xl overflow-hidden border border-gray-700 shadow-xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#21252b] border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="ml-3 text-xs text-content-faint font-mono">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyCode}
            className="p-1.5 text-content-faint hover:text-white transition-colors rounded-lg hover:bg-surface/10"
            title="Copy Code"
          >
            <Copy className="h-4 w-4" />
          </button>
          {language !== 'html' && (
            <button
              type="button"
              onClick={runCode}
              disabled={state.isRunning || state.isPyodideLoading}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                state.isRunning || state.isPyodideLoading
                  ? 'bg-gray-600 dark:bg-line-strong text-content-faint cursor-wait'
                  : 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-900/20'
              }`}
            >
              {state.isRunning || state.isPyodideLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <PlayCircle className="h-3 w-3" />
              )}
              {state.isPyodideLoading ? 'Engine...' : 'Run'}
            </button>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={state.code}
          height="100%"
          theme={oneDark}
          extensions={[getExtension()]}
          onChange={handleChange}
          readOnly={readOnly}
          className="text-sm h-full"
        />
      </div>

      {/* Console Output */}
      {language !== 'html' && (
        <div className="h-1/3 min-h-[150px] border-t border-gray-700 bg-[#1e2127] flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700/50">
            <span className="text-[10px] uppercase font-bold text-content-muted flex items-center gap-1">
              <Terminal className="h-3 w-3" /> Console
            </span>
            <button
              type="button"
              onClick={clearLogs}
              className="text-[10px] text-content-muted hover:text-red-400 flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-content-faint space-y-1">
            {state.output.length === 0 ? (
              <span className="text-content-muted italic">
                No output yet. Run the code to see results.
              </span>
            ) : (
              state.output.map((line) => (
                <div
                  key={line.id}
                  className="break-words whitespace-pre-wrap border-b border-white/5 pb-0.5 mb-0.5"
                >
                  <span className="text-green-500 mr-2">&gt;</span>
                  {line.text}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
