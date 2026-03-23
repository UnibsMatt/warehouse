# Warehouse Management System

A production-ready fullstack warehouse management application.

## Tech Stack

- **Frontend**: Next.js 14 App Router (TypeScript + Tailwind CSS)
- **Backend**: FastAPI (Python 3.11+, async)
- **Database**: PostgreSQL 15
- **Auth**: JWT (access token + refresh token in httpOnly cookies)
- **Infrastructure**: Docker + Docker Compose + Nginx

## Quick Start

### 1. Clone and configure

```bash
cp .env.example .env
```

Edit `.env` and set a strong `SECRET_KEY` (minimum 32 characters):

```env
SECRET_KEY=your-super-secret-key-change-in-production-min-32-chars
```

### 2. Build and run

```bash
docker-compose up --build
```

The first boot will:
1. Start PostgreSQL
2. Run Alembic migrations
3. Seed the database with demo data
4. Start FastAPI and Next.js

### 3. Access the application

Open http://localhost in your browser.

### Demo credentials

| Role  | Email                    | Password  |
|-------|--------------------------|-----------|
| Admin | admin@warehouse.com      | admin123  |
| User  | user@warehouse.com       | user123   |

## Features

### User Dashboard
- Browse all products with real-time stock levels
- Add/remove products to cart with quantity controls
- Select a client and place orders
- Stock is automatically decremented on order creation

### Admin Panel
- View all pending orders with client and item details
- Mark orders as complete (optimistic UI update)
- Protected route: accessible only to admin users

## Development Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

export DATABASE_URL=postgresql+psycopg2://warehouse:warehouse@localhost:5432/warehouse
export SECRET_KEY=dev-secret-key

alembic upgrade head
python seed.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install

echo "FASTAPI_URL=http://localhost:8000" > .env.local
echo "JWT_SECRET=dev-secret-key" >> .env.local

npm run dev
```

Visit http://localhost:3000 for the frontend and http://localhost:8000/docs for the FastAPI Swagger UI.

## Architecture

```
Browser
  -> HTTP (port 80)
Nginx
  -> proxy_pass
Next.js (port 3000)
  -> server-side fetch with Bearer token
FastAPI (port 8000)
  -> async SQLAlchemy
PostgreSQL (port 5432)
```

### Security

- JWT access tokens expire in 15 minutes
- JWT refresh tokens expire in 7 days
- All tokens stored in httpOnly cookies (XSS-safe)
- Browser never communicates directly with FastAPI
- Next.js middleware enforces authentication and role-based access
- Admin routes protected both in frontend middleware and FastAPI dependencies

## API Endpoints

| Method | Path                    | Auth  | Description              |
|--------|-------------------------|-------|--------------------------|
| POST   | /api/auth/login         | No    | Login, returns JWT       |
| POST   | /api/auth/refresh       | No    | Refresh access token     |
| POST   | /api/auth/logout        | No    | Logout                   |
| GET    | /api/clients/           | User  | List all clients         |
| POST   | /api/clients/           | User  | Create client            |
| GET    | /api/clients/{id}       | User  | Get client by ID         |
| PUT    | /api/clients/{id}       | User  | Update client            |
| DELETE | /api/clients/{id}       | User  | Delete client            |
| GET    | /api/products/          | User  | List all products        |
| POST   | /api/products/          | User  | Create product           |
| GET    | /api/products/{id}      | User  | Get product by ID        |
| PUT    | /api/products/{id}      | User  | Update product           |
| DELETE | /api/products/{id}      | User  | Delete product           |
| POST   | /api/orders/            | User  | Create order             |
| GET    | /api/orders/            | User  | List all orders          |
| GET    | /api/orders/pending     | Admin | List pending orders      |
| PUT    | /api/orders/{id}/status | Admin | Update order status      |
