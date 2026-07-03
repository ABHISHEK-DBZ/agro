// Community Service — Local storage based (groups, messages, notifications, polls)
import storageService from './storage';

// ===== Types =====
export interface FarmerGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  privacy: 'public' | 'private';
  createdBy: string;
  createdByName: string;
  members: string[];
  posts: number;
  tags: string[];
  imageUrl?: string;
  createdAt: number;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  message: string;
  read: boolean;
  timestamp: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'reply' | 'like' | 'group_invite' | 'alert' | 'system';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  postId?: string;
  groupId?: string;
  createdAt: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[];
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  createdBy: string;
  createdByName: string;
  category: string;
  expiresAt: string;
  createdAt: number;
}

const KEYS = {
  GROUPS: '@krishi_groups',
  CONVERSATIONS: '@krishi_conversations',
  MESSAGES: '@krishi_messages',
  NOTIFICATIONS: '@krishi_notifications',
  POLLS: '@krishi_polls',
};

class CommunityService {
  // ===== Groups =====
  async getGroups(): Promise<FarmerGroup[]> {
    return (await storageService.getItem<FarmerGroup[]>(KEYS.GROUPS)) || [];
  }

  async createGroup(data: {
    name: string; description: string; category: string;
    privacy: 'public' | 'private'; createdBy: string; createdByName: string; tags: string[];
  }): Promise<FarmerGroup> {
    const groups = await this.getGroups();
    const group: FarmerGroup = {
      id: `group_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ...data,
      members: [data.createdBy],
      posts: 0,
      createdAt: Date.now(),
    };
    groups.unshift(group);
    await storageService.setItem(KEYS.GROUPS, groups);
    return group;
  }

  async joinGroup(groupId: string, userId: string): Promise<void> {
    const groups = await this.getGroups();
    const group = groups.find(g => g.id === groupId);
    if (group && !group.members.includes(userId)) {
      group.members.push(userId);
      await storageService.setItem(KEYS.GROUPS, groups);
    }
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const groups = await this.getGroups();
    const group = groups.find(g => g.id === groupId);
    if (group) {
      group.members = group.members.filter(m => m !== userId);
      await storageService.setItem(KEYS.GROUPS, groups);
    }
  }

  getUserGroups(userId: string, groups: FarmerGroup[]): FarmerGroup[] {
    return groups.filter(g => g.members.includes(userId));
  }

  // ===== Messages =====
  async getConversations(userId: string): Promise<any[]> {
    const all = await storageService.getItem<any[]>(KEYS.CONVERSATIONS) || [];
    return all.filter((c: any) => c.participants?.includes(userId));
  }

  async getMessages(conversationId: string): Promise<DirectMessage[]> {
    const all = await storageService.getItem<DirectMessage[]>(KEYS.MESSAGES) || [];
    return all.filter(m => m.conversationId === conversationId);
  }

  async sendMessage(data: {
    conversationId: string; senderId: string; senderName: string;
    recipientId: string; message: string;
  }): Promise<DirectMessage> {
    const msg: DirectMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      conversationId: data.conversationId,
      senderId: data.senderId,
      senderName: data.senderName,
      message: data.message,
      read: false,
      timestamp: Date.now(),
    };
    const all = await storageService.getItem<DirectMessage[]>(KEYS.MESSAGES) || [];
    all.push(msg);
    await storageService.setItem(KEYS.MESSAGES, all);

    // Update conversation
    let convos = await storageService.getItem<any[]>(KEYS.CONVERSATIONS) || [];
    let convo = convos.find(c => c.id === data.conversationId);
    if (!convo) {
      convo = {
        id: data.conversationId,
        participants: [data.senderId, data.recipientId],
        lastMessage: { text: data.message, senderId: data.senderId, timestamp: Date.now() },
        unreadCount: 0,
      };
      convos.push(convo);
    } else {
      convo.lastMessage = { text: data.message, senderId: data.senderId, timestamp: Date.now() };
    }
    await storageService.setItem(KEYS.CONVERSATIONS, convos);
    return msg;
  }

  async getOrCreateConversation(userId1: string, userId2: string, userName1: string, userName2: string): Promise<string> {
    let convos = await storageService.getItem<any[]>(KEYS.CONVERSATIONS) || [];
    const existing = convos.find((c: any) =>
      c.participants.includes(userId1) && c.participants.includes(userId2)
    );
    if (existing) return existing.id;

    const convoId = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    convos.push({
      id: convoId,
      participants: [userId1, userId2],
      participantNames: { [userId1]: userName1, [userId2]: userName2 },
      lastMessage: null,
      unreadCount: 0,
    });
    await storageService.setItem(KEYS.CONVERSATIONS, convos);
    return convoId;
  }

  // ===== Notifications =====
  async getNotifications(userId: string): Promise<Notification[]> {
    const all = await storageService.getItem<Notification[]>(KEYS.NOTIFICATIONS) || [];
    return all.filter(n => n.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  }

  async addNotification(notif: Omit<Notification, 'id' | 'createdAt'>): Promise<void> {
    const all = await storageService.getItem<Notification[]>(KEYS.NOTIFICATIONS) || [];
    all.unshift({ ...notif, id: `notif_${Date.now()}`, createdAt: Date.now() });
    await storageService.setItem(KEYS.NOTIFICATIONS, all.slice(0, 100)); // Keep last 100
  }

  async markNotificationRead(notifId: string): Promise<void> {
    const all = await storageService.getItem<Notification[]>(KEYS.NOTIFICATIONS) || [];
    const n = all.find(x => x.id === notifId);
    if (n) { n.read = true; await storageService.setItem(KEYS.NOTIFICATIONS, all); }
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    const all = await storageService.getItem<Notification[]>(KEYS.NOTIFICATIONS) || [];
    all.forEach(n => { if (n.userId === userId) n.read = true; });
    await storageService.setItem(KEYS.NOTIFICATIONS, all);
  }

  // ===== Polls =====
  async getPolls(): Promise<Poll[]> {
    return (await storageService.getItem<Poll[]>(KEYS.POLLS)) || [];
  }

  async createPoll(data: {
    question: string; options: PollOption[]; createdBy: string;
    createdByName: string; category: string; expiresAt: Date;
  }): Promise<Poll> {
    const polls = await this.getPolls();
    const poll: Poll = {
      id: `poll_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      question: data.question,
      options: data.options,
      totalVotes: 0,
      createdBy: data.createdBy,
      createdByName: data.createdByName,
      category: data.category,
      expiresAt: data.expiresAt.toISOString(),
      createdAt: Date.now(),
    };
    polls.unshift(poll);
    await storageService.setItem(KEYS.POLLS, polls);
    return poll;
  }

  async voteOnPoll(pollId: string, optionId: string, userId: string): Promise<void> {
    const polls = await this.getPolls();
    const poll = polls.find(p => p.id === pollId);
    if (!poll) throw new Error('Poll not found');
    if (poll.options.some(o => o.voters.includes(userId))) throw new Error('User already voted');
    const opt = poll.options.find(o => o.id === optionId);
    if (!opt) throw new Error('Option not found');
    opt.votes++;
    opt.voters.push(userId);
    poll.totalVotes++;
    await storageService.setItem(KEYS.POLLS, polls);
  }

  // Seed initial data
  async seedInitialData(): Promise<void> {
    const existing = await this.getGroups();
    if (existing.length > 0) return;

    // Seed groups
    const sampleGroups: FarmerGroup[] = [
      { id: 'g1', name: 'Wheat Farmers of Punjab', description: 'A community for wheat farmers in Punjab to share tips, best practices, and market information.', category: 'crop-specific', privacy: 'public', createdBy: 'system', createdByName: 'Admin', members: ['user1', 'user2', 'user3'], posts: 24, tags: ['wheat', 'punjab', 'rabi'], createdAt: Date.now() - 86400000 * 7 },
      { id: 'g2', name: 'Organic Farming Circle', description: 'Learn and share organic farming techniques. Natural pest control, composting, and certification guidance.', category: 'general', privacy: 'public', createdBy: 'system', createdByName: 'Admin', members: ['user1', 'user4'], posts: 18, tags: ['organic', 'natural', 'pesticide-free'], createdAt: Date.now() - 86400000 * 5 },
      { id: 'g3', name: 'Rampur Village Farmers', description: 'Local group for farmers in and around Rampur. Equipment sharing, water management, and collective selling.', category: 'location-based', privacy: 'private', createdBy: 'system', createdByName: 'Admin', members: ['user2', 'user3', 'user5'], posts: 31, tags: ['rampur', 'local', 'equipment'], createdAt: Date.now() - 86400000 * 3 },
      { id: 'g4', name: 'Tomato Growers Network', description: 'Everything about tomato farming — from seedling to market. Pest control, variety selection, pricing.', category: 'crop-specific', privacy: 'public', createdBy: 'system', createdByName: 'Admin', members: ['user1', 'user4', 'user5'], posts: 12, tags: ['tomato', 'pest-control', 'market'], createdAt: Date.now() - 86400000 },
      { id: 'g5', name: 'Tractor & Equipment Share', description: 'Share and rent farming equipment. Tractor, tiller, harvester available for cooperative use.', category: 'equipment-sharing', privacy: 'public', createdBy: 'system', createdByName: 'Admin', members: ['user3', 'user4'], posts: 8, tags: ['tractor', 'equipment', 'rental'], createdAt: Date.now() - 86400000 * 2 },
    ];
    await storageService.setItem(KEYS.GROUPS, sampleGroups);

    // Seed sample notifications
    const sampleNotifs: Notification[] = [
      { id: 'n1', userId: 'user1', type: 'reply', title: 'New reply on your post', message: 'Ramesh replied to your question about wheat sowing', read: false, postId: 'p1', createdAt: Date.now() - 3600000 },
      { id: 'n2', userId: 'user1', type: 'group_invite', title: 'Group invitation', message: 'You were invited to join "Organic Farming Circle"', read: false, groupId: 'g2', createdAt: Date.now() - 7200000 },
      { id: 'n3', userId: 'user1', type: 'alert', title: 'Weather Alert', message: 'Heavy rain expected in your area tomorrow', read: true, createdAt: Date.now() - 86400000 },
      { id: 'n4', userId: 'user1', type: 'like', title: 'Your tip was helpful!', message: '5 farmers found your soil testing tip helpful', read: false, createdAt: Date.now() - 1800000 },
      { id: 'n5', userId: 'user1', type: 'system', title: 'PM-KISAN update', message: 'Next installment of ₹2,000 to be released next week', read: false, createdAt: Date.now() - 300000 },
    ];
    await storageService.setItem(KEYS.NOTIFICATIONS, sampleNotifs);

    // Seed sample polls
    const samplePolls: Poll[] = [
      {
        id: 'poll1', question: 'Which fertilizer gives the best yield for wheat?',
        options: [
          { id: 'o1', text: 'DAP', votes: 12, voters: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11', 'u12'] },
          { id: 'o2', text: 'Urea', votes: 8, voters: ['u13', 'u14', 'u15', 'u16', 'u17', 'u18', 'u19', 'u20'] },
          { id: 'o3', text: 'NPK Complex', votes: 15, voters: ['u21', 'u22', 'u23', 'u24', 'u25', 'u26', 'u27', 'u28', 'u29', 'u30', 'u31', 'u32', 'u33', 'u34', 'u35'] },
          { id: 'o4', text: 'Organic Compost', votes: 5, voters: ['u36', 'u37', 'u38', 'u39', 'u40'] },
        ],
        totalVotes: 40, createdBy: 'admin', createdByName: 'Admin', category: 'fertilizers',
        expiresAt: new Date(Date.now() + 86400000 * 5).toISOString(), createdAt: Date.now() - 86400000 * 2,
      },
      {
        id: 'poll2', question: 'What is the biggest challenge in farming today?',
        options: [
          { id: 'o5', text: 'Water scarcity', votes: 25, voters: Array.from({ length: 25 }, (_, i) => `wa${i}`) },
          { id: 'o6', text: 'Low market prices', votes: 18, voters: Array.from({ length: 18 }, (_, i) => `lp${i}`) },
          { id: 'o7', text: 'Pest & disease', votes: 12, voters: Array.from({ length: 12 }, (_, i) => `pd${i}`) },
          { id: 'o8', text: 'Labor shortage', votes: 8, voters: Array.from({ length: 8 }, (_, i) => `ls${i}`) },
        ],
        totalVotes: 63, createdBy: 'admin', createdByName: 'Admin', category: 'general',
        expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(), createdAt: Date.now() - 86400000,
      },
    ];
    await storageService.setItem(KEYS.POLLS, samplePolls);
  }
}

export const communityService = new CommunityService();
export default communityService;
