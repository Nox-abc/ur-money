import React, { useState, useEffect } from 'react';
import './App.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState({
    total_income: 0,
    total_expenses: 0,
    total_transactions: 0
  });
  const [spendingByCategory, setSpendingByCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category_id: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, catRes, statsRes, spendingRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/categories'),
        fetch('/api/statistics'),
        fetch('/api/spending-by-category')
      ]);

      const [transData, catData, statsData, spendingData] = await Promise.all([
        transRes.json(),
        catRes.json(),
        statsRes.json(),
        spendingRes.json()
      ]);

      setTransactions(transData);
      setCategories(catData);
      setStatistics(statsData);
      setSpendingByCategory(spendingData);
      setError(null);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          category_id: formData.category_id ? parseInt(formData.category_id) : null
        })
      });

      if (response.ok) {
        setFormData({
          description: '',
          amount: '',
          type: 'expense',
          category_id: '',
          date: new Date().toISOString().split('T')[0]
        });
        fetchData();
      } else {
        setError('Failed to add transaction. Please try again.');
      }
    } catch (err) {
      setError('Failed to add transaction. Please try again.');
      console.error('Error adding transaction:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData();
      } else {
        setError('Failed to delete transaction. Please try again.');
      }
    } catch (err) {
      setError('Failed to delete transaction. Please try again.');
      console.error('Error deleting transaction:', err);
    }
  };

  const formatCurrency = (amount) => {
    const currency = process.env.REACT_APP_CURRENCY || 'USD';
    const locale = process.env.REACT_APP_LOCALE || 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const balance = (statistics.total_income || 0) - (statistics.total_expenses || 0);

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading ur-money...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>💰 ur-money</h1>
        <p>Manage your money and track your spending</p>
      </header>

      <div className="container">
        {error && <div className="error">{error}</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Income</div>
            <div className="stat-value income">
              {formatCurrency(statistics.total_income || 0)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Expenses</div>
            <div className="stat-value expense">
              {formatCurrency(statistics.total_expenses || 0)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Balance</div>
            <div className={`stat-value ${balance >= 0 ? 'income' : 'expense'}`}>
              {formatCurrency(balance)}
            </div>
          </div>
        </div>

        <div className="content-grid">
          <div>
            <div className="card">
              <h2>Add Transaction</h2>
              <form onSubmit={handleSubmit} className="add-transaction-form">
                <div className="form-group">
                  <label>Type</label>
                  <div className="type-selector">
                    <div
                      className={`type-option ${formData.type === 'expense' ? 'active expense' : ''}`}
                      onClick={() => setFormData({ ...formData, type: 'expense' })}
                    >
                      Expense
                    </div>
                    <div
                      className={`type-option ${formData.type === 'income' ? 'active income' : ''}`}
                      onClick={() => setFormData({ ...formData, type: 'income' })}
                    >
                      Income
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    placeholder="e.g., Grocery shopping"
                  />
                </div>

                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Add Transaction
                </button>
              </form>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
              <h2>Recent Transactions</h2>
              {transactions.length === 0 ? (
                <div className="empty-state">
                  <p>No transactions yet. Add your first transaction above!</p>
                </div>
              ) : (
                <div className="transactions-list">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`transaction-item ${transaction.type}`}
                    >
                      <div className="transaction-info">
                        <div className="transaction-description">
                          {transaction.description}
                        </div>
                        <div className="transaction-meta">
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                          {transaction.category_name && (
                            <span className="transaction-category">
                              <span
                                className="category-dot"
                                style={{ backgroundColor: transaction.category_color }}
                              />
                              {transaction.category_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="transaction-actions">
                        <div className={`transaction-amount ${transaction.type}`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </div>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="btn btn-danger btn-small"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="card">
              <h2>Spending by Category</h2>
              {spendingByCategory.length === 0 ? (
                <div className="empty-state">
                  <p>No expenses tracked yet.</p>
                </div>
              ) : (
                <div className="spending-chart">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={spendingByCategory}
                        dataKey="total"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={(entry) => entry.name}
                      >
                        {spendingByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="category-list" style={{ marginTop: '1rem' }}>
                    {spendingByCategory.map((cat) => (
                      <div key={cat.name} className="category-item">
                        <div
                          className="category-color"
                          style={{ backgroundColor: cat.color }}
                        />
                        <div className="category-info">
                          <div className="category-name">{cat.name}</div>
                          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                            {formatCurrency(cat.total)} ({cat.count} transactions)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
