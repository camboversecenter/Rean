import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from './Icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              មានបញ្ហាបច្ចេកទេស (Something went wrong)
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              កម្មវិធីបានជួបបញ្ហាដែលមិនរំពឹងទុក។ សូមព្យាយាមផ្ទុកទំព័រឡើងវិញ។
              <br />
              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded mt-2 inline-block max-w-full truncate">
                {this.state.error?.message}
              </span>
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> ផ្ទុកឡើងវិញ (Reload)
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default ErrorBoundary;
