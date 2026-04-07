# 💰 Money Mate — Fintech Expense Tracker

A full-stack, production-ready personal finance tracker with expense management, EMI tracking, reports, and smart AI-powered insights.

---

## 🚀 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React.js 18, Tailwind CSS, Chart.js |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB (Mongoose ODM)              |
| Auth       | JWT (JSON Web Tokens) + bcryptjs    |
| Charts     | Chart.js via react-chartjs-2        |
| Export     | jsPDF + jspdf-autotable, xlsx       |

---

## 📁 Project Structure

```
money-mate/
├── backend/
│   ├── config/         # DB connection
│   ├── controllers/    # Business logic
│   ├── middleware/     # Auth middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routes
│   ├── .env            # Environment variables
│   ├── seed.js         # Demo data seeder
│   └── server.js       # Express app entry
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/         # Login / Register
│   │   │   ├── dashboard/    # Dashboard with charts
│   │   │   ├── transactions/ # CRUD transactions
│   │   │   ├── emi/          # EMI manager
│   │   │   ├── reports/      # Monthly/yearly reports
│   │   │   ├── insights/     # Smart insights
│   │   │   └── shared/       # Sidebar, UI components
│   │   ├── context/          # Auth context
│   │   ├── utils/            # API client, helpers
│   │   └── styles/           # Global CSS
│   └── package.json
│
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (local) or MongoDB Atlas (cloud)
- **npm** v9+

---

## 🛠️ Setup & Run (Step by Step)

### Step 1 — Clone / Extract the project

```bash
cd money-mate
```

### Step 2 — Configure environment variables

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/moneymate
JWT_SECRET=moneymate_super_secret_jwt_key_2024
JWT_EXPIRE=30d
NODE_ENV=development
```

> For MongoDB Atlas, replace MONGODB_URI with your connection string:
> `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moneymate`

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 3 — Install dependencies

```bash
# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### Step 4 — Seed demo data (optional but recommended)

```bash
cd backend && npm run seed
```

This creates:
- 1 demo user
- 6 months of transaction history
- 3 active EMIs (Home Loan, Car Loan, iPhone EMI)
- Default expense/income categories

**Demo Login:**
```
Email:    demo@moneymate.in
Password: demo1234
```

### Step 5 — Run the application

**Terminal 1 — Backend:**
```bash
cd backend && npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm start
# Runs on http://localhost:3000
```

Open **http://localhost:3000** in your browser. 🎉

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint           | Description       |
|--------|--------------------|-------------------|
| POST   | /api/auth/register | Register user     |
| POST   | /api/auth/login    | Login user        |
| GET    | /api/auth/me       | Get current user  |
| PUT    | /api/auth/profile  | Update profile    |

### Transactions
| Method | Endpoint                | Description          |
|--------|-------------------------|----------------------|
| GET    | /api/transactions       | Get all (filterable) |
| POST   | /api/transactions       | Create transaction   |
| PUT    | /api/transactions/:id   | Update transaction   |
| DELETE | /api/transactions/:id   | Delete transaction   |

### EMI
| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| GET    | /api/emi              | Get all EMIs        |
| POST   | /api/emi              | Create EMI          |
| PUT    | /api/emi/:id          | Update EMI          |
| DELETE | /api/emi/:id          | Delete EMI          |
| POST   | /api/emi/:id/pay      | Mark payment paid   |
| POST   | /api/emi/:id/unpay    | Mark payment unpaid |

### Dashboard, Reports, Insights
| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| GET    | /api/dashboard        | Dashboard summary     |
| GET    | /api/reports/monthly  | Monthly report        |
| GET    | /api/reports/yearly   | Yearly report         |
| GET    | /api/insights         | Smart insights        |

---

## ✨ Features

- **🔐 Auth** — JWT login/signup with bcrypt password hashing
- **📊 Dashboard** — Balance, income vs expense charts, EMI due alerts
- **💸 Transactions** — Full CRUD with search, filter by date/category/type, pagination
- **🏦 EMI Manager** — Add loans, auto-generate payment schedule, mark paid/unpaid, overdue alerts
- **📈 Reports** — Monthly/yearly breakdowns, category analysis, export to PDF & Excel
- **🧠 Insights** — Spending trends, EMI burden analysis, savings rate analysis
- **🌙 Dark Mode** — Toggle with persistence
- **📱 Responsive** — Mobile-first design

---

## 🎨 Design Highlights

- Fonts: **Space Grotesk** (headings) + **Plus Jakarta Sans** (body)
- Color: Deep Indigo/Slate with green/rose accents
- Glassmorphism effects, smooth animations, shimmer loading states
- Fintech-grade card layouts with gradient stat cards

---

## 🐛 Troubleshooting

**MongoDB not connecting?**
- Ensure MongoDB is running: `mongod --dbpath /data/db`
- Or use MongoDB Atlas and update MONGODB_URI

**Port conflicts?**
- Backend: change PORT in `backend/.env`
- Frontend: set PORT=3001 in `frontend/.env`

**CORS errors?**
- Ensure backend CORS origin matches frontend URL
- Check `server.js` CORS config

---

## 📝 License

MIT — Free to use and modify.
