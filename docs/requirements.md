# Requirements Analysis

## Business Goals
- Obtain accurate sales results data from distributors
- Enable comparison of current results with historical data and budgets
- Monitor the number of new points of sale
- Improve business relationship management with partners
- Central access to marketing and product materials

## User Roles

### 1. Distributor Employee
- Limited access – no visibility into contract details or detailed sales results

### 2. Distributor
- Access only to their own data and forms
- Can enter sales data and download materials

### 3. Export Manager
- Access to data for assigned distributors
- Can set budgets and sales targets
- Can filter and export data

### 4. Administrator
- Full access to all distributor data
- Can export data for all distributors
- Can select any distributor to view their reports

### 5. Super-Administrator
- All administrator permissions
- User account management
- Access to activity logs

## System Modules

### Login and Authorization
- Role-based system with 5 access levels
- Security:
  - Force password change on first login
  - Password requirements: min. 8 characters, 1 special character, 1 digit
  - Account lockout after 3 failed login attempts
  - Hierarchical account unlocking system
  - HTTPS encryption
  - User activity logging
  - Administrator can suspend accounts

### SALES CHANNELS

- Quarterly sales reporting broken down by channel:
  - Professional sales
  - Pharmacy sales
  - E-commerce B2C
  - E-commerce B2B
  - Third party
  - Other
- Features:
  - Automatic summing of all channels (Total sales)
  - Field for new clients (New clients)
  - CSV file import
  - Customer lists by channel (optional)
  - Monthly report per SKU (optional)
  - Automatic conversion to EUR according to NBP rate

### PURCHASE REPORT

- Module available only for roles: Export Manager, Administrator, Super-Administrator
- Reporting of purchase data and points of sale

#### Data Fields:
- Last Year Sales – sales in the same quarter last year
- Purchases – distributor purchase value
- Budget – defined sales budget
- Actual Sales – automatically pulled from Sales Channels module
- Total POS – number of points of sale
- New Openings – new points of sale in the quarter
- New Openings Target – planned number of new points of sale

#### Automatic Calculations:
- Year-over-year comparison (TotalYearVsLastYear)
- Comparison to budget (TotalYearVsBudget)

#### Dashboard:
- Visualization of quarterly data as bar charts
- Channels: Actual Sales, Budget, Last Year Sales, Purchases

#### Notes:
- Distributor must be selected before editing or saving data
- All data updates after saving the report or changing the distributor selection

### MEDIA

- Repository for marketing and product materials
- Access to view, download, and search files

#### Features:
- Browse files in grid or list view
- Download single files or multiple files as a package
- Search by:
  - File name
  - SKU
  - Tags
  - Category
- Sort files by:
  - Creation date (oldest/newest)
  - File name (A-Z / Z-A)
  - File size (largest/smallest)

#### File Upload:
- Upload files with optional assignment of:
  - SKU
  - Category
  - Tags
  - Description
- Create new categories (unique path + name + description)

#### Example folder structure:
- `/PRODUCTS/` – subfolders per SKU
- `/MARKETING/` – subfolders per month

#### Additional Notes:
- Ability to select multiple files for download
- Display basic file information: size, date, SKU, category, tags, uploader
- Pagination support for large file sets

### Admin Panel

The admin panel is divided into three modules:

#### 1. User Management
- Overview of all system users with role and status information
- Hierarchical account unlocking
- User account management: activation/deactivation and unlocking
- Add new users (Admin / Superadmin only)

#### 2. Export Manager Panel
- Overview of distributors assigned to Export Managers
- Information about company, country, currency, assigned Export Manager, and status
- Admin / Superadmin: full access to all distributors and substitutes, ability to create/deactivate substitutes, export full or assigned data
- Export Manager: access only to assigned distributors, no access to substitutes, ability to export assigned distributor data

#### 3. Activity Logs
- View system activity logs with filters by user, action, and time range
- Export logs to CSV (UTF-8) with predefined columns (Superadmin only)

## Technical Requirements

### Technology Stack
- **Frontend**: React
- **Backend**: Nest.js (Node.js + TypeScript)
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authorization**: JWT + role-based access control

### Performance Requirements
- Support ~80 users initially
- Typical load: 1-2 simultaneous users
- Responsive design (mainly desktop)

### Compatibility
- Browsers: Chrome, Firefox, Safari, Edge (latest versions)
- HTTPS required for all connections

## Security Requirements
- Data encryption in transit (HTTPS) and at rest
- Password hashing
- Account lockout mechanisms
- User activity audit
- Hierarchical permissions system
