
import React, { useState, useEffect } from 'react';
import { 
    Gift, Plus, Trash2, Loader2, Image as ImageIcon,
    X, CheckCircle, Zap 
} from './Icons';
import { 
    getMyMysteryBoxes, createMysteryBox, addMysteryBoxItems, 
    deleteMysteryBox, fetchCreatorClaims, markClaimFulfilled 
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
    const [mysteryBoxes, setMysteryBoxes] = useState<MysteryBox[]>([]);
    const [claims, setClaims] = useState<RewardClaim[]>([]);
    const [loading, setLoading] = useState(true);
    const [rewardSubTab, setRewardSubTab] = useState<'boxes' | 'claims'>('boxes');
    
    // Editor State
    const [currentBox, setCurrentBox] = useState<Partial<MysteryBox>>({
        title: '',
        description: '',
        price_points: 100,
        cover_image: ''
    });
    const [boxItems, setBoxItems] = useState<Partial<MysteryBoxItem>[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [newItemProb, setNewItemProb] = useState(10);

    const [boxImageFile, setBoxImageFile] = useState<File | null>(null);
    const [boxImageBase64, setBoxImageBase64] = useState<string | null>(null);
    const [showBoxModal, setShowBoxModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const boxesData = await getMyMysteryBoxes();
            setMysteryBoxes(boxesData);
            const claimsData = await fetchCreatorClaims();
            setClaims(claimsData);
        } catch (e) {
            console.error("Failed to load reward data", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBox = () => {
        setCurrentBox({ title: '', description: '', price_points: 100, cover_image: '' });
        setBoxItems([]);
        setBoxImageFile(null);
        setBoxImageBase64(null);
        setShowBoxModal(true);
    };

    const handleAddItem = () => {
        if (!newItemName) return;
        setBoxItems(prev => [...prev, { name: newItemName, probability: newItemProb, type: 'coupon' }]);
        setNewItemName('');
        setNewItemProb(10);
    };

    const handleRemoveItem = (idx: number) => {
        setBoxItems(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSaveBox = async () => {
        if (!currentBox.title || !currentBox.price_points) return;
        
        if (boxItems.length === 0) {
            if(!window.confirm("You haven't added any reward items. The box will be empty. Continue?")) return;
        }

        setIsSaving(true);
        try {
            let coverUrl = currentBox.cover_image || '';
            
            if (boxImageBase64) {
                const blob = base64ToBlob(boxImageBase64);
                const uploaded = await uploadFile(blob, 'rewards');
                if (uploaded) coverUrl = uploaded;
            } else if (boxImageFile) {
                coverUrl = (await uploadFile(boxImageFile, 'rewards')) || '';
            }
            
            const newBox = await createMysteryBox({ ...currentBox, cover_image: coverUrl });
            
            if (newBox && boxItems.length > 0) {
                await addMysteryBoxItems(newBox.id, boxItems);
            }

            toast.success("បានបង្កើតប្រអប់រង្វាន់!");
            setShowBoxModal(false);
            loadData();
        } catch (e) {
            console.error(e);
            toast.error("បរាជ័យក្នុងការបង្កើត");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteBox = async (id: string) => {
        if (!window.confirm("លុបរង្វាន់នេះ?")) return;
        try {
            await deleteMysteryBox(id);
            toast.success("បានលុបរង្វាន់");
            loadData();
        } catch (e) {
            toast.error("បរាជ័យក្នុងការលុប");
        }
    };

    const handleFulfillClaim = async (id: string) => {
        if (!window.confirm("Mark as fulfilled? (Sent item to student)")) return;
        try {
            await markClaimFulfilled(id);
            setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'Fulfilled' } : c));
            toast.success("Marked as fulfilled!");
        } catch (e) {
            toast.error("Action failed");
        }
    };

    const handleGenerateRewardImage = async () => {
        if (!currentBox.title) {
            toast.error("សូមបញ្ចូលចំណងជើងជាមុនសិន");
            return;
        }
        setIsGenerating(true);
        try {
            const prompt = `A mysterious and exciting reward box icon or illustration for "${currentBox.title}". 3D render style, colorful, floating item.`;
            const base64 = await generateImage(prompt);
            if (base64) {
                setBoxImageBase64(base64);
                setBoxImageFile(null);
                toast.success("រូបភាពរង្វាន់ត្រូវបានបង្កើត!");
            }
        } catch (e) {
            toast.error("ការបង្កើតរូបភាពបរាជ័យ");
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-300 h-8 w-8" /></div>;
    }

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setRewardSubTab('boxes')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${rewardSubTab === 'boxes' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        ប្រអប់រង្វាន់ (Boxes)
                    </button>
                    <button 
                        onClick={() => setRewardSubTab('claims')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${rewardSubTab === 'claims' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        អ្នកឈ្នះ (Claims)
                    </button>
                </div>
                
                {rewardSubTab === 'boxes' && (
                    <button 
                        onClick={handleCreateBox}
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center shadow-lg shadow-gray-200 hover:scale-105 transition-transform"
                    >
                        <Plus className="h-4 w-4 mr-2" /> បង្កើតរង្វាន់ថ្មី
                    </button>
                )}
            </div>

            {rewardSubTab === 'boxes' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mysteryBoxes.length === 0 && (
                        <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
                            <Gift className="h-16 w-16 mx-auto mb-4 text-gray-200" />
                            <h3 className="font-bold text-gray-900 text-lg">មិនទាន់មានរង្វាន់</h3>
                            <p className="text-gray-500 mb-6">បង្កើតប្រអប់សំណាងដំបូងរបស់អ្នក។</p>
                            <button onClick={handleCreateBox} className="text-primary font-bold hover:underline">បង្កើតឥឡូវនេះ</button>
                        </div>
                    )}
                    {mysteryBoxes.map(box => (
                        <div key={box.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                            <div className="relative h-40 bg-purple-50 flex items-center justify-center overflow-hidden">
                                {box.cover_image ? (
                                    <img src={box.cover_image} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl">🎁</span>
                                )}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDeleteBox(box.id)} className="bg-white p-2 rounded-full text-red-500 shadow-sm hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                                </div>
                                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
                                    {box.price_points} Points
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 mb-1">{box.title}</h3>
                                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{box.description}</p>
                                <div className="bg-gray-50 rounded-lg p-2 text-xs border border-gray-100">
                                    <p className="font-bold text-gray-700 mb-1">Items in box:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {box.items?.slice(0, 3).map((item, idx) => (
                                            <span key={idx} className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-600">{item.name}</span>
                                        ))}
                                        {(box.items?.length || 0) > 3 && <span className="text-gray-400">+{ (box.items?.length || 0) - 3} more</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-4">អ្នកឈ្នះ (Winner)</th>
                                    <th className="px-6 py-4">រង្វាន់ (Prize)</th>
                                    <th className="px-6 py-4">ប្រអប់ (Box)</th>
                                    <th className="px-6 py-4">កាលបរិច្ឆេទ</th>
                                    <th className="px-6 py-4 text-right">ស្ថានភាព</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {claims.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-400">មិនទាន់មានអ្នកឈ្នះទេ។</td>
                                    </tr>
                                )}
                                {claims.map(claim => (
                                    <tr key={claim.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={claim.user_avatar || 'https://via.placeholder.com/30'} className="w-8 h-8 rounded-full bg-gray-200" />
                                                <div>
                                                    <div className="font-bold text-gray-900">{claim.user_name}</div>
                                                    <div className="text-xs text-gray-500">{claim.user_email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-purple-600">{claim.reward_detail}</td>
                                        <td className="px-6 py-4 text-gray-500">{claim.box_title}</td>
                                        <td className="px-6 py-4 text-xs text-gray-400">{claim.created_at}</td>
                                        <td className="px-6 py-4 text-right">
                                            {claim.status === 'Pending' ? (
                                                <button 
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
            {showBoxModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-900 flex items-center">
                                <Gift className="h-5 w-5 mr-2 text-purple-500" /> បង្កើតប្រអប់រង្វាន់
                            </h3>
                            <button onClick={() => setShowBoxModal(false)}><X className="h-5 w-5 text-gray-400" /></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto space-y-5">
                            {/* 1. Details */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase">ព័ត៌មានប្រអប់</label>
                                <input 
                                    className="w-full p-3 border border-gray-200 rounded-xl text-sm"
                                    placeholder="ឈ្មោះប្រអប់ (Box Title)"
                                    value={currentBox.title}
                                    onChange={e => setCurrentBox({...currentBox, title: e.target.value})}
                                />
                                <textarea 
                                    className="w-full p-3 border border-gray-200 rounded-xl text-sm h-20"
                                    placeholder="ការពិពណ៌នា..."
                                    value={currentBox.description}
                                    onChange={e => setCurrentBox({...currentBox, description: e.target.value})}
                                />
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">តម្លៃ (Points)</label>
                                        <input 
                                            type="number"
                                            className="w-full p-3 border border-gray-200 rounded-xl text-sm font-bold"
                                            placeholder="100"
                                            value={currentBox.price_points}
                                            onChange={e => setCurrentBox({...currentBox, price_points: parseInt(e.target.value)})}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 2. Image */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-gray-500 uppercase">រូបភាព</label>
                                    <button 
                                        onClick={handleGenerateRewardImage}
                                        disabled={isGenerating}
                                        className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-1 rounded flex items-center hover:bg-indigo-100"
                                    >
                                        {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Zap className="h-3 w-3 mr-1" /> AI Generate ({AI_COSTS.IMAGE} Pts)</>}
                                    </button>
                                </div>
                                <div className="h-32 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center relative overflow-hidden group">
                                    {boxImageBase64 || boxImageFile || currentBox.cover_image ? (
                                        <img src={boxImageBase64 ? `data:image/png;base64,${boxImageBase64}` : (boxImageFile ? URL.createObjectURL(boxImageFile) : currentBox.cover_image)} className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="h-8 w-8 text-gray-300" />
                                    )}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => { setBoxImageFile(e.target.files?.[0] || null); setBoxImageBase64(null); }} accept="image/*" />
                                </div>
                            </div>

                            {/* 3. Items */}
                            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <label className="text-xs font-bold text-gray-500 uppercase">រង្វាន់ក្នុងប្រអប់ (Items)</label>
                                <div className="flex gap-2">
                                    <input 
                                        className="flex-1 p-2 border border-gray-200 rounded-lg text-sm"
                                        placeholder="ឈ្មោះរង្វាន់ (ឧ. អាវយឺត, Coupon 50%)"
                                        value={newItemName}
                                        onChange={e => setNewItemName(e.target.value)}
                                    />
                                    <input 
                                        type="number"
                                        className="w-20 p-2 border border-gray-200 rounded-lg text-sm"
                                        placeholder="Weight"
                                        value={newItemProb}
                                        onChange={e => setNewItemProb(parseInt(e.target.value))}
                                        title="Probability Weight"
                                    />
                                    <button onClick={handleAddItem} className="bg-gray-900 text-white px-3 rounded-lg hover:bg-black"><Plus className="h-4 w-4" /></button>
                                </div>
                                
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {boxItems.length === 0 && <p className="text-xs text-gray-400 text-center italic py-2">មិនទាន់មានរង្វាន់។</p>}
                                    {boxItems.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200 text-sm">
                                            <span>{item.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 rounded">W: {item.probability}</span>
                                                <button onClick={() => handleRemoveItem(idx)} className="text-red-400 hover:text-red-600"><X className="h-3 w-3" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setShowBoxModal(false)} className="px-4 py-2 text-gray-600 font-bold text-sm hover:bg-gray-200 rounded-lg">បោះបង់</button>
                            <button onClick={handleSaveBox} disabled={isSaving} className="px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-lg flex items-center">
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'បង្កើតប្រអប់'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MysteryBoxManager;
