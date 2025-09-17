# Distributor Sales & Media Management System

A full-stack web application designed to collect distributor sales data, manage purchase reports, and provide central access to marketing and product materials.  
The system supports role-based access (Distributor, Export Manager, Administrator, Super-Administrator) with secure authentication and logging.

---

## Dashboard Preview

<img width="1906" height="886" alt="image" src="https://github.com/user-attachments/assets/8d882c04-cf65-4c60-8452-b9e066bd7b4a" />

---

## System Architecture

The application follows a **3-layer architecture**:

```
[Frontend (React)] ↔ [Backend API (Nest.js)] ↔ [Database (PostgreSQL)]
                                    ↓
                            [File Storage (Local)]
```


### Frontend (React)
- Dashboards, forms, file repository
- Role-based UI
- Data visualization with charts
- Routing and protected routes

### Backend (Nest.js)
- REST API with JWT authentication & RBAC
- Business logic and validation
- File upload & metadata management
- Data export (CSV) and reporting

### Database (PostgreSQL)
- User management
- Sales & purchase reports
- File metadata and activity logs
- Currency rates (NBP API integration)

### File Storage
- Local storage for uploaded media
- Access controlled via API

---

## Core Features

- Secure login & session management
- Quarterly sales reporting by channel
- Purchase report dashboards
- Media repository with file search, categories, and bulk download
- Administration panel for users, logs, and distributor management
- Export Manager view with budget & distributor assignments

---

## Requirements

- **Node.js** v18+
- **PostgreSQL** v14+
- **npm** or **yarn**
- **.env file for backend configuration**

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/erienx/b2b-portal.git
cd b2b-portal
```

### 2. Backend (Nest.js)
```bash
cd backend
npm install
```

#### Environment Variables

The backend requires a `.env` file inside the `backend/` directory.  
Below is an example configuration you can use as a starting point (`.env`):

```env
# Application
PORT=3000
NODE_ENV=development

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=b2b_portal

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your_refresh_jwt_secret

# External APIs
NBP_API_BASE=https://api.nbp.pl/api
NBP_API_TIMEOUT=5000

# Security
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=3
ACCOUNT_LOCK_DURATION=30m

# Media
MEDIA_UPLOAD_PATH=./uploads/media
MEDIA_MAX_FILE_SIZE=52428800
```
Run the backend in development mode:
```bash
npm run start:dev
```
API will be available at:
```
http://localhost:3000
```
### 3. Frontend (React)
```bash
cd frontend
npm install
```
Run the frontend in development mode:
```bash
npm run dev
```
Frontend will be available at:
```bash
http://localhost:5173
```
