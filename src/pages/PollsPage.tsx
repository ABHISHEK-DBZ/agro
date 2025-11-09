import React, { useState, useEffect } from 'react';
import { BarChart3, Plus, Vote, Clock, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import communityService, { Poll } from '../services/communityService';

const PollsPage: React.FC = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    category: 'crops',
    expiryDays: 7
  });
  const currentUserId = 'current_user_id'; // TODO: Get from auth

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      setLoading(true);
      const fetchedPolls = await communityService.getActivePolls();
      setPolls(fetchedPolls);
    } catch (error) {
      console.error('Error loading polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePoll = async () => {
    if (!newPoll.question.trim() || newPoll.options.filter(o => o.trim()).length < 2) {
      alert('Please provide a question and at least 2 options');
      return;
    }

    try {
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
        createdByName: 'Current User', // TODO: Get from auth
        expiresAt: expiryDate,
        category: newPoll.category
      });

      setNewPoll({ question: '', options: ['', ''], category: 'crops', expiryDays: 7 });
      setShowCreateModal(false);
      loadPolls();
      alert('Poll created successfully! 📊');
    } catch (error) {
      console.error('Error creating poll:', error);
      alert('Failed to create poll');
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    try {
      await communityService.voteOnPoll(pollId, optionId, currentUserId);
      loadPolls();
      alert('Vote recorded! ✅');
    } catch (error: any) {
      if (error.message === 'User already voted') {
        alert('You have already voted on this poll');
      } else {
        console.error('Error voting:', error);
        alert('Failed to vote');
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
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return 'Ending soon';
  };

  const hasUserVoted = (poll: Poll) => {
    return poll.options.some(opt => opt.voters.includes(currentUserId));
  };

  const getUserVotedOption = (poll: Poll) => {
    return poll.options.find(opt => opt.voters.includes(currentUserId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 shadow-lg">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <BarChart3 className="w-10 h-10" />
                Community Polls
              </h1>
              <p className="text-blue-100 mt-2">
                {polls.length} Active Polls • Share your opinion on farming decisions
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create Poll
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : polls.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">No active polls</p>
            <p className="text-gray-500">Be the first to create a poll!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700"
            >
              Create First Poll
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {polls.map(poll => {
              const voted = hasUserVoted(poll);
              const userChoice = getUserVotedOption(poll);

              return (
                <div key={poll.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6">
                  {/* Poll Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{poll.question}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Vote className="w-4 h-4" />
                          {poll.totalVotes} votes
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {getTimeRemaining(poll.expiresAt)}
                        </span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                          {poll.category}
                        </span>
                      </div>
                    </div>
                    {voted && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Voted
                      </span>
                    )}
                  </div>

                  {/* Poll Options */}
                  <div className="space-y-3">
                    {poll.options.map(option => {
                      const percentage = poll.totalVotes > 0 
                        ? Math.round((option.votes / poll.totalVotes) * 100) 
                        : 0;
                      const isUserChoice = userChoice?.id === option.id;

                      return (
                        <div key={option.id} className="relative">
                          <button
                            onClick={() => !voted && handleVote(poll.id, option.id)}
                            disabled={voted}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                              voted
                                ? 'cursor-default border-gray-200'
                                : 'cursor-pointer border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                            } ${isUserChoice ? 'border-blue-500 bg-blue-50' : ''}`}
                          >
                            {/* Progress Bar */}
                            {voted && (
                              <div
                                className="absolute inset-0 bg-blue-100 rounded-lg transition-all"
                                style={{ width: `${percentage}%`, opacity: 0.3 }}
                              />
                            )}

                            {/* Option Content */}
                            <div className="relative flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-800">{option.text}</span>
                                {isUserChoice && (
                                  <CheckCircle className="w-4 h-4 text-blue-600" />
                                )}
                              </div>
                              {voted && (
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-gray-600">{option.votes} votes</span>
                                  <span className="text-lg font-bold text-blue-600">{percentage}%</span>
                                </div>
                              )}
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Poll Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                    Created by <span className="font-medium">{poll.createdByName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Poll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="w-7 h-7" />
                Create New Poll
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white hover:bg-blue-700 p-2 rounded-full transition-all"
              >
                <AlertCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Question */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Poll Question <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newPoll.question}
                  onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                  placeholder="e.g., Which fertilizer gives best results for wheat?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={newPoll.category}
                  onChange={(e) => setNewPoll({ ...newPoll, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="crops">Crops</option>
                  <option value="fertilizers">Fertilizers</option>
                  <option value="equipment">Equipment</option>
                  <option value="market">Market</option>
                  <option value="weather">Weather</option>
                  <option value="general">General</option>
                </select>
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Options <span className="text-red-500">*</span> (min 2)
                </label>
                <div className="space-y-2">
                  {newPoll.options.map((option, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      {newPoll.options.length > 2 && (
                        <button
                          onClick={() => removeOption(idx)}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addOption}
                  className="mt-2 text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Option
                </button>
              </div>

              {/* Expiry */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Poll Duration</label>
                <select
                  value={newPoll.expiryDays}
                  onChange={(e) => setNewPoll({ ...newPoll, expiryDays: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 Day</option>
                  <option value={3}>3 Days</option>
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                </select>
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreatePoll}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                Create Poll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollsPage;
