# Analiza wymagań

## Cele biznesowe
- Pozyskanie dokładnych danych o wynikach sprzedaży od dystrybutorów
- Możliwość porównywania bieżących wyników z danymi historycznymi i budżetami
- Monitorowanie liczby nowych punktów sprzedaży
- Usprawnienie zarządzania relacjami biznesowymi z partnerami
- Centralny dostęp do materiałów marketingowych i produktowych

## Role użytkowników

1. **Pracownik dystrybutora** 
   - Ograniczony dostęp, bez wglądu w dane umowy i szczegółowe wyniki sprzedażowe

2. **Dystrybutor** 
   - Dostęp tylko do własnych danych i formularzy
   - Może wprowadzać dane sprzedażowe i pobierać materiały

3. **Export Manager** 
   - Dostęp do danych przypisanych dystrybutorów
   - Może wprowadzać budżety i cele sprzedażowe
   - Może filtrować i eksportować dane

4. **Administrator** 
   - Pełny dostęp do danych wszystkich dystrybutorów
   - Może eksportować dane wszystkich dystrybutorów

5. **Super-administrator** 
   - Wszystkie uprawnienia administratora
   - Zarządzanie kontami użytkowników
   - Dostęp do logów aktywności

## Moduły systemu

### Logowanie i autoryzacja
- System ról z 5 poziomami dostępu
- Bezpieczeństwo:
  - Wymuszenie zmiany hasła przy pierwszym logowaniu
  - Wymagania dla haseł: min. 8 znaków, 1 znak specjalny, 1 cyfra
  - Blokada konta po 3 nieudanych próbach logowania
  - Hierarchiczny system odblokowywania kont
  - Szyfrowanie HTTPS
  - Rejestracja aktywności użytkowników

### SALES CHANNELS
- Raportowanie kwartalne sprzedaży w podziale na kanały:
  - Professional sales
  - Pharmacy sales
  - E-commerce B2C
  - E-commerce B2B
  - Third party
  - Other
- Funkcjonalności:
  - Automatyczne sumowanie (Total sales)
  - Pole na nowych klientów (New clients)
  - Automatyczne przeliczanie na EUR według kursu NBP
  - Import danych do formularza
  - Raportowanie stanów magazynowych
  - Lista klientów w podziale na kanały
  - Sprzedaż miesięczna per SKU

### PURCHASE REPORT
- Raportowanie danych zakupowych i punktów sprzedaży
- Pola danych:
  - Last Year Sales (dane historyczne)
  - Purchases (wartość zakupów)
  - Budget (ustalony budżet)
  - Actual Sales (pobierane z SALES CHANNELS)
- Automatyczne obliczenia:
  - Porównanie rok do roku
  - Porównanie do budżetu
- Dane o punktach sprzedaży:
  - Total POS
  - New openings
  - New openings target
- Dashboard z wizualizacją danych

### MEDIA
- Repozytorium materiałów marketingowych i produktowych
- Funkcjonalności:
  - Przeglądanie i pobieranie plików
  - Wyszukiwanie po numerze SKU
  - Sortowanie (data, rozmiar, typ)
  - Pobieranie pojedynczych plików lub paczkami
- Struktura katalogów:
  - `/PRODUCTS/` - podkatalogi per SKU
  - `/MARKETING/` - podkatalogi per miesiąc
- Konwencje nazewnictwa:
  - Produkty: `SKU123_function_number.extension`
  - Kampanie: `campaign_name_SKU123_SKU222.extension`
  - Dokumenty: `SKU123_document_type.extension`

### Panel administracyjny
- Przegląd danych wszystkich/przypisanych dystrybutorów
- Filtry według kraju i dystrybutora
- System zastępstw Export Managerów
- Eksport danych do CSV (UTF-8) z predefiniowanymi nazwami kolumn
- Logi aktywności (tylko super-administrator)

## Wymagania techniczne

### Stack technologiczny
- **Frontend**: React
- **Backend**: Nest.js (Node.js + TypeScript)
- **Baza danych**: PostgreSQL
- **ORM**: TypeORM
- **Autoryzacja**: JWT + role-based access control

### Wymagania wydajnościowe
- Obsługa ~80 użytkowników na start
- Typowe obciążenie: 1-2 jednoczesnych użytkowników
- Responsywny design (głównie desktop)

### Kompatybilność
- Przeglądarki: Chrome, Firefox, Safari, Edge (najnowsze wersje)
- HTTPS wymagane dla wszystkich połączeń

## Wymagania bezpieczeństwa
- Szyfrowanie danych w tranzycie (HTTPS) i spoczynku
- Hashowanie haseł
- Mechanizmy blokady kont
- Audyt aktywności użytkowników
- Hierarchiczny system uprawnień