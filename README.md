# ⚖️ Women's Rights Compass
Women's Rights Compass is a high-impact mobile and web application designed to empower women with legal literacy. It provides direct access to legal advocates, an AI-driven legal assistant, and critical emergency support tools.

# 🚀 Key Features

📚 Knowledge Hub: A curated library of categorized articles on women's rights and legal procedures.
🤖 AI Legal Assistant: An interactive, LLM-powered chat for immediate legal information and guidance.
🔍 Advocate Directory: A verified network of legal professionals available for connection.
💬 Secure Messaging: Direct, private communication channels with legal advocates.
🚨 Emergency Support: Instant access to emergency contacts and localized resources.

# 🛠️ Tech Stack & Structure
The project is architected as a full-stack monorepo:

Backend: FastAPI + MongoDB
Frontend: Expo (React Native) for Cross-platform Mobile & Web.
AI: Integration with Large Language Models (LLMs) via custom API services.

# ⚙️ Getting Started
Prerequisites

Python: 3.10+
Node.js: 18+

MongoDB: Local instance or MongoDB Atlas

# Setting up Project

## 1. Backend Setup
Bash

### - Navigate to the backend directory
cd app/backend

### - Create and activate a virtual environment
python -m venv .venv
### - Windows:
.venv\Scripts\activate
### - macOS/Linux:
source .venv/bin/activate

### - Install dependencies
pip install -r requirements.txt
Configure Environment Variables:
Create a .env file in app/backend/:

### - Code snippet

MONGO_URL=mongodb://localhost:27017
DB_NAME=women_rights_compass
EMERGENT_LLM_KEY=your_llm_key_here
SECRET_KEY=your_secret_key_here
Run the Server:

### - Bash

fastapi dev server.py
API will be live at http://localhost:8000

## 2. Frontend Setup
Bash

### - Navigate to the frontend directory
cd app/frontend

### - Install dependencies
yarn install
Configure Environment Variables:
Create a .env file in app/frontend/:

### - Code snippet

EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
Start Development:

### - Bash

### - For Web
yarn web

### - For Mobile (Expo Go)
yarn start

# 📖 Development Insights
## Authentication & API
Security: Uses JWT-based authentication. Users can register as either user or advocate.

## API Service
The frontend uses a custom fetch-based service in api.ts that handles AsyncStorage authorization and global error catching.

## AI & Data
LLM Integration: Ensure your EMERGENT_LLM_KEY is active to enable the Legal Assistant.

Database: MongoDB handles all persistent data. Use MongoDB Compass for local visualization on port 27017.

# 🤝 Contribution & Credits
This project was brought to life by:

## 1. 🎀 Vaishnavi Shahane
The Initiator, Core Idea, and Lead Executor.
## 2. 🕶 Shyam Vyawahare
Technical Architect and Code In-charge for this version.

# 🕹 How to Contribute
Fork the repository.

Create your Feature Branch (git checkout -b feature/AmazingFeature).
Commit your changes (git commit -m 'Add AmazingFeature').
Push to the branch (git push origin feature/AmazingFeature).
Open a Pull Request.
