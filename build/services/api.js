const API_URL = '/api';
const LS_KEYS = {
    USERS: 'retro_users',
    POSTS: 'retro_posts',
    MSGS: 'retro_msgs',
    SESS: 'retro_sess',
};
const jsonHeaders = { 'Content-Type': 'application/json' };
const safeParseArray = (value) => {
    if (!value)
        return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
};
const getLocalList = (key) => safeParseArray(localStorage.getItem(key));
const setLocalList = (key, list) => {
    localStorage.setItem(key, JSON.stringify(list));
};
async function requestJson(path, init) {
    const response = await fetch(`${API_URL}${path}`, init);
    if (!response.ok) {
        const fallback = `Request failed with status ${response.status}`;
        try {
            const payload = await response.json();
            throw new Error(payload.error || fallback);
        }
        catch {
            throw new Error(fallback);
        }
    }
    return response.json();
}
export const api = {
    checkHealth: async () => {
        try {
            await requestJson('/health');
            return true;
        }
        catch {
            return false;
        }
    },
    getUsers: async (useServer) => {
        if (useServer)
            return requestJson('/users');
        return getLocalList(LS_KEYS.USERS);
    },
    createUser: async (user, useServer) => {
        if (useServer) {
            return requestJson('/users', {
                method: 'POST',
                headers: jsonHeaders,
                body: JSON.stringify(user),
            });
        }
        const users = getLocalList(LS_KEYS.USERS);
        users.push(user);
        setLocalList(LS_KEYS.USERS, users);
        return user;
    },
    updateUser: async (user, useServer) => {
        if (useServer) {
            return requestJson(`/users/${user.id}`, {
                method: 'PUT',
                headers: jsonHeaders,
                body: JSON.stringify(user),
            });
        }
        const users = getLocalList(LS_KEYS.USERS);
        const index = users.findIndex((candidate) => candidate.id === user.id);
        if (index >= 0) {
            users[index] = user;
            setLocalList(LS_KEYS.USERS, users);
        }
        return user;
    },
    getPosts: async (useServer) => {
        if (useServer)
            return requestJson('/posts');
        return getLocalList(LS_KEYS.POSTS);
    },
    createPost: async (post, useServer) => {
        if (useServer) {
            return requestJson('/posts', {
                method: 'POST',
                headers: jsonHeaders,
                body: JSON.stringify(post),
            });
        }
        const posts = getLocalList(LS_KEYS.POSTS);
        posts.unshift(post);
        setLocalList(LS_KEYS.POSTS, posts);
        return post;
    },
    updatePost: async (post, useServer) => {
        if (useServer) {
            return requestJson(`/posts/${post.id}`, {
                method: 'PUT',
                headers: jsonHeaders,
                body: JSON.stringify(post),
            });
        }
        const posts = getLocalList(LS_KEYS.POSTS);
        const index = posts.findIndex((candidate) => candidate.id === post.id);
        if (index >= 0) {
            posts[index] = post;
            setLocalList(LS_KEYS.POSTS, posts);
        }
        return post;
    },
    deletePost: async (postId, useServer) => {
        if (useServer) {
            await requestJson(`/posts/${postId}`, { method: 'DELETE' });
            return;
        }
        const posts = getLocalList(LS_KEYS.POSTS).filter((post) => post.id !== postId);
        setLocalList(LS_KEYS.POSTS, posts);
    },
    getMessages: async (useServer) => {
        if (useServer)
            return requestJson('/messages');
        return getLocalList(LS_KEYS.MSGS);
    },
    createMessage: async (message, useServer) => {
        if (useServer) {
            return requestJson('/messages', {
                method: 'POST',
                headers: jsonHeaders,
                body: JSON.stringify(message),
            });
        }
        const messages = getLocalList(LS_KEYS.MSGS);
        messages.push(message);
        setLocalList(LS_KEYS.MSGS, messages);
        return message;
    },
    getSession: () => localStorage.getItem(LS_KEYS.SESS),
    setSession: (userId) => {
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
