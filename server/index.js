const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from React build
const buildPath = path.join(__dirname, '..', 'client', 'build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ur-money API is running' });
});

// Transaction routes
app.get('/api/transactions', (req, res) => {
  db.getAllTransactions((err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows || []);
    }
  });
});

app.get('/api/transactions/:id', (req, res) => {
  db.getTransactionById(req.params.id, (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Transaction not found' });
    } else {
      res.json(row);
    }
  });
});

app.post('/api/transactions', (req, res) => {
  const { description, amount, type, category_id, date } = req.body;
  
  if (!description || !amount || !type || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.createTransaction(req.body, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ id: this.lastID, ...req.body });
    }
  });
});

app.put('/api/transactions/:id', (req, res) => {
  const { description, amount, type, category_id, date } = req.body;
  
  if (!description || !amount || !type || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.updateTransaction(req.params.id, req.body, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Transaction not found' });
    } else {
      res.json({ id: req.params.id, ...req.body });
    }
  });
});

app.delete('/api/transactions/:id', (req, res) => {
  db.deleteTransaction(req.params.id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Transaction not found' });
    } else {
      res.json({ message: 'Transaction deleted successfully' });
    }
  });
});

// Category routes
app.get('/api/categories', (req, res) => {
  db.getAllCategories((err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows || []);
    }
  });
});

app.get('/api/categories/:id', (req, res) => {
  db.getCategoryById(req.params.id, (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Category not found' });
    } else {
      res.json(row);
    }
  });
});

app.post('/api/categories', (req, res) => {
  const { name, color } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  db.createCategory(req.body, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ id: this.lastID, ...req.body });
    }
  });
});

app.put('/api/categories/:id', (req, res) => {
  const { name, color } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  db.updateCategory(req.params.id, req.body, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Category not found' });
    } else {
      res.json({ id: req.params.id, ...req.body });
    }
  });
});

app.delete('/api/categories/:id', (req, res) => {
  db.deleteCategory(req.params.id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Category not found' });
    } else {
      res.json({ message: 'Category deleted successfully' });
    }
  });
});

// Analytics routes
app.get('/api/statistics', (req, res) => {
  db.getStatistics((err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(row || { total_income: 0, total_expenses: 0, total_transactions: 0 });
    }
  });
});

app.get('/api/spending-by-category', (req, res) => {
  db.getSpendingByCategory((err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows || []);
    }
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  if (fs.existsSync(buildPath)) {
    res.sendFile(path.join(buildPath, 'index.html'));
  } else {
    res.json({ 
      message: 'ur-money API is running. Build the client app to see the UI.',
      api_docs: '/api/health'
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ur-money server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
