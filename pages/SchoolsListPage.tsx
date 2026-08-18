import React, { useState, useEffect } from 'react';
import { Search, Building2, Loader2, ChevronDown } from '../components/Icons';
import SchoolCard from '../components/SchoolCard';
import { fetchAllSchools } from '../services/schoolService';
import { School } from '../types';

const LIMIT = 10;

const SchoolsListPage: React.FC = () => {
  const [state, setState] = useState({
    filterType: 'All',
    searchQuery: '',
    schools: [] as School[],
    loading: true,
    page: 1,
    hasMore: true,
    loadingMore: false,
  });

  const loadData = React.useCallback(
    async (
      pageToLoad: number,
      isReset: boolean = false,
      currentSearchQuery: string,
      currentFilterType: string
    ) => {
      if (!isReset) setState((s) => ({ ...s, loadingMore: true }));
      else setState((s) => ({ ...s, loading: true }));

      try {
        const data = await fetchAllSchools(
          pageToLoad,
          LIMIT,
          currentSearchQuery,
          currentFilterType
        );

        setState((s) => ({
          ...s,
          hasMore: data.length >= LIMIT,
          schools: isReset ? data : [...s.schools, ...data],
          loading: false,
          loadingMore: false,
        }));
      } catch (e) {
        console.error(e);
        setState((s) => ({ ...s, loading: false, loadingMore: false }));
      }
    },
    []
  );

  useEffect(() => {
    // Reset list when filters change
    setState((s) => ({ ...s, page: 1, schools: [], hasMore: true }));
    loadData(1, true, state.searchQuery, state.filterType);
  }, [state.searchQuery, state.filterType, loadData]);

  const handleLoadMore = () => {
    const nextPage = state.page + 1;
    setState((s) => ({ ...s, page: nextPage }));
    loadData(nextPage, false, state.searchQuery, state.filterType);
  };

  const types = ['All', 'University', 'High School', 'Vocational', 'Center'];
  const typeMapping: Record<string, string> = {
    All: 'ទាំងអស់',
    University: 'សាកលវិទ្យាល័យ',
    'High School': 'វិទ្យាល័យ',
    Vocational: 'វិជ្ជាជីវៈ',
    Center: 'មជ្ឈមណ្ឌល',
  };

  return (
    <div className="pb-20 pt-4 px-4 min-h-screen bg-surface-2">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-content mb-4">
            ការជ្រើសរើសសិស្សថ្មី (Recruitment)
          </h1>

          {/* Search */}
          <div className="relative mb-4">
            <input
              id="searchSchools"
              type="text"
              aria-label="Search schools"
              value={state.searchQuery}
              onChange={(e) => setState((s) => ({ ...s, searchQuery: e.target.value }))}
              placeholder="ស្វែងរកតាមឈ្មោះសាលា..."
              className="w-full bg-surface border border-line-strong rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
            />
            <Search className="absolute left-3 top-3 h-5 w-5 text-content-faint" />
          </div>

          {/* Filter Chips */}
          <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
            {types.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setState((s) => ({ ...s, filterType: t }))}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-colors ${state.filterType === t ? 'bg-primary text-white' : 'bg-surface-3 text-content-muted hover:bg-line-strong'}`}
              >
                {typeMapping[t]}
              </button>
            ))}
          </div>
        </div>

        {/* List (Grid View on Desktop) */}
        <div>
          {state.loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
            </div>
          ) : state.schools.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.schools.map((school) => (
                  <SchoolCard key={school.id} school={school} />
                ))}
              </div>

              {/* Load More Button */}
              {state.hasMore && (
                <div className="pt-8 pb-8 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={state.loadingMore}
                    className="bg-surface border border-line-strong text-content-muted font-bold py-2 px-6 rounded-full shadow-sm hover:bg-surface-2 disabled:opacity-50 flex items-center text-sm"
                  >
                    {state.loadingMore ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    )}
                    បង្ហាញបន្ថែម (Load More)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 text-content-muted">
              <Building2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>មិនមានសាលាដែលអ្នកស្វែងរកទេ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolsListPage;
