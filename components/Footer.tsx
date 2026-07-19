import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Code2, Heart } from './Icons';

const REPO_URL = 'https://github.com/camboversecenter/Rean';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-8 mb-16 md:mb-0">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <p className="font-bold text-gray-900">REAN</p>
            <p className="text-sm text-gray-500">
              Incubated by CamboVerse Center, National University of Management (NUM).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            {/* AGPL section 13: users of a network service can obtain the source. */}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-600 hover:text-primary transition-colors"
              aria-label="View source code on GitHub"
            >
              <Code2 className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Source code
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-600 hover:text-primary transition-colors"
              aria-label="GitHub repository"
            >
              <Github className="h-4 w-4 mr-1.5" aria-hidden="true" />
              GitHub
            </a>
            <Link to="/license" className="text-gray-600 hover:text-primary transition-colors">
              License
            </Link>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-400">
          <p className="flex items-center">
            Made with <Heart className="h-3 w-3 mx-1 text-red-400" aria-hidden="true" /> for the
            Cambodian learning community.
          </p>
          <p>© {year} REAN. Code licensed under AGPL-3.0-or-later. Free to use in Cambodia.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
