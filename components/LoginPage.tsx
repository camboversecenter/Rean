import React, { useEffect, useState } from 'react';
import { signInWithGoogle } from '../services/authService';
import { BookOpen, AlertCircle, Send } from './Icons';
import { Link } from 'react-router-dom';

const getInitialError = (): string | null => {
  const params = new URLSearchParams(window.location.hash.substring(1));
  const searchParams = new URLSearchParams(window.location.search);
  let errorDesc = searchParams.get('error_description') || params.get('error_description');
  if (!errorDesc && window.location.hash.includes('error_description=')) {
    const parts = window.location.hash.split('error_description=');
    if (parts.length > 1) {
      errorDesc = parts[1].split('&')[0];
    }
  }
  if (errorDesc) {
    return decodeURIComponent(errorDesc).replace(/\+/g, ' ');
  }
  return null;
};

const LoginPage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(getInitialError);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const searchParams = new URLSearchParams(window.location.search);
    let errorDesc = searchParams.get('error_description') || params.get('error_description');
    if (errorDesc || window.location.hash.includes('error_description=')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogin = async () => {
    try {
      setErrorMessage(null);
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Login failed', error);
      setErrorMessage(error.message || 'Failed to sign in. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-6 md:p-10 text-center border border-gray-100">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-primary p-4 rounded-2xl shadow-lg shadow-primary/30 transform rotate-3">
            <BookOpen className="h-10 w-10 text-white" aria-hidden="true" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3 font-['Kantumruy_Pro'] tracking-tight">
          REAN - រៀន
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          វេទិកាអប់រំសម្រាប់អ្នកសិក្សាជំនាន់ថ្មី។
          <br />
          ចូលប្រើប្រាស់ដើម្បីចាប់ផ្តើម។
        </p>

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-4 rounded-2xl flex items-center text-left animate-pulse-once" role="alert">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" aria-hidden="true" />
            <span className="text-sm font-medium">{errorMessage}</span>
          </div>
        )}

        <button type="button"
          onClick={handleLogin}
          aria-label="បន្តជាមួយ Google"
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 font-bold py-4 px-6 rounded-2xl transition-all transform active:scale-[0.98] group"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google Logo"
            className="w-6 h-6 group-hover:scale-110 transition-transform"
          />
          <span className="text-base">បន្តជាមួយ Google</span>
        </button>

        <div className="mt-8 flex flex-col items-center space-y-4">
          <div className="flex flex-wrap justify-center gap-2">
            <a
              href="https://t.me/+DBOU-zZhP_lkNTg9"
              target="_blank"
              rel="noreferrer"
              aria-label="Telegram Community"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 rounded-full text-[10px] text-blue-600 font-bold hover:bg-blue-100 transition-colors border border-blue-100"
            >
              <Send className="h-3 w-3 mr-1.5 rotate-45 transform -translate-y-[1px]" aria-hidden="true" />
              តេឡេក្រាមសហគមន៍ (Telegram)
            </a>
            <Link
              to="/license"
              aria-label="Community License"
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-50 rounded-full text-[10px] text-primary font-bold hover:bg-primary/5 transition-colors border border-gray-100"
            >
              🛡️ អាជ្ញាប័ណ្ណសហគមន៍ (Community License)
            </Link>
          </div>
          <div className="pt-2">
            <span className="text-[10px] text-gray-300 font-mono">Ver 0.01 (Beta)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
