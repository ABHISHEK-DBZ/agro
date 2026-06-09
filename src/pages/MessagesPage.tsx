import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Send, Search, Mic, Image as ImageIcon, Smile, ArrowLeft, MoreVertical, Phone, Video, Check, CheckCheck, X } from 'lucide-react';
import communityService, { DirectMessage } from '../services/communityService';
import { useAuth } from '../contexts/AuthContext';
import { EmptyState, Skeleton } from '../components/ui';

interface Conversation {
  conversationId: string;
  participants: { uid: string; name: string; photoURL?: string; online?: boolean }[];
  lastMessage?: { text: string; senderId: string; timestamp: Date };
  unreadCount?: number;
}

const MessagesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, userProfile } = useAuth();
  const currentUserId = user?.uid || '';
  const currentUserName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'You';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to user's conversations
  useEffect(() => {
    if (!currentUserId) return;
    setLoadingConvos(true);
    const unsub = communityService.subscribeToUserConversations?.(currentUserId, (data) => {
      setConversations(data as Conversation[]);
      setLoadingConvos(false);
    });
    if (!unsub) {
      // Fallback to one-time load
      communityService.getUserConversations(currentUserId).then((data) => {
        setConversations(data as Conversation[]);
        setLoadingConvos(false);
      }).catch(() => setLoadingConvos(false));
    }
    return () => { if (typeof unsub === 'function') unsub(); };
  }, [currentUserId]);

  // Subscribe to messages in selected conversation
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }
    const unsub = communityService.subscribeToConversation(
      selectedConversationId,
      (msgs) => setMessages(msgs),
    );
    return () => { if (typeof unsub === 'function') unsub(); };
  }, [selectedConversationId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.conversationId === selectedConversationId) || null,
    [conversations, selectedConversationId],
  );

  const otherParticipant = useMemo(() => {
    if (!selectedConversation) return null;
    return selectedConversation.participants.find((p) => p.uid !== currentUserId) || null;
  }, [selectedConversation, currentUserId]);

  const handleSendMessage = async () => {
    const text = newMessage.trim();
    if (!text || !selectedConversation || !currentUserId) return;
    setSending(true);
    try {
      await communityService.sendDirectMessage({
        conversationId: selectedConversationId!,
        senderId: currentUserId,
        senderName: currentUserName,
        recipientId: otherParticipant?.uid || '',
        message: text,
      });
      setNewMessage('');
    } catch (e) {
      console.error('Failed to send message', e);
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
    setSelectedConversationId(null);
  };

  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    const q = searchTerm.toLowerCase();
    return conversations.filter((c) => {
      const other = c.participants.find((p) => p.uid !== currentUserId);
      return (other?.name || '').toLowerCase().includes(q) ||
        (c.lastMessage?.text || '').toLowerCase().includes(q);
    });
  }, [conversations, searchTerm, currentUserId]);

  const formatTime = (d: Date | string) => {
    const date = typeof d === 'string' ? new Date(d) : d;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return t('messages.justNow', 'just now');
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    const days = Math.floor(minutes / 1440);
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-canvas">
      <div className="h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] flex bg-surface">
        {/* Conversations list */}
        <aside
          className={`w-full md:w-80 lg:w-96 border-r border-subtle flex flex-col ${
            showMobileChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-subtle flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-strong">{t('messages.title', 'Messages')}</h1>
              <p className="text-xs text-muted">{conversations.length} {t('messages.conversations', 'conversations')}</p>
            </div>
            <button
              type="button"
              className="p-1.5 rounded-md hover:bg-sunken text-ink-600"
              aria-label="More"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-subtle">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('messages.searchPlaceholder', 'Search messages...')}
                className="input pl-8 w-full"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {loadingConvos ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-3 w-3/4 mb-1.5" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <EmptyState
                icon={<MessageSquare className="w-10 h-10" />}
                title={t('messages.emptyTitle', 'No conversations yet')}
                description={t('messages.emptyDesc', 'Start a chat with a farmer from the Community page.')}
                className="h-full"
              />
            ) : (
              filteredConversations.map((c) => {
                const other = c.participants.find((p) => p.uid !== currentUserId);
                const initial = (other?.name || '?').charAt(0).toUpperCase();
                const active = c.conversationId === selectedConversationId;
                return (
                  <button
                    key={c.conversationId}
                    type="button"
                    onClick={() => handleSelectConversation(c.conversationId)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 transition-colors ${
                      active ? 'bg-leaf-50 border-l-2 border-leaf-600' : 'hover:bg-sunken border-l-2 border-transparent'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-leaf-100 text-leaf-700 flex items-center justify-center font-semibold">
                        {initial}
                      </div>
                      {other?.online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-leaf-500 border-2 border-surface rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-medium text-strong truncate">{other?.name || 'Unknown'}</span>
                        {c.lastMessage?.timestamp && (
                          <span className="text-[10px] text-muted flex-shrink-0">
                            {formatTime(c.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs text-muted truncate flex-1">
                          {c.lastMessage
                            ? (c.lastMessage.senderId === currentUserId ? 'You: ' : '') + c.lastMessage.text
                            : t('messages.noMessages', 'No messages yet')}
                        </p>
                        {c.unreadCount && c.unreadCount > 0 ? (
                          <span className="min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-leaf-600 text-white text-[10px] font-semibold flex items-center justify-center">
                            {c.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Chat area */}
        <main
          className={`flex-1 flex flex-col bg-canvas ${
            showMobileChat ? 'flex' : 'hidden md:flex'
          }`}
        >
          {selectedConversation && otherParticipant ? (
            <>
              {/* Chat header */}
              <div className="px-3 md:px-4 py-2.5 border-b border-subtle flex items-center gap-3 bg-surface">
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="md:hidden p-1.5 rounded-md hover:bg-sunken"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-9 h-9 rounded-full bg-leaf-100 text-leaf-700 flex items-center justify-center font-semibold">
                  {otherParticipant.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-strong truncate">{otherParticipant.name}</div>
                  <div className="text-xs text-muted flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${otherParticipant.online ? 'bg-leaf-500' : 'bg-ink-300'}`} />
                    {otherParticipant.online ? t('messages.online', 'Online') : t('messages.offline', 'Offline')}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-md hover:bg-sunken text-ink-600" aria-label="Voice call">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-md hover:bg-sunken text-ink-600 hidden sm:inline-flex" aria-label="Video call">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-md hover:bg-sunken text-ink-600" aria-label="More">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 bg-canvas">
                <div className="max-w-3xl mx-auto space-y-2.5">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full py-12">
                      <EmptyState
                        icon={<MessageSquare className="w-10 h-10" />}
                        title={t('messages.startChat', 'Start the conversation')}
                        description={t('messages.startDesc', 'Say hello to break the ice.')}
                      />
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isSender = msg.senderId === currentUserId;
                      const prev = messages[idx - 1];
                      const showAvatar = !isSender && (!prev || prev.senderId !== msg.senderId);
                      return (
                        <div key={msg.id || idx} className={`flex gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}>
                          {!isSender && (
                            <div className="w-7 h-7 rounded-full bg-leaf-100 text-leaf-700 flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ visibility: showAvatar ? 'visible' : 'hidden' }}>
                              {(otherParticipant.name || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className={`max-w-[75%] md:max-w-[60%] ${isSender ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div
                              className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                                isSender
                                  ? 'bg-leaf-600 text-white rounded-br-md'
                                  : 'bg-surface border border-subtle text-ink-900 rounded-bl-md'
                              }`}
                            >
                              {msg.message}
                            </div>
                            <div className={`flex items-center gap-1 mt-1 text-[10px] text-ink-500 ${isSender ? 'flex-row-reverse' : ''}`}>
                              <span>{formatTime(msg.timestamp)}</span>
                              {isSender && (
                                msg.read ? <CheckCheck className="w-3 h-3 text-leaf-600" /> : <Check className="w-3 h-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-subtle px-3 md:px-4 py-3 bg-surface">
                <div className="max-w-3xl mx-auto flex items-end gap-1.5">
                  <button className="p-2 rounded-md hover:bg-sunken text-ink-600 hidden sm:inline-flex" aria-label="Emoji">
                    <Smile className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-md hover:bg-sunken text-ink-600 hidden sm:inline-flex" aria-label="Send image">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-md hover:bg-sunken text-ink-600 hidden sm:inline-flex" aria-label="Voice message">
                    <Mic className="w-5 h-5" />
                  </button>
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      rows={1}
                      placeholder={t('messages.typePlaceholder', 'Type a message...')}
                      className="input resize-none max-h-32 w-full py-2"
                      style={{ minHeight: '2.5rem' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="p-2.5 rounded-md bg-leaf-600 text-white hover:bg-leaf-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <EmptyState
                icon={<MessageSquare className="w-16 h-16 text-ink-300" />}
                title={t('messages.welcomeTitle', 'Welcome to Messages')}
                description={t('messages.welcomeDesc', 'Select a conversation from the left to start chatting with farmers.')}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MessagesPage;
