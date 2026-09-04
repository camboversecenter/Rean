import React, { useState, useEffect } from 'react';
import {
  Gift,
  Zap,
  DollarSign,
  Lock,
  AlertCircle,
  Loader2,
  CheckCircle,
  Clock,
  ChevronDown,
} from '../components/Icons';
import { getCurrentUserProfile } from '../services/authService';
import {
  spendPoints,
  fetchMysteryBoxes,
  recordRewardClaim,
  getMyRewardClaims,
  fetchPointHistory,
} from '../services/gamificationService';
import { UserProfile, MysteryBox, RewardClaim, PointTransaction } from '../types';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const RewardsPage: React.FC = () => {
  const [state, setState] = useState({
    profile: null as UserProfile | null,
    activeTab: 'shop' as 'shop' | 'inventory' | 'history',
    boxes: [] as MysteryBox[],
    myClaims: [] as RewardClaim[],
    loading: true,
    opening: null as string | null,
    pointHistory: [] as PointTransaction[],
    pointHistoryPage: 1,
    pointHistoryHasMore: true,
    historyLoading: false,
  });

  const {
    profile,
    activeTab,
    boxes,
    myClaims,
    loading,
    opening,
    pointHistory,
    pointHistoryPage,
    pointHistoryHasMore,
    historyLoading,
  } = state;

  const setProfile = React.useCallback((v: any) => setState((s) => ({ ...s, profile: v })), []);
  const setActiveTab = React.useCallback((v: any) => setState((s) => ({ ...s, activeTab: v })), []);
  const setBoxes = React.useCallback((v: any) => setState((s) => ({ ...s, boxes: v })), []);
  const setMyClaims = React.useCallback((v: any) => setState((s) => ({ ...s, myClaims: v })), []);
  const setLoading = React.useCallback((v: any) => setState((s) => ({ ...s, loading: v })), []);
  const setOpening = React.useCallback((v: any) => setState((s) => ({ ...s, opening: v })), []);
  const setPointHistory = React.useCallback(
    (v: any) =>
      setState((s) => ({
        ...s,
        pointHistory: typeof v === 'function' ? v(s.pointHistory) : v,
      })),
    []
  );
  const setpointHistoryPage = React.useCallback(
    (v: any) => setState((s) => ({ ...s, pointHistoryPage: v })),
    []
  );
  const setpointHistoryHasMore = React.useCallback(
    (v: any) => setState((s) => ({ ...s, pointHistoryHasMore: v })),
    []
  );
  const setPointHistoryLoading = React.useCallback(
    (v: any) => setState((s) => ({ ...s, historyLoading: v })),
    []
  );

  const loadData = React.useCallback(async () => {
    const p = await getCurrentUserProfile();
    const b = await fetchMysteryBoxes();
    setProfile(p);
    setBoxes(b);
    setLoading(false);
  }, []);

  const loadHistory = React.useCallback(
    async (page: number) => {
      setPointHistoryLoading(true);
      const data = await fetchPointHistory(page, 20);
      if (data.length < 20) setpointHistoryHasMore(false);

      if (page === 1) setPointHistory(data);
      else setPointHistory((prev: any) => [...prev, ...data]);

      setPointHistoryLoading(false);
    },
    [setPointHistoryLoading, setpointHistoryHasMore, setPointHistory]
  );

  useEffect(() => {
    loadData();

    // Listen for balance updates
    const handleUpdate = () => {
      getCurrentUserProfile().then((p) => {
        if (p) setProfile(p);
      });
    };
    window.addEventListener('rean-points-updated', handleUpdate);
    return () => window.removeEventListener('rean-points-updated', handleUpdate);
  }, [loadData]);

  // Effect to reload data based on tab
  useEffect(() => {
    if (activeTab === 'inventory') {
      getMyRewardClaims().then(setMyClaims);
    } else if (activeTab === 'history') {
      // Only load if empty to prevent excessive calls, allow manual refresh via pull/reload if needed later
      if (pointHistory.length === 0) loadHistory(1);
    }
  }, [activeTab, pointHistory.length, loadHistory]);

  const handleHistoryLoadMore = () => {
    const nextPage = pointHistoryPage + 1;
    setpointHistoryPage(nextPage);
    loadHistory(nextPage);
  };

  const handlePurchase = async (box: MysteryBox) => {
    if (!profile) return;
    if ((profile.spendable_points || 0) < box.price_points) {
      toast.error('ពិន្ទុមិនគ្រប់គ្រាន់! (Not enough points)');
      return;
    }

    if (!window.confirm(`ចំណាយ ${box.price_points} ពិន្ទុលើ "${box.title}"?`)) return;

    setOpening(box.id);

    try {
      // 1. Determine Winning Item (Client-side for MVP, Server-side ideally)
      let wonItemName = box.title; // Default fall back
      const items = box.items || [];

      if (items.length > 0) {
        const totalWeight = items.reduce((sum, item) => sum + (item.probability || 0), 0);
        if (totalWeight > 0) {
          let random = Math.random() * totalWeight;
          let selected = false;
          for (const item of items) {
            if (random < (item.probability || 0)) {
              wonItemName = item.name;
              selected = true;
              break;
            }
            random -= item.probability || 0;
          }
          // Fallback if rounding errors caused loop to finish
          if (!selected) {
            wonItemName = items[items.length - 1].name;
          }
        } else {
          // Fallback if all weights are 0
          wonItemName = items[0].name;
        }
      }

      // 2. Transact
      const success = await spendPoints(box.price_points, `Opened Box: ${box.title}`);

      if (success) {
        // 3. Record specific win
        await recordRewardClaim(box.id, wonItemName);

        // 4. Animation & Feedback
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
          });

          toast.success(`អបអរសាទរ! អ្នកឈ្នះ៖ ${wonItemName}`, {
            duration: 6000,
            icon: '🎁',
            style: {
              background: '#10B981',
              color: '#fff',
              fontWeight: 'bold',
            },
          });

          setOpening(null);

          // Update lists if we are already on those tabs
          if (activeTab === 'inventory') getMyRewardClaims().then(setMyClaims);
          if (activeTab === 'history') {
            setpointHistoryPage(1);
            setpointHistoryHasMore(true);
            loadHistory(1);
          }
        }, 1500);
      } else {
        setOpening(null);
        toast.error('ប្រតិបត្តិការបរាជ័យ។');
      }
    } catch (e) {
      console.error(e);
      setOpening(null);
      toast.error('មានបញ្ហា។');
    }
  };

  return (
    <div className="min-h-screen bg-surface-2 pb-20 pt-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header with Balance */}
        <div className="bg-gray-900 dark:bg-surface-3 rounded-2xl p-6 text-white mb-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 bg-surface/5 rounded-full -mr-4 -mt-4"></div>
          <div className="relative z-10">
            <p className="text-content-faint text-xs font-bold uppercase tracking-wider mb-1">
              សមតុល្យរបស់អ្នក (Balance)
            </p>
            <h1 className="text-4xl font-bold flex items-center">
              {profile?.spendable_points || 0}{' '}
              <span className="text-lg ml-2 text-yellow-400">ពិន្ទុ</span>
            </h1>
            <p className="text-sm text-content-faint mt-2">
              ប្រើពិន្ទុដើម្បីដូរយករង្វាន់ និងការបញ្ចុះតម្លៃ។
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-surface rounded-xl p-1 shadow-sm border border-line mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('shop')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'shop' ? 'bg-gray-900 dark:bg-surface-3 text-white shadow' : 'text-content-muted hover:text-content'}`}
          >
            ហាង (Shop)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'inventory' ? 'bg-gray-900 dark:bg-surface-3 text-white shadow' : 'text-content-muted hover:text-content'}`}
          >
            របស់ខ្ញុំ (My)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'history' ? 'bg-gray-900 dark:bg-surface-3 text-white shadow' : 'text-content-muted hover:text-content'}`}
          >
            ប្រវត្តិ (History)
          </button>
        </div>

        {/* SHOP CONTENT */}
        {activeTab === 'shop' && (
          <>
            <div className="mb-4 flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-content text-lg">ប្រអប់សំណាង</h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : boxes.length === 0 ? (
              <div className="text-center py-10 text-content-faint bg-surface rounded-xl border border-dashed border-line-strong">
                <p>មិនទាន់មានរង្វាន់នៅឡើយទេ។</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {boxes.map((item) => (
                  <div
                    key={item.id}
                    className="bg-surface rounded-2xl p-4 shadow-sm border border-line flex items-center gap-4 hover:shadow-md transition-shadow relative overflow-hidden"
                  >
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-inner bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 overflow-hidden">
                      {item.cover_image ? (
                        <img
                          src={item.cover_image}
                          className="w-full h-full object-cover"
                          alt="Cover Image"
                        />
                      ) : (
                        '🎁'
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-content">{item.title}</h3>
                      <p className="text-xs text-content-muted line-clamp-1">{item.description}</p>
                      {item.items && item.items.length > 0 && (
                        <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold mt-1 bg-purple-50 dark:bg-purple-900/50 inline-block px-1.5 rounded">
                          មាន {item.items.length} រង្វាន់ក្នុងប្រអប់
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePurchase(item)}
                      disabled={opening !== null}
                      className={`px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition-transform active:scale-95 ${
                        (profile?.spendable_points || 0) >= item.price_points
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : 'bg-surface-3 text-content-faint cursor-not-allowed'
                      }`}
                    >
                      {opening === item.id ? (
                        <Zap className="h-4 w-4 animate-spin" />
                      ) : (
                        <span className="flex items-center">
                          {item.price_points} <span className="ml-1 text-[10px]">pts</span>
                        </span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* INVENTORY CONTENT */}
        {activeTab === 'inventory' && (
          <div className="animate-fade-in">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h2 className="font-bold text-content text-lg">ប្រវត្តិឈ្នះរង្វាន់</h2>
            </div>

            {myClaims.length === 0 ? (
              <div className="text-center py-12 bg-surface rounded-xl border border-dashed border-line-strong">
                <Gift className="h-10 w-10 text-content-faint mx-auto mb-2" />
                <p className="text-content-muted">អ្នកមិនទាន់មានរង្វាន់ទេ។</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="bg-surface p-4 rounded-xl border border-line shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-green-50 dark:bg-green-900/50 p-2 rounded-lg text-green-600 dark:text-green-400">
                        <Gift className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-content">{claim.reward_detail}</h4>
                        <p className="text-xs text-content-muted">
                          ពីប្រអប់: {claim.box_title} • {claim.created_at}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded ${
                        claim.status === 'Fulfilled'
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                      }`}
                    >
                      {claim.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HISTORY CONTENT */}
        {activeTab === 'history' && (
          <div className="animate-fade-in">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-content-muted" />
              <h2 className="font-bold text-content text-lg">ប្រវត្តិប្រតិបត្តិការ</h2>
            </div>

            {pointHistory.length === 0 && !historyLoading ? (
              <div className="text-center py-12 bg-surface rounded-xl border border-dashed border-line-strong text-content-faint">
                គ្មានប្រវត្តិ។
              </div>
            ) : (
              <div className="bg-surface rounded-xl border border-line overflow-hidden">
                {pointHistory.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 border-b border-line last:border-0 flex justify-between items-center hover:bg-surface-2"
                  >
                    <div>
                      <p className="font-bold text-content text-sm">{tx.reason}</p>
                      <p className="text-[10px] text-content-faint">
                        {new Date(tx.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`font-mono font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}
                    >
                      {tx.amount > 0 ? '+' : ''}
                      {tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {pointHistoryHasMore && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handleHistoryLoadMore}
                  disabled={historyLoading}
                  className="bg-surface border border-line-strong text-content-muted text-xs font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-surface-2 disabled:opacity-50 flex items-center justify-center mx-auto"
                >
                  {historyLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <ChevronDown className="h-3 w-3 mr-1" />
                  )}
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsPage;
