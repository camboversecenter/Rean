import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Heart, Send } from './Icons';
import { TELEGRAM_COMMUNITY_URL } from '../constants';

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
              Incubated by{' '}
              <a
                href="https://camboverse.world/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors underline decoration-gray-300 underline-offset-2"
              >
                CamboVerse Center
              </a>
              ,{' '}
              <a
                href="https://num.edu.kh/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors underline decoration-gray-300 underline-offset-2"
              >
                National University of Management (NUM)
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            <Link to="/about" className="text-gray-600 hover:text-primary transition-colors">
              About
            </Link>
            {/* Support channel. Students should be able to reach help from any
                page, not only from the sign-in screen. */}
            <a
              href={TELEGRAM_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-600 hover:text-primary transition-colors"
              aria-label="Get help on Telegram"
            >
              <Send
                className="h-4 w-4 mr-1.5 rotate-45 transform -translate-y-[1px]"
                aria-hidden="true"
              />
              Get help
            </a>
            {/* Link to the open-source repository. */}
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
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-400">
          {/*
            The heart sits inline rather than as a flex item: a flex container
            drops the whitespace-only nodes around it, which ran the sentence
            together as "Made withfor the ...". Labelling it instead of hiding
            it keeps the line readable when it is announced or copied.
          */}
          <p>
            Made with{' '}
            <Heart
              className="inline h-3 w-3 align-[-2px] text-red-400"
              role="img"
              aria-label="love"
            />{' '}
            for learners across Cambodia.
          </p>
          <p>© {year} REAN · Free and open source under Apache-2.0</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
