import { User, Post, Message } from '../types';

const KEYS = {
  USERS: 'retrospace_users_v1',
  POSTS: 'retrospace_posts_v1',
  MESSAGES: 'retrospace_messages_v1',
  SESSION: 'retrospace_session_v1',
};

export const storage = {
  getUsers: (): User[] => {
    try {
      const data = localStorage.getItem(KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  },
  
  saveUsers: (users: User[]) => {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  getPosts: (): Post[] => {
    try {
      const data = localStorage.getItem(KEYS.POSTS);
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  },

  savePosts: (posts: Post[]) => {
    localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
  },

  getMessages: (): Message[] => {
    try {
      const data = localStorage.getItem(KEYS.MESSAGES);
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  },

  saveMessages: (messages: Message[]) => {
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages));
  },

  getSession: (): string | null => {
    return localStorage.getItem(KEYS.SESSION);
  },

  setSession: (userId: string | null) => {
    if (userId) {
      localStorage.setItem(KEYS.SESSION, userId);
    } else {
      localStorage.removeItem(KEYS.SESSION);
    }
  },

  clearAll: () => {
    localStorage.removeItem(KEYS.USERS);
    localStorage.removeItem(KEYS.POSTS);
    localStorage.removeItem(KEYS.MESSAGES);
    localStorage.removeItem(KEYS.SESSION);
    window.location.reload();
  }
};