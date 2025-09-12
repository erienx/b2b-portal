# Modele danych

## Założenia projektowe

- **Baza danych**: PostgreSQL
- **Klucze główne**: UUID (generowane automatycznie)
- **Konwencja nazw**: snake_case dla tabel i kolumn
- **Encje w Nest.js**: PascalCase (`User`, `Distributor`, `SalesChannelsReport`)
- **Timestampy**: `created_at`, `updated_at` (automatyczne)
- **Bezpieczeństwo**: hasła jako hash, blokady kont, logi aktywności
- **Walutowanie**: wartości oryginalne + EUR + kurs wymiany
- **Pliki**: metadane w DB, pliki w lokalnym storage

---

## Model: `User`

Przechowuje dane wszystkich użytkowników systemu z różnymi rolami.

**Kolumny:**
- `id` - UUID, klucz główny, generowany automatycznie
- `email` - string(255), unikalny, wymagany
- `password_hash` - string(255), wymagany
- `first_name` - string(100), wymagany
- `last_name` - string(100), wymagany
- `role` - enum: EMPLOYEE | DISTRIBUTOR | EXPORT_MANAGER | ADMIN | SUPER_ADMIN
- `is_active` - boolean, domyślnie true
- `is_locked` - boolean, domyślnie false
- `failed_login_attempts` - integer, domyślnie 0
- `password_changed_at` - timestamp, nullable
- `must_change_password` - boolean, domyślnie true
- `created_at` - timestamp, automatyczny
- `updated_at` - timestamp, automatyczny

**Relacje:**
- One-to-Many z `UserDistributorAssignment` (assignments)
- One-to-Many z `UserActivityLog` (activityLogs)
- One-to-Many z `MediaFile` (uploadedFiles)
- One-to-Many z `Distributor` (managedDistributors jako export manager)

---

## Model: `Distributor`

Przechowuje dane firm dystrybutorskich.

**Kolumny:**
- `id` - UUID, klucz główny, generowany automatycznie
- `company_name` - string(255), wymagany
- `country` - string(2), kod ISO kraju, wymagany
- `currency` - string(3), kod ISO waluty, wymagany
- `export_manager_id` - UUID, foreign key do User, nullable
- `is_active` - boolean, domyślnie true
- `created_at` - timestamp, automatyczny
- `updated_at` - timestamp, automatyczny

**Relacje:**
- Many-to-One z `User` (exportManager)
- One-to-Many z `UserDistributorAssignment` (assignments)
- One-to-Many z `SalesChannelsReport` (salesReports)
- One-to-Many z `PurchaseReport` (purchaseReports)

---

## Model: `UserDistributorAssignment`

Przypisania użytkowników do dystrybutorów (relacja many-to-many).

**Kolumny:**
- `id` - UUID, klucz główny, generowany automatycznie
- `user_id` - UUID, foreign key do User, wymagany
- `distributor_id` - UUID, foreign key do Distributor, wymagany
- `created_at` - timestamp, automatyczny

**Ograniczenia:**
- Unikalny klucz kompozytowy: (user_id, distributor_id)
- Kaskadowe usuwanie przy usunięciu użytkownika lub dystrybutora

**Relacje:**
- Many-to-One z `User` (user)
- Many-to-One z `Distributor` (distributor)

---

## Model: `SalesChannelsReport`

Raporty sprzedażowe według kanałów dystrybucji.

**Kolumny:**
- `id` - UUID, klucz główny, generowany automatycznie
- `distributor_id` - UUID, foreign key do Distributor, wymagany
- `year` - integer, wymagany
- `quarter` - integer, wymagany, wartości 1-4
- `currency` - string(3), kod waluty, wymagany

**Wartości sprzedażowe (waluta oryginalna):**
- `professional_sales` - decimal(15,2), domyślnie 0
- `pharmacy_sales` - decimal(15,2), domyślnie 0
- `ecommerce_b2c_sales` - decimal(15,2), domyślnie 0
- `ecommerce_b2b_sales` - decimal(15,2), domyślnie 0
- `third_party_sales` - decimal(15,2), domyślnie 0
- `other_sales` - decimal(15,2), domyślnie 0
- `total_sales` - decimal(15,2), domyślnie 0
- `new_clients` - integer, domyślnie 0

**Wartości przeliczone na EUR:**
- `professional_sales_eur` - decimal(15,2), nullable
- `pharmacy_sales_eur` - decimal(15,2), nullable
- `ecommerce_b2c_sales_eur` - decimal(15,2), nullable
- `ecommerce_b2b_sales_eur` - decimal(15,2), nullable
- `third_party_sales_eur` - decimal(15,2), nullable
- `other_sales_eur` - decimal(15,2), nullable
- `total_sales_eur` - decimal(15,2), nullable

**Metadata:**
- `currency_rate` - decimal(10,4), nullable, kurs do EUR
- `created_by` - UUID, foreign key do User, nullable
- `created_at` - timestamp, automatyczny
- `updated_at` - timestamp, automatyczny

**Ograniczenia:**
- Unikalny klucz kompozytowy: (distributor_id, year, quarter)
- Walidacja: quarter między 1 a 4

**Relacje:**
- Many-to-One z `Distributor` (distributor)
- Many-to-One z `User` (createdBy)

**Indeksy:**
- (distributor_id, year, quarter) - unikalny
- (distributor_id, created_at) - wydajność

---

## Model: `PurchaseReport`

Raporty zakupowe i dane o punktach sprzedaży.

**Kolumny:**
- `id` - UUID, klucz główny, generowany automatycznie
- `distributor_id` - UUID, foreign key do Distributor, wymagany
- `year` - integer, wymagany
- `quarter` - integer, wymagany, wartości 1-4

**Dane finansowe:**
- `last_year_sales` - decimal(15,2), domyślnie 0
- `purchases` - decimal(15,2), domyślnie 0
- `budget` - decimal(15,2), domyślnie 0
- `actual_sales` - decimal(15,2), domyślnie 0 (synchronizowane z `SalesChannelsReport.total_sales`)

**Punkty sprzedaży:**
- `total_pos` - integer, domyślnie 0 (total points of sale)
- `new_openings` - integer, domyślnie 0
- `new_openings_target` - integer, domyślnie 0

**Metadata:**
- `created_by` - UUID, foreign key do User, nullable
- `created_at` - timestamp, automatyczny
- `updated_at` - timestamp, automatyczny

**Ograniczenia:**
- Unikalny klucz kompozytowy: (distributor_id, year, quarter)
- Walidacja: quarter między 1 a 4

**Relacje:**
- Many-to-One z `Distributor` (distributor)
- Many-to-One z `User` (createdBy)

**Indeksy:**
- (distributor_id, year, quarter) - unikalny

---

## Model: `MediaCategory`

Kategorie plików w repozytorium mediów.

**Kolumny:**
- `id` - UUID, klucz główny, generowany automatycznie
- `name` - string(100), unikalny, wymagany
- `path` - string(255), unikalny, wymagany (ścieżka w storage)
- `description` - text, nullable
- `is_active` - boolean, domyślnie true
- `created_at` - timestamp, automatyczny

**Relacje:**
- One-to-Many z `MediaFile` (files)

---

## Model: `MediaFile`

Metadane plików w repozytorium mediów.

**Kolumny:**
- `id` - UUID, klucz główny, generowany automatycznie
- `filename` - string(255), wymagany (nazwa pliku w storage)
- `original_filename` - string(255), wymagany (oryginalna nazwa)
- `storage_path` - string(500), wymagany (pełna ścieżka do pliku)
- `file_size` - bigint, wymagany (rozmiar w bajtach)
- `mime_type` - string(100), wymagany
- `category_id` - UUID, foreign key do MediaCategory, nullable
- `sku` - string(50), nullable (numer produktu)
- `tags` - array of strings, nullable (tagi do wyszukiwania)
- `description` - text, nullable
- `is_active` - boolean, domyślnie true
- `uploaded_by` - UUID, foreign key do User, nullable
- `created_at` - timestamp, automatyczny
- `updated_at` - timestamp, automatyczny

**Relacje:**
- Many-to-One z `MediaCategory` (category)
- Many-to-One z `User` (uploadedBy)

**Indeksy:**
- (sku) - wydajność wyszukiwania
- (category_id) - wydajność filtrowania
- (created_at) - sortowanie

---

## Model: `UserActivityLog`

Logi aktywności użytkowników.

**Kolumny:**
- `id` - UUID, klucz główny, generowany automatycznie
- `user_id` - UUID, foreign key do User, nullable
- `action` - string(50), wymagany (typ akcji)
- `resource_type` - string(50), nullable (typ zasobu)
- `resource_id` - UUID, nullable (ID zasobu)
- `ip_address` - string, nullable (adres IP)
- `user_agent` - text, nullable
- `details` - JSON object, nullable (dodatkowe szczegóły)
- `created_at` - timestamp, automatyczny

**Przykładowe akcje:**
- LOGIN, LOGOUT
- CREATE_SALES_REPORT, UPDATE_SALES_REPORT
- CREATE_PURCHASE_REPORT, UPDATE_PURCHASE_REPORT
- UPLOAD_FILE, DOWNLOAD_FILE
- EXPORT_DATA

**Relacje:**
- Many-to-One z `User` (user)

**Indeksy:**
- (user_id, created_at) - zapytania per użytkownik
- (action, created_at) - zapytania per akcja
- (created_at) - sortowanie chronologiczne

---

## Model: `CurrencyRate`

Kursy walut do przeliczania na EUR.

**Kolumny:**
- `id` - UUID, klucz główny, generowany automatycznie
- `currency_code` - string(3), wymagany (kod ISO waluty)
- `rate_date` - date, wymagany (data kursu)
- `rate_to_eur` - decimal(10,4), wymagany (kurs do EUR)
- `source` - string(50), domyślnie 'NBP' (źródło kursu)
- `created_at` - timestamp, automatyczny

**Ograniczenia:**
- Unikalny klucz kompozytowy: (currency_code, rate_date)

**Indeksy:**
- (currency_code, rate_date DESC) - wydajność pobierania najnowszego kursu

---

## Model: `ExportManagerSubstitution`

System zastępstw dla Export Managerów.

**Kolumny:**
- `id` - UUID, klucz główny, generowany automatycznie
- `export_manager_id` - UUID, foreign key do User, wymagany
- `substitute_id` - UUID, foreign key do User, wymagany
- `start_date` - date, wymagany
- `end_date` - date, wymagany
- `is_active` - boolean, domyślnie true
- `created_by` - UUID, foreign key do User, nullable
- `created_at` - timestamp, automatyczny

**Ograniczenia:**
- Walidacja: start_date <= end_date
- Walidacja: export_manager_id != substitute_id

**Relacje:**
- Many-to-One z `User` (exportManager)
- Many-to-One z `User` (substitute)
- Many-to-One z `User` (createdBy)

**Indeksy:**
- (export_manager_id, start_date, end_date) - wydajność sprawdzania zastępstw

---

## Relacje między modelami

### Hierarchia ról i dostępu:
```
SUPER_ADMIN
    ↓ może zarządzać
ADMIN
    ↓ może zarządzać  
EXPORT_MANAGER
    ↓ ma przypisanych
DISTRIBUTOR/EMPLOYEE
```

### Kluczowe związki:

**1. User ↔ Distributor (Many-to-Many)**
- Przez model `UserDistributorAssignment`
- Użytkownik może być przypisany do wielu dystrybutorów
- Dystrybutor może mieć wielu użytkowników

**2. Export Manager → Distributors (One-to-Many)**
- `Distributor.export_manager_id` → `User.id`
- Jeden Export Manager może mieć wielu dystrybutorów
- Dystrybutor ma jednego Export Managera

**3. Distributor → Reports (One-to-Many)**
- `SalesChannelsReport.distributor_id` → `Distributor.id`
- `PurchaseReport.distributor_id` → `Distributor.id`
- Dystrybutor ma wiele raportów (po jednym na kwartał)

**4. User → Activity Logs (One-to-Many)**
- `UserActivityLog.user_id` → `User.id`
- Użytkownik ma wiele logów aktywności

**5. Media Relations**
- `MediaFile.category_id` → `MediaCategory.id`
- `MediaFile.uploaded_by` → `User.id`

### Reguły integralności danych:

**Kaskadowe operacje:**
- Usunięcie użytkownika → usunięcie jego przypisań (`UserDistributorAssignment`)
- Usunięcie dystrybutora → usunięcie przypisań

**Ograniczenia biznesowe:**
- Raport sprzedażowy: jeden na dystrybutor/rok/kwartał
- Raport zakupowy: jeden na dystrybutor/rok/kwartał
- Kursy walut: jeden kurs na walutę/datę
- Zastępstwa: data_od <= data_do, różne osoby

**Walidacje:**
- Quarter: wartości 1-4
- Email: unikalny w systemie
- Currency codes: format ISO (3 znaki)
- Country codes: format ISO (2 znaki)

---

## Dane inicjalne i seedowanie

### Wymagane dane startowe:

**1. Super Administrator**
```
email: admin@company.com
role: SUPER_ADMIN
must_change_password: false
is_active: true
```

**2. Kategorie mediów**
```
PRODUCTS:
  name: "Products"
  path: "products"
  description: "Product files organized by SKU"

MARKETING:
  name: "Marketing" 
  path: "marketing"
  description: "Marketing materials organized by date"
```

**3. Podstawowe kursy walut**
- EUR/EUR = 1.0000 (stały kurs bazowy)
- Inne waluty pobierane z API NBP

### Struktura katalogów plików:

```
uploads/
├── products/
│   ├── SKU001/
│   │   ├── SKU001_main_1.jpg
│   │   ├── SKU001_detail_1.jpg
│   │   └── SKU001_manual.pdf
│   └── SKU002/
│       └── SKU002_main_1.jpg
└── marketing/
    ├── 2025_01/
    │   └── winter_campaign_SKU001_SKU002.jpg
    └── 2025_02/
        └── spring_sale_2025.pdf
```

### Konwencje nazewnictwa plików:

**Produkty:** `{SKU}_{function}_{number}.{ext}`
- Przykład: `SKU123_main_1.jpg`, `SKU123_manual.pdf`

**Kampanie:** `{campaign_name}_{SKU1}_{SKU2}.{ext}`
- Przykład: `spring_sale_SKU123_SKU222.jpg`

**Dokumenty:** `{SKU}_{document_type}.{ext}`
- Przykład: `SKU123_ingredients.pdf`

### Przykład danych testowych:

**Dystrybutor:**
```
company_name: "Test Distributor Sp. z o.o."
country: "PL"
currency: "PLN"
```

**Użytkownik dystrybutora:**
```
email: "distributor@test.com"
role: "DISTRIBUTOR"
first_name: "Jan"
last_name: "Kowalski"
```

**Export Manager:**
```
email: "manager@company.com"
role: "EXPORT_MANAGER"
first_name: "Anna"
last_name: "Nowak"
```