import { User, Post, Message } from '../types';

// Use relative URL so it works on whatever port the server is running on
const API_URL = '/api';

const LS_KEYS = { USERS: 'retro_users', POSTS: 'retro_posts', MSGS: 'retro_msgs', SESS: 'retro_sess' };

export const api = {
  checkHealth: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/health`);
      return res.ok;
    } catch (e) { return false; }
  },

  getUsers: async (useServer: boolean): Promise<User[]> => {
    if (useServer) return (await fetch(`${API_URL}/users`)).json();
    return JSON.parse(localStorage.getItem(LS_KEYS.USERS) || '[]');
  },

  createUser: async (user: User, useServer: boolean): Promise<User> => {
    if (useServer) {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      return res.json();
    }
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

  getPosts: async (useServer: boolean): Promise<Post[]> => {
    if (useServer) return (await fetch(`${API_URL}/posts`)).json();
    return JSON.parse(localStorage.getItem(LS_KEYS.POSTS) || '[]');
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

  getMessages: async (useServer: boolean): Promise<Message[]> => {
    if (useServer) return (await fetch(`${API_URL}/messages`)).json();
    return JSON.parse(localStorage.getItem(LS_KEYS.MSGS) || '[]');
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

  getSession: () => localStorage.getItem(LS_KEYS.SESS),
  setSession: (userId: string | null) => userId ? localStorage.setItem(LS_KEYS.SESS, userId) : localStorage.removeItem(LS_KEYS.SESS),
  clearLocal: () => {
     localStorage.clear();
     window.location.reload();
  }
};