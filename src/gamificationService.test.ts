import { describe, it, expect, vi, beforeEach } from 'vitest';

const rpcMock = vi.fn();
const fromMock = vi.fn();
vi.mock('../services/supabaseClient', () => ({
  supabase: {
    rpc: (...args: any[]) => rpcMock(...args),
    from: (...args: any[]) => fromMock(...args),
    auth: { getUser: async () => ({ data: { user: { id: 'user-1' } } }) },
  },
  SUPABASE_URL: 'http://localhost',
  STORAGE_BUCKET: 'Rean',
}));

vi.mock('../services/authService', () => ({
  getCurrentUser: async () => ({ id: 'user-1' }),
}));

import { spendPoints, awardAction, canAfford } from '../services/gamificationService';

// Chainable query builder mock: every method returns itself; terminal
// methods resolve with the configured result.
const makeBuilder = (result: any) => {
  const builder: any = {};
  for (const method of ['select', 'update', 'insert', 'eq', 'gte', 'order', 'range', 'in']) {
    builder[method] = vi.fn(() => builder);
  }
  builder.single = vi.fn(async () => result);
  builder.maybeSingle = vi.fn(async () => result);
  builder.then = (resolve: any) => resolve(result);
  return builder;
};

beforeEach(() => {
  rpcMock.mockReset();
  fromMock.mockReset();
});

describe('spendPoints', () => {
  it('uses the atomic RPC when available and never writes the wallet directly', async () => {
    rpcMock.mockResolvedValue({ data: true, error: null });

    const ok = await spendPoints(5, 'Used AI: Chat');

    expect(ok).toBe(true);
    expect(rpcMock).toHaveBeenCalledWith('spend_points', {
      p_amount: 5,
      p_reason: 'Used AI: Chat',
    });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('returns false when the RPC reports insufficient funds', async () => {
    rpcMock.mockResolvedValue({ data: false, error: null });

    const ok = await spendPoints(9999, 'Big spend');

    expect(ok).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('falls back to the legacy direct write when the RPC does not exist yet', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { code: 'PGRST202' } });
    const profileRead = makeBuilder({ data: { spendable_points: 100 }, error: null });
    const walletWrite = makeBuilder({ error: null });
    const txInsert = makeBuilder({ error: null });
    fromMock
      .mockReturnValueOnce(profileRead) // select balance
      .mockReturnValueOnce(walletWrite) // update balance
      .mockReturnValueOnce(txInsert); // log transaction

    const ok = await spendPoints(30, 'Legacy spend');

    expect(ok).toBe(true);
    expect(walletWrite.update).toHaveBeenCalledWith({ spendable_points: 70 });
  });

  it('legacy fallback refuses to overdraw', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { code: 'PGRST202' } });
    fromMock.mockReturnValueOnce(makeBuilder({ data: { spendable_points: 3 }, error: null }));

    const ok = await spendPoints(10, 'Too expensive');
    expect(ok).toBe(false);
  });
});

describe('awardAction', () => {
  it('prefers the atomic RPC with the action name and no wallet writes', async () => {
    rpcMock.mockResolvedValue({ data: true, error: null });

    await awardAction('user-1', 'REPLY');

    expect(rpcMock).toHaveBeenCalledWith('award_action', {
      p_target: 'user-1',
      p_action: 'REPLY',
      p_custom_points: null,
    });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('passes custom points through for lucky drops', async () => {
    rpcMock.mockResolvedValue({ data: true, error: null });

    await awardAction('user-1', 'LUCKY_DROP', 7);

    expect(rpcMock).toHaveBeenCalledWith('award_action', {
      p_target: 'user-1',
      p_action: 'LUCKY_DROP',
      p_custom_points: 7,
    });
  });
});

describe('canAfford', () => {
  it('checks the balance without writing anything', async () => {
    fromMock.mockReturnValueOnce(makeBuilder({ data: { spendable_points: 12 }, error: null }));
    expect(await canAfford(10)).toBe(true);

    fromMock.mockReturnValueOnce(makeBuilder({ data: { spendable_points: 12 }, error: null }));
    expect(await canAfford(25)).toBe(false);
  });
});
