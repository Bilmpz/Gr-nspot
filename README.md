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

## Arkitektur

```
GrønSpot/
├── api/                                # Vercel Serverless Functions (Node.js/TypeScript)
│   ├── _lib/
│   │   └── power.ts                   # Fælles logik: fetch, beregninger, typer
│   └── power/
│       ├── today.ts                   # GET /api/power/today
│       ├── tomorrow.ts                # GET /api/power/tomorrow
│       ├── cheapest.ts                # GET /api/power/cheapest
│       ├── best-window.ts             # GET /api/power/best-window
│       └── summary.ts                 # GET /api/power/summary
│
├── frontend/                          # React 19 + Vite + Tailwind
│   └── src/
│       ├── api/
│       │   └── api.ts                 # Alle fetch-funktioner + hjælpere (toKr, formatHour)
│       ├── components/
│       │   ├── Navbar.tsx             # Topbar med logo og aktivt prisområde
│       │   ├── AreaSelector.tsx       # Skift mellem Vest/Øst
│       │   ├── PriceBarChart.tsx      # Søjlediagram via Recharts
│       │   ├── MetricCard.tsx         # Statistik-kort med farvet venstre-kant
│       │   └── LoadingSkeleton.tsx    # Shimmer-loading
│       └── pages/
│           ├── TodayPage.tsx          # Dagens timepriser
│           ├── TomorrowPage.tsx       # Morgendagens priser (404 hvis ikke udgivet endnu)
│           ├── CheapestPage.tsx       # N billigste timer med slider
│           ├── BestWindowPage.tsx     # Bedste sammenhængende vindue med slider
│           └── SummaryPage.tsx        # Dagsoversigt med nøgletal
│
├── vercel.json                        # Vercel-konfiguration (build + routing)
└── package.json                       # Root-pakke (Vercel Node types)
```

---

## Datakilde

Priserne kommer fra [Energi Data Service](https://www.energidataservice.dk/) — det officielle, gratis og åbne API fra Energinet. Datasættet hedder **DayAheadPrices** (afløser for det udgåede Elspotprices-datasæt pr. 30. september 2025).

Priserne er i DKK/MWh og omregnes til kr/kWh i API-laget. De afspejler spotprisen ekskl. tariffer, afgifter og moms.

---

## Caching

| Data                | Nøgle                    | Server (Vercel CDN) | Frontend (TanStack Query) |
|---------------------|--------------------------|---------------------|---------------------------|
| Dagens priser       | `prices_{area}_{dato}`   | 30 minutter         | 5 minutter                |
| Morgendagens priser | `prices_{area}_{dato}`   | 60 minutter         | 5 minutter                |

---


```
