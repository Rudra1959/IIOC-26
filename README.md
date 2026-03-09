# 🌍 AirSentinel OS (iioc-26)

> **Your City's Digital Twin** — A 3D environmental intelligence platform mapping pollution, heat islands, and air quality at 500-meter resolution using an H3 hexagonal grid. Built for city-scale intelligence, enabling hyper-local risk assessment and real-time automated action thresholds.

---

## 📖 Table of Contents
1. [Project Overview](#project-overview)
2. [Core Architecture & Tech Stack](#core-architecture--tech-stack)
3. [Key Features & Modules](#key-features--modules)
4. [File & Directory Structure](#file--directory-structure)
5. [Data Models & Schemas](#data-models--schemas)
6. [Detailed Implementation Breakdown](#detailed-implementation-breakdown)
7. [Environment Setup & Installation](#environment-setup--installation)

---

## 🔍 Project Overview
**AirSentinel OS** provides real-time, hyper-local environmental data, visualizing urban challenges like never before. Rather than relying on sparse point-sensor networks, it utilizes H3 grid models to map Urban Heat Islands (UHI), Air Quality (AQI), UV Index, and Pollen Counts at street-level precision.

**Twin Viewing Experiences:**
- **Citizen View:** Grants citizens granular data on their immediate surroundings (±500m radius), protecting them from localized hazards.
- **Gov/Command View:** Provides city officials with an "Automated Action Matrix," live threat attribution (e.g., Vehicle Idling Detection), and triggers threshold actions like traffic diversion or deploying water sprinklers.

---

## 🛠 Core Architecture & Tech Stack

This project is a modern, full-stack application leveraging the bleeding edge of the React ecosystem.

### Frontend
- **Framework:** [TanStack Start](https://tanstack.com/start) configured with React 19 (`@tanstack/react-start`)
- **Routing:** [TanStack Router](https://tanstack.com/router) for precise file-based routing and SSR readiness.
- **Styling:** Tailwind CSS v4 + Tailwind Animate, seamlessly integrated via Vite plugins.
- **Animations:** Framer Motion for buttery-smooth glassmorphism UI transitions.
- **State Management:** `zustand` (`useEnvStore`) for lightning-fast, boilerplate-free global state.

### 3D Geospatial Mapping
- **Base Map:** `maplibre-gl` fetching Dark Matter Carto basemaps.
- **Data Visualization Layer:** `deck.gl` (specifically `H3HexagonLayer` for cellular geospatial data, `PathLayer` for routing, `ScatterplotLayer` for user tracking).
- **H3 Indexing:** Uber's `h3-js` for converting coordinates into hexagonal grid cell IDs.
- **Landing Page Globe:** `cobe` for an ultra-lightweight, high-performance interactive 3D WebGL globe.

### Backend, Auth & Database
- **Authentication:** [Clerk](https://clerk.com/) (`@clerk/clerk-react`) smoothly integrated for User identity management.
- **Real-time Data:** [Convex](https://convex.dev/) for instant database sync and backend functions.
- **Relational DB / GIS:** Prisma configuration prepped for PostgreSQL with the `postgis` extension (vital for polygon and geospatial geometry queries).

---

## 🌟 Key Features & Modules

### 1. Landing Page (`/` route via `index.tsx`)
- Interactive 3D globe configured with glowing emerald markers highlighting heavily monitored global cities.
- Smooth Framer Motion reveal animations on hero texts and feature cards.
- Dark-themed glassmorphic UI overlay with Clerk Auth modals natively hooked into the CTA buttons.

### 2. The Command Dashboard (`/dashboard`)
The dashboard implements a complex Z-indexed layout. A full-screen 3D map sits underneath absolute-positioned floating UI panels.

- **CityMap (`src/components/map/CityMap.tsx`):**
  - Harnesses `@deck.gl/react` to render a fully extruded 3D H3 Hexagon grid layer. 
  - Calculates elevation scale and color dynamically (Green -> Yellow -> Orange -> Red) reflecting the simulated Environmental Risk Score of each 500m cell.
  - Animates smooth `FlyToInterpolator` camera panning directly to the user's acquired geolocation.
  - Uses `ScatterplotLayer` with spring transitions to create an animated pulsing radar effect around the user's active coordinates.

- **GovView (`src/components/dashboard/GovView.tsx`):**
  - The authorities' command panel. 
  - **Automated Action Matrix:** Ingests the highest risk score from the store and outputs actionable intelligence (e.g., outputs `Traffic diversion + Construction halt` for scores > 85, or `Increase street sweeping` for lower scores).
  - **Live Threat Attribution:** Identifies pollution sources (Vehicle idling, Urban Heat Islands, Biomass Combustion) and renders them in a Threat List with dedicated animated indicators.

- **CitizenView (`src/components/dashboard/CitizenView.tsx`):**
  - Personal tracker with four key metrics: Air Quality (AQI), Humidity, UV Index, and Pollen Count.
  - Implements a Deep-Dive Modal managed via `AnimatePresence`. Offers detailed mock historical data trend bar charts and natural language impact analysis (e.g., proximity to City Green Belts).

- **Smart Alerts (`src/components/dashboard/SmartAlerts.tsx`):**
  - A notification dropdown enabling users to bind custom action thresholds via an HTML range slider. 
  - Prepares the logical framework for pushing hyper-local socket events when anomalies enter a personal radius.

### 3. 🎮 Level Up: Playing for the Planet
Moving beyond passive observation, AirSentinel OS transforms environmental action into a gamified mission for community volunteers (**Eco-Warriors**). We elevate the user experience from just "cleaning" to "playing for the planet":

- **Volunteer XP System (Gamified Volunteering):** Creates a powerful incentive loop. Volunteers earn badges (e.g., *Scout*, *Guardian*, *Earth Hero*), build streaks, and gather 'Impact Points' that show exactly how many square meters they've helped clean. A weekly leaderboard sparks friendly competition.
- **The Pulse Check (Feedback Loop):** A seamless, 3-question survey at the end of every task. No fluff—just a quick check to gather on-the-ground data, helping us continuously improve logistics and support for the team.
- **The Green Map (Pristine Discovery):** A GPS-driven 'Green Spot' locator highlighting the 'Nearest Clean Zone'. This gives users a 'North Star' benchmark for what their own neighborhoods could look like, providing a goal to work toward and a pristine place to relax after a shift.

---

## 📂 File & Directory Structure

```text
iioc-26/
├── convex/                   # Convex Backend Services
│   ├── _generated/           # Auto-generated convex typings
│   ├── schema.ts             # Convex definitions (users, todos)
│   ├── users.ts              # API routes handlers for users
│   └── todos.ts              # API routes handlers for todos
├── prisma/                   # Prisma ORM Configurations
│   ├── schema.prisma         # Postgres schema featuring PostGIS extensions
├── src/
│   ├── components/           # UI Components
│   │   ├── dashboard/        # Floating Dashboard UI (CitizenView, GovView, SmartAlerts)
│   │   ├── map/              # DeckGL WebGL mapping implementations (CityMap)
│   │   ├── ui/               # Reusable primitive elements
│   │   ├── Header.tsx & Footer.tsx
│   ├── hooks/                # Custom React Hooks
│   ├── store/                # Zustand State Stores (envStore.ts)
│   ├── routes/               # TanStack Router File-Based Routes
│   │   ├── __root.tsx        # Base Application Layout Wrapper
│   │   ├── index.tsx         # / route (Landing Page)
│   │   ├── dashboard.tsx     # /dashboard route (Main App interface)
│   ├── lib/ & utils/         # Helper functions, type definitions
│   ├── env.ts                # T3 Env rigorous environment variable schema
│   ├── router.tsx            # TanStack Router initialization
│   └── styles.css            # Global Tailwind imports
├── components.json           # Shadcn Configuration
├── tailwind.config.ts        # Tailwind configuration & plugins
├── package.json              # Project Dependencies
└── vite.config.ts            # Vite & Tanstack builder config
```

---

## 🗄 Data Models & Schemas

### Prisma (PostgreSQL + PostGIS)
**Configured to handle complex geospatial relationships:**
- `Todo`: Basic testing model.
- `GridCell`: The core geospatial atomic unit. Represents an Uber H3 Hexagon.
  - `id`: The String H3 Index.
  - `geom`: `geometry(Polygon, 4326)` PostGIS geometry for spatial bounds.
  - `score`: Environmental decay score.
- `EnvironmentalDataLog`: Timeseries logs mapping historical AQI, temperature, wind parameters to a specific `GridCell`.
- `PollutionSource`: Point coordinate instances mapped to a cell with semantic descriptions.

### Convex (Real-time DB)
**Syncing User Data securely via Clerk:**
- `users`: Tracks `clerkId`, `email`, `name`, `avatarUrl`, generating a fast index (`by_clerk_id`) for instantaneous lookup.
- `todos`: Basic realtime state management arrays.

---

## 🔬 Detailed Implementation Breakdown

### 1. State Management (`src/store/envStore.ts`)
The application relies heavily on `zustand` to avoid prop drilling in the complex layered dashboard:
- `userLocation`: Manages the strictly typed `[longitude, latitude]` array.
- `identifiedSources`: Array of objects defining `score`, `attributedSource`, `aqi`, and boolean `isIdlingRisk`.
- `setInsights`: A singular setter that dynamically injects Government mock data into the global UI.

### 2. Geolocation Synchronization (`src/routes/dashboard.tsx`)
On load, the dashboard queries `navigator.geolocation`. 
- **Success:** Triggers bounding box zoom (`FlyToInterpolator`) mapping directly to the user's localized sector.
- **Fail/Deny:** Gracefully defaults coordinates to the San Francisco Bay Area `[-122.4, 37.74]`.
It implements tight conditional rendering to ensure the 3D map is absolutely hidden/loading until Clerk authenticates and confirms the user identity bounds.

### 3. Rendering the WebGL Layers (`src/components/map/CityMap.tsx`)
Generates 300+ continuous hexagon grid cells algorithmically on the client to simulate big-data processing.
- Utilizing Uber's `latLngToCell(lat, lng, 9)`, it clusters points and generates an array of `{id, score}`.
- Instantiates a `H3HexagonLayer` with 3D extrusion enabled (`extruded: true`, `elevationScale: 50`). Material shaders dynamically catch light from an orchestrated `PointLight` and `AmbientLight` setup.

---

## ⚙️ Environment Setup & Installation

### Prerequisites
- Node `v20+` or `Bun`
- A Clerk Account for Auth keys
- A Convex Account for DB sync
- (Optional) PostgreSQL database url if pushing Prisma schema migrations

### 1. Installation

```bash
bun install
```

### 2. Environment Variables
Create a `.env.local` file spanning the required services:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_... # Your Clerk Publishable Key

# Convex Database
CONVEX_DEPLOYMENT=dev:... # Managed via `bunx convex dev`
VITE_CONVEX_URL=https://... # Your Convex Instance URL

# Prisma Database (If actively deployed)
DATABASE_URL="postgresql://user:password@localhost:5432/airsentinel?schema=public"
```

### 3. Running the Stack

To power up the environment you will typically run two terminals:

**Terminal 1 (Convex DB Sync):**
```bash
bunx convex dev
```

**Terminal 2 (Frontend Dev Server):**
```bash
bun --bun run dev
```

### 4. Available Scripts
- `bun run dev`: Starts Vite dev server on port 3000.
- `bun run build`: Prepares the optimized production build.
- `bun run test`: Executes the Vitest test runner.
- `bun run lint` / `format`: Code quality checks via Biome.js.

---
*AirSentinel OS was built to protect. Navigate your city with intelligence.*
