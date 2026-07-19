import { describe, it, expect, vi, beforeEach } from 'vitest';

const updateMock = vi.fn();
const fromMock = vi.fn();
const getSessionMock = vi.fn();

vi.mock('../services/supabaseClient', () => ({
  supabase: {
    from: (...args: any[]) => fromMock(...args),
    auth: {
      getSession: (...args: any[]) => getSessionMock(...args),
    },
  },
  SUPABASE_URL: 'http://localhost',
  STORAGE_BUCKET: 'Rean',
}));

import { updateUserRole } from '../services/authService';

const makeUpdateBuilder = (result: any) => {
  const builder: any = {};
  builder.update = vi.fn((...args: any[]) => {
    updateMock(...args);
    return builder;
  });
  builder.eq = vi.fn(() => builder);
  builder.select = vi.fn(() => builder);
  builder.maybeSingle = vi.fn(async () => result);
  return builder;
};

beforeEach(() => {
  updateMock.mockReset();
  fromMock.mockReset();
  getSessionMock.mockReset();
});

describe('updateUserRole', () => {
  it('updates the role through the shared Supabase client (no legacy anon-key fetch)', async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { user: { id: 'user-1' }, access_token: 'token' } },
    });
    const builder = makeUpdateBuilder({
      data: { id: 'user-1', role: 'student' },
      error: null,
    });
    fromMock.mockReturnValue(builder);

    const result = await updateUserRole('student');

    expect(fromMock).toHaveBeenCalledWith('profiles');
    expect(updateMock).toHaveBeenCalledWith({ role: 'student' });
    expect(builder.eq).toHaveBeenCalledWith('id', 'user-1');
    expect(result).toEqual({ id: 'user-1', role: 'student' });
  });

  it('throws when nobody is logged in', async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });

    await expect(updateUserRole('student')).rejects.toThrow('No user logged in');
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('surfaces database errors', async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { user: { id: 'user-1' } } },
    });
    fromMock.mockReturnValue(
      makeUpdateBuilder({ data: null, error: { message: 'permission denied' } })
    );

    await expect(updateUserRole('tutor')).rejects.toThrow('permission denied');
  });
});
