# GrønSpot

GrønSpot er et dansk elspot-værktøj der viser realtidspriser på strøm time for time. Priserne hentes direkte fra Energi Data Services åbne API og præsenteres i et rent, moderne interface — ingen login, ingen abonnement, bare data.

Formålet er at gøre det nemt at se hvornår strømmen er billig, så man kan planlægge sit forbrug derefter. Oplad bilen, kør opvasken, start vaskemaskinen — på de billigste timer.

---

## Hvad kan det?

- **I dag og i morgen** — timepriser som søjlediagram med farver efter pris (grøn = billig, rød = dyr)
- **Billigste timer** — vælg selv hvor mange timer du vil se, sorteret fra billigst
- **Bedste vindue** — finder det billigste sammenhængende tidsrum (f.eks. 3 timer i træk)
- **Oversigt** — min/max/gennemsnit, billigste og dyreste time, antal timer under gennemsnit
- **Vest / Øst** — skift mellem DK1 (Vestdanmark) og DK2 (Østdanmark)
- Priser vises altid i **kr/kWh**

---

## Kom i gang

Du skal bruge .NET 10 og Node 18+ installeret.

**Start backend:**
```bash
cd backend
dotnet run --project CheapHours.Api
```
API kører på `http://localhost:5249` — Swagger UI på `http://localhost:5249/swagger`

**Start frontend:**
```bash
cd frontend
npm install
npm run dev
```
App kører på `http://localhost:5173`

Frontendens `/api`-kald bliver automatisk proxiet til backend via Vite.

---

## Filstruktur

```
GrønSpot/
├── README.md
│
├── backend/
│   └── CheapHours.Api/
│       ├── Clients/
│       │   ├── IElspotClient.cs        # Interface for dataklient
│       │   └── ElspotClient.cs         # Henter DayAheadPrices fra Energi Data Service
│       ├── Controllers/
│       │   └── PowerController.cs      # API-endpoints: /today /tomorrow /cheapest /best-window /summary
│       ├── Middleware/
│       │   └── GlobalExceptionMiddleware.cs  # Fanger alle fejl og returnerer JSON
│       ├── Models/
│       │   ├── HourlyPrice.cs          # En times pris
│       │   ├── BestWindow.cs           # Billigste sammenhængende blok
│       │   └── PriceSummary.cs         # Daglig statistik
│       ├── Services/
│       │   ├── IPowerService.cs        # Service-interface
│       │   └── PowerService.cs         # Forretningslogik + IMemoryCache (30/60 min)
│       ├── Program.cs                  # DI, Swagger, CORS, middleware-pipeline
│       └── appsettings.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── api.ts                  # Alle fetch-funktioner + hjælpere (toKr, formatHour)
    │   ├── components/
    │   │   ├── Navbar.tsx              # Topbar med logo og aktivt prisområde
    │   │   ├── AreaSelector.tsx        # Skift mellem Vest/Øst
    │   │   ├── PriceBarChart.tsx       # Søjlediagram via Recharts
    │   │   ├── MetricCard.tsx          # Statistik-kort med farvet venstre-kant
    │   │   └── LoadingSkeleton.tsx     # Shimmer-loading
    │   ├── pages/
    │   │   ├── TodayPage.tsx           # Dagens timepriser
    │   │   ├── TomorrowPage.tsx        # Morgendagens priser (404 hvis ikke udgivet endnu)
    │   │   ├── CheapestPage.tsx        # N billigste timer med slider
    │   │   ├── BestWindowPage.tsx      # Bedste sammenhængende vindue med slider
    │   │   └── SummaryPage.tsx         # Dagsoversigt med nøgletal
    │   ├── App.tsx                     # Router, tabs, area-state
    │   └── main.tsx
    ├── vite.config.ts                  # Proxy /api → localhost:5249
    └── package.json
```

---

## Datakilde

Priserne kommer fra [Energi Data Service](https://www.energidataservice.dk/) — det officielle, gratis og åbne API fra Energinet. Datasættet hedder **DayAheadPrices** (afløser for det udgåede Elspotprices-datasæt pr. 30. september 2025).

Priserne er i DKK/MWh og omregnes til kr/kWh i backend. De afspejler spotprisen ekskl. tariffer, afgifter og moms.

---

## Caching

| Data             | Nøgle                    | Varighed   |
|------------------|--------------------------|------------|
| Dagens priser    | `prices_{area}_{dato}`   | 30 minutter |
| Morgendagens priser | `prices_{area}_{dato}` | 60 minutter |

Frontend cacher via TanStack Query med `staleTime: 5 minutter`.
