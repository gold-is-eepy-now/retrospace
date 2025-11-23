import { User, Post, Message } from '../types';

const API_URL = 'http://localhost:3001/api';

// Fallback Key for LocalStorage (Demo Mode)
const LS_KEYS = { USERS: 'retro_users', POSTS: 'retro_posts', MSGS: 'retro_msgs', SESS: 'retro_sess' };

export const api = {
  // Check if server is running
  checkHealth: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/health`);
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  // --- USERS ---
  getUsers: async (useServer: boolean): Promise<User[]> => {
    if (useServer) {
      const res = await fetch(`${API_URL}/users`);
      return res.json();
    }
    const data = localStorage.getItem(LS_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  createUser: async (user: User, useServer: boolean): Promise<User> => {
    if (useServer) {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (!res.ok) throw new Error('Failed to create user');
      return res.json();
    }
    // Fallback
    const users = JSON.parse(localStorage.getItem(LS_KEYS.USERS) || '[]');
    users.push(user);
    localStorage.setItem(LS_KEYS.USERS, JSON.stringify(users));
    return user;
  },

  updateUser: async (user: User, useServer: boolean): Promise<User> => {
      if (useServer) {
          const res = await fetch(`${API_URL}/users/${user.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(user)
          });
          return res.json();
      }
      const users = JSON.parse(localStorage.getItem(LS_KEYS.USERS) || '[]');
      const idx = users.findIndex((u: User) => u.id === user.id);
      if (idx !== -1) {
          users[idx] = user;
          localStorage.setItem(LS_KEYS.USERS, JSON.stringify(users));
      }
      return user;
  },

  // --- POSTS ---
  getPosts: async (useServer: boolean): Promise<Post[]> => {
    if (useServer) {
      const res = await fetch(`${API_URL}/posts`);
      return res.json();
    }
    const data = localStorage.getItem(LS_KEYS.POSTS);
    return data ? JSON.parse(data) : [];
  },

  createPost: async (post: Post, useServer: boolean): Promise<Post> => {
    if (useServer) {
      const res = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
      });
      return res.json();
    }
    const posts = JSON.parse(localStorage.getItem(LS_KEYS.POSTS) || '[]');
    posts.unshift(post);
    localStorage.setItem(LS_KEYS.POSTS, JSON.stringify(posts));
    return post;
  },

  updatePost: async (post: Post, useServer: boolean): Promise<Post> => {
      if(useServer) {
          const res = await fetch(`${API_URL}/posts/${post.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(post)
          });
          return res.json();
      }
      const posts = JSON.parse(localStorage.getItem(LS_KEYS.POSTS) || '[]');
      const idx = posts.findIndex((p: Post) => p.id === post.id);
      if (idx !== -1) {
          posts[idx] = post;
          localStorage.setItem(LS_KEYS.POSTS, JSON.stringify(posts));
      }
      return post;
  },

  deletePost: async (postId: string, useServer: boolean): Promise<void> => {
      if(useServer) {
          await fetch(`${API_URL}/posts/${postId}`, { method: 'DELETE' });
          return;
      }
      let posts = JSON.parse(localStorage.getItem(LS_KEYS.POSTS) || '[]');
      posts = posts.filter((p: Post) => p.id !== postId);
      localStorage.setItem(LS_KEYS.POSTS, JSON.stringify(posts));
  },

  // --- MESSAGES ---
  getMessages: async (useServer: boolean): Promise<Message[]> => {
    if (useServer) {
      const res = await fetch(`${API_URL}/messages`);
      return res.json();
    }
    const data = localStorage.getItem(LS_KEYS.MSGS);
    return data ? JSON.parse(data) : [];
  },

  createMessage: async (msg: Message, useServer: boolean): Promise<Message> => {
    if (useServer) {
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg)
      });
      return res.json();
    }
    const msgs = JSON.parse(localStorage.getItem(LS_KEYS.MSGS) || '[]');
    msgs.push(msg);
    localStorage.setItem(LS_KEYS.MSGS, JSON.stringify(msgs));
    return msg;
  },

  // --- SESSION ---
  getSession: () => {
    return localStorage.getItem(LS_KEYS.SESS);
  },
  
  setSession: (userId: string | null) => {
    if (userId) localStorage.setItem(LS_KEYS.SESS, userId);
    else localStorage.removeItem(LS_KEYS.SESS);
  },

  clearLocal: () => {
     localStorage.removeItem(LS_KEYS.USERS);
     localStorage.removeItem(LS_KEYS.POSTS);
     localStorage.removeItem(LS_KEYS.MSGS);
     localStorage.removeItem(LS_KEYS.SESS);
     window.location.reload();
  }
};