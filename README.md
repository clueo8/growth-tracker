# Children's Growth Tracker

A modern web application to track children's physical growth, standard metrics (height, weight), and tailor's tape body measurements over time.

## Features

- **Multi-Child Tracking**: Easily toggle between children, each with custom color themes and automatic age calculations.
- **Tailor's Tape Measurements**:
  - Head Circumference, Neck, Chest / Bust
  - Left & Right Biceps / Arms
  - Left & Right Forearms
  - Wingspan / Arm Span
  - Waist & Hips
  - Left & Right Thighs
  - Left & Right Calves
  - Inseam / Leg Length
  - Foot Length
- **Custom Metrics**: Create any custom measurement anytime (e.g. wrist, hand span, shoulder width).
- **"Tape Day" Batch Entry**: Fast, single-page measurement session logging that shows previous values and dates directly beneath every field.
- **Interactive Visualizations (Chart.js)**:
  - Progression timeline with age annotations at each measurement date.
  - Sibling Comparison curve normalized by age in months.
  - Real-time growth deltas (+1.5 in since last session).
- **Data Export & Restore**: One-click JSON backup and import.
- **Persistent SQLite Storage**: Zero native compilation, WAL mode for concurrent speed, stored in `./data/growth.db`.

## Quick Start (Docker)

The app is deployed in `~/docker/growth-tracker`:

```bash
cd ~/docker/growth-tracker
docker compose up -d
```

The web dashboard is available at:
`http://localhost:3085` or `http://<server-ip>:3085`

## Configuration

Port and timezone can be modified in `.env`:
```env
HOST_PORT=3085
TZ=America/New_York
```

## Running Standalone with Node

If running outside Docker:
```bash
npm install
npm start
```
Default port is `3000` (or `PORT=3085 npm start`).
