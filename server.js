require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Initialize SQLite database
const dbPath = process.env.DATABASE_PATH || './embu_county.db';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log(`Connected to SQLite database at ${dbPath}`);
    initializeDatabase();
  }
});

// Create tables
function initializeDatabase() {
  db.serialize(() => {
    // Services table
    db.run(`CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // News table
    db.run(`CREATE TABLE IF NOT EXISTS news (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tenders table
    db.run(`CREATE TABLE IF NOT EXISTS tenders (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Departments table
    db.run(`CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Downloads table
    db.run(`CREATE TABLE IF NOT EXISTS downloads (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  });
}

// Generic CRUD functions
function getAll(table, callback) {
  db.all(`SELECT * FROM ${table} ORDER BY updated_at DESC`, [], callback);
}

function getById(table, id, callback) {
  db.get(`SELECT * FROM ${table} WHERE id = ?`, [id], callback);
}

function create(table, id, data, callback) {
  const jsonData = JSON.stringify(data);
  db.run(
    `INSERT INTO ${table} (id, data) VALUES (?, ?)`,
    [id, jsonData],
    callback
  );
}

function update(table, id, data, callback) {
  const jsonData = JSON.stringify(data);
  db.run(
    `UPDATE ${table} SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [jsonData, id],
    callback
  );
}

function deleteRecord(table, id, callback) {
  db.run(`DELETE FROM ${table} WHERE id = ?`, [id], callback);
}

// ============= SERVICES ROUTES =============
app.get('/api/services', (req, res) => {
  getAll('services', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const services = rows.map(row => JSON.parse(row.data));
    res.json(services);
  });
});

app.get('/api/services/:id', (req, res) => {
  getById('services', req.params.id, (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(JSON.parse(row.data));
  });
});

app.post('/api/services', (req, res) => {
  const service = req.body;
  create('services', service.id, service, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(service);
  });
});

app.put('/api/services/:id', (req, res) => {
  const service = req.body;
  update('services', req.params.id, service, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  });
});

app.delete('/api/services/:id', (req, res) => {
  deleteRecord('services', req.params.id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ message: 'Service deleted' });
  });
});

// ============= NEWS ROUTES =============
app.get('/api/news', (req, res) => {
  getAll('news', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const news = rows.map(row => JSON.parse(row.data));
    res.json(news);
  });
});

app.post('/api/news', (req, res) => {
  const article = req.body;
  create('news', article.id, article, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(article);
  });
});

app.put('/api/news/:id', (req, res) => {
  const article = req.body;
  update('news', req.params.id, article, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'News not found' });
    }
    res.json(article);
  });
});

app.delete('/api/news/:id', (req, res) => {
  deleteRecord('news', req.params.id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'News deleted' });
  });
});

// ============= TENDERS ROUTES =============
app.get('/api/tenders', (req, res) => {
  getAll('tenders', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const tenders = rows.map(row => JSON.parse(row.data));
    res.json(tenders);
  });
});

app.post('/api/tenders', (req, res) => {
  const tender = req.body;
  create('tenders', tender.id, tender, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(tender);
  });
});

app.put('/api/tenders/:id', (req, res) => {
  const tender = req.body;
  update('tenders', req.params.id, tender, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(tender);
  });
});

app.delete('/api/tenders/:id', (req, res) => {
  deleteRecord('tenders', req.params.id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Tender deleted' });
  });
});

// ============= DEPARTMENTS ROUTES =============
app.get('/api/departments', (req, res) => {
  getAll('departments', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const departments = rows.map(row => JSON.parse(row.data));
    res.json(departments);
  });
});

app.post('/api/departments', (req, res) => {
  const department = req.body;
  create('departments', department.id, department, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(department);
  });
});

app.put('/api/departments/:id', (req, res) => {
  const department = req.body;
  update('departments', req.params.id, department, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(department);
  });
});

app.delete('/api/departments/:id', (req, res) => {
  deleteRecord('departments', req.params.id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Department deleted' });
  });
});

// ============= DOWNLOADS ROUTES =============
app.get('/api/downloads', (req, res) => {
  getAll('downloads', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const downloads = rows.map(row => JSON.parse(row.data));
    res.json(downloads);
  });
});

app.post('/api/downloads', (req, res) => {
  const download = req.body;
  create('downloads', download.id, download, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(download);
  });
});

app.put('/api/downloads/:id', (req, res) => {
  const download = req.body;
  update('downloads', req.params.id, download, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(download);
  });
});

app.delete('/api/downloads/:id', (req, res) => {
  deleteRecord('downloads', req.params.id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Download deleted' });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Embu County API is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});
