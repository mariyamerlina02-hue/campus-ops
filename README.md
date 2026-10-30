# CampusOps 2.0 • University Operations Operating System

A next-generation enterprise campus management and life-safety platform built with Next.js 14, TypeScript, Tailwind CSS, Lucide icons, Recharts, and Firebase.

---

## 🌟 Modules Included

### 1. 📢 Campus Pulse (Grievance SLA & Resolution)
- **Path:** `/dashboard/grievances` & `/dashboard/grievances/new`
- Anonymous or authenticated grievance filing with category routing:
  - Infrastructure, Academic, Hostel & Residential, Cafeteria, Security, Finance, Anti-Harassment.
- Upvoting system with community interest ranking.
- SLA escalation tracking (Submitted → Under Review → In Progress → Resolved).
- Staff & faculty assignment with resolution notes and case timeline comments.

### 2. 🏛️ Campus Nexus (Smart Space & Lab Scheduling)
- **Path:** `/dashboard/resources`
- Conflict-free reservation system for:
  - Alan Turing Grand Auditorium (350 seats)
  - Advanced AI & Robotics Vision Lab (NVIDIA RTX 4090 rigs)
  - Executive Boardroom Alpha (Polycom telepresence)
  - Indoor Badminton Arena
  - Digital Fabrication & 3D Prototyping Studio
- Approver workflow for faculty and facility staff.

### 3. 🛠️ Facilities & Maintenance (Work Orders)
- **Path:** `/dashboard/maintenance`
- Preventative maintenance dispatch:
  - Plumbing, Electrical, HVAC, Access Readers, Civil/Furniture.
- Priority levels: Low, Medium, Urgent.
- Technician assignment and completion sign-off.

### 4. 🚨 Campus Sentinel (Emergency & Safety Command)
- **Path:** `/dashboard/incidents` & `/dashboard/incidents/report`
- **1-Click High-Priority SOS Panic Beacon** with live coordinates broadcast to campus security and emergency medical units.
- Incident logging (theft, physical hazard, trespassing, medical emergency).
- Security guard dispatch status: Open → Dispatched → Investigating → Resolved.

### 5. 🗺️ Campus 2D Spatial Map
- **Path:** `/dashboard/map`
- Visual blueprint with compass bearing and spatial coordinates.
- Interactive facility nodes and live alert radar pins (distress beacons, active grievances, maintenance).

### 6. 📊 Operations & Compliance Analytics
- **Path:** `/dashboard/analytics`
- Recharts visualizations:
  - Reported vs Resolved issues by Department.
  - Mean turnaround hours vs SLA limit trend.
  - Facility booking density & utilization.
  - Security incident severity breakdown.
- One-click Audit Report PDF generation.

### 7. 📣 Announcements & Notifications
- **Path:** `/dashboard/announcements` & `/dashboard/notifications`
- Target-role broadcast filtering (Student, Faculty, Staff, Security, Admin).
- Real-time in-app notification center.

### 8. 🎭 Multi-Role RBAC Simulator
- **Path:** `/dashboard/settings`
- 1-click live perspective switcher between 5 distinct personas:
  - **Student:** Alex Rivers (`STU-2024-8841`)
  - **Faculty Member:** Dr. Marcus Chen (`FAC-ENG-104`)
  - **Facilities Staff:** Sarah Miller (`STAFF-OPS-330`)
  - **Campus Security Officer:** Officer Davis Jackson (`SEC-UNIT-07`)
  - **Campus Administrator / Dean:** Dean Eleanor Harrison (`ADM-EXEC-01`)

---

## ☁️ Firebase Configuration

Configured in `.env.local`:
- **Project ID:** `orvian-89563`
- **Auth Domain:** `orvian-89563.firebaseapp.com`
- **Storage Bucket:** `orvian-89563.firebasestorage.app`

Includes built-in resilience: automatically synchronizes with Firebase Authentication and Firestore when credentials are valid, while providing instant local storage persistence for seamless offline and demo operations.

---

## 🚀 Getting Started

```bash
# Navigate to project
cd C:\Users\mariy\.gemini\antigravity\scratch\campusops

# Start development server
npm run dev
# or
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
"# campus-ops" 
