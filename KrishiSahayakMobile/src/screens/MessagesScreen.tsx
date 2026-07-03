// Messages Screen — Farmer-to-farmer direct messages
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Header } from '../components';
import { EmptyState } from '../components/ui';
import communityService, { DirectMessage } from '../services/communityService';

const OTHER_USER = { id: 'user2', name: 'Ramesh Kumar' };

export const MessagesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const flatRef = useRef<FlatList>(null);
  const currentUser = { id: 'user1', name: 'You' };

  useEffect(() => {
    const init = async () => {
      const convId = await communityService.getOrCreateConversation(currentUser.id, OTHER_USER.id, currentUser.name, OTHER_USER.name);
      setConversationId(convId);
      const msgs = await communityService.getMessages(convId);
      setMessages(msgs);
    };
    init();
  }, []);

  const send = async () => {
    if (!input.trim() || !conversationId) return;
    await communityService.sendMessage({
      conversationId, senderId: currentUser.id, senderName: currentUser.name,
      recipientId: OTHER_USER.id, message: input.trim(),
    });
    setInput('');
    const msgs = await communityService.getMessages(conversationId);
    setMessages(msgs);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <Header title={OTHER_USER.name} subtitle="Online" onBack={() => navigation.goBack()} />
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatRef.current?.scrollToEnd()}
        ListEmptyComponent={<EmptyState icon="💬" title="Start chatting" description="Say hello to Ramesh!" />}
        renderItem={({ item }) => {
          const isMe = item.senderId === currentUser.id;
          return (
            <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
              <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                <Text style={[styles.msgText, isMe && styles.msgTextMe]}>{item.message}</Text>
                <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>{formatTime(item.timestamp)}</Text>
              </View>
            </View>
          );
        }}
      />
      <View style={styles.inputBar}>
        <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Type a message..." placeholderTextColor={colors.textTertiary}
          returnKeyType="send" onSubmitEditing={send} />
        <TouchableOpacity style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} onPress={send} disabled={!input.trim()}>
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: spacing.md },
  msgRow: { flexDirection: 'row', marginBottom: spacing.md },
  msgRowMe: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '78%', padding: spacing.md, borderRadius: borderRadius.lg },
  bubbleMe: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: colors.white, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.borderLight },
  msgText: { fontSize: typography.fontSize.md, color: colors.textPrimary, lineHeight: 20 },
  msgTextMe: { color: colors.white },
  msgTime: { fontSize: typography.fontSize.xs, color: colors.textTertiary, marginTop: 4, textAlign: 'right' },
  msgTimeMe: { color: 'rgba(255,255,255,0.6)' },
  inputBar: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.borderLight, gap: spacing.sm },
  input: { flex: 1, backgroundColor: colors.background, borderRadius: borderRadius.lg, paddingHorizontal: spacing.lg, height: 44, fontSize: typography.fontSize.md, color: colors.textPrimary },
  sendBtn: { backgroundColor: colors.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: colors.border },
  sendText: { fontSize: 18, color: colors.white },
});

export default MessagesScreen;
