const KEYS = {
    USERS: 'retrospace_users_v1',
    POSTS: 'retrospace_posts_v1',
    MESSAGES: 'retrospace_messages_v1',
    SESSION: 'retrospace_session_v1',
};
export const storage = {
    getUsers: () => {
        try {
            const data = localStorage.getItem(KEYS.USERS);
            return data ? JSON.parse(data) : [];
        }
        catch (e) {
            return [];
        }
    },
    saveUsers: (users) => {
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    },
    getPosts: () => {
        try {
            const data = localStorage.getItem(KEYS.POSTS);
            return data ? JSON.parse(data) : [];
        }
        catch (e) {
            return [];
        }
    },
    savePosts: (posts) => {
        localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
    },
    getMessages: () => {
        try {
            const data = localStorage.getItem(KEYS.MESSAGES);
            return data ? JSON.parse(data) : [];
        }
        catch (e) {
            return [];
        }
    },
    saveMessages: (messages) => {
        localStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages));
    },
    getSession: () => {
        return localStorage.getItem(KEYS.SESSION);
    },
    setSession: (userId) => {
        if (userId) {
            localStorage.setItem(KEYS.SESSION, userId);
        }
        else {
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
