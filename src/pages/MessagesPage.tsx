import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Search, Circle, Mic, Image as ImageIcon, Smile } from 'lucide-react';
import communityService, { DirectMessage } from '../services/communityService';

const MessagesPage: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const currentUserId = 'current_user_id'; // TODO: Get from auth

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      
      // Subscribe to real-time updates
      const unsubscribe = communityService.subscribeToConversation(
        selectedConversation,
        (newMessages) => {
          setMessages(newMessages);
        }
      );

      return () => unsubscribe();
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const convos = await communityService.getUserConversations(currentUserId);
      setConversations(convos);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const msgs = await communityService.getConversationMessages(conversationId);
      setMessages(msgs);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await communityService.sendDirectMessage({
        conversationId: selectedConversation,
        senderId: currentUserId,
        senderName: 'Current User',
        recipientId: 'recipient_id', // TODO: Get from selected conversation
        message: newMessage
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Conversations List */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-3">
            <MessageSquare className="w-7 h-7" />
            Messages
          </h1>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-200 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-green-700 bg-opacity-50 text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No conversations yet</p>
              <p className="text-sm text-gray-400 mt-1">Start chatting with farmers!</p>
            </div>
          ) : (
            conversations.map((convo, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedConversation(convo.conversationId)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
                  selectedConversation === convo.conversationId ? 'bg-green-50 border-l-4 border-l-green-600' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                      F{idx + 1}
                    </div>
                    <Circle className="w-3 h-3 text-green-500 fill-green-500 absolute bottom-0 right-0" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800 truncate">Farmer {idx + 1}</h3>
                      <span className="text-xs text-gray-500">2m ago</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">Last message preview...</p>
                  </div>

                  {/* Unread Badge */}
                  <div className="w-5 h-5 bg-green-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                F
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-gray-800">Farmer Name</h2>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <Circle className="w-2 h-2 fill-green-600" />
                  Online
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23e5e7eb\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
              <div className="space-y-3 max-w-4xl mx-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No messages yet</p>
                    <p className="text-sm text-gray-400 mt-1">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSender = msg.senderId === currentUserId;
                    
                    return (
                      <div key={msg.id} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md ${isSender ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`rounded-2xl px-4 py-2 shadow-sm ${
                              isSender
                                ? 'bg-green-600 text-white rounded-br-none'
                                : 'bg-white text-gray-800 rounded-bl-none'
                            }`}
                          >
                            <p className="break-words">{msg.message}</p>
                            {msg.imageUrl && (
                              <img src={msg.imageUrl} alt="Shared" className="mt-2 rounded-lg max-w-full" />
                            )}
                          </div>
                          <p className={`text-xs text-gray-500 mt-1 ${isSender ? 'text-right' : 'text-left'}`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center gap-3 max-w-4xl mx-auto">
                <button className="p-2 text-gray-500 hover:text-green-600 transition-colors">
                  <Smile className="w-6 h-6" />
                </button>
                <button className="p-2 text-gray-500 hover:text-green-600 transition-colors">
                  <ImageIcon className="w-6 h-6" />
                </button>
                <button className="p-2 text-gray-500 hover:text-green-600 transition-colors">
                  <Mic className="w-6 h-6" />
                </button>
                
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />

                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Select a Conversation</h2>
              <p className="text-gray-500">Choose a farmer from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
