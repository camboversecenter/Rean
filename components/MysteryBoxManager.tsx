import React, { useState, useEffect } from 'react';
import { placeholderImage } from '../utils/placeholder';
import { Gift, Plus, Trash2, Loader2, Image as ImageIcon, X, CheckCircle, Zap } from './Icons';
import {
  getMyMysteryBoxes,
  createMysteryBox,
  addMysteryBoxItems,
  deleteMysteryBox,
  fetchCreatorClaims,
  markClaimFulfilled,
} from '../services/gamificationService';
import { generateImage, AI_COSTS } from '../services/geminiService';
import { uploadFile } from '../services/storageService';
import { MysteryBox, MysteryBoxItem, RewardClaim } from '../types';
import toast from 'react-hot-toast';

// Helper for Base64 Upload
const base64ToBlob = (base64: string, mimeType: string = 'image/png') => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

const MysteryBoxManager: React.FC = () => {
  const [state, setState] = useState({
    mysteryBoxes: [] as MysteryBox[],
    claims: [] as RewardClaim[],
    loading: true,
    rewardSubTab: 'boxes' as 'boxes' | 'claims',
    currentBox: {
      title: '',
      description: '',
      price_points: 100,
      cover_image: '',
    } as Partial<MysteryBox>,
    boxItems: [] as (Partial<MysteryBoxItem> & { id: string })[],
    newItemName: '',
    newItemProb: 10,
    boxImageFile: null as File | null,
    boxImageBase64: null as string | null,
    showBoxModal: false,
    isSaving: false,
    isGenerating: false,
  });

  const loadData = React.useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const boxesData = await getMyMysteryBoxes();
      const claimsData = await fetchCreatorClaims();
      setState((s) => ({ ...s, mysteryBoxes: boxesData, claims: claimsData }));
    } catch (e) {
      console.error('Failed to load reward data', e);
    } finally {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateBox = () => {
    setState((s) => ({
      ...s,
      currentBox: { title: '', description: '', price_points: 100, cover_image: '' },
      boxItems: [],
      boxImageFile: null,
      boxImageBase64: null,
      showBoxModal: true,
    }));
  };

  const handleAddItem = () => {
    if (!state.newItemName) return;
    setState((prev) => ({
      ...prev,
      boxItems: [
        ...prev.boxItems,
        {
          id: Date.now().toString() + Math.random(),
          name: prev.newItemName,
          probability: prev.newItemProb,
          type: 'coupon',
        },
      ],
      newItemName: '',
      newItemProb: 10,
    }));
  };

  const handleRemoveItem = (idx: number) => {
    setState((s) => ({ ...s, boxItems: s.boxItems.filter((_, i) => i !== idx) }));
  };

  const handleSaveBox = async () => {
    if (!state.currentBox.title || !state.currentBox.price_points) return;

    if (state.boxItems.length === 0) {
      if (!window.confirm("You haven't added any reward items. The box will be empty. Continue?"))
        return;
    }

    setState((s) => ({ ...s, isSaving: true }));
    try {
      let coverUrl = state.currentBox.cover_image || '';

      if (state.boxImageBase64) {
        const blob = base64ToBlob(state.boxImageBase64);
        const uploaded = await uploadFile(blob, 'rewards');
        if (uploaded) coverUrl = uploaded;
      } else if (state.boxImageFile) {
        coverUrl = (await uploadFile(state.boxImageFile, 'rewards')) || '';
      }

      const newBox = await createMysteryBox({ ...state.currentBox, cover_image: coverUrl });

      if (newBox && state.boxItems.length > 0) {
        await addMysteryBoxItems(newBox.id, state.boxItems);
      }

      toast.success('បានបង្កើតប្រអប់រង្វាន់!');
      setState((s) => ({ ...s, showBoxModal: false }));
      loadData();
    } catch (e) {
      console.error(e);
      toast.error('បរាជ័យក្នុងការបង្កើត');
    } finally {
      setState((s) => ({ ...s, isSaving: false }));
    }
  };

  const handleDeleteBox = async (id: string) => {
    if (!window.confirm('លុបរង្វាន់នេះ?')) return;
    try {
      await deleteMysteryBox(id);
      toast.success('បានលុបរង្វាន់');
      loadData();
    } catch (e) {
      toast.error('បរាជ័យក្នុងការលុប');
    }
  };

  const handleFulfillClaim = async (id: string) => {
    if (!window.confirm('Mark as fulfilled? (Sent item to student)')) return;
    try {
      await markClaimFulfilled(id);
      setState((s) => ({
        ...s,
        claims: s.claims.map((c) => (c.id === id ? { ...c, status: 'Fulfilled' } : c)),
      }));
      toast.success('Marked as fulfilled!');
    } catch (e) {
      toast.error('Action failed');
    }
  };

  const handleGenerateRewardImage = async () => {
    if (!state.currentBox.title) {
      toast.error('សូមបញ្ចូលចំណងជើងជាមុនសិន');
      return;
    }
    setState((s) => ({ ...s, isGenerating: true }));
    try {
      const prompt = `A mysterious and exciting reward box icon or illustration for "${state.currentBox.title}". 3D render style, colorful, floating item.`;
      const base64 = await generateImage(prompt);
      if (base64) {
        setState((s) => ({ ...s, boxImageBase64: base64, boxImageFile: null }));
        toast.success('រូបភាពរង្វាន់ត្រូវបានបង្កើត!');
      }
    } catch (e) {
      toast.error('ការបង្កើតរូបភាពបរាជ័យ');
    } finally {
      setState((s) => ({ ...s, isGenerating: false }));
    }
  };

  if (state.loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-gray-300 h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex bg-surface-3 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setState((s) => ({ ...s, rewardSubTab: 'boxes' }))}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${state.rewardSubTab === 'boxes' ? 'bg-surface shadow-sm text-content' : 'text-content-muted hover:text-content-soft'}`}
          >
            ប្រអប់រង្វាន់ (Boxes)
          </button>
          <button
            type="button"
            onClick={() => setState((s) => ({ ...s, rewardSubTab: 'claims' }))}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${state.rewardSubTab === 'claims' ? 'bg-surface shadow-sm text-content' : 'text-content-muted hover:text-content-soft'}`}
          >
            អ្នកឈ្នះ (Claims)
          </button>
        </div>

        {state.rewardSubTab === 'boxes' && (
          <button
            type="button"
            onClick={handleCreateBox}
            className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center shadow-lg shadow-gray-200 hover:scale-105 transition-transform"
          >
            <Plus className="h-4 w-4 mr-2" /> បង្កើតរង្វាន់ថ្មី
          </button>
        )}
      </div>

      {state.rewardSubTab === 'boxes' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.mysteryBoxes.length === 0 && (
            <div className="col-span-full text-center py-16 bg-surface rounded-3xl border border-dashed border-line-strong">
              <Gift className="h-16 w-16 mx-auto mb-4 text-gray-200" />
              <h3 className="font-bold text-content text-lg">មិនទាន់មានរង្វាន់</h3>
              <p className="text-content-muted mb-6">បង្កើតប្រអប់សំណាងដំបូងរបស់អ្នក។</p>
              <button
                type="button"
                onClick={handleCreateBox}
                className="text-primary font-bold hover:underline"
              >
                បង្កើតឥឡូវនេះ
              </button>
            </div>
          )}
          {state.mysteryBoxes.map((box) => (
            <div
              key={box.id}
              className="bg-surface rounded-2xl shadow-sm border border-line overflow-hidden hover:shadow-md transition-all group"
            >
              <div className="relative h-40 bg-purple-50 flex items-center justify-center overflow-hidden">
                {box.cover_image ? (
                  <img
                    src={box.cover_image}
                    className="w-full h-full object-cover"
                    alt="Box Cover"
                  />
                ) : (
                  <span className="text-4xl">🎁</span>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleDeleteBox(box.id)}
                    className="bg-surface p-2 rounded-full text-red-500 shadow-sm hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
                  {box.price_points} Points
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-content mb-1">{box.title}</h3>
                <p className="text-xs text-content-muted mb-3 line-clamp-2">{box.description}</p>
                <div className="bg-surface-2 rounded-lg p-2 text-xs border border-line">
                  <p className="font-bold text-content-soft mb-1">Items in box:</p>
                  <div className="flex flex-wrap gap-1">
                    {box.items?.slice(0, 3).map((item, idx) => (
                      <span
                        key={item.id || `${item.name}-${idx}`}
                        className="bg-surface px-2 py-0.5 rounded border border-line-strong text-content-muted"
                      >
                        {item.name}
                      </span>
                    ))}
                    {(box.items?.length || 0) > 3 && (
                      <span className="text-content-faint">
                        +{(box.items?.length || 0) - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface rounded-2xl shadow-sm border border-line overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-2 text-content-muted font-bold text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">អ្នកឈ្នះ (Winner)</th>
                  <th className="px-6 py-4">រង្វាន់ (Prize)</th>
                  <th className="px-6 py-4">ប្រអប់ (Box)</th>
                  <th className="px-6 py-4">កាលបរិច្ឆេទ</th>
                  <th className="px-6 py-4 text-right">ស្ថានភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {state.claims.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-content-faint">
                      មិនទាន់មានអ្នកឈ្នះទេ។
                    </td>
                  </tr>
                )}
                {state.claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-surface-2">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={claim.user_avatar || placeholderImage(30, 30)}
                          className="w-8 h-8 rounded-full bg-line-strong"
                          alt="User Avatar"
                        />
                        <div>
                          <div className="font-bold text-content">{claim.user_name}</div>
                          <div className="text-xs text-content-muted">{claim.user_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-purple-600">{claim.reward_detail}</td>
                    <td className="px-6 py-4 text-content-muted">{claim.box_title}</td>
                    <td className="px-6 py-4 text-xs text-content-faint">{claim.created_at}</td>
                    <td className="px-6 py-4 text-right">
                      {claim.status === 'Pending' ? (
                        <button
                          type="button"
                          onClick={() => handleFulfillClaim(claim.id)}
                          className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-primary/90 transition-colors"
                        >
                          Mark Done
                        </button>
                      ) : (
                        <span className="text-green-600 font-bold text-xs flex items-center justify-end">
                          <CheckCircle className="h-4 w-4 mr-1" /> Fulfilled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BOX CREATION MODAL */}
      {state.showBoxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
            <div className="p-4 border-b border-line flex justify-between items-center bg-surface-2">
              <h3 className="font-bold text-lg text-content flex items-center">
                <Gift className="h-5 w-5 mr-2 text-purple-500" /> បង្កើតប្រអប់រង្វាន់
              </h3>
              <button
                type="button"
                onClick={() => setState((s) => ({ ...s, showBoxModal: false }))}
              >
                <X className="h-5 w-5 text-content-faint" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* 1. Details */}
              <div className="space-y-3">
                <label
                  htmlFor="boxTitle"
                  className="text-xs font-bold text-content-muted uppercase"
                >
                  ព័ត៌មានប្រអប់
                </label>
                <input
                  id="boxTitle"
                  className="w-full p-3 border border-line-strong rounded-xl text-sm"
                  placeholder="ឈ្មោះប្រអប់ (Box Title)"
                  value={state.currentBox.title}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      currentBox: { ...s.currentBox, title: e.target.value },
                    }))
                  }
                />
                <label htmlFor="boxDescription" className="sr-only">
                  ការពិពណ៌នា
                </label>
                <textarea
                  id="boxDescription"
                  className="w-full p-3 border border-line-strong rounded-xl text-sm h-20"
                  placeholder="ការពិពណ៌នា..."
                  value={state.currentBox.description}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      currentBox: { ...s.currentBox, description: e.target.value },
                    }))
                  }
                />
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label
                      htmlFor="boxPoints"
                      className="text-xs font-bold text-content-muted uppercase mb-1 block"
                    >
                      តម្លៃ (Points)
                    </label>
                    <input
                      id="boxPoints"
                      type="number"
                      className="w-full p-3 border border-line-strong rounded-xl text-sm font-bold"
                      placeholder="100"
                      value={state.currentBox.price_points}
                      onChange={(e) =>
                        setState((s) => ({
                          ...s,
                          currentBox: { ...s.currentBox, price_points: parseInt(e.target.value) },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* 2. Image */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="boxImage"
                    className="text-xs font-bold text-content-muted uppercase"
                  >
                    រូបភាព
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRewardImage}
                    disabled={state.isGenerating}
                    className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-1 rounded flex items-center hover:bg-indigo-100"
                  >
                    {state.isGenerating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <Zap className="h-3 w-3 mr-1" /> AI Generate ({AI_COSTS.IMAGE} Pts)
                      </>
                    )}
                  </button>
                </div>
                <div className="h-32 bg-surface-3 rounded-xl border border-line-strong flex items-center justify-center relative overflow-hidden group">
                  {state.boxImageBase64 || state.boxImageFile || state.currentBox.cover_image ? (
                    <img
                      src={
                        state.boxImageBase64
                          ? `data:image/png;base64,${state.boxImageBase64}`
                          : state.boxImageFile
                            ? URL.createObjectURL(state.boxImageFile)
                            : state.currentBox.cover_image
                      }
                      className="w-full h-full object-cover"
                      alt="Box Cover"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-gray-300" />
                  )}
                  <input
                    id="boxImage"
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      setState((s) => ({
                        ...s,
                        boxImageFile: e.target.files?.[0] || null,
                        boxImageBase64: null,
                      }));
                    }}
                    accept="image/*"
                  />
                </div>
              </div>

              {/* 3. Items */}
              <div className="space-y-3 bg-surface-2 p-4 rounded-xl border border-line">
                <label
                  htmlFor="boxItemName"
                  className="text-xs font-bold text-content-muted uppercase"
                >
                  រង្វាន់ក្នុងប្រអប់ (Items)
                </label>
                <div className="flex gap-2">
                  <input
                    id="boxItemName"
                    className="flex-1 p-2 border border-line-strong rounded-lg text-sm"
                    placeholder="ឈ្មោះរង្វាន់ (ឧ. អាវយឺត, Coupon 50%)"
                    value={state.newItemName}
                    onChange={(e) => setState((s) => ({ ...s, newItemName: e.target.value }))}
                  />
                  <label htmlFor="boxItemProb" className="sr-only">
                    Probability Weight
                  </label>
                  <input
                    id="boxItemProb"
                    type="number"
                    className="w-20 p-2 border border-line-strong rounded-lg text-sm"
                    placeholder="Weight"
                    value={state.newItemProb}
                    onChange={(e) =>
                      setState((s) => ({ ...s, newItemProb: parseInt(e.target.value) }))
                    }
                    title="Probability Weight"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="bg-gray-900 text-white px-3 rounded-lg hover:bg-black"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {state.boxItems.length === 0 && (
                    <p className="text-xs text-content-faint text-center italic py-2">
                      មិនទាន់មានរង្វាន់។
                    </p>
                  )}
                  {state.boxItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center bg-surface p-2 rounded border border-line-strong text-sm"
                    >
                      <span>{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-content-faint bg-surface-3 px-1.5 rounded">
                          W: {item.probability}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-line bg-surface-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setState((s) => ({ ...s, showBoxModal: false }))}
                className="px-4 py-2 text-content-muted font-bold text-sm hover:bg-line-strong rounded-lg"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleSaveBox}
                disabled={state.isSaving}
                className="px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-lg flex items-center"
              >
                {state.isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'បង្កើតប្រអប់'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MysteryBoxManager;
