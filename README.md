# Automatic Flood Alert

**Community early-warning system for flood-prone areas in Malawi**  
Multi-channel alerts (SMS + app + hardware sensors + sirens) designed for rural communities along river basins such as the Ruo.

Developed with the **Dzenje CDSS ADDA STEM Club**  
Presented at **Malawi University of Science and Technology (MUST)**

[![Live demo](https://img.shields.io/badge/Live-automatic--flood--alert--app.vercel.app-0A66C2?style=flat-square&logo=vercel)](https://automatic-flood-alert-app.vercel.app)

---

## Problem

Seasonal floods repeatedly affect communities along Malawian river basins. Traditional warnings often arrive too late or fail to reach households that lack reliable infrastructure. Expensive proprietary systems are difficult to maintain locally.

This project delivers a low-cost, multi-channel platform that works with local sensors, SMS, and simple mobile devices.

---

## Key features

1. **Dual detection**
   - Hardware: vibration / motion sensors and river float nodes
   - Acoustic: detection of emergency bells or siren frequencies

2. **Multi-channel alerts**
   - GSM SMS (Chichewa + simple English)
   - Web push (PWA)
   - On-device emergency audio

3. **Community safety tools**
   - Safety network status and headcount
   - Voice SOS for users with limited literacy

4. **Accessible design**
   - High-contrast Material 3 interface
   - Bilingual support (Chichewa / English)
   - Optimised for entry-level smartphones and bright outdoor conditions

---

## Tech stack

| Area | Technology |
|------|------------|
| Frontend | React 18, TypeScript, Tailwind, Vite, Material 3 |
| Offline | PWA service worker, Web Audio, Device Motion APIs |
| Backend | Firebase (Firestore, Auth) |
| SMS | Textbee GSM Android gateway |
| Delivery | Web (SPA/PWA) + Android APK |

---

## Team & context

- **Lead innovator:** Peter Damiano — [portfolio](https://peterdamiano.vercel.app)
- **STEM Club Patron:** Mr. H. Skinner
- **Institutional advisor:** Mr. Palapandu
- **Contributors:** Dzenje CDSS ADDA STEM Club (≈30 student innovators)
- **Focus communities:** Dzenje Village, Ruo River Basin and surrounding flood-prone areas

Built as a practical school-led STEM project for disaster resilience.

---

## Privacy & purpose

- Built strictly for public safety and community early warning
- Contact and location data used only for emergency coordination
- Open innovation intended to improve local preparedness in Malawi

---

## Links

- Live app: [automatic-flood-alert-app.vercel.app](https://automatic-flood-alert-app.vercel.app)
- Developer portfolio: [peterdamiano.vercel.app](https://peterdamiano.vercel.app)
