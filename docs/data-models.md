# Data Models

## Project Assumptions

- **Database**: PostgreSQL  
- **Primary keys**: UUID (auto-generated)  
- **Naming convention**: snake_case for tables and columns  
- **Entities in Nest.js**: PascalCase (`User`, `Distributor`, `SalesChannelsReport`)  
- **Timestamps**: `created_at`, `updated_at`
- **Security**: hashed passwords, account locks, activity logs  
- **Currency**: original values + EUR + exchange rate  
- **Files**: metadata in DB, files in local storage  

---

## Model: `User`

Stores all system users with different roles.

**Columns:**
- `id` – UUID, primary key, auto-generated  
- `email` – string(255), unique, required  
- `password_hash` – string(255), required  
- `first_name` – string(100), required  
- `last_name` – string(100), required  
- `role` – enum: EMPLOYEE | DISTRIBUTOR | EXPORT_MANAGER | ADMIN | SUPER_ADMIN  
- `is_active` – boolean, default true  
- `is_locked` – boolean, default false  
- `failed_login_attempts` – integer, default 0  
- `password_changed_at` – timestamp, nullable  
- `must_change_password` – boolean, default true  
- `created_at` – timestamp, automatic  
- `updated_at` – timestamp, automatic  

**Relations:**
- One-to-Many with `UserDistributorAssignment` (assignments)  
- One-to-Many with `UserActivityLog` (activityLogs)  
- One-to-Many with `MediaFile` (uploadedFiles)  
- One-to-Many with `Distributor` (managedDistributors as export manager)  

---

## Model: `Distributor`

Stores distributor company data.

**Columns:**
- `id` – UUID, primary key, auto-generated  
- `company_name` – string(255), required  
- `country` – string(2), ISO code, required  
- `currency` – string(3), ISO code, required  
- `is_active` – boolean, default true  
- `created_at` – timestamp, automatic  
- `updated_at` – timestamp, automatic  

**Relations:**
- Many-to-One with `User` (exportManager)  
- One-to-Many with `UserDistributorAssignment` (assignments)  
- One-to-Many with `SalesChannelsReport` (salesReports)  
- One-to-Many with `PurchaseReport` (purchaseReports)  

---

## Model: `UserDistributorAssignment`

User-to-distributor assignments (many-to-many relation).

**Columns:**
- `id` – UUID, primary key, auto-generated  
- `user_id` – UUID, foreign key to User, required  
- `distributor_id` – UUID, foreign key to Distributor, required  
- `created_at` – timestamp, automatic  

**Constraints:**
- Unique composite key: (user_id, distributor_id)  
- Cascade delete when user or distributor is removed  

**Relations:**
- Many-to-One with `User` (user)  
- Many-to-One with `Distributor` (distributor)  

---

## Model: `SalesChannelsReport`

Quarterly sales reports per channel.

**Columns:**
- `id` – UUID, primary key, auto-generated  
- `distributor_id` – UUID, foreign key to Distributor, required  
- `year` – integer, required  
- `quarter` – integer, required, values 1–4  
- `currency` – string(3), ISO code, required  

- `professional_sales` – decimal(15,2), default 0  
- `pharmacy_sales` – decimal(15,2), default 0  
- `ecommerce_b2c_sales` – decimal(15,2), default 0  
- `ecommerce_b2b_sales` – decimal(15,2), default 0  
- `third_party_sales` – decimal(15,2), default 0  
- `other_sales` – decimal(15,2), default 0  
- `total_sales` – decimal(15,2), default 0  
- `new_clients` – integer, default 0  

- `stock_level` – decimal(15,2), nullable  
- `total_sales_eur` – decimal(15,2), nullable  
- `currency_rate` – decimal(10,4), nullable  

- `created_by` – UUID, foreign key to User, nullable  
- `created_at` – timestamp, automatic  
- `updated_at` – timestamp, automatic  

**Constraints:**
- Unique composite key: (distributor_id, year, quarter)  
- Validation: quarter between 1 and 4  

**Relations:**
- Many-to-One with `Distributor` (distributor)  
- Many-to-One with `User` (createdBy)  
- One-to-Many with `SalesChannelsClient` (clients)  
- One-to-Many with `SalesChannelsSkuReport` (skuReports)  

---

## Model: `SalesChannelsClient`

Stores client names per sales channel in reports.

**Columns:**
- `id` – UUID, primary key, auto-generated  
- `report_id` – UUID, foreign key to SalesChannelsReport, cascade delete  
- `channel` – string (e.g. Professional, Pharmacy, Ecommerce B2C/B2B, Third party, Other)  
- `client_name` – string, required  

---

## Model: `SalesChannelsSkuReport`

Stores monthly SKU-level sales data per report.

**Columns:**
- `id` – UUID, primary key, auto-generated  
- `report_id` – UUID, foreign key to SalesChannelsReport, cascade delete  
- `sku` – string(50), required  
- `month` – integer, 1–12  
- `sales_value` – decimal(15,2), required  
- `sales_quantity` – integer, required  

**Constraints:**
- Unique composite key: (report_id, sku, month)  

---

## Model: `PurchaseReport`

Quarterly purchase reports and POS data.

**Columns:**
- `id` – UUID, primary key, auto-generated  
- `distributor_id` – UUID, foreign key to Distributor, required  
- `year` – integer, required  
- `quarter` – integer, required, values 1–4  

- `last_year_sales` – decimal(15,2), default 0  
- `purchases` – decimal(15,2), default 0  
- `budget` – decimal(15,2), default 0  
- `actual_sales` – decimal(15,2), default 0 (synced with SalesChannelsReport.total_sales)  

- `total_pos` – integer, default 0  
- `new_openings` – integer, default 0  
- `new_openings_target` – integer, default 0  

- `created_by` – UUID, foreign key to User, nullable  
- `created_at` – timestamp, automatic  
- `updated_at` – timestamp, automatic  

**Constraints:**
- Unique composite key: (distributor_id, year, quarter)  
- Validation: quarter between 1 and 4  

**Relations:**
- Many-to-One with `Distributor` (distributor)  
- Many-to-One with `User` (createdBy)  

---

## Model: `MediaCategory`

Categories for media repository.

**Columns:**
- `id` – UUID, primary key, auto-generated  
- `name` – string(100), unique, required  
- `path` – string(255), unique, required (storage path)  
- `description` – text, nullable  
- `is_active` – boolean, default true  
- `created_at` – timestamp, automatic  

**Relations:**
- One-to-Many with `MediaFile` (files)  

---

## Model: `MediaFile`

Metadata for media repository files.

**Columns:**
- `id` – UUID, primary key, auto-generated  
- `filename` – string(255), required (storage file name)  
- `original_filename` – string(255), required  
- `storage_path` – string(500), required  
- `file_size` – bigint, required (bytes)  
- `mime_type` – string(100), required  
- `category_id` – UUID, foreign key to MediaCategory, nullable  
- `sku` – string(50), nullable  
- `tags` – array of strings, nullable  
- `description` – text, nullable  
- `is_active` – boolean, default true  
- `uploaded_by` – UUID, foreign key to User, nullable  
- `created_at` – timestamp, automatic  
- `updated_at` – timestamp, automatic  

**Relations:**
- Many-to-One with `MediaCategory` (category)  
- Many-to-One with `User` (uploadedBy)  

**Indexes:**
- sku  
- category_id  
- created_at  

---

## Model: `UserActivityLog`

Logs of user activity.

**Columns:**
- `id` – UUID, primary key, auto-generated  
- `user_id` – UUID, foreign key to User, nullable  
- `action` – enum (UserAction), required  
- `resource_type` – string(50), nullable  
- `resource_id` – UUID, nullable  
- `ip_address` – string, nullable  
- `user_agent` – text, nullable  
- `details` – JSON object, nullable  
- `created_at` – timestamp, automatic  

**Relations:**
- Many-to-One with `User` (user)  

**Indexes:**
- (user_id, created_at)  
- (action, created_at)  
- (created_at)  

---

## Model: `CurrencyRate`

Exchange rates to EUR.

**Columns:**
- `id` – UUID, primary key, auto-generated  
- `currency_code` – string(3), required  
- `rate_date` – date, required  
- `rate_to_eur` – decimal(10,4), required  
- `source` – string(50), default 'NBP'  
- `created_at` – timestamp, automatic  

**Constraints:**
- Unique composite key: (currency_code, rate_date)  

**Indexes:**
- (currency_code, rate_date DESC)  

---

## Model: `ExportManagerSubstitution`

Substitution system for Export Managers.

**Columns:**
- `id` – UUID, primary key, auto-generated  
- `export_manager_id` – UUID, foreign key to User, required  
- `substitute_id` – UUID, foreign key to User, required  
- `start_date` – date, required  
- `end_date` – date, required  
- `is_active` – boolean, default true  
- `created_by` – UUID, foreign key to User, nullable  
- `created_at` – timestamp, automatic  

**Constraints:**
- start_date ≤ end_date  
- export_manager_id ≠ substitute_id  

**Relations:**
- Many-to-One with `User` (exportManager)  
- Many-to-One with `User` (substitute)  
- Many-to-One with `User` (createdBy)  

**Indexes:**
- (export_manager_id, start_date, end_date)  

---

## Relations between models

### Role hierarchy and access:
SUPER_ADMIN
↓ manages
ADMIN
↓ manages
EXPORT_MANAGER
↓ assigned
DISTRIBUTOR/EMPLOYEE

### Key relations:

**1. User ↔ Distributor (Many-to-Many)**  
- Via `UserDistributorAssignment`  
- A user can be assigned to many distributors  
- A distributor can have many users  

**2. Export Manager → Distributors (One-to-Many)**  
- `Distributor.export_manager_id` → `User.id`  
- One Export Manager can manage many distributors  
- A distributor has one Export Manager  

**3. Distributor → Reports (One-to-Many)**  
- `SalesChannelsReport.distributor_id` → `Distributor.id`  
- `PurchaseReport.distributor_id` → `Distributor.id`  
- A distributor has multiple reports (one per quarter)  

**4. User → Activity Logs (One-to-Many)**  
- `UserActivityLog.user_id` → `User.id`  
- A user has multiple activity logs  

**5. Media Relations**  
- `MediaFile.category_id` → `MediaCategory.id`  
- `MediaFile.uploaded_by` → `User.id`  

### Data integrity rules:

**Cascade operations:**  
- Deleting a user → deletes their assignments (`UserDistributorAssignment`)  
- Deleting a distributor → deletes its assignments  

**Business constraints:**  
- Sales report: one per distributor/year/quarter  
- Purchase report: one per distributor/year/quarter  
- Currency rate: one per currency/date  
- Substitution: start_date ≤ end_date, different users  

**Validations:**  
- Quarter: values 1–4  
- Email: unique in system  
- Currency codes: ISO format (3 letters)  
- Country codes: ISO format (2 letters)  

## Initial Data Seeding

This section describes how to seed the database with initial users and distributors.

**Super Administrator:**
- Email: `admin@b2bportal.com`
- Role: `SUPER_ADMIN`
- Password: set via seeding script
- Created if not already existing

**Demo Users:**
| Email                     | Role           | First Name | Last Name |
|----------------------------|----------------|------------|-----------|
| employee@demo.com          | EMPLOYEE       | John       | Employee  |
| distributor@demo.com       | DISTRIBUTOR    | Jane       | Distributor |
| distributor2@demo.com      | DISTRIBUTOR    | Jack       | Distributor |
| exportmanager@demo.com     | EXPORT_MANAGER | Mike       | Manager   |
| exportmanager2@demo.com    | EXPORT_MANAGER | Marta      | Manager   |
| admin@demo.com             | ADMIN          | Alice      | Admin     |

**Demo Distributors:**
1. **Demo Distributor 1**
   - Country: `PL`
   - Currency: `PLN`
   - Export Manager: `exportmanager@demo.com`
   - Assigned Users: `distributor@demo.com`
2. **Demo Distributor 2**
   - Country: `EN`
   - Currency: `USD`
   - Export Manager: `exportmanager2@demo.com`
   - Assigned Users: `distributor2@demo.com`

**Seeding logic highlights:**
- Creates super admin if not present  
- Creates demo users only if they do not exist  
- Creates demo distributors only if they do not exist  
- Assigns users to distributors through `UserDistributorAssignment`  
- Uses Nest.js `UsersService` and TypeORM repositories for creation  

**Execution:**
- Run the seeding script in the application context  
- Logs status for each user and distributor created  
- Ensures idempotency: running multiple times will not duplicate records  