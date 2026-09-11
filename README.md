# EcoNav

**EcoNav** is a production-grade smart city waste disposal route planner. It helps government officials allocate vehicles, place collection sites on real-world maps, and compute optimal collection routes that minimize cost and time while respecting vehicle capacity constraints.

## Features

- **Interactive map planning** — Place depot and collection sites on OpenStreetMap (web) or native maps (mobile)
- **Capacitated route optimization** — Clarke-Wright Savings Algorithm with 2-opt improvement (CVRP)
- **Multi-criteria optimization** — Minimize distance, time, cost, or balanced objectives
- **Fleet management** — Configure vehicles with capacity (kg) and speed (km/h)
- **Demand-aware scheduling** — Accounts for waste volume at each site in kilograms
- **Route simulation** — Step-by-step timeline of vehicle movements and collections
- **Cross-platform** — Responsive web app (Next.js) and mobile app (Expo/React Native)
- **Fully tested** — Unit tests for core algorithms, simulation, and API

## Architecture

```
EcoNav/
├── packages/core/     # Domain logic: CVRP solver, geo utils, simulation
├── apps/api/          # Fastify REST API
├── apps/web/          # Next.js web dashboard
└── apps/mobile/       # Expo mobile app
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Core | TypeScript, Vitest |
| API | Fastify, Zod validation |
| Web | Next.js 14, React, Leaflet |
| Mobile | Expo 52, React Native Maps |
| Maps | OpenStreetMap tiles |

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
git clone <repository-url>
cd EcoNav
cp .env.example .env
npm install
npm run build --workspace=@econav/core
```

### Run Development Servers

**Terminal 1 — API:**
```bash
npm run dev:api
```

**Terminal 2 — Web:**
```bash
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000)

**Mobile (optional):**
```bash
npm run dev:mobile
```

> For mobile devices/emulators, set `EXPO_PUBLIC_API_URL` to your machine's LAN IP (e.g. `http://192.168.1.10:3001`).

### Run Tests

```bash
npm test
```

## API Reference

### `GET /api/health`

Health check endpoint.

### `POST /api/plan`

Plan optimal waste collection routes.

**Request body:**

```json
{
  "depot": {
    "id": "depot-1",
    "name": "Central Depot",
    "lat": 28.6139,
    "lng": 77.209
  },
  "sites": [
    {
      "id": "site-1",
      "name": "Connaught Place",
      "lat": 28.6315,
      "lng": 77.2167,
      "demandKg": 850
    }
  ],
  "vehicles": [
    {
      "id": "vehicle-1",
      "name": "Truck Alpha",
      "capacityKg": 3000,
      "speedKmh": 35
    }
  ],
  "config": {
    "criterion": "balanced",
    "serviceTimeMinutes": 10,
    "costPerKm": 2.5,
    "costPerHour": 500
  }
}
```

**Response:**

```json
{
  "plan": {
    "routes": [...],
    "unassignedSites": [...],
    "summary": {
      "totalVehiclesUsed": 2,
      "totalSitesAssigned": 5,
      "totalDistanceKm": 45.2,
      "totalDurationMinutes": 120,
      "totalCost": 3500,
      "averageVehicleUtilization": 78.5
    }
  },
  "simulation": {
    "events": [...],
    "totalDurationMinutes": 120,
    "vehicleCount": 2
  }
}
```

## Route Optimization

EcoNav solves the **Capacitated Vehicle Routing Problem (CVRP)**:

1. Build a distance matrix using Haversine great-circle distances
2. Apply Clarke-Wright Savings Algorithm to merge routes efficiently
3. Enforce vehicle capacity constraints (kg)
4. Improve routes with 2-opt local search
5. Calculate time, cost, and utilization metrics

### Optimization Criteria

| Criterion | Description |
|-----------|-------------|
| `distance` | Minimize total travel distance |
| `time` | Minimize total travel time |
| `cost` | Minimize operational cost (distance + labor) |
| `balanced` | Balance distance and cost (default) |

## Environment Variables

Copy `.env.example` to `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `API_PORT` | `3001` | API server port |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Web app API URL |
| `EXPO_PUBLIC_API_URL` | `http://localhost:3001` | Mobile app API URL |
| `DEFAULT_VEHICLE_SPEED_KMH` | `40` | Default vehicle speed |
| `DEFAULT_SERVICE_TIME_MINUTES` | `10` | Collection time per site |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins |

## Project Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:api` | Start API server |
| `npm run dev:web` | Start web app |
| `npm run dev:mobile` | Start Expo mobile app |
| `npm test` | Run all unit tests |
| `npm run build` | Build all packages |

## Deploy to Production

Deploy to **www.econav.in** with a single command:

```bash
# One-time setup
cp .env.deploy.example .env.deploy   # add VERCEL_TOKEN + RAILWAY_TOKEN
npm run setup:deploy

# Every deploy
npm run deploy
```

See [DEPLOY.md](DEPLOY.md) for DNS setup and troubleshooting.

## License

MIT License — see [LICENSE](LICENSE).
