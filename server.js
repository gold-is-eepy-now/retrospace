const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const ROOT_DIR = __dirname;
const DB_FILE = path.join(ROOT_DIR, 'database.json');

const DEFAULT_DB = Object.freeze({
  users: [],
  posts: [],
  messages: [],
});

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(ROOT_DIR));

app.get('/build/*', async (req, res, next) => {
  try {
    if (path.extname(req.path)) return next();

    const jsPath = path.join(ROOT_DIR, `${req.path}.js`);
    await fs.access(jsPath);
    res.type('application/javascript');
    return res.sendFile(jsPath);
  } catch {
    return next();
  }
});

const cloneDefaultDb = () => ({
  users: [],
  posts: [],
  messages: [],
});

const normalizeDb = (raw) => ({
  users: Array.isArray(raw?.users) ? raw.users : [],
  posts: Array.isArray(raw?.posts) ? raw.posts : [],
  messages: Array.isArray(raw?.messages) ? raw.messages : [],
});

async function ensureDbFile() {
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf8');
  }
}

async function readDb() {
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8');
    return normalizeDb(JSON.parse(raw));
  } catch {
    return cloneDefaultDb();
  }
}

async function writeDb(data) {
  const normalized = normalizeDb(data);
  await fs.writeFile(DB_FILE, JSON.stringify(normalized, null, 2), 'utf8');
  return normalized;
}

function requireString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function createRouter() {
  const router = express.Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  router.get('/users', async (_req, res, next) => {
    try {
      const db = await readDb();
      res.json(db.users);
    } catch (error) {
      next(error);
    }
  });

  router.post('/users', async (req, res, next) => {
    try {
      const username = req.body?.username;
      if (!requireString(username)) {
        return res.status(400).json({ error: 'username is required' });
      }

      const db = await readDb();
      const taken = db.users.some(
        (user) => user?.username?.toLowerCase() === username.toLowerCase(),
      );
      if (taken) {
        return res.status(400).json({ error: 'Username taken' });
      }

      db.users.push(req.body);
      await writeDb(db);
      res.status(201).json(req.body);
    } catch (error) {
      next(error);
    }
  });

  router.put('/users/:id', async (req, res, next) => {
    try {
      const db = await readDb();
      const userIndex = db.users.findIndex((user) => user.id === req.params.id);
      if (userIndex < 0) {
        return res.status(404).json({ error: 'Not found' });
      }

      db.users[userIndex] = { ...db.users[userIndex], ...req.body };
      await writeDb(db);
      res.json(db.users[userIndex]);
    } catch (error) {
      next(error);
    }
  });

  router.get('/posts', async (_req, res, next) => {
    try {
      const db = await readDb();
      res.json(db.posts);
    } catch (error) {
      next(error);
    }
  });

  router.post('/posts', async (req, res, next) => {
    try {
      const db = await readDb();
      db.posts.unshift(req.body);
      await writeDb(db);
      res.status(201).json(req.body);
    } catch (error) {
      next(error);
    }
  });

  router.put('/posts/:id', async (req, res, next) => {
    try {
      const db = await readDb();
      const postIndex = db.posts.findIndex((post) => post.id === req.params.id);
      if (postIndex < 0) {
        return res.status(404).json({ error: 'Not found' });
      }

      db.posts[postIndex] = { ...db.posts[postIndex], ...req.body };
      await writeDb(db);
      res.json(db.posts[postIndex]);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/posts/:id', async (req, res, next) => {
    try {
      const db = await readDb();
      db.posts = db.posts.filter((post) => post.id !== req.params.id);
      await writeDb(db);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  router.get('/messages', async (_req, res, next) => {
    try {
      const db = await readDb();
      res.json(db.messages);
    } catch (error) {
      next(error);
    }
  });

  router.post('/messages', async (req, res, next) => {
    try {
      const db = await readDb();
      db.messages.push(req.body);
      await writeDb(db);
      res.status(201).json(req.body);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

app.use('/api', createRouter());

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.sendFile(path.join(ROOT_DIR, 'index.html'));
});

app.use((error, _req, res, _next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

ensureDbFile()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Retrospace running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
