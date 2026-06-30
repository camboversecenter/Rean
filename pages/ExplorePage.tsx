import React, { useState, useEffect } from 'react';
import {
  Target,
  BookOpen,
  Filter,
  CheckCircle,
  Zap,
  X,
  Brain,
  Loader2,
  ChevronDown,
} from '../components/Icons';
import MissionCard from '../components/MissionCard';
import ShortCourseCard from '../components/ShortCourseCard';
import MarkdownText from '../components/MarkdownText';
import { CATEGORIES_LIST } from '../constants';
import { fetchAllShortCourses } from '../services/schoolService';
import { fetchAllMissions } from '../services/missionService';
import { ShortCourse, Mission } from '../types';
import { chatWithAI, AI_COSTS } from '../services/geminiService';
import toast from 'react-hot-toast';

const LIMIT = 10;

const ExplorePage: React.FC = () => {
  const [state, setState] = useState({
    selectedCategory: 'All',
    viewType: 'mission' as 'mission' | 'short-course',
    courses: [] as (ShortCourse & { schoolName: string })[],
    missions: [] as Mission[],
    loading: true,
    page: 1,
    hasMore: true,
    loadingMore: false,
    formatFilter: 'All' as 'All' | 'Online' | 'On-Campus' | 'Hybrid',
    compareList: [] as (ShortCourse & { schoolName: string })[],
    showCompareModal: false,
    comparisonResult: '',
    analyzing: false,
  });

  const {
    selectedCategory,
    viewType,
    courses,
    missions,
    loading,
    page,
    hasMore,
    loadingMore,
    formatFilter,
    compareList,
    showCompareModal,
    comparisonResult,
    analyzing,
  } = state;


  const loadData = React.useCallback(async (pageToLoad: number, isReset: boolean = false) => {
    if (!isReset) setState(prev => ({ ...prev, loadingMore: true }));
    else setState(prev => ({ ...prev, loading: true }));

    try {
      if (viewType === 'mission') {
        const data = await fetchAllMissions(pageToLoad, LIMIT, selectedCategory);
        if (data.length < LIMIT) setState(prev => ({ ...prev, hasMore: false }));

        if (isReset) setState(prev => ({ ...prev, missions: data }));
        else setState(prev => ({ ...prev, missions: [...prev.missions, ...data] }));
      } else {
        // Fetch Courses
        const data = await fetchAllShortCourses(pageToLoad, LIMIT, selectedCategory, formatFilter);
        if (data.length < LIMIT) setState(prev => ({ ...prev, hasMore: false }));

        if (isReset) setState(prev => ({ ...prev, courses: data }));
        else setState(prev => ({ ...prev, courses: [...prev.courses, ...data] }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setState(prev => ({ ...prev, loading: false, loadingMore: false }));
    }
  }, [viewType, selectedCategory, formatFilter]);

  // --- EFFECT: Reset on Filter Change ---
  useEffect(() => {
    setState(prev => ({ ...prev, page: 1, courses: [], missions: [], hasMore: true }));
    loadData(1, true);
  }, [loadData]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setState(prev => ({ ...prev, page: nextPage }));
    loadData(nextPage);
  };

  const handleToggleCompare = (course: ShortCourse & { schoolName: string }) => {
    setState((prev) => {
      const exists = prev.compareList.find((c) => c.id === course.id);
      if (exists) {
        return { ...prev, compareList: prev.compareList.filter((c) => c.id !== course.id) };
      } else {
        if (prev.compareList.length >= 2) {
          toast.error('អាចប្រៀបធៀបបានត្រឹមតែ ២ វគ្គសិក្សាប៉ុណ្ណោះ។');
          return prev;
        }
        return { ...prev, compareList: [...prev.compareList, course] };
      }
    });
  };

  const handleAnalyzeComparison = async () => {
    if (compareList.length < 2) return;

    setState(prev => ({ ...prev, analyzing: true, showCompareModal: true, comparisonResult: '' }));

    try {
      const c1 = compareList[0];
      const c2 = compareList[1];

      const prompt = `
            Act as an educational consultant for a student in Cambodia. 
            Compare these two short courses:

            Course A: "${c1.title}" by ${c1.schoolName}
            - Price: ${c1.price} Riel
            - Duration: ${c1.duration}
            - Format: ${c1.format}
            - Description: ${c1.description || 'N/A'}

            Course B: "${c2.title}" by ${c2.schoolName}
            - Price: ${c2.price} Riel
            - Duration: ${c2.duration}
            - Format: ${c2.format}
            - Description: ${c2.description || 'N/A'}

            Please provide a concise comparison in Khmer Language (ភាសាខ្មែរ) highlighting:
            1. Key Differences (Focus vs Focus)
            2. Who is Course A for?
            3. Who is Course B for?
            4. Value for money recommendation.
            
            Format the response in Markdown using bullet points and bold text for readability.
            Keep the tone helpful and neutral.
          `;

      const result = await chatWithAI(prompt);
      setState(prev => ({ ...prev, comparisonResult: result }));
    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, comparisonResult: 'បរាជ័យក្នុងការវិភាគ។ សូមព្យាយាមម្តងទៀត។' }));
    } finally {
      setState(prev => ({ ...prev, analyzing: false }));
    }
  };

  return (
    <div className="pb-28 px-4 pt-4 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">រុករកការសិក្សា (Explore)</h1>
          <p className="text-xs text-gray-500">បេសកកម្ម (រៀនតាមរយៈការអនុវត្ត) & វគ្គសិក្សាខ្លី</p>
        </div>

        {/* Type Toggle */}
        <div className="flex p-1 bg-gray-200 rounded-xl mb-6 shadow-inner">
          <button type="button"
            onClick={() => setState(prev => ({ ...prev, viewType: 'mission' }))}
            className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${viewType === 'mission' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
          >
            <div className="flex items-center justify-center">
              <Target className="h-4 w-4 mr-2" />
              Missions (បេសកកម្ម)
            </div>
          </button>
          <button type="button"
            onClick={() => setState(prev => ({ ...prev, viewType: 'short-course' }))}
            className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${viewType === 'short-course' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
          >
            <div className="flex items-center justify-center">
              <BookOpen className="h-4 w-4 mr-2" />
              វគ្គសិក្សាខ្លី (Short Courses)
            </div>
          </button>
        </div>

        {/* Category Filter (Common) */}
        <div className="flex overflow-x-auto space-x-2 mb-4 pb-2 scrollbar-hide">
          <button type="button"
            onClick={() => setState(prev => ({ ...prev, selectedCategory: 'All' }))}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selectedCategory === 'All'
                ? 'bg-gray-800 text-white'
                : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            ទាំងអស់
          </button>
          {CATEGORIES_LIST.map((cat) => (
            <button type="button"
              key={cat}
              onClick={() => setState(prev => ({ ...prev, selectedCategory: cat }))}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-gray-800 text-white'
                  : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Extra Filters for Short Courses */}
        {viewType === 'short-course' && (
          <div className="mb-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wide">
              <Filter className="h-3 w-3" /> តម្រង (Filters)
            </div>
            <div className="flex flex-wrap gap-4">
              {/* Format Filter */}
              <div className="flex items-center space-x-2">
                <label htmlFor="format-filter" className="text-xs font-bold text-gray-700">ទម្រង់៖</label>
                <select
                  id="format-filter"
                  value={formatFilter}
                  onChange={(e) => setState(prev => ({ ...prev, formatFilter: e.target.value as any }))}
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg focus:ring-primary focus:border-primary block p-2 outline-none"
                >
                  <option value="All">ទាំងអស់</option>
                  <option value="Online">អនឡាញ</option>
                  <option value="On-Campus">រៀននៅសាលា</option>
                  <option value="Hybrid">ចម្រុះ</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary h-8 w-8" />
          </div>
        ) : (
          <>
            {/* Content Grid */}
            {viewType === 'mission' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {missions.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                      មិនមានបេសកកម្មក្នុងផ្នែកនេះទេ។
                    </div>
                  )}
                  {missions.map((mission) => (
                    <MissionCard key={mission.id} mission={mission} />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                      មិនមានវគ្គសិក្សាតាមការស្វែងរកទេ។
                    </div>
                  )}
                  {courses.map((sc, idx) => (
                    <ShortCourseCard
                      key={sc.id}
                      course={sc}
                      schoolName={sc.schoolName}
                      onCompare={() => handleToggleCompare(sc)}
                      isSelected={!!compareList.find((c) => c.id === sc.id)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="pt-8 pb-4 flex justify-center">
                <button type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-white border border-gray-200 text-gray-600 font-bold py-2 px-6 rounded-full shadow-sm hover:bg-gray-50 disabled:opacity-50 flex items-center text-sm"
                >
                  {loadingMore ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  )}
                  បង្ហាញបន្ថែម (Load More)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Compare Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-96 z-40">
          <div className="bg-gray-900 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {compareList.map((c) => (
                  <img
                    key={c.id}
                    src={c.coverImage || 'https://via.placeholder.com/50'}
                    className="w-8 h-8 rounded-full border border-gray-800 object-cover"
                    alt="cover"
                  />
                ))}
                {compareList.length < 2 && (
                  <div className="w-8 h-8 rounded-full border border-gray-800 bg-gray-800 flex items-center justify-center text-xs text-gray-500">
                    ?
                  </div>
                )}
              </div>
              <span className="text-sm font-bold">{compareList.length}/2 បានជ្រើសរើស</span>
            </div>

            {compareList.length === 2 ? (
              <button type="button"
                onClick={handleAnalyzeComparison}
                className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center animate-pulse"
              >
                <Brain className="h-3 w-3 mr-1" /> AI ប្រៀបធៀប ({AI_COSTS.CHAT} Pt)
              </button>
            ) : (
              <span className="text-xs text-gray-400">ជ្រើសរើស 1 ទៀត</span>
            )}

            <button type="button"
              onClick={() => setState(prev => ({ ...prev, compareList: [] }))}
              className="absolute -top-2 -right-2 bg-gray-700 rounded-full p-1 text-gray-300"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Comparison Result Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl animate-scale-in">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-secondary fill-secondary" />
                <h3 className="font-bold text-gray-900">ការប្រៀបធៀបដោយ AI</h3>
              </div>
              <button type="button" onClick={() => setState(prev => ({ ...prev, showCompareModal: false }))}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {analyzing ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                  <h4 className="font-bold text-gray-800 mb-2">កំពុងវិភាគ...</h4>
                  <p className="text-sm text-gray-500">
                    សុភាទន្សាយកំពុងអានព័ត៌មានលម្អិតជំនួសអ្នក...
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex gap-4 border-b border-gray-100 pb-6">
                    {compareList.map((c) => (
                      <div key={c.id} className="flex-1">
                        <img
                          src={c.coverImage || 'https://via.placeholder.com/300x200'}
                          className="w-full h-24 object-cover rounded-lg mb-2 bg-gray-100"
                          alt="Cover"
                        />
                        <h4 className="font-bold text-xs text-gray-900 line-clamp-2">{c.title}</h4>
                        <p className="text-[10px] text-gray-500">{c.schoolName}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-50">
                    <MarkdownText content={comparisonResult} />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button type="button"
                onClick={() => setState(prev => ({ ...prev, showCompareModal: false }))}
                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl"
              >
                បិទ (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
