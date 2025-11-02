# 🛡️ SafePath: Personal Safety Web Application

**SafePath** is a **single-file**, **mobile-first** web application designed as a personal safety tool. It leverages **Firebase** for real-time data and the **Gemini API** for intelligent, context-aware features.

---

## 🚀 Project Overview

The core purpose of SafePath is to provide users with a **quick and reliable way to alert trusted contacts in an emergency** and make **safer travel decisions**.

The entire application is contained within a **single `index.html` file**, making it highly **portable**, **lightweight**, and **easy to deploy**.

---

## ✨ Key Features

### 🔴 Instant SOS
- A large, prominent SOS button for immediate alerts.  
- **Single-Tap:** Sends a pre-written, user-defined message with the user’s **current GPS location**.  
- **Double-Tap:** Uses the **Gemini AI API** to generate a **context-aware emergency message** before sending it with the location.  

### 👥 Emergency Contacts Manager
- Add and manage a list of **trusted contacts**.  
- Contacts are added using their **unique userId** (from Firebase Authentication), ensuring alerts reach the correct person.  

### ⚡ Live SOS Alerts
- Real-time alerts powered by Firestore’s **onSnapshot listener**.  
- If a contact triggers an SOS, a **live alert banner** instantly appears on the recipient’s app — regardless of their current activity.  

### 🧭 Smart Safe Routing
- Input “Start” and “End” locations to get a **safe route description**.  
- Gemini API prioritizes **well-lit**, **crowded**, and **low-risk** areas.  
- Includes a **simulated map** and a **privacy toggle** for continuous location tracking.  

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | HTML5, Tailwind CSS (via CDN) |
| **Backend & Database** | Firebase |
| **Authentication** | Firebase Authentication (custom token / anonymous) |
| **Realtime Database** | Firestore (for contacts and alerts) |
| **AI** | Google Gemini `gemini-2.5-flash-preview-09-2025` |
| **Core Logic** | Vanilla JavaScript (ES6 Modules) |

---

## ⚙️ How It Works

### 🔐 Authentication
- On load, Firebase authenticates the user and assigns a **unique `userId`**.
- This ID appears on the dashboard and is used to **add friends as contacts**.

### 📇 Adding Contacts
- Users add a contact by entering their friend’s `userId`.  
- Data is stored in the user’s private Firestore collection.

### 🚨 Sending an SOS
1. User taps the SOS button.  
2. The app fetches their **GPS location**.  
3. Retrieves the **contact list** from Firestore.  
4. For each contact, a new alert document is written to the public collection:  
