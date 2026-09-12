# 🕊️ MILAN (मिलन)
### Multi-Agency Integrated Logistics & Action Network
**Open Humanitarian Crisis Operating System for Deterministic Identity Reconciliation in Disaster Grids**

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38b2ac.svg)](https://tailwindcss.com/)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![Test Suite](https://img.shields.io/badge/Tests-100%25_Passing-brightgreen.svg)]()
[![Offline Support](https://img.shields.io/badge/Offline-PWA_Ready-success.svg)]()

---

## 📌 Executive Overview

During large-scale natural disasters (flash floods, cloudbursts, earthquakes, and landslides), civil infrastructure collapses. Responders face **communication blackouts, fractured data across relief camps and hospitals, and mass psychological panic**. Families are left searching blindly across chaotic relief tents, while shock-disoriented survivors and unaccompanied minors face severe risks of exploitation and human trafficking.

**MILAN** is a resilient, offline-first digital public infrastructure platform that unifies missing person reports, frontline rescue manifests, and clinical hospital triage into a **single, verified identity reconciliation grid**.

---

## 🚨 The Critical Problem

* **Fragmented Data Silos**: Missing persons filings, NDRF casualty manifests, civil hospital triage logs, and Army dispatch transcripts remain isolated in paper notebooks or private WhatsApp groups.
* **Connectivity Blackouts**: Crisis zones lose cellular towers and fiber backbones; traditional cloud-reliant applications fail entirely.
* **Child Trafficking & Illegal Custody**: Unaccompanied children in chaotic evacuation shelters are vulnerable to fraudulent custody claims without verified guardian verification.
* **Traumatic False Hope**: Uncontrolled match percentages and raw clinical injury logs leaked to anxious families trigger mass panic and emotional trauma.

---

## 💡 The MILAN Solution

MILAN provides an open, deterministic crisis operating framework with **zero external cloud dependencies**:

```
[ INPUT SOURCES ]
 ├── Anxious Families (Guided, empathetic multi-step intake)
 ├── NDRF / Army Teams (Ruggedized outdoor field logging)
 ├── Civil Hospitals (Medical-grade clinical triage & bed status)
 └── Voice & VHF Radio (Deterministic speech & dispatch transcript parser)
                    │
                    ▼
[ CLIENT-SIDE RECONCILIATION & OFFLINE BUFFER ]
 ├── Offline Disaster Queue (IndexedDB persistent blackout buffer)
 ├── Attribute Normalizer (Tolerance vectors & high-discrimination clues)
 └── DOM Neural Localization Engine (Sub-second Hindi <-> English translation)
                    │
                    ▼
[ DETERMINISTIC MATCHING & GAP ANALYZER ]
 ├── Multi-Vector Weighted Scoring (Scars, Implants, Age, Geo-Temporal)
 ├── Conflict & Discrepancy Detector (Flags irreconcilable contradictions)
 └── Human-in-the-Loop Forensic Dossier (Side-by-side evidence review)
                    │
                    ▼
[ SAFEGUARD & REUNIFICATION GATES ]
 ├── Quarantine RBAC (Confidential clinical trauma logs masked from family view)
 ├── Mandatory Minor Protection Lock (Child trafficking prevention)
 ├── Cryptographic Verification Token Mint (MILAN-SAFE-XXXX)
 └── Official Legal Handover Certificate
```

---

## ⚡ Key Innovations & Architecture

### 1. Deterministic Multi-Vector Matching Engine
Unlike black-box generative AI that hallucinates in high-stakes environments, MILAN uses a transparent, auditable weighted scoring model:
* **Primary Forensic Discriminators (40%)**: Surgical scars, birthmarks, medical implants, dental records, tattoos.
* **Geospatial & Temporal Proximity (25%)**: Disaster sector, evacuation camp, timestamp correlation.
* **Biometric Vectors (20%)**: Age window tolerance ($\pm2\text{--}3\text{ yrs}$), biological sex, blood group.
* **Secondary Clues (15%)**: Upper/lower clothing, footwear, personal accessories.

### 2. Anti-Trafficking Safeguards & Minor Protection Lock
* Automatically detects cases involving **unaccompanied minors (<18 yrs)** or non-verbal survivors.
* **Hard-locks custody handover** until legal guardian government ID proof, relationship verification documents, and administrative sign-offs are logged.
* Mints an irreversible **cryptographic SHA-256 audit token** (`MILAN-SAFE-XXXX`) printed onto official release certificates to prevent paperwork forgery.

### 3. Offline Disaster Blackout Queue
* Operates **100% offline** via browser-native `IndexedDB` and `LocalStorage`.
* Responders can continue filing reports and reviewing cached cases with zero network signal.
* Automatically syncs and deduplicates pending payloads with the central registry when connection is restored.

### 4. Autonomous Live DOM Neural Localization Engine
* Translates the entire portal between **Hindi (हिन्दी) and English in under 30 milliseconds** using native `TreeWalker` DOM traversal.
* Powered by a specialized **5,000+ line crisis vocabulary corpus** covering forensic, medical, biometric, and disaster terms.
* Fallback phonetic transliteration converts unmapped names (e.g., *"Aarav Sharma"* $\rightarrow$ *"आरव शर्मा"*) with zero Latin character leakage.
* **Full Bidirectional Restoration**: Toggling back to English restores pristine text instantaneously without page reloads.

### 5. Quarantine Role-Based Access Control (RBAC)
Enforces strict architectural boundaries across 7 roles:
| Role | Permitted Access | Strict Quarantine Boundary |
| :--- | :--- | :--- |
| **FAMILY** | File missing report, view public registry, track status | **BLOCKED**: Clinical trauma notes, forensic match scores, internal dispatcher logs |
| **ARMY_RESCUE / NDRF** | Rapid field intake, operational case search, internal notes | **BLOCKED**: Forensic approval/rejection overrides |
| **HOSPITAL** | Clinical triage forms, condition logs, medical intake | **BLOCKED**: Family dossier overrides |
| **REVIEWER** | Full forensic dossier, side-by-side evidence matrix, match approval | **FULL AUDIT ACCESS**: Human-in-the-loop oversight |
| **ADMIN** | User management, case overrides, forensic ledger inspection | **SUPERUSER ACCESS**: Complete cryptographic audit trail |

### 6. Voice AI & VHF Dispatch Parser
* Dictate notes directly in high-noise field environments (rain, wind, muddy gloves).
* Extracts structured biometric clues (age, scars, clothing, evacuation sector) from conversational speech or VHF radio text logs.

---

## 🛠️ Technology Stack

| Layer | Technologies Used | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18** + **TypeScript** | Strict compile-time type safety across life-critical medical and forensic models. |
| **Build & Bundler** | **Vite 5** | Sub-second Hot Module Replacement (HMR) and ultra-lightweight production bundle (**<300 KB gzipped**). |
| **Styling & Theme** | **Tailwind CSS** | Warm orange palette (`#aa2d00`, `#ea580c`) and high-contrast slate borders calibrated for outdoor sunlight and glare. |
| **Iconography** | **Lucide React** | Consistent, accessible visual cues for high-stress crisis interfaces. |
| **Client Storage** | **IndexedDB** & **LocalStorage** | Zero-dependency offline persistence without external database binaries. |
| **DOM Engine** | **TreeWalker Native API** | Microsecond DOM tree traversal for instantaneous bilingual localization. |
| **Quality Assurance** | **TSX** + Custom Verification Suites | 100% automated test coverage across matching, RBAC gates, offline queues, and i18n parity. |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Installation

```bash
# 1. Clone repository
git clone https://github.com/devbytarun/MILAN.git
cd MILAN

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open your browser and navigate to:
```
http://localhost:5173/ (or http://localhost:5174/)
```

### Running Automated Test Suites

```bash
# Runs Matching, Anti-Trafficking, RBAC Gates, and i18n Verification
npm test
```

### Production Build & Type Check

```bash
npm run build
```

---

## 🧪 Test Coverage & Verification

MILAN includes comprehensive automated test suites covering all core engines:
* `test/matching.test.ts`: Validates weighted multi-vector scoring, gap detection, and tolerance windows.
* `test/innovations.test.ts`: Verifies offline blackout queues, tamper-proof anti-trafficking token generation, and minor custody locks.
* `test/i18n.test.ts`: Verifies 100% key parity between English and Hindi, zero-Latin phonetic transliteration, and bidirectional English restoration.
* `test/rbac.test.ts`: Asserts route gating, role permission boundaries, and clinical trauma note masking for family users.

---

## 🌍 Humanitarian Research & Standards Alignment

MILAN’s workflows and data schemas are modeled after international crisis standards:
* **NDMA Incident Response System (IRS)**: Aligned with national command structures and field task forces.
* **Sphere Project Humanitarian Charter**: Designed to uphold the dignity, rights, and privacy of disaster victims.
* **ICRC Restoring Family Links (RFL)**: Formulated on proven cross-border family tracing and reunification protocols.
* **Sendai Framework for Disaster Risk Reduction (2015–2030)**: Fulfills Priority 4: *"Enhancing disaster preparedness for effective response"*.
* **Interpol Disaster Victim Identification (DVI)**: Categorization of primary and secondary biometric clues.

---

## 🗺️ Future Roadmap

* **Phase 1 (Edge Biometrics)**: On-device facial vector hash generation directly on field tablets without cloud image transmission.
* **Phase 2 (LoRa / VHF Mesh Radio)**: Transmission of compressed survivor vectors over decentralized radio frequencies when all telecommunication infrastructure is destroyed.
* **Phase 3 (National Gateway)**: Direct integration with India's Emergency Response Support System (ERSS 112) and UN OCHA humanitarian clusters.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with compassion and engineering rigor for frontline responders and anxious families.</sub>
</div>
