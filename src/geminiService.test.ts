import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Gemini SDK so no real client is constructed.
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = {};
    chats = { create: vi.fn() };
  },
}));

const invokeMock = vi.fn();
vi.mock('../services/supabaseClient', () => ({
  supabase: { functions: { invoke: (...args: any[]) => invokeMock(...args) } },
  SUPABASE_URL: 'http://localhost',
  STORAGE_BUCKET: 'Rean',
}));

const canAffordMock = vi.fn();
const spendPointsMock = vi.fn();
vi.mock('../services/gamificationService', () => ({
  canAfford: (...args: any[]) => canAffordMock(...args),
  spendPoints: (...args: any[]) => spendPointsMock(...args),
}));

import {
  chatWithAI,
  evaluateSubmission,
  generateImage,
  checkContentQuality,
  AI_COSTS,
} from '../services/geminiService';

beforeEach(() => {
  invokeMock.mockReset();
  canAffordMock.mockReset();
  spendPointsMock.mockReset();
});

describe('chatWithAI', () => {
  it('calls the edge function exactly once and never deducts points client-side', async () => {
    canAffordMock.mockResolvedValue(true);
    invokeMock.mockResolvedValue({ data: { text: 'hello student' }, error: null });

    const result = await chatWithAI('hi');

    expect(result).toBe('hello student');
    expect(invokeMock).toHaveBeenCalledTimes(1);
    expect(invokeMock.mock.calls[0][0]).toBe('ai-assistant');
    expect(invokeMock.mock.calls[0][1].body.action).toBe('chat');
    // The double-charge bug: the client must NOT spend points itself.
    expect(spendPointsMock).not.toHaveBeenCalled();
    expect(canAffordMock).toHaveBeenCalledWith(AI_COSTS.CHAT);
  });

  it('throws before calling the edge function when the user cannot afford it', async () => {
    canAffordMock.mockResolvedValue(false);

    await expect(chatWithAI('hi')).rejects.toThrow();
    expect(invokeMock).not.toHaveBeenCalled();
    expect(spendPointsMock).not.toHaveBeenCalled();
  });

  it('returns a friendly error string when the edge function fails and no dev key exists', async () => {
    canAffordMock.mockResolvedValue(true);
    invokeMock.mockResolvedValue({ data: null, error: new Error('boom') });

    const result = await chatWithAI('hi');
    expect(typeof result).toBe('string');
    expect(result).toContain('System Error');
  });
});

describe('evaluateSubmission', () => {
  it('parses a passing SCORE from the edge function response', async () => {
    canAffordMock.mockResolvedValue(true);
    invokeMock.mockResolvedValue({
      data: { text: 'SCORE: 85\nFEEDBACK: ល្អណាស់!' },
      error: null,
    });

    const result = await evaluateSubmission('task', 'persona', 'my answer');

    expect(result.passed).toBe(true);
    expect(result.score).toBe(85);
    expect(result.feedback).toContain('ល្អណាស់');
    expect(invokeMock.mock.calls[0][1].body.action).toBe('evaluate');
    expect(spendPointsMock).not.toHaveBeenCalled();
  });

  it('fails a submission scoring under 70', async () => {
    canAffordMock.mockResolvedValue(true);
    invokeMock.mockResolvedValue({ data: { text: 'SCORE: 40\nFEEDBACK: weak' }, error: null });

    const result = await evaluateSubmission('task', 'persona', 'bad answer');
    expect(result.passed).toBe(false);
    expect(result.score).toBe(40);
  });
});

describe('generateImage', () => {
  it('returns the image from the edge function without client-side spending', async () => {
    canAffordMock.mockResolvedValue(true);
    invokeMock.mockResolvedValue({ data: { image: 'base64data' }, error: null });

    const result = await generateImage('a rabbit teacher');

    expect(result).toBe('base64data');
    expect(invokeMock.mock.calls[0][1].body.action).toBe('generate-image');
    expect(canAffordMock).toHaveBeenCalledWith(AI_COSTS.IMAGE);
    expect(spendPointsMock).not.toHaveBeenCalled();
  });
});

describe('checkContentQuality', () => {
  it('scores replies through the free edge action, no affordability gate', async () => {
    invokeMock.mockResolvedValue({ data: { text: '88' }, error: null });

    const score = await checkContentQuality('A detailed explanation of photosynthesis...');

    expect(score).toBe(88);
    expect(invokeMock.mock.calls[0][1].body.action).toBe('quality');
    expect(canAffordMock).not.toHaveBeenCalled();
  });

  it('falls back to a neutral 50 when the edge function fails and no dev key exists', async () => {
    invokeMock.mockRejectedValue(new Error('offline'));
    const score = await checkContentQuality('some reply');
    expect(score).toBe(50);
  });
});
