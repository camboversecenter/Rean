import React, { useState, useEffect } from 'react';
import {
  Zap,
  Mic,
  Camera,
  Heart,
  MessageCircle,
  CheckCircle,
  Award,
  Send,
  X,
  Loader2,
  ChevronDown,
  Ghost,
  User,
  Search,
  ChevronRight,
  Bookmark,
  Clock,
} from './Icons';
import { StudentPost, CommunityReply, ReactionType } from '../types';
import { chatWithAI, AI_COSTS } from '../services/geminiService';
import {
  fetchCommunityFeed,
  createStudentPost,
  createCommunityReply,
  toggleReaction,
  SortOption,
} from '../services/communityService';
import {
  toggleBookmark,
  fetchBookmarkedPostIds,
  fetchSavedPosts,
} from '../services/bookmarkService';
import { getCurrentUser, getCurrentUserProfile } from '../services/authService';
import { canAfford } from '../services/gamificationService';
import { Link, useNavigate } from 'react-router-dom';
import MarkdownText from './MarkdownText';
import CharCounter from './CharCounter';
import ReactionBar from './ReactionBar';
import toast from 'react-hot-toast';

const POST_LIMIT = 500;

const CommunityFeed: React.FC = () => {
  const navigate = useNavigate();
  const [feedState, setFeedState] = React.useReducer(
    (prev: any, next: any) => ({ ...prev, ...(typeof next === 'function' ? next(prev) : next) }),
    {
      activeTab: 'all' as 'all' | 'saved',
      sortBy: 'latest' as SortOption,
      posts: [] as StudentPost[],
      newPostContent: '',
      bountyAmount: 0,
      isAnonymous: false,
      isPosting: false,
      isLoading: true,
      page: 1,
      hasMore: true,
      loadingMore: false,
      searchQuery: '',
      currentUser: null as any,
      userProfile: null as any,
      bookmarkedPosts: new Set<string>(),
    }
  );

  const {
    activeTab,
    sortBy,
    posts,
    newPostContent,
    bountyAmount,
    isAnonymous,
    isPosting,
    isLoading,
    page,
    hasMore,
    loadingMore,
    searchQuery,
    currentUser,
    userProfile,
    bookmarkedPosts,
  } = feedState;

  const setActiveTab = React.useCallback((v: any) => setFeedState({ activeTab: v }), []);
  const setSortBy = React.useCallback((v: any) => setFeedState({ sortBy: v }), []);
  const setPosts = React.useCallback(
    (v: any) =>
      setFeedState((prev: any) => ({ posts: typeof v === 'function' ? v(prev.posts) : v })),
    []
  );
  const setNewPostContent = React.useCallback((v: any) => setFeedState({ newPostContent: v }), []);
  const setBountyAmount = React.useCallback((v: any) => setFeedState({ bountyAmount: v }), []);
  const setIsAnonymous = React.useCallback((v: any) => setFeedState({ isAnonymous: v }), []);
  const setIsPosting = React.useCallback((v: any) => setFeedState({ isPosting: v }), []);
  const setIsLoading = React.useCallback((v: any) => setFeedState({ isLoading: v }), []);
  const setPage = React.useCallback((v: any) => setFeedState({ page: v }), []);
  const setHasMore = React.useCallback((v: any) => setFeedState({ hasMore: v }), []);
  const setLoadingMore = React.useCallback((v: any) => setFeedState({ loadingMore: v }), []);
  const setSearchQuery = React.useCallback((v: any) => setFeedState({ searchQuery: v }), []);
  const setCurrentUser = React.useCallback((v: any) => setFeedState({ currentUser: v }), []);
  const setUserProfile = React.useCallback((v: any) => setFeedState({ userProfile: v }), []);
  const setBookmarkedPosts = React.useCallback(
    (v: any) =>
      setFeedState((prev: any) => ({
        bookmarkedPosts: typeof v === 'function' ? v(prev.bookmarkedPosts) : v,
      })),
    []
  );

  const LIMIT = 10;

  // Load User & Likes on Mount
  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser();
      const profile = await getCurrentUserProfile();
      setCurrentUser(user);
      setUserProfile(profile);

      if (user) {
        fetchBookmarkedPostIds().then(setBookmarkedPosts);
      }
    };
    loadUser();
  }, []);

  const loadData = React.useCallback(
    async (pageToLoad: number, isReset: boolean = false) => {
      if (!isReset) setLoadingMore(true);
      else setIsLoading(true);

      try {
        let data: StudentPost[] = [];

        if (activeTab === 'all') {
          data = await fetchCommunityFeed(pageToLoad, LIMIT, searchQuery, sortBy);
        } else {
          data = await fetchSavedPosts(pageToLoad, LIMIT);
        }

        if (data.length < LIMIT) setHasMore(false);

        if (isReset) setPosts(data);
        else setPosts((prev: StudentPost[]) => [...prev, ...data]);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
        setLoadingMore(false);
      }
    },
    [activeTab, searchQuery, sortBy, LIMIT, setLoadingMore, setIsLoading, setHasMore, setPosts]
  );

  // Search/Load Effect
  useEffect(() => {
    if (activeTab === 'all') {
      const timer = setTimeout(() => {
        setPage(1);
        setHasMore(true);
        loadData(1, true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setPage(1);
      setHasMore(true);
      loadData(1, true);
    }
  }, [activeTab, loadData, setPage, setHasMore]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadData(nextPage, false);
  };

  const handlePost = async () => {
    if (!newPostContent.trim() || newPostContent.length > POST_LIMIT) return;

    if (!currentUser) {
      toast.error('សូមចូលគណនីដើម្បីសួរសំណួរ (Please login)');
      return;
    }

    if (bountyAmount > 0) {
      const freshProfile = await getCurrentUserProfile();
      setUserProfile(freshProfile);

      if (!freshProfile || (freshProfile.spendable_points || 0) < bountyAmount) {
        toast.error(`ពិន្ទុមិនគ្រប់គ្រាន់! អ្នកមាន ${freshProfile?.spendable_points || 0} ពិន្ទុ`);
        return;
      }
    }

    setIsPosting(true);

    try {
      const newPost = await createStudentPost(newPostContent, bountyAmount, isAnonymous);

      if (isAnonymous) {
        newPost.authorName = 'សិស្សអនាមិក (Anonymous)';
        newPost.authorAvatar = '';
      }

      // If we are sorted by 'latest', prepend. Else, we might need to reload to keep sort order correct
      // but prepending is better UX for immediate feedback.
      if (sortBy === 'latest') {
        setPosts((prev: any) => [newPost, ...prev]);
      } else {
        // Just notify and let user refresh if they want to see it in 'trending'
        toast("Posted! Switch to 'Latest' to see it now.", { icon: 'ℹ️' });
      }

      setNewPostContent('');
      setBountyAmount(0);
      setIsAnonymous(false);

      if (userProfile && bountyAmount > 0) {
        const newPoints = (userProfile.spendable_points || 0) - bountyAmount;
        setUserProfile({ ...userProfile, spendable_points: newPoints });
      }

      const systemPrompt = `
          You are "សុភាទន្សាយ" (Sophea Tonsay), a smart student in the REAN community.
          User Question: "${newPost.content}"
          
          GUIDELINES:
          1. Answer in **Khmer language** (ភាសាខ្មែរ).
          2. **TONE:** Casual, friendly, direct. **NO** formal intros like "As an AI..." or "I am Sophea Tonsay".
          3. **CONTENT:** Use the Search Tool to find facts if needed. Keep it under 80 words. Be helpful.
          4. **IGNORE BOUNTY:** Do not mention the bounty or points in your text response.
        `;

      const aiResponseText = await chatWithAI(newPost.content, [], systemPrompt, true);
      const aiReply = await createCommunityReply(newPost.id, aiResponseText, true, []);

      if (sortBy === 'latest') {
        setPosts((prev: any) =>
          prev.map((p: any) =>
            p.id === newPost.id ? { ...p, replies: [aiReply, ...p.replies] } : p
          )
        );
      }

      toast.success('បានបង្ហោះ! សុភាទន្សាយបានឆ្លើយតប។', { icon: '⚡' });
    } catch (error: any) {
      console.error('Posting error:', error);
      toast.error('ការបង្ហោះបរាជ័យ។ ' + (error.message || ''));
    } finally {
      setIsPosting(false);
    }
  };

  const handleReaction = async (post: StudentPost, type: ReactionType) => {
    if (!currentUser) {
      toast.error('សូមចូលគណនីដើម្បីបញ្ចេញមតិ។');
      return;
    }

    // Optimistic UI Update
    setPosts((prev: any) =>
      prev.map((p: any) => {
        if (p.id !== post.id) return p;

        const currentReaction = p.userReaction;
        const newCounts = { ...p.reactions };

        // If clicking same reaction -> remove it
        if (currentReaction === type) {
          newCounts[type] = Math.max(0, newCounts[type] - 1);
          return { ...p, reactions: newCounts, userReaction: null };
        }
        // If clicking diff reaction -> switch it
        else {
          if (currentReaction)
            newCounts[currentReaction] = Math.max(0, newCounts[currentReaction] - 1);
          newCounts[type] = newCounts[type] + 1;
          return { ...p, reactions: newCounts, userReaction: type };
        }
      })
    );

    try {
      await toggleReaction(post.id, 'post', type, post.author_id);
    } catch (error) {
      console.error('Reaction failed', error);
      // Revert on fail (optional, but good practice)
    }
  };

  const handleBookmark = async (post: StudentPost) => {
    if (!currentUser) {
      toast.error('សូមចូលគណនីដើម្បីរក្សាទុក។');
      return;
    }

    const isBookmarked = bookmarkedPosts.has(post.id);

    setBookmarkedPosts((prev: any) => {
      const newSet = new Set(prev);
      if (isBookmarked) newSet.delete(post.id);
      else newSet.add(post.id);
      return newSet;
    });

    if (activeTab === 'saved' && isBookmarked) {
      setPosts((prev: any) => prev.filter((p: any) => p.id !== post.id));
    }

    try {
      const newState = await toggleBookmark(post.id);
      if (newState) toast.success('បានរក្សាទុក! (Saved)');
    } catch (e) {
      console.error(e);
      toast.error('ប្រតិបត្តិការបរាជ័យ។');
      setBookmarkedPosts((prev: any) => {
        const newSet = new Set(prev);
        if (isBookmarked) newSet.add(post.id);
        else newSet.delete(post.id);
        return newSet;
      });
    }
  };

  return (
    <div className="pb-20 pt-4 bg-surface-2 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="px-4 mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-content flex items-center">
              <Zap className="h-5 w-5 text-secondary mr-2 fill-secondary" />
              Lazy Learning (រៀនផ្លូវកាត់)
            </h1>
            <p className="text-xs text-content-muted">ខ្ជិលស្រាវជ្រាវមែនទេ? សួរនៅទីនេះបាន!</p>
          </div>
          {userProfile && (
            <div className="bg-surface border border-line-strong px-3 py-1 rounded-full flex items-center shadow-sm">
              <div className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center text-[8px] text-white font-bold mr-2">
                P
              </div>
              <span className="text-xs font-bold text-content-soft">
                {userProfile.spendable_points || 0} ពិន្ទុ
              </span>
            </div>
          )}
        </div>

        {activeTab === 'all' && (
          <div className="mx-4 mb-6 bg-surface p-4 rounded-2xl shadow-sm border border-line relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-primary"></div>

            <div className="flex gap-3 mb-1">
              {isAnonymous ? (
                <div className="w-10 h-10 rounded-full bg-gray-800 dark:bg-line-strong flex items-center justify-center flex-shrink-0">
                  <Ghost className="h-5 w-5 text-white" />
                </div>
              ) : (
                <img
                  src={userProfile?.avatar_url || 'https://ui-avatars.com/api/?name=Me'}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  alt="Me"
                />
              )}
              <div className="flex-1">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder={
                    isAnonymous ? 'សួរដោយអនាមិក (Ninja Mode)...' : 'តើអ្នកចង់ដឹងអ្វីនៅពេលនេះ?'
                  }
                  className="w-full text-base text-content resize-none focus:outline-none min-h-[60px] placeholder-content-faint bg-transparent py-1"
                  disabled={isPosting}
                  aria-label="New post content"
                />
                <CharCounter current={newPostContent.length} limit={POST_LIMIT} />
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center mt-2 pt-2 border-t border-line gap-2">
              <div className="flex items-center space-x-2">
                <div className="relative group">
                  <select
                    value={bountyAmount}
                    onChange={(e) => setBountyAmount(Number(e.target.value))}
                    className="appearance-none bg-surface-3 text-content-muted text-xs font-bold pl-3 pr-8 py-2 rounded-full hover:bg-line-strong focus:outline-none cursor-pointer"
                    disabled={isPosting}
                    aria-label="Bounty amount"
                  >
                    <option value={0}>គ្មានរង្វាន់</option>
                    <option value={10}>🏆 10 ពិន្ទុ</option>
                    <option value={20}>🏆 20 ពិន្ទុ</option>
                    <option value={50}>🏆 50 ពិន្ទុ</option>
                    <option value={100}>🏆 100 ពិន្ទុ</option>
                  </select>
                  <Award className="absolute right-2 top-2 h-4 w-4 text-content-faint pointer-events-none" />
                </div>

                <button
                  type="button"
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    isAnonymous
                      ? 'bg-gray-800 dark:bg-line-strong text-white border-gray-800 dark:border-line-strong shadow-md'
                      : 'bg-surface text-content-muted border-line-strong hover:bg-surface-2'
                  }`}
                  title="សួរដោយអនាមិក (Ask Anonymously)"
                >
                  {isAnonymous ? (
                    <Ghost className="h-3.5 w-3.5" />
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">
                    {isAnonymous ? 'អនាមិក (On)' : 'អនាមិក (Off)'}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={handlePost}
                disabled={!newPostContent.trim() || isPosting || newPostContent.length > POST_LIMIT}
                className="bg-primary text-white text-sm font-bold px-5 py-2 rounded-full flex items-center shadow-lg shadow-primary/30 disabled:opacity-50 disabled:shadow-none hover:scale-105 transition-transform"
              >
                {isPosting ? (
                  'កំពុងគិត...'
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-1 fill-white" /> សួរភ្លាមៗ ({AI_COSTS.CHAT} Pt)
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="px-4 mb-4 flex flex-col gap-4">
          {/* View Tabs (All vs Saved) */}
          <div className="flex p-1 bg-line-strong rounded-xl shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'all' ? 'bg-surface shadow-sm text-content' : 'text-content-muted hover:text-content-soft'}`}
            >
              សំណួរទាំងអស់ (All)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'saved' ? 'bg-surface shadow-sm text-content' : 'text-content-muted hover:text-content-soft'}`}
            >
              <Bookmark className="h-3 w-3" /> បានរក្សាទុក (Saved)
            </button>
          </div>

          {/* Sorting Filters (Only for 'All' tab) */}
          {activeTab === 'all' && (
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide pb-2">
              <button
                type="button"
                onClick={() => setSortBy('latest')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  sortBy === 'latest'
                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                    : 'bg-surface text-content-muted border-line-strong'
                }`}
              >
                <Clock className="h-3.5 w-3.5" /> ថ្មីៗ (Newest)
              </button>
              <button
                type="button"
                onClick={() => setSortBy('trending')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  sortBy === 'trending'
                    ? 'bg-orange-100 text-orange-700 border-orange-200'
                    : 'bg-surface text-content-muted border-line-strong'
                }`}
              >
                <Zap className={`h-3.5 w-3.5 ${sortBy === 'trending' ? 'fill-orange-600' : ''}`} />{' '}
                កំពុងពេញនិយម (Trending)
              </button>
              <button
                type="button"
                onClick={() => setSortBy('bounty')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  sortBy === 'bounty'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    : 'bg-surface text-content-muted border-line-strong'
                }`}
              >
                <Award className="h-3.5 w-3.5" /> រង្វាន់ច្រើន (High Bounty)
              </button>
            </div>
          )}

          {activeTab === 'all' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-faint" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ស្វែងរកសំណួរ... (Search questions)"
                className="w-full bg-surface border border-line-strong rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                aria-label="Search community"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-surface-3 rounded-full text-content-muted hover:bg-line-strong"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4 px-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-line-strong border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-10 text-content-faint bg-surface rounded-xl border border-dashed border-line-strong">
              {activeTab === 'saved' ? (
                <p>មិនទាន់មានសំណួរដែលបានរក្សាទុកទេ។</p>
              ) : (
                <p>មិនទាន់មានសំណួរទេ។ សួរមុនគេ!</p>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.map((post: any) => {
                  const isPostAnonymous = post.isAnonymous;
                  const displayAuthor = isPostAnonymous
                    ? 'សិស្សអនាមិក (Anonymous Student)'
                    : post.authorName;

                  const acceptedReply = post.replies.find((r: any) => r.accepted);
                  const isSolved = !!acceptedReply;

                  const aiReply = post.replies.find((r: any) => r.isAI && !r.accepted);
                  const latestHumanReply = post.replies.find((r: any) => !r.isAI && !r.accepted);

                  const highlights: CommunityReply[] = [];
                  if (acceptedReply) highlights.push(acceptedReply);
                  if (aiReply && highlights.length < 2) highlights.push(aiReply);
                  if (latestHumanReply && highlights.length < 2) highlights.push(latestHumanReply);

                  const hiddenCount = post.replies.length - highlights.length;
                  const isBookmarked = bookmarkedPosts.has(post.id);

                  return (
                    <div
                      key={post.id}
                      onClick={() => navigate(`/community/question/${post.id}`)}
                      className="bg-surface rounded-xl border border-line shadow-sm p-4 animate-fade-in relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow group h-full flex flex-col"
                    >
                      {(post.bounty_points || 0) > 0 && (
                        <div
                          className={`absolute top-0 right-0 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl shadow-sm z-10 ${
                            isSolved ? 'bg-gray-400 dark:bg-line-strong' : 'bg-yellow-400'
                          }`}
                        >
                          {isSolved ? '🏁 Claimed' : `🏆 ${post.bounty_points} Pts`}
                        </div>
                      )}

                      <div className="flex items-start gap-3 mb-2">
                        {isPostAnonymous ? (
                          <div className="w-9 h-9 rounded-full bg-line-strong flex items-center justify-center border border-line-strong flex-shrink-0">
                            <Ghost className="h-5 w-5 text-content-muted" />
                          </div>
                        ) : (
                          <img
                            src={
                              post.authorAvatar ||
                              `https://ui-avatars.com/api/?name=${post.authorName}`
                            }
                            alt={post.authorName}
                            className="w-9 h-9 rounded-full border border-line object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3
                              className={`text-sm font-bold ${isPostAnonymous ? 'text-content-muted italic' : 'text-content'}`}
                            >
                              {displayAuthor}
                            </h3>
                            <span className="text-[10px] text-content-faint">{post.timestamp}</span>
                          </div>
                          <p className="text-sm text-content font-medium leading-relaxed mt-1 line-clamp-3">
                            {post.content}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1">
                        {highlights.map((reply) => (
                          <div
                            key={reply.id}
                            className={`ml-8 mt-2 pl-3 py-1.5 border-l-2 relative ${
                              reply.accepted
                                ? 'border-green-500 bg-green-50/30 rounded-r-lg'
                                : reply.isAI
                                  ? 'border-primary bg-primary/5 rounded-r-lg'
                                  : 'border-line-strong'
                            }`}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              {reply.isAI ? (
                                <span className="text-lg">🐰</span>
                              ) : (
                                <img
                                  src={
                                    reply.authorAvatar ||
                                    `https://ui-avatars.com/api/?name=${reply.authorName}`
                                  }
                                  className="w-4 h-4 rounded-full"
                                  alt="avt"
                                />
                              )}
                              <span
                                className={`text-[10px] font-bold ${reply.isAI ? 'text-primary' : 'text-content-soft'}`}
                              >
                                {reply.isAI && reply.authorName === 'Kru REAN'
                                  ? 'សុភាទន្សាយ'
                                  : reply.authorName}
                              </span>
                              {reply.accepted && (
                                <span className="ml-auto text-[10px] font-bold text-green-600 flex items-center">
                                  <CheckCircle className="h-3 w-3 mr-1" /> Accepted
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-content-soft leading-relaxed line-clamp-2">
                              <MarkdownText content={reply.content} />
                            </div>
                          </div>
                        ))}
                      </div>

                      {hiddenCount > 0 && (
                        <div className="ml-8 mt-2 text-xs font-bold text-blue-600 hover:underline">
                          មើល {hiddenCount} ចម្លើយទៀត...
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-4 pl-12 border-t border-line pt-2">
                        <ReactionBar
                          reactions={post.reactions}
                          userReaction={post.userReaction}
                          onReact={(type) => handleReaction(post, type)}
                          size="sm"
                        />

                        <div className="flex items-center text-xs text-content-faint ml-2">
                          <MessageCircle className="h-3.5 w-3.5 mr-1" />
                          {post.replies.length}
                        </div>

                        <div className="ml-auto flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookmark(post);
                            }}
                            className={`flex items-center text-xs transition-transform active:scale-90 ${isBookmarked ? 'text-blue-600' : 'text-content-faint hover:text-blue-500'}`}
                            title={isBookmarked ? 'ឈប់រក្សាទុក' : 'រក្សាទុក'}
                            aria-label={isBookmarked ? 'ឈប់រក្សាទុក' : 'រក្សាទុក'}
                          >
                            <Bookmark
                              className={`h-4 w-4 ${isBookmarked ? 'fill-blue-600' : ''}`}
                            />
                          </button>

                          <div className="text-content-faint group-hover:text-primary transition-colors">
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasMore && (
                <div className="pt-4 pb-8 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="bg-surface border border-line-strong text-content-muted font-bold py-2 px-6 rounded-full shadow-sm hover:bg-surface-2 disabled:opacity-50 flex items-center text-sm"
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
      </div>
    </div>
  );
};

export default CommunityFeed;
