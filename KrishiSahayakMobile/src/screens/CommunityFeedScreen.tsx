// Community Feed Screen — Self-contained local community for farmers
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Header } from '../components';
import { EmptyState, Badge } from '../components/ui';
import storageService from '../services/storage';

// Types
interface Post {
  id: string;
  farmerName: string;
  title: string;
  description: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  timestamp: number;
  likes: number;
  replies: number;
  solved: boolean;
}

interface Reply {
  id: string;
  postId: string;
  farmerName: string;
  content: string;
  timestamp: number;
  isExpert: boolean;
}

const STORAGE_POSTS_KEY = '@krishi_community_posts';
const STORAGE_REPLIES_KEY = '@krishi_community_replies';

const CATEGORIES = [
  { value: 'all', label: 'All', icon: '🌐' },
  { value: 'crops', label: 'Crops', icon: '🌾' },
  { value: 'diseases', label: 'Diseases', icon: '🦠' },
  { value: 'weather', label: 'Weather', icon: '🌤️' },
  { value: 'market', label: 'Market', icon: '💰' },
  { value: 'advice', label: 'Advice', icon: '💡' },
  { value: 'tips', label: 'Tips', icon: '🌟' },
];

const FARMER_NAMES = [
  'Ramesh Kumar', 'Suresh Patel', 'Amit Singh', 'Vijay Sharma',
  'Rajesh Verma', 'Dinesh Yadav', 'Manoj Gupta', 'Sunil Joshi',
  'Anil Das', 'Prakash Rao',
];

export const CommunityFeedScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  // Post form
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('crops');
  const [newUrgency, setNewUrgency] = useState<'low' | 'medium' | 'high'>('medium');

  // Replies
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Load data
  React.useEffect(() => {
    const load = async () => {
      const [savedPosts, savedReplies] = await Promise.all([
        storageService.getItem<Post[]>(STORAGE_POSTS_KEY),
        storageService.getItem<Reply[]>(STORAGE_REPLIES_KEY),
      ]);
      if (savedPosts) setPosts(savedPosts);
      if (savedReplies) setReplies(savedReplies);
      setLoading(false);
    };
    load();
  }, []);

  const savePosts = useCallback(async (updated: Post[]) => {
    setPosts(updated);
    await storageService.setItem(STORAGE_POSTS_KEY, updated);
  }, []);

  const saveReplies = useCallback(async (updated: Reply[]) => {
    setReplies(updated);
    await storageService.setItem(STORAGE_REPLIES_KEY, updated);
  }, []);

  // Seeded random name
  const getRandomName = () => FARMER_NAMES[Math.floor(Math.random() * FARMER_NAMES.length)];

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newDesc.trim()) return;
    const post: Post = {
      id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      farmerName: getRandomName(),
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategory,
      urgency: newUrgency,
      timestamp: Date.now(),
      likes: 0,
      replies: 0,
      solved: false,
    };
    await savePosts([post, ...posts]);
    setShowNewPost(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleLike = async (id: string) => {
    const updated = posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p);
    await savePosts(updated);
  };

  const handleMarkSolved = async (id: string) => {
    const updated = posts.map(p => p.id === id ? { ...p, solved: !p.solved } : p);
    await savePosts(updated);
  };

  const handleDeletePost = async (id: string) => {
    const updated = posts.filter(p => p.id !== id);
    const updatedReplies = replies.filter(r => r.postId !== id);
    await savePosts(updated);
    await saveReplies(updatedReplies);
  };

  const handleOpenReplies = (post: Post) => {
    setSelectedPost(post);
    setShowReplies(true);
  };

  const handleAddReply = async () => {
    if (!replyText.trim() || !selectedPost) return;
    const reply: Reply = {
      id: `reply_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      postId: selectedPost.id,
      farmerName: getRandomName(),
      content: replyText.trim(),
      timestamp: Date.now(),
      isExpert: Math.random() > 0.7,
    };
    const updatedReplies = [...replies, reply];
    await saveReplies(updatedReplies);

    // Update reply count
    const updatedPosts = posts.map(p =>
      p.id === selectedPost.id ? { ...p, replies: p.replies + 1 } : p
    );
    await savePosts(updatedPosts);
    setReplyText('');
  };

  // Filter
  const filtered = useMemo(() => {
    let list = posts;
    if (selectedCategory !== 'all') {
      list = list.filter(p => p.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.farmerName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [posts, selectedCategory, search]);

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const postReplies = useMemo(() => {
    if (!selectedPost) return [];
    return replies.filter(r => r.postId === selectedPost.id);
  }, [replies, selectedPost]);

  return (
    <View style={styles.container}>
      <Header
        title="Community"
        subtitle={posts.length > 0 ? `${posts.length} discussions` : 'Farmer community'}
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowNewPost(true)}>
            <Text style={styles.addBtnText}>+ New Post</Text>
          </TouchableOpacity>
        }
      />

      {/* Category Chips */}
      <View style={styles.catRow}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={c => c.value}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, selectedCategory === item.value && styles.chipActive]}
              onPress={() => setSelectedCategory(item.value)}
            >
              <Text style={styles.chipIcon}>{item.icon}</Text>
              <Text style={[styles.chipText, selectedCategory === item.value && styles.chipTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search discussions..."
        placeholderTextColor={colors.textTertiary}
        value={search}
        onChangeText={setSearch}
      />

      {/* Posts */}
      <FlatList
        data={filtered}
        keyExtractor={p => p.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="💬"
            title={posts.length === 0 ? 'No discussions yet' : 'No matching posts'}
            description={posts.length === 0 ? 'Tap + New Post to start a discussion with other farmers' : 'Try adjusting your search'}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.postAuthor}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.farmerName.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={styles.authorName}>{item.farmerName}</Text>
                  <Text style={styles.postTime}>{formatTime(item.timestamp)}</Text>
                </View>
              </View>
              <Badge
                label={item.urgency}
                variant={item.urgency === 'high' ? 'error' : item.urgency === 'medium' ? 'warning' : 'info'}
                size="sm"
              />
            </View>

            <View style={styles.postCategoryRow}>
              <Badge label={item.category} variant="neutral" size="sm" />
              {item.solved && <Badge label="✓ Solved" variant="success" size="sm" />}
            </View>

            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postDesc}>{item.description}</Text>

            <View style={styles.postActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(item.id)}>
                <Text style={styles.actionIcon}>👍</Text>
                <Text style={styles.actionText}>{item.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenReplies(item)}>
                <Text style={styles.actionIcon}>💬</Text>
                <Text style={styles.actionText}>{item.replies}</Text>
              </TouchableOpacity>
              {!item.solved ? (
                <TouchableOpacity style={styles.solvedBtn} onPress={() => handleMarkSolved(item.id)}>
                  <Text style={styles.solvedText}>Mark Solved</Text>
                </TouchableOpacity>
              ) : (
                <Badge label="✓ Solved" variant="success" size="sm" />
              )}
              <TouchableOpacity onPress={() => handleDeletePost(item.id)}>
                <Text style={styles.deleteBtn}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* New Post Modal */}
      <Modal visible={showNewPost} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.formModal} showsVerticalScrollIndicator={false}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>📝 New Discussion</Text>
              <TouchableOpacity onPress={() => setShowNewPost(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <View style={styles.formBody}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput style={styles.input} value={newTitle} onChangeText={setNewTitle} placeholder="What's on your mind?" />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput style={[styles.input, styles.inputMultiline]} value={newDesc} onChangeText={setNewDesc} placeholder="Share details with the community..." multiline numberOfLines={4} />

              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORIES.filter(c => c.value !== 'all').map(c => (
                  <TouchableOpacity key={c.value} style={[styles.formChip, newCategory === c.value && styles.formChipActive]} onPress={() => setNewCategory(c.value)}>
                    <Text style={styles.chipIcon}>{c.icon}</Text>
                    <Text style={[styles.chipText, newCategory === c.value && styles.chipTextActive]}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Urgency</Text>
              <View style={styles.urgencyRow}>
                {(['low', 'medium', 'high'] as const).map(u => (
                  <TouchableOpacity key={u} style={[styles.urgencyChip, newUrgency === u && styles.urgencyChipActive]} onPress={() => setNewUrgency(u)}>
                    <Text style={[styles.urgencyText, newUrgency === u && styles.urgencyTextActive]}>
                      {u === 'low' ? '🟢 Low' : u === 'medium' ? '🟡 Medium' : '🔴 High'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleCreatePost}>
                <Text style={styles.submitText}>📢 Post to Community</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Replies Modal */}
      <Modal visible={showReplies} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.formModal}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>💬 Replies</Text>
              <TouchableOpacity onPress={() => { setShowReplies(false); setSelectedPost(null); }}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>

            {selectedPost && (
              <>
                {/* Original Post */}
                <View style={styles.replyOriginalPost}>
                  <Text style={styles.replyPostTitle}>{selectedPost.title}</Text>
                  <Text style={styles.replyPostDesc}>{selectedPost.description}</Text>
                </View>

                {/* Replies */}
                <FlatList
                  data={postReplies}
                  keyExtractor={r => r.id}
                  style={styles.replyList}
                  contentContainerStyle={styles.replyListContent}
                  ListEmptyComponent={<EmptyState icon="💬" title="No replies yet" description="Be the first to reply!" />}
                  renderItem={({ item }) => (
                    <View style={styles.replyItem}>
                      <View style={styles.replyHeader}>
                        <View style={[styles.avatarSmall]}>
                          <Text style={styles.avatarSmallText}>{item.farmerName.charAt(0)}</Text>
                        </View>
                        <Text style={styles.replyAuthor}>{item.farmerName}</Text>
                        {item.isExpert && <Badge label="Expert" variant="premium" size="sm" />}
                        <Text style={styles.replyTime}>{formatTime(item.timestamp)}</Text>
                      </View>
                      <Text style={styles.replyContent}>{item.content}</Text>
                    </View>
                  )}
                />

                {/* Reply Input */}
                <View style={styles.replyInputBar}>
                  <TextInput
                    style={styles.replyInput}
                    value={replyText}
                    onChangeText={setReplyText}
                    placeholder="Write a reply..."
                    placeholderTextColor={colors.textTertiary}
                  />
                  <TouchableOpacity style={styles.replySendBtn} onPress={handleAddReply}>
                    <Text style={styles.replySendText}>Send</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  addBtnText: { fontSize: typography.fontSize.sm, color: colors.textInverse, fontWeight: typography.fontWeight.semibold },
  catRow: { paddingVertical: spacing.sm, paddingLeft: spacing.lg, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.background, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border, gap: 4 },
  chipActive: { backgroundColor: colors.primaryFaded, borderColor: colors.primary },
  chipIcon: { fontSize: 14 },
  chipText: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  chipTextActive: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
  searchInput: { marginHorizontal: spacing.lg, marginVertical: spacing.sm, backgroundColor: colors.white, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, height: 40, fontSize: typography.fontSize.md, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
  list: { padding: spacing.lg, paddingBottom: spacing.huge },
  postCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  postAuthor: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.white },
  authorName: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary },
  postTime: { fontSize: typography.fontSize.xs, color: colors.textTertiary },
  postCategoryRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  postTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.xs },
  postDesc: { fontSize: typography.fontSize.sm, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.md },
  postActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.md },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionIcon: { fontSize: 16 },
  actionText: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  solvedBtn: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full, backgroundColor: colors.primaryFaded },
  solvedText: { fontSize: typography.fontSize.xs, color: colors.primary, fontWeight: typography.fontWeight.medium },
  deleteBtn: { fontSize: 16, paddingLeft: spacing.sm },
  // Form Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  formModal: { backgroundColor: colors.white, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, maxHeight: '90%' },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  formTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
  modalClose: { fontSize: typography.fontSize.xl, color: colors.textTertiary, padding: spacing.xs },
  formBody: { padding: spacing.xl },
  inputLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.background, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.fontSize.md, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  inputMultiline: { minHeight: 100, textAlignVertical: 'top' },
  formChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.background, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 4 },
  formChipActive: { backgroundColor: colors.primaryFaded, borderColor: colors.primary },
  urgencyRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  urgencyChip: { flex: 1, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  urgencyChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryFaded },
  urgencyText: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  urgencyTextActive: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
  submitBtn: { backgroundColor: colors.primary, paddingVertical: spacing.lg, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.lg },
  submitText: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.white },
  // Replies
  replyOriginalPost: { padding: spacing.lg, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  replyPostTitle: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.xs },
  replyPostDesc: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  replyList: { maxHeight: 300 },
  replyListContent: { padding: spacing.lg },
  replyItem: { marginBottom: spacing.md },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  avatarSmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  avatarSmallText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: colors.white },
  replyAuthor: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary },
  replyTime: { fontSize: typography.fontSize.xs, color: colors.textTertiary, marginLeft: 'auto' },
  replyContent: { fontSize: typography.fontSize.sm, color: colors.textSecondary, lineHeight: 20, marginLeft: 36 },
  replyInputBar: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.borderLight, gap: spacing.sm },
  replyInput: { flex: 1, backgroundColor: colors.background, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, height: 40, fontSize: typography.fontSize.md, color: colors.textPrimary },
  replySendBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
  replySendText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.white },
});

export default CommunityFeedScreen;
