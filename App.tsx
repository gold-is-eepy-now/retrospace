import React, { useState, useEffect, useRef } from 'react';
import { User, Post, ViewState, Comment, PostType, UserTheme, Message } from './types';
import { generateRetroStatus, generateAIComment, generateProfileBio, generateBlogPost } from './services/geminiService';
import { api } from './services/api';
import { MusicPlayer } from './components/MusicPlayer';
import { TopFriends } from './components/TopFriends';

// --- INITIAL DATA & PRESETS ---

const PRESET_THEMES: UserTheme[] = [
  { backgroundUrl: '', musicUrl: '', cursorUrl: '', borderRadius: '0px', backgroundColor: '#FFFFFF', fontFamily: 'Arial, sans-serif', textColor: '#333333', headerColor: '#E8FDC1', panelColor: '#FFFFFF' }, 
  { backgroundUrl: '', musicUrl: '', cursorUrl: '', borderRadius: '0px', backgroundColor: '#000000', fontFamily: 'Courier New, monospace', textColor: '#00FF00', headerColor: '#111111', panelColor: '#1a1a1a' }, 
  { backgroundUrl: '', musicUrl: '', cursorUrl: '', borderRadius: '15px', backgroundColor: '#ffeaf4', fontFamily: 'Comic Sans MS', textColor: '#d63384', headerColor: '#ffb3d9', panelColor: '#fff0f5' }, 
  { backgroundUrl: '', musicUrl: '', cursorUrl: '', borderRadius: '4px', backgroundColor: '#f0f0f0', fontFamily: 'Verdana, sans-serif', textColor: '#000066', headerColor: '#ccccff', panelColor: '#ffffff' },
];

interface ActivityNotification {
  id: string;
  text: string;
  type: 'like' | 'follow' | 'message';
  timestamp: number;
}

interface HeaderProps {
  user: User | null;
  onlineCount: number;
  setView: (view: ViewState) => void;
  unreadCount: number;
  activityCount: number;
  notifications: ActivityNotification[];
  handleLogout: () => void;
  serverStatus: boolean;
  clearNotifications: () => void;
}

interface NavItem {
  label: string;
  view: ViewState;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', view: ViewState.HOME },
  { label: 'Profile', view: ViewState.PROFILE },
];

// --- COMMON COMPONENTS ---

const Header: React.FC<HeaderProps> = ({
  user,
  onlineCount,
  setView,
  unreadCount,
  activityCount,
  notifications,
  handleLogout,
  serverStatus,
  clearNotifications,
}) => {
  const [showTray, setShowTray] = useState(false);
  const logoDestination = user ? ViewState.HOME : ViewState.LOGIN;

  const toggleActivityTray = () => {
    setShowTray((previousValue) => {
      if (!previousValue) {
        clearNotifications();
      }
      return !previousValue;
    });
  };

  return (
    <div className="flex justify-between items-end mb-6 mt-4 px-2 select-none relative">
      <div className="flex flex-col">
          <h1 className="retro-logo cursor-pointer" onClick={() => setView(logoDestination)}>
            <span>retrospace</span>
          </h1>
          <span className={`text-[9px] font-bold ${serverStatus ? 'text-green-600' : 'text-red-500'}`}>
              {serverStatus ? '● SERVER ONLINE' : '○ SERVER OFFLINE (LOCAL MODE)'}
          </span>
      </div>
      {user && (
        <div className="text-[#666] text-xs pb-1 flex gap-3 items-center">
            {NAV_ITEMS.map(({ label, view }) => (
              <a key={label} onClick={() => setView(view)} className="font-bold hover:underline cursor-pointer text-[#2276BB]">
                {label}
              </a>
            ))}
            <a onClick={() => setView(ViewState.MESSAGES)} className="font-bold hover:underline cursor-pointer text-[#2276BB] relative">
              Mail {unreadCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] px-1 rounded-sm badge-pulse">{unreadCount}</span>}
            </a>
            
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={toggleActivityTray}
                className="font-bold hover:underline cursor-pointer text-[#2276BB] flex items-center gap-1"
              >
                Activity {(activityCount > 0) && <span className="bg-red-500 text-white text-[9px] px-1 rounded-sm badge-pulse">{activityCount}</span>}
              </button>
              {showTray && (
                <div className="notification-tray">
                   <div className="font-bold border-b border-gray-200 mb-1 pb-1 flex justify-between">
                     <span>Recent Activity</span>
                     <button onClick={() => setShowTray(false)} className="text-gray-400">x</button>
                   </div>
                   {notifications.length === 0 ? (
                     <div className="text-gray-400 italic py-2 text-center">No new activity.</div>
                   ) : (
                     <div className="max-h-[200px] overflow-y-auto space-y-1">
                        {notifications.slice(0, 5).map(n => (
                          <div key={n.id} className="border-b border-gray-100 py-1 last:border-0">
                             {n.text}
                          </div>
                        ))}
                     </div>
                   )}
                </div>
              )}
            </div>

           {user.isAdmin && (
             <button onClick={() => setView(ViewState.ADMIN)} className="text-red-600 font-bold hover:underline">[Admin]</button>
           )}
           <span className="text-gray-400">|</span>
           <a onClick={handleLogout} className="hover:underline cursor-pointer text-[#2276BB]">Sign Out</a>
        </div>
      )}
    </div>
  );
};

export default function App() {
  // --- STATE ---
  const [useServer, setUseServer] = useState(false);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>(ViewState.LOGIN);
  
  // Notification State
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  const [newActivityCount, setNewActivityCount] = useState(0);
  const prevFollowersRef = useRef<string[]>([]);
  const prevLikesCountRef = useRef<number>(0);

  // Auth Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  
  // UI State
  const [postMode, setPostMode] = useState<PostType>('status');
  const [newPostContent, setNewPostContent] = useState('');
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState('Life');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Message UI State
  const [messageBoxView, setMessageBoxView] = useState<'inbox'|'sent'>('inbox');
  const [isComposing, setIsComposing] = useState(false);
  const [composeReceiverId, setComposeReceiverId] = useState<string | null>(null);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  // Interaction State
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing State
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Computed
  const currentUser = users.find(u => u.id === currentUserId) || null;
  const activeProfile = users.find(u => u.id === activeProfileId) || currentUser;
  const unreadCount = currentUser 
    ? messages.filter(m => m.receiverId === currentUser.id && !m.read && !currentUser.blockedUsers?.includes(m.senderId)).length 
    : 0;

  // --- INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
        setLoading(true);
        const hasServer = await api.checkHealth();
        setUseServer(hasServer);
        
        const [u, p, m] = await Promise.all([
            api.getUsers(hasServer),
            api.getPosts(hasServer),
            api.getMessages(hasServer)
        ]);

        setUsers(u);
        setPosts(p);
        setMessages(m);

        const sessId = api.getSession();
        if (sessId && u.find(user => user.id === sessId)) {
            setCurrentUserId(sessId);
            setView(ViewState.HOME);
            
            // Set initial state for activity tracking
            const loggedInUser = u.find(user => user.id === sessId);
            if (loggedInUser) {
              prevFollowersRef.current = loggedInUser.followers;
              prevLikesCountRef.current = p.filter(post => post.authorId === sessId).reduce((acc, curr) => acc + curr.likes.length, 0);
            }
        } else {
            setView(ViewState.LOGIN);
        }

        setLoading(false);
    };
    init();
  }, []);

  // --- POLLING EFFECT FOR "REAL-TIME" ---
  useEffect(() => {
    if (!currentUserId) return;
    
    const poll = async () => {
      const [u, p, m] = await Promise.all([
          api.getUsers(useServer),
          api.getPosts(useServer),
          api.getMessages(useServer)
      ]);
      
      const prevUsers = users;
      const prevPosts = posts;
      
      setUsers(u);
      setPosts(p);
      setMessages(m);

      const me = u.find(user => user.id === currentUserId);
      if (me) {
          // Check for new followers
          const newFollowerIds = me.followers.filter(id => !prevFollowersRef.current.includes(id));
          if (newFollowerIds.length > 0) {
              newFollowerIds.forEach(id => {
                  const followerUser = u.find(fu => fu.id === id);
                  const text = `${followerUser?.username || 'Someone'} is now following you!`;
                  addNotification(text, 'follow');
              });
              prevFollowersRef.current = me.followers;
          }

          // Check for new likes
          const myPosts = p.filter(post => post.authorId === currentUserId);
          const currentTotalLikes = myPosts.reduce((acc, curr) => acc + curr.likes.length, 0);
          if (currentTotalLikes > prevLikesCountRef.current) {
              const diff = currentTotalLikes - prevLikesCountRef.current;
              addNotification(`${diff} new like${diff > 1 ? 's' : ''} on your posts!`, 'like');
              prevLikesCountRef.current = currentTotalLikes;
          }
      }
    };

    const intervalId = setInterval(poll, 10000); // Poll every 10 seconds
    return () => clearInterval(intervalId);
  }, [currentUserId, useServer, users, posts]);

  const addNotification = (text: string, type: 'like' | 'follow' | 'message') => {
      const newNotif: ActivityNotification = {
          id: `notif-${Date.now()}-${Math.random()}`,
          text,
          type,
          timestamp: Date.now()
      };
      setNotifications(prev => [newNotif, ...prev]);
      setNewActivityCount(prev => prev + 1);
  };

  const clearNotifications = () => {
      setNewActivityCount(0);
  };

  // --- BACKGROUND & CURSOR HANDLING ---
  useEffect(() => {
    if (view === ViewState.PROFILE && activeProfile?.theme) {
       if (activeProfile.theme.backgroundUrl) {
           document.body.style.backgroundImage = `url('${activeProfile.theme.backgroundUrl}')`;
           document.body.style.backgroundSize = 'cover';
           document.body.style.backgroundRepeat = 'no-repeat';
           document.body.style.backgroundPosition = 'center top';
           document.body.style.backgroundAttachment = 'fixed';
       } else if (activeProfile.theme.backgroundColor) {
           document.body.style.backgroundImage = 'none';
           document.body.style.backgroundColor = activeProfile.theme.backgroundColor;
       } else {
           document.body.style.backgroundImage = '';
       }

       if (activeProfile.theme.cursorUrl) {
           document.body.style.cursor = `url('${activeProfile.theme.cursorUrl}'), auto`;
       } else {
           document.body.style.cursor = 'auto';
       }
    } else {
       document.body.style.backgroundImage = '';
       document.body.style.backgroundColor = '';
       document.body.style.backgroundSize = '';
       document.body.style.backgroundRepeat = '';
       document.body.style.backgroundPosition = '';
       document.body.style.backgroundAttachment = '';
       document.body.style.cursor = 'auto';
    }
  }, [view, activeProfile]);

  // --- HELPERS ---

  const renderContentWithTags = (content: string) => {
    const parts = content.split(/((?:^|\s)#[a-zA-Z0-9_]+)/g);
    return (
      <span>
        {parts.map((part, i) => {
          if (part.trim().startsWith('#')) {
             return (
               <span 
                 key={i} 
                 className="text-[#2276BB] font-bold cursor-pointer hover:underline"
                 onClick={(e) => {
                   e.stopPropagation();
                   setSearchQuery(part.trim());
                   setView(ViewState.HOME);
                 }}
               >
                 {part}
               </span>
             );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  const getFilteredPosts = () => {
    let filtered = posts.filter(p => {
        if (!currentUser) return true;
        if (currentUser.blockedUsers?.includes(p.authorId)) return false;
        const author = users.find(u => u.id === p.authorId);
        if (author?.blockedUsers?.includes(currentUser.id)) return false;
        return true;
    });

    if (searchQuery) {
       const lowerQ = searchQuery.toLowerCase();
       filtered = filtered.filter(p => {
          if (lowerQ.startsWith('#')) {
             return p.tags?.some(t => t.toLowerCase() === lowerQ) || p.content.toLowerCase().includes(lowerQ);
          }
          return p.content.toLowerCase().includes(lowerQ) || 
                 p.authorName.toLowerCase().includes(lowerQ) ||
                 p.title?.toLowerCase().includes(lowerQ);
       });
    }
    return filtered;
  };

  // --- ACTIONS ---

  const reloadData = async () => {
      const [u, p, m] = await Promise.all([
          api.getUsers(useServer),
          api.getPosts(useServer),
          api.getMessages(useServer)
      ]);
      setUsers(u);
      setPosts(p);
      setMessages(m);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username.toLowerCase() === loginUsername.toLowerCase());
    if (user) {
      if (user.isBanned) {
        alert("This account is banned.");
        return;
      }
      setCurrentUserId(user.id);
      api.setSession(user.id);
      setView(ViewState.HOME);
      // Track initial state for notifications
      prevFollowersRef.current = user.followers;
      prevLikesCountRef.current = posts.filter(post => post.authorId === user.id).reduce((acc, curr) => acc + curr.likes.length, 0);
    } else {
      alert("User not found! Try signing up.");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupUsername.trim()) return;
    
    const latestUsers = await api.getUsers(useServer);
    if (latestUsers.find(u => u.username.toLowerCase() === signupUsername.toLowerCase())) {
        alert("Username taken!");
        return;
    }

    const newUser: User = {
        id: `user-${Date.now()}`,
        username: signupUsername,
        avatarUrl: `https://picsum.photos/150/150?random=${Date.now()}`,
        tagline: 'New to Retrospace!',
        mood: 'New',
        isOnline: true,
        topFriends: [],
        theme: PRESET_THEMES[0],
        isAdmin: false, 
        followers: [],
        following: [],
        blockedUsers: [],
        age: '??',
        gender: 'Unknown',
        location: 'Earth'
    };

    if (latestUsers.length === 0 || signupUsername.toLowerCase() === 'admin') {
        newUser.isAdmin = true;
    }

    await api.createUser(newUser, useServer);
    await reloadData();
    setCurrentUserId(newUser.id);
    api.setSession(newUser.id);
    setView(ViewState.HOME);
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    api.setSession(null);
    setView(ViewState.LOGIN);
    setLoginUsername('');
    setLoginPassword('');
    setNotifications([]);
    setNewActivityCount(0);
  };

  const handlePostSubmit = async () => {
    if (!newPostContent.trim() || !currentUser) return;

    const tags = newPostContent.match(/#[a-zA-Z0-9_]+/g) || [];

    const newPost: Post = {
      id: `p-${Date.now()}`,
      type: postMode,
      title: postMode === 'blog' ? (blogTitle || 'Untitled') : undefined,
      category: postMode === 'blog' ? blogCategory : undefined,
      authorId: currentUser.id,
      authorName: currentUser.username,
      authorAvatar: currentUser.avatarUrl,
      content: newPostContent,
      timestamp: 'less than 5 seconds ago',
      likes: [],
      comments: [],
      tags: tags as string[]
    };

    await api.createPost(newPost, useServer);
    await reloadData();

    setNewPostContent('');
    setBlogTitle('');
    
    if (Math.random() > 0.3 && users.length > 1) {
      setTimeout(async () => {
         const latestPosts = await api.getPosts(useServer);
         const targetPost = latestPosts.find(p => p.id === newPost.id);
         if (!targetPost) return;

         const replyText = await generateAIComment(newPostContent);
         const otherUsers = users.filter(u => u.id !== currentUser.id);
         const randomFriend = otherUsers.length > 0 ? otherUsers[Math.floor(Math.random() * otherUsers.length)] : null;
         
         if (randomFriend && !currentUser.blockedUsers?.includes(randomFriend.id)) {
             const updatedPost = {
                 ...targetPost,
                 comments: [...targetPost.comments, {
                     id: `c-${Date.now()}`,
                     authorId: randomFriend.id,
                     authorName: randomFriend.username,
                     content: replyText,
                     timestamp: 'just now'
                 }]
             };
             await api.updatePost(updatedPost, useServer);
             await reloadData();
         }
      }, 5000);
    }
  };

  const handleStartEdit = (post: Post) => {
    setEditingPostId(post.id);
    setEditingContent(post.content);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditingContent('');
  };

  const handleSaveEdit = async () => {
    if (!editingPostId) return;
    const post = posts.find(p => p.id === editingPostId);
    if (!post) return;

    const tags = editingContent.match(/#[a-zA-Z0-9_]+/g) || [];

    const updatedPost = {
      ...post,
      content: editingContent,
      isEdited: true,
      tags: tags as string[]
    };

    await api.updatePost(updatedPost, useServer);
    await reloadData();
    setEditingPostId(null);
    setEditingContent('');
  };

  const handleAddComment = async (postId: string, text: string) => {
    if (!currentUser) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const updatedPost = {
        ...post,
        comments: [...post.comments, {
            id: `c-${Date.now()}`,
            authorId: currentUser.id,
            authorName: currentUser.username,
            content: text,
            timestamp: 'just now'
        }]
    };
    await api.updatePost(updatedPost, useServer);
    await reloadData();
  };

  const handleLikePost = async (postId: string) => {
    if (!currentUser) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const isLiked = post.likes.includes(currentUser.id);
    const updatedPost = {
        ...post,
        likes: isLiked ? post.likes.filter(id => id !== currentUser.id) : [...post.likes, currentUser.id]
    };
    await api.updatePost(updatedPost, useServer);
    await reloadData();
  };

  const handleFollow = async (targetId: string) => {
    if (!currentUser) return;
    const targetUser = users.find(u => u.id === targetId);
    if (!targetUser) return;

    const isFollowing = currentUser.following.includes(targetId);
    const updatedCurrentUser = {
        ...currentUser,
        following: isFollowing ? currentUser.following.filter(id => id !== targetId) : [...currentUser.following, targetId]
    };
    const updatedTargetUser = {
        ...targetUser,
        followers: isFollowing ? targetUser.followers.filter(id => id !== currentUser.id) : [...targetUser.followers, currentUser.id]
    };

    await api.updateUser(updatedCurrentUser, useServer);
    await api.updateUser(updatedTargetUser, useServer);
    await reloadData();
  };

  const handleBlockUser = async (targetId: string) => {
    if (!currentUser) return;
    const isBlocked = currentUser.blockedUsers?.includes(targetId);
    let newBlockedList = currentUser.blockedUsers || [];
    if (isBlocked) {
        newBlockedList = newBlockedList.filter(id => id !== targetId);
    } else {
        newBlockedList = [...newBlockedList, targetId];
        if (currentUser.following.includes(targetId)) {
            handleFollow(targetId); 
        }
    }
    const updatedUser = { ...currentUser, blockedUsers: newBlockedList };
    await api.updateUser(updatedUser, useServer);
    await reloadData();
    alert(isBlocked ? "User Unblocked" : "User Blocked");
  };

  const handleBanUser = async (userId: string, durationMinutes: number) => {
    const userToBan = users.find(u => u.id === userId);
    if (!userToBan || userToBan.isAdmin) return;
    const until = durationMinutes === -1 ? null : Date.now() + (durationMinutes * 60000); 
    const updatedUser = { ...userToBan, isBanned: true, bannedUntil: until };
    await api.updateUser(updatedUser, useServer);
    await reloadData();
  };

  const handleUnbanUser = async (userId: string) => {
      const user = users.find(u => u.id === userId);
      if(!user) return;
      await api.updateUser({ ...user, isBanned: false }, useServer);
      await reloadData();
  };

  const handleDeletePost = async (postId: string) => {
    await api.deletePost(postId, useServer);
    await reloadData();
  };

  const handleGenerateIdea = async () => {
    setAiGenerating(true);
    if (postMode === 'status') {
      const idea = await generateRetroStatus();
      setNewPostContent(idea);
    } else {
      const idea = await generateBlogPost(blogCategory);
      setBlogTitle(idea.title);
      setNewPostContent(idea.content);
    }
    setAiGenerating(false);
  };

  const handleThemeChange = async (index: number) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, theme: PRESET_THEMES[index] };
    await api.updateUser(updatedUser, useServer);
    await reloadData();
  };

  const handleSendMessage = async () => {
      if(!currentUser || !composeReceiverId || !composeBody.trim()) return;
      const newMsg: Message = { 
          id: `m-${Date.now()}`, 
          senderId: currentUser.id, 
          receiverId: composeReceiverId, 
          subject: composeSubject || 'No Subject',
          content: composeBody, 
          timestamp: 'Just now', 
          createdAt: Date.now(), 
          read: false 
      };
      await api.createMessage(newMsg, useServer);
      await reloadData();
      setIsComposing(false);
      setComposeBody('');
      setComposeSubject('');
      setComposeReceiverId(null);
      alert("Message Sent!");
  };

  const openCompose = (receiverId: string | null = null) => {
      setComposeReceiverId(receiverId);
      setIsComposing(true);
  };

  const navigateToProfile = (userId: string) => {
    setActiveProfileId(userId);
    setView(ViewState.PROFILE);
    setSearchQuery('');
  };

  const updateProfileThemeField = (field: keyof UserTheme, value: string) => {
      if (!currentUser) return;
      const updatedUser = { ...currentUser, theme: { ...currentUser.theme, [field]: value } };
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
      api.updateUser(updatedUser, useServer);
  };
  
  const updateUserProfile = (field: keyof User, value: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, [field]: value };
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    api.updateUser(updatedUser, useServer);
  };

  // --- RENDERING ---

  if (loading) {
      return (
          <div className="min-h-screen bg-[#8edbf5] flex items-center justify-center">
              <div className="bg-white p-6 border-2 border-blue-300 shadow-lg text-center">
                  <h1 className="retro-logo text-4xl mb-2 text-blue-400">retrospace</h1>
                  <p className="text-xs font-mono text-gray-500">Connecting to server...</p>
                  <div className="mt-4 w-32 h-2 bg-gray-200 mx-auto overflow-hidden border border-gray-400">
                      <div className="h-full bg-blue-500 animate-pulse w-1/2"></div>
                  </div>
              </div>
          </div>
      );
  }

  const renderLogin = () => (
    <div className="max-w-[760px] mx-auto p-2 font-sans text-[13px] text-[#333]">
       <Header user={null} onlineCount={4582} setView={setView} unreadCount={0} activityCount={0} notifications={[]} handleLogout={handleLogout} serverStatus={useServer} clearNotifications={clearNotifications} />
       <div className="flex gap-4">
         <div className="w-[520px]">
            <h2 className="text-xl mb-1 leading-tight text-[#333] font-bold">
               A global community of friends and strangers answering one simple question: <span className="highlight-yellow">What are you doing?</span>
            </h2>
            <p className="text-sm mb-4 text-[#666]">Look at what <a href="#">these people</a> are doing right now...</p>
         </div>
         <div className="w-[200px] flex-shrink-0">
            <div className="sidebar-box">
               <div className="sidebar-header">Sign In!</div>
               <form onSubmit={handleLogin} className="flex flex-col gap-2">
                  <div className="flex flex-col">
                     <label className="text-[10px] text-[#666]">Username</label>
                     <input type="text" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} />
                  </div>
                  <div className="flex flex-col">
                     <label className="text-[10px] text-[#666]">Password</label>
                     <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                  </div>
                  <button type="submit" className="btn-login self-center">Sign In!</button>
               </form>
            </div>
            <div className="bg-[#FFFFCC] border border-[#EEEEBB] p-3 text-center mb-4">
               <a onClick={() => setView(ViewState.SIGNUP)} className="block font-bold bg-[#ffff00] text-blue-700 text-lg hover:underline cursor-pointer">Join for Free!</a>
            </div>
         </div>
       </div>
    </div>
  );

  const renderSignup = () => (
    <div className="max-w-[760px] mx-auto p-2 font-sans text-[13px] text-[#333]">
       <Header user={null} onlineCount={4582} setView={setView} unreadCount={0} activityCount={0} notifications={[]} handleLogout={handleLogout} serverStatus={useServer} clearNotifications={clearNotifications} />
       <div className="bg-[#E8FDC1] border border-[#a3dba8] p-4 max-w-[500px] mx-auto mt-10">
          <h2 className="font-bold text-lg mb-4 text-center">Join the Retrospace!</h2>
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
              <div>
                 <label className="block font-bold mb-1">Choose a Username:</label>
                 <input type="text" className="w-full text-lg p-1" value={signupUsername} onChange={e => setSignupUsername(e.target.value)} required />
              </div>
              <div>
                 <label className="block font-bold mb-1">Password:</label>
                 <input type="password" className="w-full text-lg p-1" required />
              </div>
              <div className="flex justify-between items-center mt-4">
                 <a onClick={() => setView(ViewState.LOGIN)} className="underline cursor-pointer text-blue-600">Back to Login</a>
                 <button type="submit" className="btn-retro text-lg px-6 py-2">Create my Account</button>
              </div>
          </form>
       </div>
    </div>
  );

  const renderHome = () => {
    if (!currentUser) return null;
    const filteredPosts = getFilteredPosts();
    return (
    <div className="max-w-[760px] mx-auto p-2 font-sans text-[13px] text-[#333]">
      <Header user={currentUser} onlineCount={users.filter(u => u.isOnline).length} setView={setView} unreadCount={unreadCount} activityCount={newActivityCount} notifications={notifications} handleLogout={handleLogout} serverStatus={useServer} clearNotifications={clearNotifications} />
      <div className="flex gap-4">
        <div className="w-[520px] bg-white border border-[#ccc] p-4 rounded-sm shadow-sm relative">
          <h2 className="text-xl mb-3 leading-tight text-[#333] flex justify-between items-center">
            <span>What are you doing?</span>
            {searchQuery && (
              <span className="text-xs font-normal bg-yellow-100 border border-yellow-300 px-2 py-1 rounded">
                Filtering: <b>{searchQuery}</b> 
                <button onClick={() => setSearchQuery('')} className="ml-2 text-red-600 font-bold hover:underline">X</button>
              </span>
            )}
          </h2>
          <div className="bg-[#E8FDC1] p-3 border border-[#a3dba8] mb-6 flex gap-2 items-start">
             <div className="flex-1">
                <div className="flex gap-2 mb-1 text-xs font-bold text-[#555]">
                  <label className={`cursor-pointer hover:underline ${postMode === 'status' ? 'text-black' : ''}`} onClick={() => setPostMode('status')}>
                    <input type="radio" checked={postMode === 'status'} readOnly className="mr-1" /> Status
                  </label>
                  <label className={`cursor-pointer hover:underline ${postMode === 'blog' ? 'text-black' : ''}`} onClick={() => setPostMode('blog')}>
                     <input type="radio" checked={postMode === 'blog'} readOnly className="mr-1" /> Blog
                  </label>
                </div>
                {postMode === 'blog' && (
                  <div className="mb-1">
                     <input className="w-full mb-1" placeholder="Title..." value={blogTitle} onChange={e => setBlogTitle(e.target.value)} />
                     <select className="w-full mb-1 text-xs" value={blogCategory} onChange={e => setBlogCategory(e.target.value)}>
                        <option>General</option><option>Music</option><option>Rant</option><option>School</option>
                     </select>
                  </div>
                )}
                <textarea className="w-full h-16 resize-none" value={newPostContent} onChange={e => setNewPostContent(e.target.value)} placeholder={postMode === 'status' ? "I am currently #working..." : "Dear diary..."} />
                <div className="flex justify-between mt-1 items-center">
                   <button onClick={handleGenerateIdea} className="text-[10px] text-blue-600 hover:underline" disabled={aiGenerating}>{aiGenerating ? "Generating..." : "Need an idea?"}</button>
                   <span className="text-[10px] text-gray-500">{140 - newPostContent.length} chars</span>
                </div>
             </div>
             <button onClick={handlePostSubmit} className="mt-6 font-bold text-lg cursor-pointer hover:text-gray-600">update</button>
          </div>
          <div className="space-y-0">
             {filteredPosts.map(post => (
                <div key={post.id} className="feed-item flex-col items-start">
                   <div className="flex gap-3 w-full">
                      <div className="w-[50px] flex-shrink-0">
                          <img src={post.authorAvatar} className="w-[48px] h-[48px] border border-[#ccc] p-[1px] cursor-pointer hover:border-blue-400" onClick={() => navigateToProfile(post.authorId)} />
                      </div>
                      <div className="feed-content flex-1 text-[13px]">
                          <a onClick={() => navigateToProfile(post.authorId)} className="font-bold underline cursor-pointer">{post.authorName}</a>{' '}
                          {editingPostId === post.id ? (
                            <div className="mt-1">
                              <textarea className="w-full h-16 border border-blue-400 p-1 mb-1" value={editingContent} onChange={(e) => setEditingContent(e.target.value)} />
                              <div className="flex gap-2">
                                <button onClick={handleSaveEdit} className="btn-retro font-bold text-green-700">Save</button>
                                <button onClick={handleCancelEdit} className="btn-retro">Cancel</button>
                              </div>
                            </div>
                          ) : (
                             post.type === 'blog' ? (
                                 <span className="italic">blogged: <a className="font-bold">"{post.title}"</a><br/><span className="text-[#666]" dangerouslySetInnerHTML={{ __html: post.content.substring(0, 150) + '...' }} /></span>
                             ) : (
                                 <span>{renderContentWithTags(post.content)}</span>
                             )
                          )}
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-[#999]">
                             <span className="hover:underline cursor-pointer">{post.timestamp}</span>
                             {post.likes.length > 0 && <span className="text-red-500">&hearts; {post.likes.length}</span>}
                          </div>
                          <div className="mt-1 text-[10px] space-x-2">
                             <a className="action-link cursor-pointer" onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}>Reply</a>
                             <a className="action-link cursor-pointer" onClick={() => handleLikePost(post.id)}>{post.likes.includes(currentUser.id) ? 'Unlike' : 'Like'}</a>
                             {post.authorId === currentUser.id && ( <a className="action-link cursor-pointer text-blue-500" onClick={() => handleStartEdit(post)}>Edit</a> )}
                          </div>
                          {post.comments.length > 0 && (
                             <div className="mt-2 pl-2 border-l-2 border-[#eee]">
                                {post.comments.map(c => (
                                   <div key={c.id} className="text-[11px] mb-1">
                                      <span className="font-bold text-blue-600">{c.authorName}:</span> {c.content}
                                   </div>
                                ))}
                             </div>
                          )}
                      </div>
                   </div>
                </div>
             ))}
          </div>
        </div>
        <div className="w-[200px] flex-shrink-0">
          <div className="sidebar-box">
             <div className="bg-white p-2 border border-[#ccc] mb-2 text-xs">
                <div className="font-bold text-blue-600 mb-1">{currentUser.username}</div>
                <button onClick={() => navigateToProfile(currentUser.id)} className="w-full font-bold text-center border border-gray-400 bg-[#f8f8f8] py-1 text-xs hover:bg-white mb-1">My Profile</button>
             </div>
          </div>
          <div className="bg-white border border-[#ccc] p-2 mb-4">
             <h3 className="font-bold text-[#333] mb-2 border-b border-[#eee] pb-1">Search</h3>
             <input type="text" placeholder="Search..." className="w-full text-xs" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  )};

  const renderProfile = () => {
    if (!currentUser) return null;
    const isOwnProfile = activeProfile.id === currentUser.id;
    const userPosts = getFilteredPosts().filter(p => p.authorId === activeProfile.id);
    const topFriends = users.filter(u => activeProfile.topFriends?.includes(u.id));
    const themeStyle = { backgroundColor: activeProfile.theme.backgroundColor, color: activeProfile.theme.textColor, fontFamily: activeProfile.theme.fontFamily, borderRadius: activeProfile.theme.borderRadius || '0px' };
    return (
      <div className="max-w-[760px] mx-auto p-2 font-sans text-[13px] text-[#333]">
        <Header user={currentUser} onlineCount={users.filter(u => u.isOnline).length} setView={setView} unreadCount={unreadCount} activityCount={newActivityCount} notifications={notifications} handleLogout={handleLogout} serverStatus={useServer} clearNotifications={clearNotifications} />
        <div className="flex gap-4">
          <div className="w-[200px] flex-shrink-0">
             <div className="bg-white border border-[#ccc] p-3 mb-3 text-center" style={{ borderRadius: activeProfile.theme.borderRadius || '0px' }}>
                 <img src={activeProfile.avatarUrl} className="w-[150px] h-[150px] mx-auto border border-gray-300 p-1 mb-2" />
                 <h2 className="font-bold text-lg leading-tight break-words">{activeProfile.username}</h2>
                 <div className="text-xs text-gray-500 mb-2">{activeProfile.tagline}</div>
                 <div className="flex flex-col gap-1 mb-3">
                   {isOwnProfile ? (
                     <button onClick={() => { const nextIndex = (PRESET_THEMES.findIndex(t => t.backgroundColor === activeProfile.theme.backgroundColor) + 1) % PRESET_THEMES.length; handleThemeChange(nextIndex); }} className="btn-retro w-full">Change Theme</button>
                   ) : (
                     <>
                        <button onClick={() => handleFollow(activeProfile.id)} className="btn-retro w-full">{currentUser.following.includes(activeProfile.id) ? 'Unfollow' : 'Follow'}</button>
                        <button onClick={() => openCompose(activeProfile.id)} className="btn-retro w-full">Message</button>
                        <button onClick={() => handleBlockUser(activeProfile.id)} className="btn-retro w-full text-red-700">{currentUser.blockedUsers?.includes(activeProfile.id) ? 'Unblock' : 'Block'}</button>
                     </>
                   )}
                 </div>
             </div>
             <MusicPlayer url={activeProfile.theme.musicUrl} />
             {isOwnProfile && ( <div className="bg-[#E8FDC1] border border-[#a3dba8] p-2 text-xs text-center font-bold"><button className="btn-retro w-full py-1 text-blue-700" onClick={() => setIsEditingProfile(true)}>Edit Profile</button></div> )}
          </div>
          <div className="w-[520px]">
             <div className="border border-[#ccc] p-4 mb-4 rounded-sm" style={themeStyle}>
                <h3 className="font-bold text-sm uppercase border-b border-gray-300 pb-1 mb-2" style={{ borderColor: activeProfile.theme.textColor }}>About {activeProfile.username}</h3>
                <p className="text-sm mb-4 leading-relaxed whitespace-pre-line">{activeProfile.bio || "No bio information."}</p>
                <div className="bg-white/50 p-2 rounded"><TopFriends friends={topFriends} /></div>
             </div>
             <div className="bg-white border border-[#ccc] p-3 rounded-sm">
                <h3 className="font-bold text-gray-700 mb-3 text-sm">Latest Updates</h3>
                <div className="space-y-4">
                  {userPosts.map(post => (
                    <div key={post.id} className="feed-item flex-col items-start border-b border-gray-200 pb-2">
                        <div className="flex justify-between w-full">
                           <span className="font-bold">{post.title || 'Status Update'}</span>
                           <span className="text-[10px] text-gray-400">{post.timestamp}</span>
                        </div>
                        <div className="mt-1 mb-2">{post.type === 'blog' ? <span dangerouslySetInnerHTML={{ __html: post.content }} /> : renderContentWithTags(post.content)}</div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
        {/* EDIT PROFILE MODAL (simplified for prompt) */}
        {isEditingProfile && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white border-2 border-[#2276BB] shadow-lg w-[500px] max-h-[80vh] overflow-y-auto p-4">
                    <h4 className="font-bold mb-4">Edit Profile</h4>
                    <input type="text" className="w-full mb-2" placeholder="Tagline" defaultValue={currentUser.tagline} onBlur={e => updateUserProfile('tagline', e.target.value)} />
                    <textarea className="w-full h-24 mb-4" placeholder="Bio" defaultValue={currentUser.bio} onBlur={e => updateUserProfile('bio', e.target.value)} />
                    <div className="flex justify-end gap-2"><button className="btn-retro" onClick={() => setIsEditingProfile(false)}>Close</button></div>
                </div>
            </div>
        )}
      </div>
    );
  };

  const renderMessages = () => {
    if (!currentUser) return null;
    const displayedMessages = messageBoxView === 'inbox' 
       ? messages.filter(m => m.receiverId === currentUser.id && !currentUser.blockedUsers?.includes(m.senderId))
       : messages.filter(m => m.senderId === currentUser.id);
    return (
      <div className="max-w-[760px] mx-auto p-2 font-sans text-[13px] text-[#333]">
         <Header user={currentUser} onlineCount={users.filter(u => u.isOnline).length} setView={setView} unreadCount={unreadCount} activityCount={newActivityCount} notifications={notifications} handleLogout={handleLogout} serverStatus={useServer} clearNotifications={clearNotifications} />
         <div className="flex gap-4">
             <div className="w-[150px] flex-shrink-0">
                <div className="bg-[#E8FDC1] border border-[#a3dba8] p-2 font-bold mb-2">RetroMail</div>
                <div className="bg-white border border-[#ccc] text-xs">
                   <div className={`p-2 cursor-pointer border-b border-[#eee] ${messageBoxView === 'inbox' ? 'bg-[#f0f0f0] font-bold' : ''}`} onClick={() => setMessageBoxView('inbox')}>Inbox ({unreadCount})</div>
                   <div className={`p-2 cursor-pointer border-b border-[#eee] ${messageBoxView === 'sent' ? 'bg-[#f0f0f0] font-bold' : ''}`} onClick={() => setMessageBoxView('sent')}>Sent Items</div>
                   <div className="mt-4 p-2"><button className="btn-retro w-full" onClick={() => openCompose()}>+ Compose</button></div>
                </div>
             </div>
             <div className="flex-1 bg-white border border-[#ccc] p-3">
                <table className="w-full text-xs">
                   <thead><tr className="text-left text-gray-500 border-b border-gray-300"><th className="p-1">From</th><th className="p-1">Subject</th><th className="p-1">Date</th></tr></thead>
                   <tbody>
                      {displayedMessages.map(msg => (
                         <tr key={msg.id} className={`border-b border-gray-100 ${!msg.read ? 'font-bold' : ''}`}>
                            <td className="p-1">{users.find(u => u.id === (messageBoxView === 'inbox' ? msg.senderId : msg.receiverId))?.username}</td>
                            <td className="p-1">{msg.subject || '(No Subject)'}</td>
                            <td className="p-1">{msg.timestamp}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
         </div>
      </div>
    );
  };

  const renderAdmin = () => {
    if (!currentUser) return null;
    return (
    <div className="max-w-[760px] mx-auto p-2 font-sans text-[13px]">
       <Header user={currentUser} onlineCount={users.filter(u => u.isOnline).length} setView={setView} unreadCount={unreadCount} activityCount={newActivityCount} notifications={notifications} handleLogout={handleLogout} serverStatus={useServer} clearNotifications={clearNotifications} />
       <div className="bg-white border-2 border-red-800 p-4">
          <h1 className="text-xl font-bold text-red-700 mb-4">Moderator Panel</h1>
          <table className="retro-table w-full">
             <thead><tr><th>User</th><th>Status</th><th>Action</th></tr></thead>
             <tbody>
                {users.map(u => (
                   <tr key={u.id}>
                      <td>{u.username}</td>
                      <td>{u.isBanned ? 'Banned' : 'Active'}</td>
                      <td>{!u.isAdmin && <button onClick={() => u.isBanned ? handleUnbanUser(u.id) : handleBanUser(u.id, -1)} className="btn-retro">{u.isBanned ? 'Unban' : 'Ban'}</button>}</td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  )};

  if (currentUser?.isBanned) return <div className="min-h-screen bg-white flex items-center justify-center text-center"><div><h1 className="text-4xl font-bold text-red-600 mb-2">Suspended</h1><button onClick={handleLogout} className="underline">Logout</button></div></div>;

  switch(view) {
    case ViewState.LOGIN: return renderLogin();
    case ViewState.SIGNUP: return renderSignup();
    case ViewState.PROFILE: return renderProfile();
    case ViewState.MESSAGES: return renderMessages();
    case ViewState.ADMIN: return currentUser?.isAdmin ? renderAdmin() : renderHome();
    default: return renderHome();
  }
}
