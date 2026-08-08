import { describe, it, expect, vi } from 'vitest';

// MissionForm imports the Supabase-backed services at module load. Stub them so
// this stays a plain unit test of the key point coercion helpers.
vi.mock('../services/geminiService', () => ({
  generateMissionStructure: vi.fn(),
  generateImage: vi.fn(),
  chatWithAI: vi.fn(),
  AI_COSTS: { STRUCTURE: 10, IMAGE: 25 },
}));

vi.mock('../services/missionService', () => ({
  assignMissionMentor: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import { splitKeyPoints, normalizeKeyPoints } from '../components/MissionForm';

describe('splitKeyPoints', () => {
  it('turns one line per point into an array', () => {
    expect(splitKeyPoints('First point\nSecond point')).toEqual(['First point', 'Second point']);
  });

  it('drops blank lines so an empty bullet is never stored', () => {
    expect(splitKeyPoints('First\n\n   \nSecond\n')).toEqual(['First', 'Second']);
  });

  it('strips bullet markers a creator may paste in', () => {
    expect(splitKeyPoints('- First\n* Second\n• Third')).toEqual(['First', 'Second', 'Third']);
  });
});

describe('normalizeKeyPoints', () => {
  it('keeps a well formed array, trimming and dropping empties', () => {
    expect(normalizeKeyPoints(['  First  ', '', 'Second'])).toEqual(['First', 'Second']);
  });

  it('coerces a single block of text, which the model sometimes returns', () => {
    expect(normalizeKeyPoints('First\nSecond')).toEqual(['First', 'Second']);
  });

  it('coerces non-string array entries rather than passing them through', () => {
    expect(normalizeKeyPoints([1, 2])).toEqual(['1', '2']);
  });

  it('returns undefined for missing or unusable values', () => {
    expect(normalizeKeyPoints(undefined)).toBeUndefined();
    expect(normalizeKeyPoints(null)).toBeUndefined();
    expect(normalizeKeyPoints([])).toBeUndefined();
    expect(normalizeKeyPoints('   ')).toBeUndefined();
    expect(normalizeKeyPoints(42)).toBeUndefined();
  });
});
