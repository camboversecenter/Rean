import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchPostById,
  fetchReplies,
  createCommunityReply,
  toggleReaction,
  acceptAnswer,
  updateCommunityReply,
} from '../services/communityService';
import { toggleBookmark, fetchBookmarkedPostIds } from '../services/bookmarkService';
import { canAfford } from '../services/gamificationService';
import { chatWithAI, chatWithAiTag, AI_COSTS } from '../services/geminiService';
import { getCurrentUser } from '../services/authService';
import { StudentPost, CommunityReply, ReactionType } from '../types';
import {
  ChevronLeft,
  Loader2,
  Send,
  MessageCircle,
  CheckCircle,
  Ghost,
  MoreHorizontal,
  User,
  Bookmark,
  Edit,
  Zap,
} from '../components/Icons';
import MarkdownText from '../components/MarkdownText';
import CharCounter from '../components/CharCounter';
import ReactionBar from '../components/ReactionBar';
import toast from 'react-hot-toast';

const REPLY_LIMIT = 1000;

const QuestionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<StudentPost | null>(null);
  const [replies, setReplies] = useState<CommunityReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Combined States
  const [pagination, setPagination] = useState({ page: 1, hasMore: true, loadingMore: false });
  const LIMIT = 20;
  const [replyState, setReplyState] = useState({ content: '', isReplying: false });
  const [editState, setEditState] = useState({ replyId: null as string | null, content: '' });

  // Interaction
  const [bookmarked, setBookmarked] = useState(false);

  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  const loadReplies = React.useCallback(
    async (pageToLoad: number, reset: boolean = false) => {
      if (!id) return;
      if (!reset) setPagination((p) => ({ ...p, loadingMore: true }));

      try {
        const newReplies = await fetchReplies(id, pageToLoad, LIMIT);
        if (newReplies.length < LIMIT) setPagination((p) => ({ ...p, hasMore: false }));

        if (reset) {
          setReplies(newReplies);
        } else {
          setReplies((prev) => [...prev, ...newReplies]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setPagination((p) => ({ ...p, loadingMore: false }));
      }
    },
    [id, LIMIT]
  );

  useEffect(() => {
    const init = async () => {
      if (!id) return;
      const user = await getCurrentUser();
      setCurrentUser(user);

      const postData = await fetchPostById(id);
      setPost(postData);

      if (user) {
        const bookmarks = await fetchBookmarkedPostIds();
        if (bookmarks.has(id)) setBookmarked(true);
      }

      await loadReplies(1, true);

      setLoading(false);
    };
    init();
  }, [id, loadReplies]);

  const handleLoadMore = () => {
    const nextPage = pagination.page + 1;
    setPagination((p) => ({ ...p, page: nextPage }));
    loadReplies(nextPage);
  };

  const handlePostReaction = async (type: ReactionType) => {
    if (!post || !currentUser) {
      toast.error('Please login to react.');
      return;
    }

    const currentReaction = post.userReaction;
    const newCounts = { ...post.reactions };

    if (currentReaction === type) {
      newCounts[type] = Math.max(0, newCounts[type] - 1);
      setPost({ ...post, reactions: newCounts, userReaction: null });
    } else {
      if (currentReaction) newCounts[currentReaction] = Math.max(0, newCounts[currentReaction] - 1);
      newCounts[type] = newCounts[type] + 1;
      setPost({ ...post, reactions: newCounts, userReaction: type });
    }

    try {
      await toggleReaction(post.id, 'post', type, post.author_id);
    } catch (e) {
      console.error('Reaction failed');
    }
  };

  const handleReplyReaction = async (reply: CommunityReply, type: ReactionType) => {
    if (!currentUser) {
      toast.error('Please login to react.');
      return;
    }

    setReplies((prev) =>
      prev.map((r) => {
        if (r.id !== reply.id) return r;
        const current = r.userReaction;
        const counts = { ...r.reactions };
        if (current === type) {
          counts[type] = Math.max(0, counts[type] - 1);
          return { ...r, reactions: counts, userReaction: null };
        } else {
          if (current) counts[current] = Math.max(0, counts[current] - 1);
          counts[type] = counts[type] + 1;
          return { ...r, reactions: counts, userReaction: type };
        }
      })
    );

    try {
      await toggleReaction(reply.id, 'reply', type, reply.author_id);
    } catch (e) {
      console.error('Reaction failed');
    }
  };

  const handleBookmark = async () => {
    if (!post) return;
    if (!currentUser) {
      toast.error('សូមចូលគណនីដើម្បីរក្សាទុក។');
      return;
    }

    const newStatus = !bookmarked;
    setBookmarked(newStatus);

    try {
      const serverStatus = await toggleBookmark(post.id);
      setBookmarked(serverStatus);
      if (serverStatus) toast.success('Saved to bookmarks!');
    } catch (e) {
      toast.error('Failed to bookmark.');
      setBookmarked(!newStatus);
    }
  };

  const handleSubmitReply = async () => {
    if (
      !replyState.content.trim() ||
      !post ||
      !currentUser ||
      replyState.content.length > REPLY_LIMIT
    ) {
      if (!currentUser) toast.error('Please login to reply.');
      return;
    }

    // --- AI TAGGING LOGIC ---
    const isTaggingAI = /@(tonsay|sopheatonsay)\b/i.test(replyState.content);
    const cost = isTaggingAI ? AI_COSTS.TAG_REPLY : 0;

    if (isTaggingAI) {
      const affordable = await canAfford(cost);
      if (!affordable) {
        toast.error(`មិនមានពិន្ទុគ្រប់គ្រាន់សម្រាប់ហៅ @tonsay (ត្រូវការ ${cost} ពិន្ទុ)`);
        return;
      }
    }

    setReplyState((s) => ({ ...s, isReplying: true }));
    try {
      // 1. Save user reply
      const newReply = await createCommunityReply(post.id, replyState.content, false);
      setReplies((prev) => [...prev, newReply]);
      setReplyState((s) => ({ ...s, content: '' }));

      // 2. Handle AI if tagged
      if (isTaggingAI) {
        // NOTE: We do NOT manually call spendPoints here anymore.
        // The chatWithAiTag service will invoke the Edge Function which handles the deduction authoritatively.

        toast.loading(`Calling @tonsay... (-${cost} Pts)`, { duration: 2000 });

        const systemPrompt = `
                    You are "សុភាទន្សាយ" (Sophea Tonsay), a smart and helpful senior student in the REAN community.
                    
                    CONTEXT:
                    The user has tagged you in a reply to a question.
                    Original Question: "${post.content}"
                    User's Reply (Tagging you): "${replyState.content}"
                    
                    INSTRUCTIONS:
                    1.  **TONE:** Casual, friendly, like a peer/student. **DO NOT** use formal introductions (e.g., do NOT say "In my name as Sophea Tonsay..." or "I am happy to explain..."). Just answer the question directly.
                    2.  **LANGUAGE:** Respond primarily in **KHMER** (ភាសាខ្មែរ). You may use English for technical terms.
                    3.  **PROHIBITED:** Do NOT use Thai, Vietnamese, or Lao scripts/languages.
                    4.  **SPAM FILTER:** If the user's input is gibberish, offensive, or spam, return exactly: "__IGNORE__".
                    5.  **CONTENT:** Be concise and direct. Do NOT mention bounties or points.
                `;

        try {
          // This service call handles server-side payment
          const aiResponseText = await chatWithAiTag(replyState.content, systemPrompt);

          if (aiResponseText && !aiResponseText.includes('__IGNORE__')) {
            const aiReply = await createCommunityReply(post.id, aiResponseText, true);
            setReplies((prev) => [...prev, aiReply]);
            toast.success('សុភាទន្សាយបានឆ្លើយតប!');
          } else {
            console.log('AI ignored spam/empty tag');
            toast.error('AI ignored the request (Spam detected). Points deducted.');
          }
        } catch (aiError: any) {
          console.error('AI Tag Error:', aiError);
          toast.error(`Error: ${aiError.message || 'AI Busy'}`);
        }
      } else {
        toast.success('បានបន្ថែមចម្លើយ!');
      }

      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (e) {
      toast.error('Failed to reply.');
    } finally {
      setReplyState((s) => ({ ...s, isReplying: false }));
    }
  };

  const handleAcceptAnswer = async (reply: CommunityReply) => {
    if (!post || currentUser?.id !== post.author_id || reply.accepted) return;
    if (!window.confirm('Accept this answer?')) return;

    try {
      await acceptAnswer(post.id, reply.id, reply.author_id);
      setReplies((prev) => prev.map((r) => (r.id === reply.id ? { ...r, accepted: true } : r)));
      toast.success('Accepted answer!');
    } catch (e) {
      toast.error('Failed to accept.');
    }
  };

  const handleEditClick = (reply: CommunityReply) => {
    setEditState({ replyId: reply.id, content: reply.content });
  };

  const handleCancelEdit = () => {
    setEditState({ replyId: null, content: '' });
  };

  const handleSaveEdit = async (replyId: string) => {
    if (!editState.content.trim() || editState.content.length > REPLY_LIMIT) return;
    try {
      await updateCommunityReply(replyId, editState.content);
      setReplies((prev) =>
        prev.map((r) => (r.id === replyId ? { ...r, content: editState.content } : r))
      );
      toast.success('កែប្រែបានជោគជ័យ! (Updated)');
      setEditState({ replyId: null, content: '' });
    } catch (e) {
      toast.error('Failed to update.');
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );
  if (!post) return <div className="p-10 text-center">Question not found.</div>;

  const isPostAnonymous = post.isAnonymous;
  const displayAuthor = isPostAnonymous ? 'សិស្សអនាមិក' : post.authorName;
  const isTaggingAI = /@(tonsay|sopheatonsay)\b/i.test(replyState.content);

  return (
    <div className="bg-gray-50 min-h-screen pb-32 font-sans">
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-gray-900">សំណួរ (Question)</h1>
            <p className="text-xs text-gray-500">{replies.length} ចម្លើយ</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleBookmark}
          aria-label="Bookmark"
          className={`p-2 rounded-full transition-colors ${bookmarked ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
        >
          <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-blue-600' : ''}`} />
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-start gap-4 mb-4">
            {isPostAnonymous ? (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
                <Ghost className="h-6 w-6 text-gray-500" />
              </div>
            ) : (
              <img
                src={post.authorAvatar || `https://ui-avatars.com/api/?name=${post.authorName}`}
                className="w-12 h-12 rounded-full object-cover border border-gray-200"
                alt="Author Avatar"
              />
            )}
            <div>
              <h2
                className={`font-bold text-gray-900 ${isPostAnonymous ? 'italic text-gray-500' : ''}`}
              >
                {displayAuthor}
              </h2>
              <p className="text-xs text-gray-400">{post.timestamp}</p>
            </div>
            {/* Fix: Explicitly check > 0 to prevent rendering '0' */}
            {(post.bounty_points || 0) > 0 && (
              <div className="ml-auto bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full border border-yellow-200">
                🏆 {post.bounty_points} Pts
              </div>
            )}
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-3 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </h3>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
            <ReactionBar
              reactions={post.reactions}
              userReaction={post.userReaction}
              onReact={handlePostReaction}
              size="md"
            />
            <div className="h-4 w-[1px] bg-gray-200 mx-2"></div>
            <button
              type="button"
              onClick={() => replyInputRef.current?.focus()}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <MessageCircle className="h-5 w-5" /> ឆ្លើយតប
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">
            ចម្លើយទាំងអស់ ({replies.length})
          </h3>

          {replies.length === 0 && (
            <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
              <p>មិនទាន់មានចម្លើយទេ។ ឆ្លើយមុនគេ!</p>
            </div>
          )}

          {replies.map((reply) => (
            <div
              key={reply.id}
              className={`bg-white rounded-xl p-4 shadow-sm border ${
                reply.accepted
                  ? 'border-green-500 ring-1 ring-green-500 bg-green-50/10'
                  : reply.isAI
                    ? 'border-blue-100 bg-blue-50/20'
                    : 'border-gray-100'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {reply.isAI ? (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-lg">🐰</span>
                    </div>
                  ) : (
                    <img
                      src={
                        reply.authorAvatar || `https://ui-avatars.com/api/?name=${reply.authorName}`
                      }
                      className="w-8 h-8 rounded-full object-cover"
                      alt="Avatar"
                    />
                  )}
                  <div>
                    <p
                      className={`text-sm font-bold ${reply.isAI ? 'text-primary' : 'text-gray-900'}`}
                    >
                      {reply.isAI && reply.authorName === 'Kru REAN'
                        ? 'សុភាទន្សាយ (AI)'
                        : reply.authorName}
                    </p>
                    <p className="text-[10px] text-gray-400">{reply.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {reply.accepted && (
                    <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-[10px] font-bold flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" /> Accepted
                    </span>
                  )}
                  {!reply.accepted && !reply.isAI && currentUser?.id === post.author_id && (
                    <button
                      type="button"
                      onClick={() => handleAcceptAnswer(reply)}
                      className="text-gray-400 hover:text-green-600 p-1"
                      title="Accept Answer"
                      aria-label="Accept Answer"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                  )}
                  {!reply.isAI &&
                    currentUser?.id === reply.author_id &&
                    editState.replyId !== reply.id && (
                      <button
                        type="button"
                        onClick={() => handleEditClick(reply)}
                        className="text-gray-400 hover:text-blue-600 p-1"
                        title="Edit Reply"
                        aria-label="Edit Reply"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                </div>
              </div>

              {editState.replyId === reply.id ? (
                <div className="pl-10 mt-2 animate-fade-in">
                  <textarea
                    value={editState.content}
                    aria-label="Edit reply"
                    onChange={(e) => setEditState((s) => ({ ...s, content: e.target.value }))}
                    className="w-full p-3 bg-gray-50 border border-blue-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:outline-none resize-none"
                    rows={3}
                  />
                  <CharCounter current={editState.content.length} limit={REPLY_LIMIT} />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      បោះបង់ (Cancel)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(reply.id)}
                      disabled={editState.content.length > REPLY_LIMIT || !editState.content.trim()}
                      className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      រក្សាទុក (Save)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-800 leading-relaxed pl-10 mb-3">
                  <MarkdownText content={reply.content} />
                </div>
              )}

              {/* Reply Reactions */}
              <div className="pl-10">
                <ReactionBar
                  reactions={reply.reactions}
                  userReaction={reply.userReaction}
                  onReact={(type) => handleReplyReaction(reply, type)}
                  size="sm"
                />
              </div>
            </div>
          ))}

          {pagination.hasMore && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={pagination.loadingMore}
              className="w-full py-3 text-sm text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition-colors flex items-center justify-center"
            >
              {pagination.loadingMore ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'បង្ហាញបន្ថែម (Load More)'
              )}
            </button>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 md:p-4 z-50">
        <div className="max-w-3xl mx-auto flex flex-col gap-1">
          <div className="flex gap-3">
            <textarea
              ref={replyInputRef}
              aria-label="Write your reply"
              value={replyState.content}
              onChange={(e) => setReplyState((s) => ({ ...s, content: e.target.value }))}
              placeholder="សរសេរចម្លើយរបស់អ្នក..."
              className="flex-1 bg-gray-100 border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none h-12 max-h-32"
            />
            <button
              type="button"
              onClick={handleSubmitReply}
              disabled={
                replyState.isReplying ||
                !replyState.content.trim() ||
                replyState.content.length > REPLY_LIMIT
              }
              className={`p-3 rounded-xl transition-all disabled:opacity-50 flex-shrink-0 ${isTaggingAI ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shadow-yellow-200' : 'bg-primary text-white hover:bg-primary/90'}`}
              aria-label="Send reply"
            >
              {replyState.isReplying ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isTaggingAI ? (
                <div className="flex flex-col items-center leading-none">
                  <Send className="h-4 w-4 mb-0.5" />
                  <span className="text-[8px] font-bold opacity-90">-{AI_COSTS.TAG_REPLY} Pts</span>
                </div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          <div className="flex justify-between items-center pr-2 pl-2 mt-1">
            <p className="text-[10px] text-gray-400">
              Tip: Tag{' '}
              <span
                className="font-bold text-primary cursor-pointer hover:underline"
                onClick={() => setReplyState((s) => ({ ...s, content: s.content + '@tonsay ' }))}
              >
                @tonsay
              </span>{' '}
              to get AI help ({AI_COSTS.TAG_REPLY} pts).
            </p>
            <CharCounter current={replyState.content.length} limit={REPLY_LIMIT} className="mt-0" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailPage;
