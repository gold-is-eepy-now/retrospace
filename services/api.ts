import { Message, Post, User } from '../types';

const API_URL = '/api';

const LS_KEYS = {
  USERS: 'retro_users',
  POSTS: 'retro_posts',
  MSGS: 'retro_msgs',
  SESS: 'retro_sess',
} as const;

const jsonHeaders = { 'Content-Type': 'application/json' };

const safeParseArray = <T>(value: string | null): T[] => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const getLocalList = <T>(key: string): T[] => safeParseArray<T>(localStorage.getItem(key));

const setLocalList = <T>(key: string, list: T[]) => {
  localStorage.setItem(key, JSON.stringify(list));
};

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init);

  if (!response.ok) {
    const fallback = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      throw new Error(payload.error || fallback);
    } catch {
      throw new Error(fallback);
    }
  }

  return response.json();
}

export const api = {
  checkHealth: async (): Promise<boolean> => {
    try {
      await requestJson<{ status: string }>('/health');
      return true;
    } catch {
      return false;
    }
  },

  getUsers: async (useServer: boolean): Promise<User[]> => {
    if (useServer) return requestJson<User[]>('/users');
    return getLocalList<User>(LS_KEYS.USERS);
  },

  createUser: async (user: User, useServer: boolean): Promise<User> => {
    if (useServer) {
      return requestJson<User>('/users', {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify(user),
      });
    }

    const users = getLocalList<User>(LS_KEYS.USERS);
    users.push(user);
    setLocalList(LS_KEYS.USERS, users);
    return user;
  },

  updateUser: async (user: User, useServer: boolean): Promise<User> => {
    if (useServer) {
      return requestJson<User>(`/users/${user.id}`, {
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify(user),
      });
    }

    const users = getLocalList<User>(LS_KEYS.USERS);
    const index = users.findIndex((candidate) => candidate.id === user.id);
    if (index >= 0) {
      users[index] = user;
      setLocalList(LS_KEYS.USERS, users);
    }

    return user;
  },

  getPosts: async (useServer: boolean): Promise<Post[]> => {
    if (useServer) return requestJson<Post[]>('/posts');
    return getLocalList<Post>(LS_KEYS.POSTS);
  },

  createPost: async (post: Post, useServer: boolean): Promise<Post> => {
    if (useServer) {
      return requestJson<Post>('/posts', {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify(post),
      });
    }

    const posts = getLocalList<Post>(LS_KEYS.POSTS);
    posts.unshift(post);
    setLocalList(LS_KEYS.POSTS, posts);
    return post;
  },

  updatePost: async (post: Post, useServer: boolean): Promise<Post> => {
    if (useServer) {
      return requestJson<Post>(`/posts/${post.id}`, {
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify(post),
      });
    }

    const posts = getLocalList<Post>(LS_KEYS.POSTS);
    const index = posts.findIndex((candidate) => candidate.id === post.id);
    if (index >= 0) {
      posts[index] = post;
      setLocalList(LS_KEYS.POSTS, posts);
    }

    return post;
  },

  deletePost: async (postId: string, useServer: boolean): Promise<void> => {
    if (useServer) {
      await requestJson<{ success: boolean }>(`/posts/${postId}`, { method: 'DELETE' });
      return;
    }

    const posts = getLocalList<Post>(LS_KEYS.POSTS).filter((post) => post.id !== postId);
    setLocalList(LS_KEYS.POSTS, posts);
  },

  getMessages: async (useServer: boolean): Promise<Message[]> => {
    if (useServer) return requestJson<Message[]>('/messages');
    return getLocalList<Message>(LS_KEYS.MSGS);
  },

  createMessage: async (message: Message, useServer: boolean): Promise<Message> => {
    if (useServer) {
      return requestJson<Message>('/messages', {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify(message),
      });
    }

    const messages = getLocalList<Message>(LS_KEYS.MSGS);
    messages.push(message);
    setLocalList(LS_KEYS.MSGS, messages);
    return message;
  },

  getSession: () => localStorage.getItem(LS_KEYS.SESS),

  setSession: (userId: string | null) => {
    if (userId) {
      localStorage.setItem(LS_KEYS.SESS, userId);
      return;
    }

    localStorage.removeItem(LS_KEYS.SESS);
  },

  clearLocal: () => {
    localStorage.clear();
    window.location.reload();
  },
};
