export interface UserTheme {
  backgroundUrl: string;
  backgroundColor: string;
  fontFamily: string;
  textColor: string;
  headerColor: string;
  panelColor: string;
  musicUrl?: string;
  cursorUrl?: string; // New: Custom cursor
  borderRadius?: string; // New: '0px' or '10px' etc
}

export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  tagline: string;
  bio?: string;
  mood: string;
  isOnline: boolean;
  topFriends?: string[]; // Array of User IDs
  theme: UserTheme;
  isAdmin?: boolean;
  isBanned?: boolean;
  bannedUntil?: number | null; // Timestamp
  blockedUsers: string[]; // New: Array of blocked User IDs
  followers: string[]; // User IDs
  following: string[]; // User IDs
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string; // Display string
  createdAt: number; // Sorting
  read: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
}

export type PostType = 'status' | 'blog';

export interface Post {
  id: string;
  type: PostType;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  title?: string;
  category?: string;
  content: string;
  timestamp: string;
  comments: Comment[];
  likes: string[]; // Array of User IDs who liked
  tags?: string[];
  isEdited?: boolean; // New: Edited flag
}

export enum ViewState {
  HOME = 'HOME',
  PROFILE = 'PROFILE',
  MESSAGES = 'MESSAGES',
  ADMIN = 'ADMIN',
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP'
}