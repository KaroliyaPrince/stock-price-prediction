# 🚀 Stock Price Prediction - Live Deployment Guide (પ્રોજેક્ટ લાઇવ કરવાની માર્ગદર્શિકા)

આ માર્ગદર્શિકા તમને તમારા **FastAPI Backend** ને [Render](https://render.com) પર અને **React Frontend** ને [Vercel](https://vercel.com) પર મફતમાં લાઇવ (Live Deployment) કરવાની સરળ અને સ્ટેપ-બાય-સ્ટેપ રીત આપે છે.

---

## 🛠️ Step 1: Push Code to GitHub (ગિટહબ પર કોડ અપલોડ કરો)

1. તમારા ગિટહબ એકાઉન્ટમાં એક નવુ **Repository** બનાવો (ઉદાહરણ તરીકે: `stock-price-prediction`).
2. પ્રોજેક્ટ ફોલ્ડરમાંથી આ કમાન્ડ્સ ચલાવીને કોડ પુશ કરો:

```bash
git init
git add .
git commit -m "Production ready folder structure and deployment configuration"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/stock-price-prediction.git
git push -u origin main
```

---

## 🐍 Step 2: Deploy Backend on Render (બેકએન્ડ લાઇવ કરો)

FastAPI Backend ને **Render Web Service** પર હોસ્ટ કરવા માટે:

1. [Render.com](https://render.com) પર સાઇન ઇન કરો.
2. **New +** બટન પર ક્લિક કરો અને **Web Service** પસંદ કરો.
3. તમારુ GitHub Repository કનેક્ટ કરો.
4. નીચે મુજબ વિગતો ભરો:
   - **Name**: `stock-price-backend` (અથવા તમારુ મનપસંદ નામ)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Free Instance Type** પસંદ કરો અને **Create Web Service** પર ક્લિક કરો.
6. Deployment પુરુ થતાં તમને એક પબ્લિક URL મળશે, જેમ કે:  
   `https://stock-price-backend.onrender.com`

---

## ⚛️ Step 3: Deploy Frontend on Vercel (ફ્રન્ટએન્ડ લાઇવ કરો)

React (Vite) Frontend ને **Vercel** પર હોસ્ટ કરવા માટે:

1. [Vercel.com](https://vercel.com) પર સાઇન ઇન કરો.
2. **Add New Project** પર ક્લિક કરો અને તમારુ GitHub Repository સિલેક્ટ કરો.
3. **Configure Project** વિભાગમાં:
   - **Root Directory**: `Edit` પર ક્લિક કરો અને `frontend` પસંદ કરો.
   - **Framework Preset**: `Vite` (આપોઆપ સિલેક્ટ થઈ જશે).
4. **Environment Variables** વિભાગ ખોલો અને ઉમેરો:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: Render પરથી મળેલ બેકએન્ડ URL (ઉદાહરણ તરીકે `https://stock-price-backend.onrender.com`)
5. **Deploy** બટન પર ક્લિક કરો.
6. 1 મિનિટમાં તમારી સાઇટ લાઇવ થઈ જશે! તમને લિંક મળશે જેમ કે: `https://stock-price-prediction.vercel.app`

---

## 🐳 Step 4 (Optional): Docker / Docker Compose Deployment

જો તમે પોતાના VPS (DigitalOcean / AWS / Linode) કે લોકલ સિસ્ટમ પર Docker વડે આખો પ્રોજેક્ટ ચલાવવા માગતા હોવ:

```bash
docker-compose up --build -d
```
આનાથી Backend (`http://localhost:8000`) અને Frontend (`http://localhost:5173`) બંને Docker Container તરીકે શરૂ થઈ જશે.

---

## ✅ System Architecture Summary

| Component | Technology | Live Host | URL / Config |
|---|---|---|---|
| **Backend** | FastAPI, Scikit-Learn, Pandas | Render Web Service | `https://stock-price-backend.onrender.com` |
| **Frontend** | React 19, Vite, Tailwind CSS | Vercel / Netlify | `https://stock-price-prediction.vercel.app` |
| **Data & Models** | Joblib, CSV | Bundled in Backend | `backend/models/*.pkl` & `backend/data/*.csv` |
