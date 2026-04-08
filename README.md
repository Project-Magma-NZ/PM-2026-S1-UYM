
## Getting Started

```
cd dashboard
npm install
npm run dev
```

App runs at http://localhost:3000

---

## File Structure

```
src/
├── App.tsx                        Entry point. Handles switching between login, monthly, and yearly views.
├── types.ts                       All shared TypeScript types used across the app.
│
├── data/
│   └── mockData.ts                All data in the app lives here. Replace this when connecting real data.
│
├── pages/
│   ├── LoginPage.tsx              Login screen.
│   ├── MonthlyStats.tsx           Monthly view. Composes monthly components together.
│   └── YearlyStats.tsx            Yearly view. Composes yearly components together.
│
├── components/
│   ├── Sidebar.tsx                Navigation sidebar with Monthly/Yearly links and logout.
│   ├── StatsCard.tsx              Reusable card used in the monthly summary row.
│   │
│   ├── monthly/
│   │   ├── MonthlySummary.tsx     Row of 4 stat cards at the top of the monthly view.
│   │   ├── AgeDemographicsChart.tsx   Bar chart comparing Meta vs Google age groups.
│   │   ├── GenderDistributionChart.tsx   Pie chart showing gender breakdown.
│   │   └── GlobalAudienceReach.tsx   Country reach bars + world map.
│   │
│   └── yearly/
│       ├── YearlySummary.tsx      3 summary cards at the top of the yearly view.
│       ├── GrowthTrajectoryChart.tsx  Area chart showing 2023 actual vs 2022 baseline.
│       ├── RegionalDistribution.tsx   NZ map + region breakdown bars.
│       ├── AgeDistributionGrid.tsx    Age bracket cards (Age 5, 11-14, 15+).
│       └── GenderRepresentation.tsx   Male/female/other bar breakdown.
```

---

## Replacing Mock Data

All mock data is in one file: `src/data/mockData.ts`

Each export has a comment above it explaining where the real data should come from and what shape it expects. When you have a real API or data source, replace the array or object in that file.

The components themselves do not contain any data. They only import from `mockData.ts`, so you will not need to touch the component files when swapping in real data.

---

## Tech Stack

- React 19 with TypeScript
- Vite (dev server and build tool)
- Tailwind CSS v4
- Recharts (bar, area, pie charts)
- react-simple-maps (NZ and world maps)
- Motion (animations)

---

## Notes

- The NZ map currently shows the country outline only. For suburb or regional boundary detail, a NZ regional GeoJSON file from Stats NZ will need to be added.
