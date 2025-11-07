const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'urmoney.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error connecting to database:', err);
      } else {
        console.log('Connected to SQLite database');
        this.initializeTables();
      }
    });
  }

  initializeTables() {
    this.db.serialize(() => {
      // Categories table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          color TEXT DEFAULT '#3B82F6',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Transactions table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          description TEXT NOT NULL,
          amount REAL NOT NULL,
          type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
          category_id INTEGER,
          date DATE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories(id)
        )
      `);

      // Insert default categories
      this.db.get("SELECT COUNT(*) as count FROM categories", (err, row) => {
        if (!err && row.count === 0) {
          const defaultCategories = [
            ['Food & Dining', '#EF4444'],
            ['Transportation', '#F59E0B'],
            ['Shopping', '#EC4899'],
            ['Entertainment', '#8B5CF6'],
            ['Bills & Utilities', '#3B82F6'],
            ['Healthcare', '#10B981'],
            ['Salary', '#22C55E'],
            ['Other', '#6B7280']
          ];

          const stmt = this.db.prepare("INSERT INTO categories (name, color) VALUES (?, ?)");
          defaultCategories.forEach(([name, color]) => {
            stmt.run(name, color);
          });
          stmt.finalize();
          console.log('Default categories created');
        }
      });
    });
  }

  // Transaction methods
  getAllTransactions(callback) {
    this.db.all(`
      SELECT t.*, c.name as category_name, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      ORDER BY t.date DESC, t.created_at DESC
    `, callback);
  }

  getTransactionById(id, callback) {
    this.db.get(`
      SELECT t.*, c.name as category_name, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `, [id], callback);
  }

  createTransaction(data, callback) {
    this.db.run(`
      INSERT INTO transactions (description, amount, type, category_id, date)
      VALUES (?, ?, ?, ?, ?)
    `, [data.description, data.amount, data.type, data.category_id, data.date], callback);
  }

  updateTransaction(id, data, callback) {
    this.db.run(`
      UPDATE transactions
      SET description = ?, amount = ?, type = ?, category_id = ?, date = ?
      WHERE id = ?
    `, [data.description, data.amount, data.type, data.category_id, data.date, id], callback);
  }

  deleteTransaction(id, callback) {
    this.db.run('DELETE FROM transactions WHERE id = ?', [id], callback);
  }

  // Category methods
  getAllCategories(callback) {
    this.db.all('SELECT * FROM categories ORDER BY name', callback);
  }

  getCategoryById(id, callback) {
    this.db.get('SELECT * FROM categories WHERE id = ?', [id], callback);
  }

  createCategory(data, callback) {
    this.db.run(`
      INSERT INTO categories (name, color)
      VALUES (?, ?)
    `, [data.name, data.color || '#3B82F6'], callback);
  }

  updateCategory(id, data, callback) {
    this.db.run(`
      UPDATE categories
      SET name = ?, color = ?
      WHERE id = ?
    `, [data.name, data.color, id], callback);
  }

  deleteCategory(id, callback) {
    this.db.run('DELETE FROM categories WHERE id = ?', [id], callback);
  }

  // Analytics methods
  getStatistics(callback) {
    this.db.get(`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
        COUNT(*) as total_transactions
      FROM transactions
    `, callback);
  }

  getSpendingByCategory(callback) {
    this.db.all(`
      SELECT 
        c.name,
        c.color,
        SUM(t.amount) as total,
        COUNT(t.id) as count
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.type = 'expense'
      GROUP BY c.id, c.name, c.color
      ORDER BY total DESC
    `, callback);
  }
}

module.exports = new Database();
