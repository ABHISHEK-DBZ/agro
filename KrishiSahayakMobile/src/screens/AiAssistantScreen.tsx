// AI Assistant Screen — Chat-based farming assistant with local + Gemini AI
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Header } from '../components';
import geminiAiService from '../services/geminiAiService';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  category?: string;
  suggestions?: string[];
}

const QUICK_QUESTIONS = [
  { id: '1', icon: '🌾', question: 'Wheat cultivation tips' },
  { id: '2', icon: '🐛', question: 'Tomato pest control' },
  { id: '3', icon: '🧪', question: 'How to test soil?' },
  { id: '4', icon: '💰', question: 'PM-KISAN scheme' },
  { id: '5', icon: '💧', question: 'Drip irrigation guide' },
  { id: '6', icon: '🌱', question: 'Organic farming start' },
];

export const AiAssistantScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        text: '🌾 **Krishi AI Assistant**\n\nNamaste! 🙏 Ask me about crops, weather, pest control, soil, irrigation, government schemes, or any farming topic.\n\nI can help in both English and Hindi!',
        isUser: false,
        timestamp: new Date(),
        category: 'general',
      }]);
    }
  }, []);

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      text: msg,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    // Detect if question is in Hindi
    const isHindi = /[\u0900-\u097F]/.test(msg);
    const lang = isHindi ? 'hi' : 'en';

    try {
      const response = await geminiAiService.getAgricultureResponse(msg, lang);

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        text: response.text,
        isUser: false,
        timestamp: new Date(),
        category: response.category,
        suggestions: response.suggestions,
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `err_${Date.now()}`,
        text: 'Sorry, something went wrong. Please try again.',
        isUser: false,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSend(question);
  };

  const clearChat = () => {
    setMessages([]);
    geminiAiService.clearHistory();
    setShowSuggestions(true);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.msgRow, item.isUser && styles.msgRowUser]}>
      {!item.isUser && (
        <View style={styles.botAvatar}>
          <Text style={styles.botAvatarText}>🌾</Text>
        </View>
      )}
      <View style={styles.msgContent}>
        <View style={[styles.msgBubble, item.isUser ? styles.msgBubbleUser : styles.msgBubbleBot]}>
          {item.category && !item.isUser && item.category !== 'general' && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {item.category === 'crop' ? '🌾 Crop' :
                 item.category === 'pest' ? '🐛 Pest' :
                 item.category === 'soil' ? '🧪 Soil' :
                 item.category === 'irrigation' ? '💧 Water' :
                 item.category === 'weather' ? '🌤️ Weather' :
                 item.category === 'market' ? '💰 Market' :
                 item.category === 'scheme' ? '🏛️ Scheme' :
                 item.category === 'organic' ? '🌱 Organic' : '🌿 Agri'}
              </Text>
            </View>
          )}
          <Text style={[styles.msgText, item.isUser && styles.msgTextUser]}>
            {item.text}
          </Text>
          <Text style={[styles.msgTime, item.isUser && styles.msgTimeUser]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
        {/* Follow-up suggestions */}
        {!item.isUser && item.suggestions && item.suggestions.length > 0 && (
          <View style={styles.suggestionRow}>
            {item.suggestions.slice(0, 3).map((s, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestionChip}
                onPress={() => handleSend(s)}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Header
        title="Krishi AI"
        subtitle="Farming assistant"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={clearChat} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>🗑️</Text>
          </TouchableOpacity>
        }
      />

      {/* Quick suggestion chips shown at start */}
      {showSuggestions && messages.length <= 1 && (
        <View style={styles.quickRow}>
          <Text style={styles.quickTitle}>Quick Questions</Text>
          <View style={styles.quickGrid}>
            {QUICK_QUESTIONS.map(q => (
              <TouchableOpacity
                key={q.id}
                style={styles.quickChip}
                onPress={() => handleQuickQuestion(q.question)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickChipIcon}>{q.icon}</Text>
                <Text style={styles.quickChipText}>{q.question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={m => m.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.loadingRow}>
              <View style={styles.botAvatar}>
                <Text style={styles.botAvatarText}>🌾</Text>
              </View>
              <View style={styles.loadingBubble}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Thinking...</Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* Input area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask about farming..."
            placeholderTextColor={colors.textTertiary}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || isLoading}
          >
            <Text style={styles.sendBtnText}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  clearBtn: { padding: spacing.sm },
  clearBtnText: { fontSize: 18 },

  // Quick questions
  quickRow: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  quickTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  quickChipIcon: { fontSize: 14 },
  quickChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },

  // Messages
  list: { padding: spacing.lg, paddingBottom: spacing.md },
  msgRow: { flexDirection: 'row', marginBottom: spacing.lg, gap: spacing.sm },
  msgRowUser: { justifyContent: 'flex-end' },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  botAvatarText: { fontSize: 16 },
  msgContent: { flex: 1, maxWidth: '82%' },
  msgBubble: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  msgBubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  msgBubbleBot: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryBadge: {
    backgroundColor: colors.primaryFaded,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  msgText: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  msgTextUser: { color: colors.white },
  msgTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  msgTimeUser: { color: 'rgba(255,255,255,0.6)' },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  suggestionChip: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },

  // Loading
  loadingRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderBottomLeftRadius: 4,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },

  // Input
  inputContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  sendBtnDisabled: { backgroundColor: colors.border },
  sendBtnText: { fontSize: 18, color: colors.white },
});

export default AiAssistantScreen;
