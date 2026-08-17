import { describe, it, expect, vi, beforeEach } from 'vitest';

// The service talks to Supabase and Gemini. Stub both so the tests pin the
// contract with the database (SUPABASE_PLAGIARISM.sql) rather than the network.
const rpcMock = vi.fn(async (..._args: any[]): Promise<any> => ({ data: [], error: null }));
const upsertMock = vi.fn(async (..._args: any[]): Promise<any> => ({ error: null }));
const fromMock = vi.fn((..._args: any[]) => ({ upsert: upsertMock }));

vi.mock('../services/supabaseClient', () => ({
  supabase: {
    rpc: (...args: any[]) => rpcMock(...args),
    from: (...args: any[]) => fromMock(...args),
  },
  SUPABASE_URL: 'http://localhost',
  STORAGE_BUCKET: 'Rean',
}));

const generateEmbeddingMock = vi.fn();
vi.mock('../services/geminiService', () => ({
  generateEmbedding: (...args: any[]) => generateEmbeddingMock(...args),
}));

vi.mock('../services/missionService', () => ({ mapMissionFromDB: vi.fn() }));
vi.mock('../services/storageService', () => ({ uploadFile: vi.fn(), deleteFileFromUrl: vi.fn() }));

import {
  checkPlagiarism,
  saveSubmissionVector,
  PLAGIARISM_THRESHOLD,
} from '../services/missionProgressService';

const EMBEDDING = [0.1, 0.2, 0.3];

beforeEach(() => {
  rpcMock.mockReset();
  upsertMock.mockReset();
  fromMock.mockClear();
  generateEmbeddingMock.mockReset();
  upsertMock.mockResolvedValue({ error: null });
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('checkPlagiarism', () => {
  it('searches the same mission and module, excluding the student themselves', async () => {
    generateEmbeddingMock.mockResolvedValue(EMBEDDING);
    rpcMock.mockResolvedValue({ data: [{ id: 'vec-9', similarity: 0.91 }], error: null });

    const result = await checkPlagiarism('mission-1', 'mod-1', 'enr-1', 'a long enough answer');

    expect(rpcMock).toHaveBeenCalledWith('match_submissions', {
      query_embedding: EMBEDDING,
      match_threshold: PLAGIARISM_THRESHOLD,
      match_count: 1,
      filter_mission_id: 'mission-1',
      filter_module_id: 'mod-1',
      // Without this a student's own earlier attempt would flag them.
      exclude_enrollment_id: 'enr-1',
    });
    expect(result.match).toEqual({ id: 'vec-9', similarity: 0.91 });
    // Handed back so the caller does not pay to embed the same text twice.
    expect(result.embedding).toEqual(EMBEDDING);
  });

  it('reports no match when nothing clears the threshold', async () => {
    generateEmbeddingMock.mockResolvedValue(EMBEDDING);
    rpcMock.mockResolvedValue({ data: [], error: null });

    expect((await checkPlagiarism('mission-1', 'mod-1', 'enr-1', 'text')).match).toBeNull();
  });

  it('fails open when the embedding cannot be generated', async () => {
    generateEmbeddingMock.mockResolvedValue(null);

    const result = await checkPlagiarism('mission-1', 'mod-1', 'enr-1', 'text');

    // An AI outage must not stop students handing work in.
    expect(result).toEqual({ embedding: null, match: null });
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('fails open when the vector search errors', async () => {
    generateEmbeddingMock.mockResolvedValue(EMBEDDING);
    rpcMock.mockResolvedValue({ data: null, error: { message: 'function does not exist' } });

    const result = await checkPlagiarism('mission-1', 'mod-1', 'enr-1', 'text');

    expect(result.match).toBeNull();
    expect(result.embedding).toEqual(EMBEDDING);
  });
});

describe('saveSubmissionVector', () => {
  it('upserts on the enrollment/module pair so retries replace the old vector', async () => {
    await saveSubmissionVector('mission-1', 'enr-1', 'mod-1', 'my answer', EMBEDDING);

    expect(fromMock).toHaveBeenCalledWith('submission_embeddings');
    const [row, options] = upsertMock.mock.calls[0];
    expect(row).toMatchObject({
      // Denormalised so the search can filter without joining enrollments.
      mission_id: 'mission-1',
      enrollment_id: 'enr-1',
      module_id: 'mod-1',
      content: 'my answer',
      embedding: EMBEDDING,
    });
    expect(options).toEqual({ onConflict: 'enrollment_id,module_id' });
    // The vector came from the check, so no second (charged) embedding call.
    expect(generateEmbeddingMock).not.toHaveBeenCalled();
  });

  it('embeds the text when no vector is handed down', async () => {
    generateEmbeddingMock.mockResolvedValue(EMBEDDING);

    await saveSubmissionVector('mission-1', 'enr-1', 'mod-1', 'my answer');

    expect(generateEmbeddingMock).toHaveBeenCalledWith('my answer');
    expect(upsertMock.mock.calls[0][0].embedding).toEqual(EMBEDDING);
  });

  it('skips the write when the embedding is unavailable', async () => {
    generateEmbeddingMock.mockResolvedValue(null);

    await saveSubmissionVector('mission-1', 'enr-1', 'mod-1', 'my answer');

    expect(upsertMock).not.toHaveBeenCalled();
  });

  it('does not throw when the corpus write fails', async () => {
    upsertMock.mockResolvedValue({ error: { message: 'permission denied' } });

    // The work is already graded and saved by this point; a failed corpus
    // write must not surface as a submission error.
    await expect(
      saveSubmissionVector('mission-1', 'enr-1', 'mod-1', 'my answer', EMBEDDING)
    ).resolves.toBeUndefined();
  });
});
