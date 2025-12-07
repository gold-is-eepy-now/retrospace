const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// --- SERVE STATIC FRONTEND ---
// This allows the server to host the React app directly
// It serves index.html, index.tsx, App.tsx, etc.
app.use(express.static(__dirname));

// Database File
const DB_FILE = path.join(__dirname, 'database.json');

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
  const initialData = {
    users: [],
    posts: [],
    messages: []
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

// Helper: Read DB
const readDb = () => {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (err) {
    return { users: [], posts: [], messages: [] };
  }
};

// Helper: Write DB
const writeDb = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- API ROUTES ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// USERS
app.get('/api/users', (req, res) => {
  const db = readDb();
  res.json(db.users);
});

app.post('/api/users', (req, res) => {
  const db = readDb();
  const newUser = req.body;
  // Check duplicate
  if (db.users.find(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
    return res.status(400).json({ error: 'Username taken' });
  }
  db.users.push(newUser);
  writeDb(db);
  res.json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const db = readDb();
  const userIndex = db.users.findIndex(u => u.id === req.params.id);
  if (userIndex > -1) {
    db.users[userIndex] = { ...db.users[userIndex], ...req.body };
    writeDb(db);
    res.json(db.users[userIndex]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// POSTS
app.get('/api/posts', (req, res) => {
  const db = readDb();
  res.json(db.posts);
});

app.post('/api/posts', (req, res) => {
  const db = readDb();
  const newPost = req.body;
  db.posts.unshift(newPost); // Add to top
  writeDb(db);
  res.json(newPost);
});

app.put('/api/posts/:id', (req, res) => {
    const db = readDb();
    const postIndex = db.posts.findIndex(p => p.id === req.params.id);
    if(postIndex > -1) {
        db.posts[postIndex] = { ...db.posts[postIndex], ...req.body };
        writeDb(db);
        res.json(db.posts[postIndex]);
    } else {
        res.status(404).json({ error: 'Post not found' });
    }
});

app.delete('/api/posts/:id', (req, res) => {
    const db = readDb();
    db.posts = db.posts.filter(p => p.id !== req.params.id);
    writeDb(db);
    res.json({ success: true });
});

// MESSAGES
app.get('/api/messages', (req, res) => {
  const db = readDb();
  res.json(db.messages);
});

app.post('/api/messages', (req, res) => {
  const db = readDb();
  const msg = req.body;
  db.messages.push(msg);
  writeDb(db);
  res.json(msg);
});

// --- CLIENT ROUTING (SPA) ---
// If the request is not an API call, serve index.html
// This is crucial for React Router or internal view logic to work on refresh
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API Endpoint not found' });
  }
  
  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('Retrospace Backend Running. Frontend assets (index.html) not found.');
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Retrospace Server running at http://localhost:${PORT}`);
  console.log(`Data saved to ${DB_FILE}`);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Retrospace Server running at http://localhost:${PORT}`);
  console.log(`Data saved to ${DB_FILE}`);
});
