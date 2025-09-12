# Architektura systemu

## Przegląd architektury

System będzie zbudowany w architekturze 3-warstwowej z wyraźnym podziałem odpowiedzialności:

```
[Frontend (React)] ↔ [Backend API (Nest.js)] ↔ [Database (PostgreSQL)]
                                    ↓
                            [File Storage (Local)]
```

## Warstwy systemu

### 1. Frontend (React)

**Odpowiedzialności:**

- Interfejs użytkownika (dashboardy, formularze, repozytorium plików)
- Autoryzacja i zarządzanie sesją użytkownika
- Walidacja danych po stronie klienta
- Komunikacja z backend API

**Komponenty główne:**

- `AuthModule` - logowanie, zarządzanie tokenami JWT
- `DashboardModule` - główny dashboard użytkownika
- `SalesChannelsModule` - formularze i widoki sprzedaży
- `PurchaseReportModule` - raporty zakupowe i dashboardy
- `MediaModule` - przeglądarka plików
- `AdminModule` - panel administracyjny

**Technologie:**

- React 18+ z hooks
- React Router - routing
- Axios - komunikacja HTTP
- Material-UI lub podobna biblioteka UI
- Chart.js - wykresy w dashboardach

### 2. Backend (Nest.js)

**Odpowiedzialności:**

- API REST dla wszystkich operacji
- Logika biznesowa i walidacja
- Autentykacja i autoryzacja (JWT + RBAC)
- Operacje na bazie danych
- Generowanie raportów i eksportów
- Zarządzanie plikami

**Moduły aplikacji:**

- `AuthModule` - autentykacja, autoryzacja
- `UsersModule` - zarządzanie użytkownikami
- `DistributorsModule` - zarządzanie dystrybutorami
- `SalesChannelsModule` - raporty sprzedażowe
- `PurchaseReportsModule` - raporty zakupowe
- `MediaModule` - zarządzanie plikami
- `AdminModule` - funkcje administracyjne
- `ExportsModule` - eksport danych do CSV
- `CurrencyModule` - kursy walut (integracja z NBP API)

**Middleware i Guards:**

- `AuthGuard` - weryfikacja JWT
- `RolesGuard` - kontrola dostępu na podstawie ról
- `LoggingInterceptor` - logowanie aktywności

### 3. Baza danych (PostgreSQL)

**Główne tabele:**

- `users` - użytkownicy systemu
- `distributors` - dystrybutorzy
- `user_distributor_assignments` - przypisania użytkowników
- `sales_channels_reports` - raporty sprzedażowe
- `purchase_reports` - raporty zakupowe
- `media_files` - metadane plików
- `media_categories` - kategorie plików
- `user_activity_logs` - logi aktywności
- `currency_rates` - kursy walut
- `export_manager_substitutions` - zastępstwa

**Optymalizacje:**

- Indeksy na często wyszukiwanych kolumnach
- Ograniczenia integralności danych
- Partycjonowanie tabel logów (jeśli potrzebne)

### 4. Przechowywanie plików

**Struktura katalogów:**

```
uploads/
├── products/
│ └── SKU123/
│ ├── SKU123_main_1.jpg
│ └── SKU123_manual.pdf
└── marketing/
└── 2025_03/
└── spring_campaign.jpg
```

**Funkcjonalności:**

- Upload plików z walidacją typu i rozmiaru
- Generowanie unikalnych nazw plików
- Metadane przechowywane w bazie danych
- Bezpieczny dostęp przez API (autoryzacja)

## Przepływ danych

### 1. Autoryzacja

```
User → Frontend → Backend (Auth API) → Database → JWT Token → Frontend
```

### 2. Operacje CRUD

```
User → Frontend → Backend (API + Guards) → Database → Response → Frontend
```

### 3. Upload plików

```
User → Frontend → Backend (Media API) → File Storage + Database → Response
```

### 4. Eksport danych

```
Admin → Frontend → Backend (Export API) → Database → CSV File → Download
```

## Bezpieczeństwo

### Warstwa komunikacji

- HTTPS dla wszystkich połączeń
- CORS skonfigurowane dla frontend domain
- Rate limiting na API endpoints

### Autoryzacja i autentykacja

- JWT tokeny z rozumnym czasem wygaśnięcia
- Refresh tokeny dla długotrwałych sesji
- Role-based access control (RBAC)
- Hierarchiczny system uprawnień

### Ochrona danych

- Hashowanie haseł (bcrypt)
- Walidacja i sanityzacja wszystkich inputów
- Parametryzowane zapytania SQL (TypeORM)
- Logowanie operacji wrażliwych

## Monitoring i logi

### Logowanie aktywności

- Wszystkie operacje użytkowników
- Próby logowania (udane i nieudane)
- Operacje CRUD na danych
- Błędy aplikacji

## Skalowalność

### Obecne wymagania

- ~80 użytkowników
- 1-2 jednoczesnych użytkowników
- Niewielka ilość danych

### Przyszła rozbudowa

- Horizontal scaling backend (load balancer)
- Database read replicas
- CDN dla plików statycznych
- Caching layer (Redis)

## Deployment

### Środowiska

- **Development** - lokalne środowisko programistów
- **Staging** - środowisko testowe
- **Production** - środowisko produkcyjne

### Infrastruktura (sugerowana)

- **Backend**: Node.js server (PM2 process manager)
- **Database**: PostgreSQL server
- **Frontend**: Static files (nginx)
- **Files**: Local file system (początkowo)

### CI/CD Pipeline

- Automatyczne testy jednostkowe i integracyjne
- Automatyczny deployment na staging
- Manualny deployment na production
- Database migrations
