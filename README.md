# 💰 ur-money

A self-hosted web application to manage your money and track your spending. Built with Node.js, Express, React, and SQLite.

## Features

- 📊 **Dashboard Overview** - See your total income, expenses, and balance at a glance
- 💸 **Transaction Management** - Add, view, and delete income and expense transactions
- 🏷️ **Categories** - Organize transactions with customizable categories
- 📈 **Visual Analytics** - Interactive pie charts showing spending by category
- 🗄️ **SQLite Database** - Lightweight, file-based database with no external dependencies
- 🐳 **Docker Support** - One-command deployment with Docker Compose

## Quick Start (Docker - Recommended)

The easiest way to run ur-money is with Docker:

```bash
docker compose up -d
```

Then open your browser to `http://localhost:3001`

That's it! The application will be running with persistent data storage.

## Installation

### Option 1: Docker (Recommended)

**Requirements:**
- Docker
- Docker Compose

**Steps:**

1. Clone the repository:
```bash
git clone https://github.com/Nox-abc/ur-money.git
cd ur-money
```

2. Start the application:
```bash
docker compose up -d
```

3. Access the application at `http://localhost:3001`

To stop the application:
```bash
docker compose down
```

To view logs:
```bash
docker compose logs -f
```

### Option 2: Manual Installation

**Requirements:**
- Node.js (v14 or higher)
- npm

**Steps:**

1. Clone the repository:
```bash
git clone https://github.com/Nox-abc/ur-money.git
cd ur-money
```

2. Install dependencies:
```bash
npm install
cd client && npm install && cd ..
```

3. Build the React frontend:
```bash
npm run build
```

4. Start the server:
```bash
npm start
```

5. Access the application at `http://localhost:3001`

## Development

To run the application in development mode with hot-reload:

1. Install dependencies (if not already done):
```bash
npm install
cd client && npm install && cd ..
```

2. Run both server and client in development mode:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- React development server on `http://localhost:3000`

## Configuration

You can customize the application by creating a `.env` file in the root directory. See `.env.example` for available options:

- `PORT` - Server port (default: 3001)
- `REACT_APP_CURRENCY` - Currency code for display (default: USD)
- `REACT_APP_LOCALE` - Locale for number formatting (default: en-US)

Example `.env` file:
```bash
PORT=3001
REACT_APP_CURRENCY=EUR
REACT_APP_LOCALE=de-DE
```

## Data Storage

Transaction data is stored in a SQLite database located at `./data/urmoney.db`. This file is automatically created when the application first runs.

When using Docker, the database is stored in a Docker volume named `urmoney-data` for persistence.

## API Endpoints

The application provides a REST API:

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create a new transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Analytics
- `GET /api/statistics` - Get summary statistics
- `GET /api/spending-by-category` - Get spending breakdown by category

## Tech Stack

- **Backend:** Node.js, Express.js, SQLite3
- **Frontend:** React, Recharts
- **Deployment:** Docker, Docker Compose

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## Support

For issues and questions, please open an issue on GitHub.
