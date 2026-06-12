# ⚖️ Women's Rights Compass
Women's Rights Compass is a high-impact mobile and web application designed to empower women with legal literacy. It provides direct access to legal advocates, an AI-driven legal assistant, and critical emergency support tools.

# 🚀 Key Features

📚 Knowledge Hub: A curated library of categorized articles on women's rights and legal procedures.

🤖 AI Legal Assistant: An interactive, LLM-powered chat for immediate legal information and guidance.

🔍 Advocate Directory: A verified network of legal professionals available for connection.

💬 Secure Messaging: Direct, private communication channels with legal advocates.

🚨 Emergency Support: Instant access to emergency contacts and localized resources.

---

# 🛠️ Tech Stack & Structure
The project is architected as a full-stack monorepo:

Backend: FastAPI + MongoDB
Frontend: Expo (React Native) for Cross-platform Mobile & Web.
AI: Integration with Large Language Models (LLMs) via custom API services.

---

# ⚙️ Getting Started
Prerequisites

Python: 3.10+
Node.js: 18+

MongoDB: Local instance or MongoDB Atlas

---

# 💻 Project Setup Guide

Follow the steps below to run the Women Safety Compass project locally.

---

🔧 Backend Setup

1️⃣ Navigate to the Backend Directory

cd app/backend

2️⃣ Create a Virtual Environment

python -m venv .venv

3️⃣ Activate the Virtual Environment

Windows

.venv\Scripts\activate

macOS / Linux

source .venv/bin/activate

4️⃣ Install Required Dependencies

pip install -r requirements.txt

5️⃣ Configure Environment Variables

Create a file named ".env" inside:

app/backend/

Add the following configuration:

MONGO_URL=mongodb://localhost:27017
DB_NAME=women_rights_compass
EMERGENT_LLM_KEY=your_llm_key_here
SECRET_KEY=your_secret_key_here

6️⃣ Start the Backend Server

fastapi dev server.py

✅ Backend API will be available at:

http://localhost:8000

---

📱 Frontend Setup

1️⃣ Navigate to the Frontend Directory

cd app/frontend

2️⃣ Install Dependencies

yarn install

3️⃣ Configure Environment Variables

Create a file named ".env" inside:

app/frontend/

Add the following configuration:

EXPO_PUBLIC_BACKEND_URL=http://localhost:8000

4️⃣ Start the Application

🌐 Run on Web

yarn web

📲 Run on Mobile (Expo Go)

yarn start

---

🚀 You're Ready!

Once both servers are running:

- ✅ Backend API → "http://localhost:8000"
- ✅ Frontend Web App → Opens automatically in your browser
- ✅ Mobile App → Scan the Expo QR Code using Expo Go

Enjoy exploring Women Safety Compass 🎉

---

# 📖 Development Insights
## Authentication & API
Security: Uses JWT-based authentication. Users can register as either user or advocate.

## API Service
The frontend uses a custom fetch-based service in api.ts that handles AsyncStorage authorization and global error catching.

## AI & Data
LLM Integration: Ensure your EMERGENT_LLM_KEY is active to enable the Legal Assistant.

Database: MongoDB handles all persistent data. Use MongoDB Compass for local visualization on port 27017.

# 🤝 Creation of
This project was brought to life by:

## 🕶 Shyam Vyawahare
Technical Architect, Initiator, Lead Executor and Code In-charge for this version.

# 🕹 How to Contribute
Fork the repository.

- Create your Feature Branch (git checkout -b feature/AmazingFeature).
- Commit your changes (git commit -m 'Add AmazingFeature').
- Push to the branch (git push origin feature/AmazingFeature).
- Open a Pull Request.
