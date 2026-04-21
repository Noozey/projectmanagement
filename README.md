# 📋 Project Management App

A full-stack project management application built with a **Node.js/Express** backend and a modern **TypeScript** frontend. Features real-time collaboration powered by **Agora** and database management via **Supabase**.

---

## 🗂️ Project Structure

```
projectmanagement/
├── my-app/        # Frontend (TypeScript)
└── server/        # Backend (Node.js / Express)
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm

---

## ⚙️ Environment Variables

Before running the app, create a `.env` file inside the **`server/`** directory with the following variables:

```env
SUPABASE_URL=
SUPABASE_KEY=
JWT_SECRET=
AGORA_APP_ID=
AGORA_APP_CERT=
```

| Variable         | Description                                      |
|-----------------|--------------------------------------------------|
| `SUPABASE_URL`  | Your Supabase project URL                        |
| `SUPABASE_KEY`  | Your Supabase anon/service key                   |
| `JWT_SECRET`    | Secret key used to sign JWT tokens               |
| `AGORA_APP_ID`  | Agora application ID for real-time features      |
| `AGORA_APP_CERT`| Agora application certificate                    |

> ⚠️ **Never commit your `.env` file to version control.**

---

## 🖥️ Backend (Server)

Navigate to the `server/` directory, install dependencies, and start the development server.

```bash
cd server
npm install
npm run dev
```

The server will start in development mode with hot-reloading.

---

## 🌐 Frontend (my-app)

Navigate to the `my-app/` directory, install dependencies, and start the development server.

```bash
cd my-app
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port shown in your terminal).

---

## 🔧 Running Both (Quick Reference)

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd my-app
npm install
npm run dev
```

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|-----------|--------------------------------------|
| Frontend  | TypeScript, HTML, CSS                |
| Backend   | Node.js, Express                     |
| Database  | Supabase (PostgreSQL)                |
| Auth      | JWT                                  |
| Real-time | Agora                                |

---

## 📄 License

This project is open source. See [LICENSE](LICENSE) for details.
