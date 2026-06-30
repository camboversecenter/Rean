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
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Pyodide State
  const pyodideRef = useRef<any>(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);

  // Sync local state when initialCode changes
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

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
      setCode(val);
      if (onChange) onChange(val);
    },
    [onChange]
  );

  // --- PYTHON ENGINE ---
  const initPyodide = async () => {
    if (pyodideRef.current) return pyodideRef.current;

    setIsPyodideLoading(true);
    setOutput((prev) => [...prev, '> Initializing Python Engine...']);

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
          setOutput((prev) => [...prev, msg]);
        },
      });

      // Redirect stderr
      pyodide.setStderr({
        batched: (msg: string) => {
          // Filter out internal Pyodide warnings if needed
          setOutput((prev) => [...prev, `Error: ${msg}`]);
        },
      });

      pyodideRef.current = pyodide;
      setOutput((prev) => [...prev, '> Python Ready!']);
      return pyodide;
    } catch (e: any) {
      setOutput((prev) => [...prev, `> Failed to load Python: ${e.message}`]);
      return null;
    } finally {
      setIsPyodideLoading(false);
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
      await pyodide.runPythonAsync(code);
    } catch (err: any) {
      // Clean up the error message
      let msg = err.message || String(err);

      // Remove internal Pyodide traceback lines to make it less scary for students
      // Example: File "/lib/python3.11.zip/_pyodide/_base.py", line 573, in eval_code_async
      msg = msg.replace(/File "\/lib\/.*?\n/g, '');
      msg = msg.replace(/line \d+, in eval_code_async\n/g, '');
      msg = msg.replace(/PythonError: /, '');

      setOutput((prev) => [...prev, `⚠️ Error:\n${msg.trim()}`]);
    }
  };

  const runCode = async () => {
    setOutput([]); // Clear previous run
    setIsRunning(true);

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
          // Wrap in async IIFE to allow await
          const asyncCode = `(async () => { ${code} })()`;
          await eval(asyncCode);
        } catch (e: any) {
          logs.push(`Error: ${e.message}`);
        }

        console.log = originalLog;
        setOutput(logs.length ? logs : ['> Code ran successfully (No output)']);
      } else if (language === 'python') {
        await runPython();
      } else {
        setOutput(['> HTML Preview is not supported in the console.']);
      }
    } catch (e: any) {
      setOutput((prev) => [...prev, `System Error: ${e.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
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
          <span className="ml-3 text-xs text-gray-400 font-mono">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            title="Copy Code"
          >
            <Copy className="h-4 w-4" />
          </button>
          {language !== 'html' && (
            <button
              onClick={runCode}
              disabled={isRunning || isPyodideLoading}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isRunning || isPyodideLoading
                  ? 'bg-gray-600 text-gray-300 cursor-wait'
                  : 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-900/20'
              }`}
            >
              {isRunning || isPyodideLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <PlayCircle className="h-3 w-3" />
              )}
              {isPyodideLoading ? 'Engine...' : 'Run'}
            </button>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={code}
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
            <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
              <Terminal className="h-3 w-3" /> Console
            </span>
            <button
              onClick={() => setOutput([])}
              className="text-[10px] text-gray-500 hover:text-red-400 flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-gray-300 space-y-1">
            {output.length === 0 ? (
              <span className="text-gray-600 italic">
                No output yet. Run the code to see results.
              </span>
            ) : (
              output.map((line, idx) => (
                <div
                  key={idx}
                  className="break-words whitespace-pre-wrap border-b border-white/5 pb-0.5 mb-0.5"
                >
                  <span className="text-green-500 mr-2">&gt;</span>
                  {line}
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
