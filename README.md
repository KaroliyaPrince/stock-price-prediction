# 📈 Stock High Price Prediction System

A full-stack Machine Learning application built with **FastAPI** and **React (Vite + Tailwind CSS)** that predicts Indian stock market high prices using multiple ML models (**Linear Regression**, **Polynomial Regression**, and **Support Vector Regression - SVR**).

---

## 📁 Production Folder Structure

```
Stock price prediction/
│
├── backend/                      # 🐍 FastAPI Backend API
│   ├── models/                   # Serialized ML Models (.pkl)
│   │   ├── stock_model.pkl
│   │   ├── stock_poly_model.pkl
│   │   └── stock_SVR_model.pkl
│   ├── data/                     # Scaler & Evaluation Dataset
│   │   └── cleaned_stock_data.csv
│   ├── main.py                   # FastAPI REST Server
│   ├── requirements.txt          # Python dependencies
│   ├── Procfile                  # Render / Railway process runner
│   └── Dockerfile                # Docker container configuration
│
├── frontend/                     # ⚛️ React + Vite Frontend UI
│   ├── public/                   # Static web assets
│   ├── src/                      # Components, Charts & React app logic
│   ├── .env.example              # Environment variables template
│   ├── Dockerfile                # Production Nginx Dockerfile
│   ├── nginx.conf                # Nginx reverse proxy configuration
│   ├── package.json              # Frontend npm dependencies
│   ├── vercel.json               # Vercel deployment configuration
│   └── vite.config.js            # Vite build & local proxy settings
│
├── notebooks/                    # 📓 Data Science & Model Training Notebooks
│   ├── Eda.ipynb                 # Exploratory Data Analysis
│   ├── Pre_Processing.ipynb      # Feature cleaning & transformation
│   ├── PolyRegrestion.ipynb      # Polynomial model development
│   ├── SVR.ipynb                 # Support Vector Regression tuning
│   └── Task-3.ipynb / Task-5.ipynb
│
├── dataset/                      # 📊 Raw NIFTY-50 & Stock Historical CSVs
│   ├── NIFTY50_all.csv
│   ├── stock_metadata.csv
│   └── [Individual Stock CSVs]
│
├── .gitignore                    # Standard git ignore rules
├── docker-compose.yml            # 1-Click Multi-container Docker deployment
├── start_servers.bat             # 🚀 Local development batch runner
└── README.md                     # Project documentation & Deployment Guide
```

---

## 🚀 Quick Start (Local Development)

### Option 1: One-Click Batch Launcher (Windows)
Double-click `start_servers.bat` at the project root to start both backend and frontend servers simultaneously.
- **Frontend App**: `http://127.0.0.1:5173`
- **Backend API**: `http://127.0.0.1:8000`
- **API Interactive Docs**: `http://127.0.0.1:8000/docs`

### Option 2: Manual Start

1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🌐 Live Deployment Guide (Render + Vercel)

For step-by-step instructions on making this project live on free cloud platforms (Render for Backend, Vercel for Frontend), see **[DEPLOYMENT.md](DEPLOYMENT.md)**.
