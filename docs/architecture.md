# System Architecture

## Architecture Overview

The system will be built using a 3-layer architecture with a clear separation of responsibilities:



```
[Frontend (React)] ↔ [Backend API (Nest.js)] ↔ [Database (PostgreSQL)]
                                    ↓
                            [File Storage (Local)]
```


## System Layers

### 1. Frontend (React)

**Responsibilities:**

- User interface (dashboards, forms, file repository)
- Authorization and session management
- Client-side data validation
- Communication with backend API

**Main Components:**

- `AuthModule` - login and JWT token management (`LoginForm`, `AuthProvider`, `ProtectedRoute`)
- `DashboardModule` - main user dashboard (`DashboardPage`)
- `SalesChannelsModule` - sales forms and views (`SalesChannelsPage`)
- `PurchaseReportModule` - purchase reports and dashboards (`PurchaseReportPage`)
- `MediaModule` - file browser (`MediaPage`)
- `AdminModule` - administration panel (`AdminPage`, `UserManagementPage`, `LogsPage`)
- `ExportManagerModule` - Export Manager dashboard (`ExportManagerPage`)
- `MainLayout` - application layout for routing (`MainLayout`)

**Technologies:**

- React 18+ with hooks
- React Router Dom for routing
- Axios for HTTP communication
- Lucide for icons
- recharts for dashboard charts

### 2. Backend (Nest.js)

**Responsibilities:**

- REST API for all operations
- Business logic and validation
- Authentication and authorization (JWT + RBAC)
- Database operations
- Report generation and data export
- File management

**Application Modules:**

- `AuthModule` - authentication and authorization
- `UsersModule` - user management
- `DistributorsModule` - distributor management
- `SalesChannelsModule` - sales reporting
- `PurchaseReportsModule` - purchase reporting
- `MediaModule` - file management
- `AdminModule` - administrative functions
- `ExportsModule` - data export to CSV
- `CurrencyModule` - currency rates (NBP API integration)

**Middleware and Guards:**

- `AuthGuard` - JWT verification
- `RolesGuard` - role-based access control
- `LoggingInterceptor` - activity logging

### 3. Database (PostgreSQL)

**Main Tables:**

- `users` - system users
- `distributors` - distributors
- `user_distributor_assignments` - user assignments
- `sales_channels_reports` - sales reports
- `purchase_reports` - purchase reports
- `media_files` - file metadata
- `media_categories` - file categories
- `user_activity_logs` - activity logs
- `currency_rates` - currency rates
- `export_manager_substitutions` - substitutions

**Optimizations:**

- Indexes on frequently queried columns
- Data integrity constraints

### 4. File Storage

**Folder Structure Backend:**

```
uploads/
├── media/

```
**Functionalities:**

- File upload with type and size validation
- Unique file name generation
- Metadata stored in the database
- Secure access through API (authorization required)

## Data Flow

### 1. Authorization


```
User → Frontend → Backend (Auth API) → Database → JWT Token → Frontend
```

### 2. CRUD Operations

```
User → Frontend → Backend (API + Guards) → Database → Response → Frontend
```

### 3. File Upload

```
User → Frontend → Backend (Media API) → File Storage + Database → Response
```

### 4. Data Export

```
Admin → Frontend → Backend (Export API) → Database → CSV File → Download
```
## Security

### Communication Layer

- HTTPS for all connections
- CORS configured for frontend domain
- Rate limiting on API endpoints

### Authorization and Authentication

- JWT tokens with reasonable expiration
- Refresh tokens for long-lived sessions
- Role-based access control (RBAC)
- Hierarchical permissions system

### Data Protection

- Password hashing (argon2)
- Input validation and sanitization
- Parameterized SQL queries (TypeORM)
- Logging of sensitive operations

## Monitoring and Logging

### Activity Logging

- All user operations
- Login attempts (successful and failed)
- CRUD operations on data
- Application errors

## Scalability

### Current Requirements

- ~80 users
- 1-2 simultaneous users
- Small data volume

## Deployment

### Infrastructure

- **Backend**: Node.js server
- **Database**: PostgreSQL server
- **Frontend**: Static files (nginx)
- **Files**: Local file system (initially)