# 🏙️ Viksit Nagpur — Urban Crisis Management & Predictive Analytics Platform

An intelligent, AI-powered command center and citizen platform designed to monitor, predict, and coordinate responses for urban crises (floods, waterlogging, fire, road hazards, pollution, traffic) across the city of Nagpur.

---

## 🚀 Key Features

- **Interactive Geospatial War Room**: Real-time map displaying Nagpur zone boundaries, critical alert hotspots, live sensors, and emergency units.
- **AI-Driven Predictive Risk Analytics**: Machine learning models calculating risk scores for urban zones based on rainfall, drainage capacity, topography, and historical data.
- **Dynamic Emergency Routing**: Route optimization for rapid first responders avoiding flooded or blocked corridors.
- **Citizen SOS & Incident Reporting**: Geotagged reporting with image upload, automated triage, and live status tracking.
- **Role-Based Admin Hub & Analytics**: Dedicated dashboard for disaster management teams, municipal officials, and zone commanders.

---

## 🏗️ Architecture

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide React, Framer Motion, Leaflet / Mapbox.
- **Backend**: Django & Django REST Framework, SQLite / PostgreSQL (PostGIS ready), Geopy, Shapely.
- **Auth & Realtime**: Supabase Auth & JWT.

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Python 3.10+
- Git

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_nagpur_data
python manage.py runserver
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 License
MIT License. Built for the citizens and administration of Nagpur.
