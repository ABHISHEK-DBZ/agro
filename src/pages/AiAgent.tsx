import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Send, User, Mic, MicOff, Volume2, VolumeX,
  Trash2, Lightbulb,  Sprout,
  Sparkles, Leaf, Droplets, AlertTriangle, Bot, ChevronRight,
  BrainCircuit, WifiOff
} from 'lucide-react';
import openRouterService from '../services/openRouterService';
import { getLocalFallback, getCatchAllResponse } from '../services/localFallbackAi';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  category?: string;
  suggestions?: string[];
  isOffline?: boolean;
}

const suggestions = [
  { icon: Sprout, label: 'Crop Management', questions: ['Best crop for my soil type?', 'What to plant after wheat?', 'Crop rotation tips'] },
  { icon: AlertTriangle, label: 'Pest Control', questions: ['How to control tomato pests?', 'Cotton disease treatment', 'Natural pesticides'] },
  { icon: Leaf, label: 'Soil Health', questions: ['Interpret soil test results', 'Best fertilizers for rice', 'Organic soil improvement'] },
  { icon: Droplets, label: 'Irrigation', questions: ['Water needs for wheat', 'Drip irrigation for chilies', 'Save water in farming'] },
  { icon: BrainCircuit, label: 'Schemes', questions: ['Current mandi prices', 'PM-KISAN benefits', 'Crop insurance guide'] },
];

const cleanText = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .trim();
};

const AiAgent: React.FC = () => {
  const { i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => { setInput(event.results[0][0].transcript); setIsListening(false); };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, [i18n.language]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'greeting',
        text: i18n.language === 'hi'
          ? "नमस्ते! मैं आपका कृषि सहायक हूं। फसलों, मौसम, कीट नियंत्रण और सरकारी योजनाओं के बारे में पूछें।"
          : "Hello! I'm your agriculture assistant. Ask me about crops, weather, pest control, and government schemes.",
        isUser: false,
        timestamp: new Date(),
        category: 'general'
      }]);
    }
  }, []);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => { speechSynthesis.cancel(); setIsSpeaking(false); };

  const addBotMessage = (text: string, category?: string, suggestionsList?: string[], offline?: boolean) => {
    setMessages(prev => [...prev, {
      id: (Date.now() + Math.random()).toString(),
      text,
      isUser: false,
      timestamp: new Date(),
      category,
      suggestions: suggestionsList,
      isOffline: offline
    }]);
  };

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: msg,
      isUser: true,
      timestamp: new Date()
    }]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    // 1. Check local fallback first (instant, guaranteed for known topics)
    const localAnswer = getLocalFallback(msg, i18n.language);

    // 2. Try OpenRouter AI for a comprehensive answer
    try {
      const prompt = `Answer this agriculture question: ${msg}\n\nProvide a concise, practical answer suitable for Indian farmers. Include specific crop names, region info, and actionable steps.`;
      const response = await openRouterService.chat(prompt, i18n.language);

      // API succeeded — use the AI response
      addBotMessage(cleanText(response.text), response.category, response.suggestions);
      setIsOfflineMode(false);
      setIsLoading(false);
      return;
    } catch (err) {
      console.warn('[AI] OpenRouter failed:', err);
    }

    // 3. API failed — use local fallback if available
    if (localAnswer) {
      addBotMessage(localAnswer, 'general', undefined, true);
      setIsOfflineMode(true);
      setIsLoading(false);
      return;
    }

    // 4. Nothing matched — use universal catch-all
    const catchAll = getCatchAllResponse(i18n.language);
    addBotMessage(catchAll, 'general', undefined, true);
    setIsOfflineMode(true);
    setIsLoading(false);
  };

  const clearConversation = () => {
    setMessages([]);
    openRouterService.clearHistory();
    setShowSuggestions(true);
    setIsOfflineMode(false);
  };

  const isVoiceSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  const isSpeechSupported = 'speechSynthesis' in window;

  return (
    <div className="h-[calc(100dvh-3.5rem)] sm:h-[calc(100vh-4rem)] flex flex-col bg-[#f8f7f5] dark:bg-[#14130f]">
      {/* Header */}
      <div className="shrink-0 bg-white dark:bg-[#1f1d18] border-b border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)]" style={{ boxShadow: '0 1px 2px rgba(38,36,31,0.04)' }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#39542f] flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-[#181713] dark:text-[#f1efe9]">Krishi AI</h1>
              <div className="flex items-center gap-1.5">
                {isOfflineMode ? (
                  <>
                    <WifiOff className="w-3 h-3 text-[#dc8a14]" />
                    <p className="text-[11px] text-[#dc8a14] font-medium">Offline Mode</p>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3d8b4d] animate-pulse" />
                    <p className="text-[11px] text-[#7a7364] dark:text-[#9b9482]">Smart Krishi Sahayak</p>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className={`p-2 rounded-lg transition-all ${
                showSuggestions
                  ? 'bg-[#f3f7f1] text-[#476a39] dark:bg-[rgba(93,133,76,0.12)] dark:text-[#a3bf96]'
                  : 'text-[#9b9482] hover:text-[#4d483f] dark:hover:text-[#bfbaad] hover:bg-[#f1efe9] dark:hover:bg-[rgba(255,255,255,0.04)]'
              }`}
              title="Suggestions"
            >
              <Lightbulb className="w-4 h-4" />
            </button>
            {isSpeechSupported && (
              <button
                onClick={isSpeaking ? stopSpeaking : undefined}
                disabled={!isSpeaking}
                className={`p-2 rounded-lg transition-all ${
                  isSpeaking
                    ? 'bg-[#fbf0ee] text-[#b94a3e] dark:bg-[rgba(185,74,62,0.15)] dark:text-[#e06b5e]'
                    : 'text-[#9b9482] hover:text-[#4d483f] dark:hover:text-[#bfbaad] hover:bg-[#f1efe9] dark:hover:bg-[rgba(255,255,255,0.04)]'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={clearConversation}
              className="p-2 rounded-lg text-[#9b9482] hover:text-[#b94a3e] hover:bg-[#fbf0ee] dark:hover:bg-[rgba(185,74,62,0.15)] transition-all"
              title="New conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Suggestion cards */}
          {showSuggestions && messages.length <= 1 && (
            <div className="mb-8">
              <p className="text-xs font-medium text-[#7a7364] dark:text-[#9b9482] uppercase tracking-wider mb-3 px-1">
                Quick Questions
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {suggestions.map((group, i) => {
                  const Icon = group.icon;
                  return (
                    <div key={i} className="bg-white dark:bg-[#1f1d18] rounded-xl border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] overflow-hidden hover:border-[rgba(38,36,31,0.15)] hover:shadow-sm transition-all">
                      <div className="p-2.5 pb-1">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Icon className="w-3.5 h-3.5 text-[#476a39] dark:text-[#7ea26d]" />
                          <span className="text-[11px] font-semibold text-[#3a3630] dark:text-[#bfbaad] truncate">{group.label}</span>
                        </div>
                      </div>
                      <div className="px-2.5 pb-2 space-y-0.5">
                        {group.questions.map((q, j) => (
                          <button
                            key={j}
                            onClick={() => handleSend(q)}
                            className="w-full text-left text-[11px] text-[#7a7364] dark:text-[#9b9482] hover:text-[#39542f] dark:hover:text-[#a3bf96] hover:bg-[#f3f7f1] dark:hover:bg-[rgba(93,133,76,0.08)] rounded-lg px-2 py-1.5 transition-all flex items-center justify-between group"
                          >
                            <span className="truncate">{q}</span>
                            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chat messages */}
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.isUser ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.isUser
                    ? 'bg-[#dbd8d0] dark:bg-[#3a3630]'
                    : 'bg-[#39542f]'
                }`}>
                  {msg.isUser ? (
                    <User className="w-3.5 h-3.5 text-[#615b4f] dark:text-[#9b9482]" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
                <div className={`max-w-[80%] ${msg.isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`px-3.5 py-2.5 ${
                    msg.isUser
                      ? 'bg-[#39542f] text-white rounded-2xl rounded-tr-md shadow-sm'
                      : 'bg-white dark:bg-[#1f1d18] text-[#26241f] dark:text-[#eeece7] rounded-2xl rounded-tl-md border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)]'
                  }`} style={!msg.isUser ? { boxShadow: '0 1px 2px rgba(38,36,31,0.04)' } : undefined}>
                    {!msg.isUser && msg.isOffline && (
                      <div className="flex items-center gap-1 text-[10px] font-medium text-[#dc8a14] mb-1">
                        <WifiOff className="w-3 h-3" />
                        <span>Offline response</span>
                      </div>
                    )}
                    {!msg.isUser && msg.category && msg.category !== 'general' && msg.category !== 'error' && (
                      <div className="text-[10px] font-semibold text-[#476a39] dark:text-[#7ea26d] mb-1 uppercase tracking-widest">
                        {msg.category}
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className={`text-[10px] ${msg.isUser ? 'text-white/50' : 'text-[#9b9482]'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!msg.isUser && isSpeechSupported && (
                        <button
                          onClick={() => speakText(msg.text)}
                          className="p-1 -mr-1 text-[#9b9482] hover:text-[#476a39] transition-colors rounded"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  {!msg.isUser && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {msg.suggestions.slice(0, 3).map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(s)}
                          className="text-[11px] px-2.5 py-1 rounded-full border border-[rgba(38,36,31,0.1)] dark:border-[rgba(255,255,255,0.08)] text-[#615b4f] dark:text-[#9b9482] hover:bg-[#f3f7f1] hover:border-[#c7d9bf] hover:text-[#39542f] dark:hover:bg-[rgba(93,133,76,0.08)] dark:hover:text-[#a3bf96] transition-all"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#39542f] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="px-3.5 py-3 rounded-2xl rounded-tl-md bg-white dark:bg-[#1f1d18] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)]" style={{ boxShadow: '0 1px 2px rgba(38,36,31,0.04)' }}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[#476a39] rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-[#476a39] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="w-1.5 h-1.5 bg-[#476a39] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-[11px] text-[#7a7364]">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="shrink-0 bg-white dark:bg-[#1f1d18] border-t border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)]" style={{ boxShadow: '0 -1px 3px rgba(38,36,31,0.03)' }}>
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 bg-[#f1efe9] dark:bg-[#181713] rounded-2xl px-4 py-1 border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] focus-within:border-[#476a39] focus-within:ring-1 focus-within:ring-[rgba(71,106,57,0.2)] transition-all">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={i18n.language === 'hi' ? "फसल, कीट, मौसम के बारे में पूछें..." : "Ask about crops, pests, weather..."}
              className="flex-1 bg-transparent text-sm text-[#26241f] dark:text-[#eeece7] placeholder-[#9b9482] dark:placeholder-[#615b4f] outline-none py-2 min-w-0"
              disabled={isLoading}
            />
            {isVoiceSupported && (
              <button
                onClick={() => isListening ? recognitionRef.current?.stop() : recognitionRef.current?.start()}
                disabled={isLoading}
                className={`p-2 rounded-xl transition-all ${
                  isListening
                    ? 'bg-[#fbf0ee] text-[#b94a3e] dark:bg-[rgba(185,74,62,0.15)] dark:text-[#e06b5e] animate-pulse'
                    : 'text-[#9b9482] hover:text-[#4d483f] dark:hover:text-[#bfbaad] hover:bg-[#dbd8d0] dark:hover:bg-[rgba(255,255,255,0.06)]'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-xl bg-[#39542f] text-white hover:bg-[#2f4328] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          {isListening && (
            <div className="mt-2 text-center">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#b94a3e] dark:text-[#e06b5e] bg-[#fbf0ee] dark:bg-[rgba(185,74,62,0.1)] px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-[#b94a3e] rounded-full animate-pulse" />
                Listening... speak now
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiAgent;
