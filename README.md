# 🛡️ SafeID

**Your Safety, One Scan Away.**

SafeID is a digital emergency identification platform. Each registered person gets a unique SafeID profile and a unique QR code. When the QR is scanned during an emergency, it opens a dedicated emergency page containing only the information needed for emergency assistance.

> The QR code contains **only a secure URL** — never medical data.

---

## ✨ Features

- 🔐 Secure authentication (bcrypt + JWT)
- 🧑‍⚕️ Patient registration with full medical info
- 👨‍👩‍👧 Parent account to monitor children
- 🛠️ Admin dashboard (patients, parents, emergencies, QR)
- 📱 QR code per patient (only contains a secure URL)
- 🚨 Public emergency page — no login required
- 📞 One-tap call emergency contact / services
- 📍 Share location during emergency
- 📊 Emergency scan logs & notifications
- 📲 PWA support (installable as mobile app)
- 🎨 Responsive modern UI (desktop / tablet / mobile)

---

## 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | **Firebase Firestore** |
| Auth | JWT + bcrypt |
| QR | `qrcode` |
| PWA | Service Worker + Manifest |
| Hosting | Vercel / Render / any Node host |

---

## 📁 Project Structure

safeid/
├── server.js
├── package.json
├── vercel.json
├── .env.example
├── .gitignore
├── README.md
│
├── public/
│ ├── index.html
│ ├── sign-up.html
│ ├── login-site.html
│ ├── sign-up-parent.html
│ ├── login-parent.html
│ ├── dashboard-parent.html
│ ├── login-admin.html
│ ├── dashboard-admin.html
│ ├── emergency.html
│ ├── offline.html
│ ├── 404.html
│ ├── manifest.json
│ ├── service-worker.js
│ ├── assets/
│ │ └── safeid-logo.png
│ ├── css/
│ │ ├── base.css
│ │ ├── layout.css
│ │ ├── components.css
│ │ ├── auth.css
│ │ ├── dashboard.css
│ │ ├── parent.css
│ │ ├── admin.css
│ │ ├── emergency.css
│ │ └── responsive.css
│ └── js/
│ ├── config.js
│ ├── api.js
│ ├── auth.js
│ ├── ui.js
│ ├── validation.js
│ ├── qr.js
│ ├── pwa.js
│ ├── sign-up.js
│ ├── login-site.js
│ ├── profile.js
│ ├── sign-up-parent.js
│ ├── login-parent.js
│ ├── dashboard-parent.js
│ ├── login-admin.js
│ ├── dashboard-admin.js
│ └── emergency.js
│
├── server/
│ ├── app.js
│ ├── config/
│ │ ├── db.js
│ │ └── env.js
│ ├── models/
│ │ ├── User.js
│ │ ├── Patient.js
│ │ ├── Parent.js
│ │ ├── Admin.js
│ │ ├── EmergencyProfile.js
│ │ ├── QrToken.js
│ │ ├── EmergencyScan.js
│ │ └── Notification.js
│ ├── routes/
│ │ ├── auth.routes.js
│ │ ├── patient.routes.js
│ │ ├── parent.routes.js
│ │ ├── admin.routes.js
│ │ ├── emergency.routes.js
│ │ └── qr.routes.js
│ ├── controllers/
│ │ ├── auth.controller.js
│ │ ├── patient.controller.js
│ │ ├── parent.controller.js
│ │ ├── admin.controller.js
│ │ ├── emergency.controller.js
│ │ └── qr.controller.js
│ ├── middleware/
│ │ ├── auth.middleware.js
│ │ ├── role.middleware.js
│ │ ├── validate.middleware.js
│ │ ├── error.middleware.js
│ │ └── rateLimit.middleware.js
│ ├── services/
│ │ ├── auth.service.js
│ │ ├── patient.service.js
│ │ ├── parent.service.js
│ │ ├── admin.service.js
│ │ ├── emergency.service.js
│ │ ├── qr.service.js
│ │ └── notification.service.js
│ ├── utils/
│ │ ├── token.js
│ │ ├── hash.js
│ │ ├── safeid.js
│ │ ├── logger.js
│ │ ├── response.js
│ │ └── validators.js
│ └── scripts/
│ └── seed.js

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js** v18+
- **Firebase** project with **Firestore** enabled
- **npm** or **yarn**

### 2. Clone & install

```bash
git clone https://github.com/your-username/safeid.git
cd safeid
npm install