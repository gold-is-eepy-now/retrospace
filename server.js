const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

// Use dynamic port for environment compatibility
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// --- SERVE STATIC FRONTEND ---
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

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/users', (req, res) => res.json(readDb().users));

app.post('/api/users', (req, res) => {
  const db = readDb();
  if (db.users.find(u => u.username.toLowerCase() === req.body.username.toLowerCase())) {
    return res.status(400).json({ error: 'Username taken' });
  }
  db.users.push(req.body);
  writeDb(db);
  res.json(req.body);
});

app.put('/api/users/:id', (req, res) => {
  const db = readDb();
  const idx = db.users.findIndex(u => u.id === req.params.id);
  if (idx > -1) {
    db.users[idx] = { ...db.users[idx], ...req.body };
    writeDb(db);
    res.json(db.users[idx]);
  } else res.status(404).json({ error: 'Not found' });
});

app.get('/api/posts', (req, res) => res.json(readDb().posts));

app.post('/api/posts', (req, res) => {
  const db = readDb();
  db.posts.unshift(req.body);
  writeDb(db);
  res.json(req.body);
});

app.put('/api/posts/:id', (req, res) => {
    const db = readDb();
    const idx = db.posts.findIndex(p => p.id === req.params.id);
    if(idx > -1) {
        db.posts[idx] = { ...db.posts[idx], ...req.body };
        writeDb(db);
        res.json(db.posts[idx]);
    } else res.status(404).json({ error: 'Not found' });
});

app.delete('/api/posts/:id', (req, res) => {
    const db = readDb();
    db.posts = db.posts.filter(p => p.id !== req.params.id);
    writeDb(db);
    res.json({ success: true });
});

app.get('/api/messages', (req, res) => res.json(readDb().messages));

app.post('/api/messages', (req, res) => {
  const db = readDb();
  db.messages.push(req.body);
  writeDb(db);
  res.json(req.body);
});

// --- CLIENT ROUTING (SPA) ---
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) res.sendFile(indexPath);
  else res.send('Frontend not found.');
});

app.listen(PORT, () => console.log(`Retrospace running at http://localhost:${PORT}`));