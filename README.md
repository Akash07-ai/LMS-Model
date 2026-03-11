# LMS Platform

Production-grade Learning Management System with sequential video unlocking.

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- Tailwind CSS
- Zustand
- Axios

### Backend
- Node.js + Express
- MySQL (Aiven)
- JWT Authentication
- bcrypt

## Project Structure

```
lms-platform/
├── backend/          # Node.js + Express API
└── frontend/         # Next.js 14 App
```

## Setup Instructions

### Backend Setup

1. Navigate to backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials

5. Run development server:
```bash
npm run dev
```

Backend runs on: http://localhost:5000

### Frontend Setup

1. Navigate to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

4. Run development server:
```bash
npm run dev
```

Frontend runs on: http://localhost:3000

## Features

- ✅ JWT Authentication (Access + Refresh tokens)
- ✅ Sequential video unlocking
- ✅ Video progress tracking
- ✅ Auto-play next video
- ✅ Resume video position
- ✅ Minimalist UI

## Deployment

- Backend → Render
- Frontend → Vercel
- Database → Aiven MySQL
