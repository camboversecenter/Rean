
import React, { useState, useEffect } from 'react';
import { Search, Building2, Loader2, ChevronDown } from '../components/Icons';
import SchoolCard from '../components/SchoolCard';
import { fetchAllSchools } from '../services/schoolService';
import { School } from '../types';

const SchoolsListPage: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 10;

  useEffect(() => {
    // Reset list when filters change
    setPage(1);
    setSchools([]);
    setHasMore(true);
    loadData(1, true);
  }, [filterType, searchQuery]);

  const loadData = async (pageToLoad: number, isReset: boolean = false) => {
    if (!isReset) setLoadingMore(true);
    else setLoading(true);

    try {
        const data = await fetchAllSchools(pageToLoad, LIMIT, searchQuery, filterType);
        
        if (data.length < LIMIT) {
            setHasMore(false);
        }

        if (isReset) {
            setSchools(data);
        } else {
            setSchools(prev => [...prev, ...data]);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
        setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
      const nextPage = page + 1;
      setPage(nextPage);
      loadData(nextPage);
  };

  const types = ['All', 'University', 'High School', 'Vocational', 'Center'];
  const typeMapping: Record<string, string> = {
      'All': 'ទាំងអស់',
      'University': 'សាកលវិទ្យាល័យ',
      'High School': 'វិទ្យាល័យ',
      'Vocational': 'វិជ្ជាជីវៈ',
      'Center': 'មជ្ឈមណ្ឌល'
  };

  return (
    <div className="pb-20 pt-4 px-4 min-h-screen bg-gray-50">
       <div className="max-w-5xl mx-auto">
           <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900 mb-4">ការជ្រើសរើសសិស្សថ្មី (Recruitment)</h1>
              
              {/* Search */}
              <div className="relative mb-4">
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="ស្វែងរកតាមឈ្មោះសាលា..." 
                   className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                 />
                 <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              </div>

              {/* Filter Chips */}
              <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
                 {types.map(t => (
                   <button
                     key={t}
                     onClick={() => setFilterType(t)}
                     className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-colors ${filterType === t ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                   >
                     {typeMapping[t]}
                   </button>
                 ))}
              </div>
           </div>

           {/* List (Grid View on Desktop) */}
           <div>
              {loading ? (
                 <div className="flex justify-center py-10">
                     <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                 </div>
              ) : schools.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {schools.map(school => (
                          <SchoolCard key={school.id} school={school} />
                        ))}
                    </div>
                    
                    {/* Load More Button */}
                    {hasMore && (
                        <div className="pt-8 pb-8 flex justify-center">
                            <button 
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="bg-white border border-gray-200 text-gray-600 font-bold py-2 px-6 rounded-full shadow-sm hover:bg-gray-50 disabled:opacity-50 flex items-center text-sm"
                            >
                                {loadingMore ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <ChevronDown className="h-4 w-4 mr-2" />}
                                បង្ហាញបន្ថែម (Load More)
                            </button>
                        </div>
                    )}
                </>
              ) : (
                <div className="text-center py-10 text-gray-500">
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
