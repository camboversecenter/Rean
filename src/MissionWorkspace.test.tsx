// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Mission } from '../types';

// The workspace pulls in Supabase-backed services and browser-only extras.
// Stub them so the test exercises the layout, not the network.
vi.mock('../services/geminiService', () => ({
  chatWithAI: vi.fn(),
  evaluateSubmission: vi.fn(),
  evaluateImageSubmission: vi.fn(),
  AI_COSTS: { LESSON: 10, EVALUATION: 5 },
}));

vi.mock('../services/missionProgressService', () => ({
  updateMissionProgress: vi.fn(),
  updateMissionSquadNote: vi.fn(),
  getSquadMembers: vi.fn(async () => []),
  checkPlagiarism: vi.fn(),
  saveSubmissionVector: vi.fn(),
  updateEnrollmentStatus: vi.fn(),
}));

vi.mock('../services/storageService', () => ({
  uploadFile: vi.fn(),
  deleteFileFromUrl: vi.fn(),
}));

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

// MarkdownText renders through remark/rehype plugins that are slow and
// irrelevant here. Render the raw text so assertions stay simple.
vi.mock('../components/MarkdownText', () => ({
  default: ({ content }: { content: string }) => <span>{content}</span>,
}));

// jsdom does not implement scrollIntoView, which the chat sidebar calls on mount.
window.HTMLElement.prototype.scrollIntoView = vi.fn();

import MissionWorkspace from '../components/MissionWorkspace';

const TASK_TEXT = 'Build a SWOT analysis for a local coffee shop.';
const THEORY_TEXT = 'Explain what a SWOT analysis is and when to use one.';

const mission: Mission = {
  id: 'mission-1',
  title: 'Business Foundations',
  mentor: 'Kru Rean',
  price: 0,
  level: 'Beginner',
  squadSize: 3,
  squadCreation: 'auto',
  enrollmentType: 'open',
  category: 'Business' as Mission['category'],
  thumbnail: '',
  description: 'A test mission',
  modules: [
    {
      id: 'mod-1',
      title: 'Lesson 1: SWOT',
      task: TASK_TEXT,
      aiPersona: 'You are a business coach.',
      initialPrompt: 'Hello, ready to start?',
      theoryPrompt: THEORY_TEXT,
    },
  ],
};

// The tab strip button is named exactly "កន្លែងអនុវត្ត". The step button in the
// summary flow strip mentions the same word inside a longer label, so match exactly.
const openPracticeTab = () =>
  fireEvent.click(screen.getByRole('button', { name: 'កន្លែងអនុវត្ត' }));

const renderWorkspace = () =>
  render(
    <MemoryRouter>
      <MissionWorkspace mission={mission} />
    </MemoryRouter>
  );

describe('MissionWorkspace tab layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Vitest is not running with `globals: true`, so Testing Library's automatic
  // cleanup is never registered. Unmount by hand or renders stack up.
  afterEach(cleanup);

  it('keeps the summary tab about the lesson, not the assignment', () => {
    renderWorkspace();

    // Summary is the default tab. It explains what the lesson teaches.
    expect(screen.getByText(THEORY_TEXT)).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Lesson 1: SWOT' })).toBeDefined();
    expect(screen.getByText(/How this lesson works/)).toBeDefined();
    expect(screen.getByText(/Tips/)).toBeDefined();

    // The assignment must NOT be on the summary tab, otherwise students read it
    // as background reading instead of work they have to hand in.
    expect(screen.queryByText(TASK_TEXT)).toBeNull();
  });

  it('shows the task on the practice tab, above the workspace', () => {
    renderWorkspace();

    openPracticeTab();

    expect(screen.getByText(TASK_TEXT)).toBeDefined();
    expect(screen.getByText(/Your Task/)).toBeDefined();
    // The workspace itself is still there.
    expect(screen.getByLabelText('Submission Text')).toBeDefined();
  });

  it('lets the student collapse the task card to free up typing room', () => {
    renderWorkspace();

    openPracticeTab();

    const toggle = screen.getByRole('button', { name: /Your Task/ });
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText(TASK_TEXT)).toBeDefined();

    fireEvent.click(toggle);

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText(TASK_TEXT)).toBeNull();
  });

  it('falls back to a lesson description when the module has no theory prompt', () => {
    const bare: Mission = {
      ...mission,
      modules: [{ ...mission.modules[0], theoryPrompt: undefined }],
    };

    render(
      <MemoryRouter>
        <MissionWorkspace mission={bare} />
      </MemoryRouter>
    );

    // Summary still has content rather than an empty panel, and still keeps the
    // assignment off this screen.
    expect(screen.getByRole('heading', { name: 'Lesson 1: SWOT' })).toBeDefined();
    expect(screen.queryByText(TASK_TEXT)).toBeNull();
  });
});
