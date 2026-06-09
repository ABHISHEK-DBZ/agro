import React, { useState, useEffect } from 'react';
import { BarChart3, Plus, Vote, Clock, CheckCircle, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import communityService, { Poll } from '../services/communityService';
import { useAuth } from '../contexts/AuthContext';

const PollsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const currentUserId = user?.uid || '';
  const currentUserName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'You';

  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    category: 'crops',
    expiryDays: 7
  });

  // Subscribe to active polls real-time
  useEffect(() => {
    setLoading(true);
    const unsubscribe = communityService.subscribeToPolls(undefined, (fetchedPolls) => {
      setPolls(fetchedPolls);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      toast.error(t('profile.loginRequired', 'Please log in to create a poll'));
      return;
    }
    if (!newPoll.question.trim() || newPoll.options.filter(o => o.trim()).length < 2) {
      toast.error(t('common.error', 'Please provide a question and at least 2 options'));
      return;
    }

    try {
      setLoading(true);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + newPoll.expiryDays);

      await communityService.createPoll({
        question: newPoll.question,
        options: newPoll.options
          .filter(o => o.trim())
          .map((text, idx) => ({
            id: `opt_${Date.now()}_${idx}`,
            text,
            votes: 0,
            voters: []
          })),
        createdBy: currentUserId,
        createdByName: currentUserName,
        expiresAt: expiryDate,
        category: newPoll.category
      });

      // Reset & Close
      setNewPoll({ question: '', options: ['', ''], category: 'crops', expiryDays: 7 });
      setShowCreateModal(false);
      toast.success(t('community.pollCreatedSuccess', 'Poll created successfully! 🎉'));
    } catch (error) {
      console.error('Error creating poll:', error);
      toast.error(t('common.error', 'Failed to create poll'));
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    if (!currentUserId) {
      toast.error(t('profile.loginRequired', 'Please log in to vote'));
      return;
    }
    try {
      await communityService.voteOnPoll(pollId, optionId, currentUserId);
      toast.success(t('community.voted', 'Vote recorded!'));
    } catch (error: any) {
      if (error.message === 'User already voted') {
        toast.error(t('community.alreadyVoted', 'You have already voted on this poll'));
      } else {
        console.error('Error voting:', error);
        toast.error(t('common.error', 'Failed to vote'));
      }
    }
  };

  const addOption = () => {
    setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
  };

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll({ ...newPoll, options: newPoll.options.filter((_, i) => i !== index) });
    }
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...newPoll.options];
    updated[index] = value;
    setNewPoll({ ...newPoll, options: updated });
  };

  const getTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    if (diff <= 0) return t('community.remainingSoon', 'Ending soon');
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${t('community.remaining', 'remaining')}`;
    if (hours > 0) return `${hours}h ${t('community.remaining', 'remaining')}`;
    return t('community.remainingSoon', 'Ending soon');
  };

  const hasUserVoted = (poll: Poll) => {
    return poll.options.some(opt => opt.voters.includes(currentUserId));
  };

  const getUserVotedOption = (poll: Poll) => {
    return poll.options.find(opt => opt.voters.includes(currentUserId));
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#14130f] text-[#26241f] dark:text-[#eeece7] pb-12 transition-colors duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2f4328] to-[#39542f] text-white py-10 px-6 shadow-md border-b border-[#2f4328]/10 relative">
        <button
          onClick={() => navigate('/community')}
          className="absolute top-6 left-6 bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white p-2.5 rounded-xl border border-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="max-w-5xl mx-auto px-4 text-center mt-4">
          <div className="flex justify-center mb-3">
            <BarChart3 className="w-12 h-12 text-[#a3bf96]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('community.polls', 'Polls')}</h1>
          <p className="text-[#c7d9bf]/80 mt-1.5 text-sm sm:text-base font-medium">
            {polls.length} {t('community.activeAlerts', 'Active Polls')} • {t('community.pollsSubText', 'Share your opinions with the farming community')}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#7ea26d] hover:bg-[#6c8e5d] text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-md hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4.5 h-4.5" />
            {t('community.createPoll', 'Create Poll')}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#39542f]"></div>
          </div>
        ) : polls.length === 0 ? (
          <div className="bg-white dark:bg-[#1f1d18] rounded-2xl border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] p-16 text-center shadow-sm max-w-xl mx-auto">
            <BarChart3 className="w-14 h-14 text-[#9b9482] mx-auto mb-4 opacity-55" />
            <h3 className="text-lg font-bold mb-1.5">{t('community.noActivePolls', 'No active polls')}</h3>
            <p className="text-sm text-[#7a7364] dark:text-[#9b9482] mb-6">
              {t('community.createFirstPollSub', 'Be the first one to create a poll!')}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#39542f] hover:bg-[#2f4328] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              {t('community.createPoll', 'Create Poll')}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {polls.map(poll => {
              const voted = hasUserVoted(poll);
              const userChoice = getUserVotedOption(poll);

              return (
                <div
                  key={poll.id}
                  className="bg-white dark:bg-[#1f1d18] rounded-2xl border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] shadow-sm p-6 hover:shadow-md hover:border-[#c7d9bf] dark:hover:border-[#39542f] transition-all"
                >
                  {/* Poll Title Info */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-[#26241f] dark:text-[#eeece7] leading-tight mb-2">
                        {poll.question}
                      </h3>
                      <div className="flex items-center gap-3 text-[11px] text-[#9b9482] font-semibold uppercase tracking-wider flex-wrap">
                        <span className="bg-[#f1efe9] dark:bg-[#181713] text-[#615b4f] dark:text-[#bfbaad] px-2 py-0.5 rounded-md">
                          {poll.category}
                        </span>
                        <span>•</span>
                        <span>
                          {poll.totalVotes} {t('community.votes', 'votes')}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          {getTimeRemaining(poll.expiresAt)}
                        </span>
                      </div>
                    </div>
                    {voted && (
                      <span className="bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-green-500/10">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {t('community.voted', 'Voted')}
                      </span>
                    )}
                  </div>

                  {/* Poll Choices (Animated Vote Bars) */}
                  <div className="space-y-3">
                    {poll.options.map(option => {
                      const percentage = poll.totalVotes > 0 
                        ? Math.round((option.votes / poll.totalVotes) * 100) 
                        : 0;
                      const isUserChoice = userChoice?.id === option.id;

                      return (
                        <div key={option.id} className="relative overflow-hidden rounded-xl border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] bg-[#f8f7f5] dark:bg-[#14130f]">
                          {/* Inner animated color block */}
                          {voted && (
                            <div
                              className="absolute left-0 top-0 bottom-0 bg-[#7ea26d]/20 dark:bg-[#7ea26d]/15 transition-all duration-700 ease-out"
                              style={{ width: `${percentage}%` }}
                            />
                          )}

                          <button
                            onClick={() => !voted && handleVote(poll.id, option.id)}
                            disabled={voted}
                            className={`w-full text-left p-4 relative z-10 flex items-center justify-between text-sm transition-all focus:outline-none ${
                              voted ? 'cursor-default' : 'hover:bg-[#dbd8d0]/25 dark:hover:bg-[#3a3630]/25 active:scale-[0.995]'
                            } ${isUserChoice ? 'ring-1 ring-[#39542f]/30' : ''}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{option.text}</span>
                              {isUserChoice && (
                                <CheckCircle className="w-4 h-4 text-[#39542f] dark:text-[#a3bf96]" />
                              )}
                            </div>
                            {voted && (
                              <div className="flex items-center gap-3 text-xs font-bold text-[#7a7364] dark:text-[#9b9482]">
                                <span>{option.votes} {t('community.votes', 'votes')}</span>
                                <span className="text-sm font-extrabold text-[#39542f] dark:text-[#a3bf96]">{percentage}%</span>
                              </div>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-4 border-t border-[rgba(38,36,31,0.04)] dark:border-[rgba(255,255,255,0.04)] text-[11px] text-[#9b9482] dark:text-[#615b4f] font-semibold flex justify-between">
                    <span>
                      {t('words.user', 'Created by')}: <span className="text-[#26241f] dark:text-[#eeece7]">{poll.createdByName}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Poll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-[#1f1d18] rounded-2xl w-full max-w-lg overflow-hidden border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#2f4328] to-[#39542f] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#a3bf96]" />
                <h3 className="font-bold text-lg">{t('community.createPoll', 'Create Poll')}</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreatePoll} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7a7364] dark:text-[#9b9482] mb-1.5">
                  {t('community.question', 'Question')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Which fertilizer gives best results for wheat?"
                  value={newPoll.question}
                  onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-sm focus:outline-none focus:border-[#39542f] text-[#26241f] dark:text-[#eeece7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7a7364] dark:text-[#9b9482] mb-1.5">
                  {t('community.category', 'Category')}
                </label>
                <select
                  value={newPoll.category}
                  onChange={(e) => setNewPoll({ ...newPoll, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-sm focus:outline-none focus:border-[#39542f] text-[#26241f] dark:text-[#eeece7]"
                >
                  <option value="crops">Crops</option>
                  <option value="fertilizers">Fertilizers</option>
                  <option value="equipment">Equipment</option>
                  <option value="market">Market</option>
                  <option value="weather">Weather</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7a7364] dark:text-[#9b9482] mb-1.5">
                  {t('community.options', 'Options')} *
                </label>
                <div className="space-y-2">
                  {newPoll.options.map((option, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder={`${t('community.option', 'Option')} ${idx + 1}`}
                        value={option}
                        onChange={(e) => updateOption(idx, e.target.value)}
                        className="flex-1 px-3.5 py-2 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-xs focus:outline-none focus:border-[#39542f] text-[#26241f] dark:text-[#eeece7]"
                      />
                      {newPoll.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(idx)}
                          className="px-3 py-1 bg-red-500/10 text-red-600 rounded-xl hover:bg-red-500/15 text-xs font-semibold"
                        >
                          {t('community.remove', 'Remove')}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-2 text-xs font-bold text-[#39542f] hover:text-[#2f4328] dark:text-[#a3bf96] flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t('community.addOption', 'Add Option')}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7a7364] dark:text-[#9b9482] mb-1.5">
                  {t('community.duration', 'Duration')}
                </label>
                <select
                  value={newPoll.expiryDays}
                  onChange={(e) => setNewPoll({ ...newPoll, expiryDays: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-sm focus:outline-none focus:border-[#39542f] text-[#26241f] dark:text-[#eeece7]"
                >
                  <option value={1}>1 Day</option>
                  <option value={3}>3 Days</option>
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-[rgba(38,36,31,0.1)] dark:border-[rgba(255,255,255,0.1)] hover:bg-[#f1efe9] dark:hover:bg-[#181713] text-xs font-bold text-[#7a7364] dark:text-[#9b9482] transition-colors"
                >
                  {t('community.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-[#39542f] hover:bg-[#2f4328] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  {loading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>}
                  {t('community.submit', 'Submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollsPage;
