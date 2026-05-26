# 🔬 DermAI — Skin Disease Detection Dashboard

A full-stack web application for AI-powered skin disease detection using image upload or live webcam capture, combined with a 10-question symptom form for improved accuracy. Built with **React** (frontend) and **Flask** (backend), with offline ML model inference via a single **pickle** file.

---

## 📁 Project Structure

```
skin-disease-detector/
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js / Navbar.css
│   │   │   └── Footer.js / Footer.css
│   │   ├── pages/
│   │   │   ├── Home.js / Home.css
│   │   │   ├── Detect.js / Detect.css   ← 3-step wizard + remedy modal
│   │   │   ├── About.js / About.css
│   │   │   └── Idea.js / Idea.css
│   │   ├── App.js
│   │   └── index.css
│   └── package.json
│
├── backend/
│   ├── app.py                 # Flask server — /api/predict + /api/remedy
│   ├── model_loader.py        # Single model loader + REMEDIES dict
│   ├── requirements.txt
│   └── models/
│       └── skin_disease_model.pkl   ← PUT YOUR MODEL HERE
│
└── README.md
```

---

## 🚀 Running Locally

### 1. Backend

```bash
cd backend

python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
python app.py
```

Backend starts at **http://localhost:5000**

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend opens at **http://localhost:3000**

---

## 🧠 Adding Your Model

### Step 1 — Place the file
```
backend/models/skin_disease_model.pkl
```

### Step 2 — Update `model_loader.py`

```python
MODEL_CONFIG = {
    'model_file': 'skin_disease_model.pkl',

    # Must match training class order exactly
    'labels': [
        'Acne Vulgaris',
        'Chickenpox',
        'Measles',
        'Normal Skin',
        'Psoriasis',
        'Skin Allergy',
    ],

    'image_size': (224, 224),   # (width, height)
}
```

### Step 3 — Adjust preprocessing (if needed)

- **Keras / CNN model** → default works (outputs `(1, H, W, 3)`)
- **Scikit-learn model** → uncomment the flatten line in `preprocess_image()`:
  ```python
  return arr.flatten().reshape(1, -1)
  ```

### Step 4 — Restart backend
```bash
python app.py
# Should print: [INFO] Model loaded successfully
```

---

## 💊 Basic Remedy Feature

After analysis, a **"Basic Remedy"** button appears. Clicking it:
1. Calls `GET /api/remedy/<disease>` on the backend
2. Opens a modal with step-by-step first-aid instructions, what to avoid, and urgency guidance
3. Shows a prominent disclaimer: *"First Aid Only — Not Medical Treatment"*

To add/edit remedies for your disease labels, update the `REMEDIES` dict in `model_loader.py`.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server + model status |
| POST | `/api/predict` | Image + symptoms → prediction |
| GET | `/api/remedy/<disease>` | First-aid remedy for a disease |

`/api/predict` accepts `multipart/form-data`:
- `image` — image file (JPG/PNG/WEBP)
- `symptoms` — JSON string of symptom answers

---

## ☁️ Backend Deployment: Render vs Hugging Face Spaces

### Recommendation: **Render** ✅

| Factor | Render | Hugging Face Spaces |
|--------|--------|---------------------|
| Best for | Flask REST APIs | ML demos (Gradio/Streamlit) |
| Custom REST endpoints | ✅ Full control | ❌ Not designed for this |
| Free tier sleep | Yes (spins down after 15 min) | Yes |
| Pickle model support | ✅ Yes | ✅ Yes |
| CORS / custom headers | ✅ Easy | ⚠️ Limited |
| Deployment method | GitHub push | GitHub push |

**Use Render** — it is purpose-built for deploying Flask/FastAPI backends with full REST API control, which is exactly what this project needs.

---

## 📦 Deploy Backend to Render — Step by Step

### Prerequisites
- GitHub account
- Render account (free) → https://render.com

---

### Step 1 — Add a `Procfile` to `backend/`

Create `backend/Procfile` (no extension):
```
web: gunicorn app:app
```

### Step 2 — Add `gunicorn` to requirements

Add to `backend/requirements.txt`:
```
gunicorn==21.2.0
```

### Step 3 — Push backend to GitHub

You can push the entire project or just the `backend/` folder as its own repo.

```bash
git init
git add .
git commit -m "Initial backend"
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### Step 4 — Create a Web Service on Render

1. Go to https://render.com → **New** → **Web Service**
2. Connect your GitHub repo
3. Set these fields:

| Field | Value |
|-------|-------|
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn app:app` |

4. Click **Create Web Service**

### Step 5 — Upload your model file

Since `.pkl` files are in `.gitignore`, upload via Render Shell:

1. In Render dashboard → your service → **Shell**
2. Run:
```bash
mkdir -p models
# Then use Render's file upload or set a download script
```

**Alternative:** Host your `.pkl` on Google Drive / S3 and add a startup download script in `app.py`:

```python
# At the top of app.py, before load_model():
import urllib.request, os
MODEL_URL = "https://your-host.com/skin_disease_model.pkl"
MODEL_PATH = "models/skin_disease_model.pkl"
if not os.path.exists(MODEL_PATH):
    os.makedirs("models", exist_ok=True)
    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
```

### Step 6 — Set Frontend API URL

Create `frontend/.env`:
```
REACT_APP_API_URL=https://your-render-service.onrender.com
```

Then rebuild the frontend:
```bash
npm run build
```

---

## 🌐 Deploy Frontend to Vercel (Recommended)

```bash
npm install -g vercel
cd frontend
vercel
```

Or connect the GitHub repo to https://vercel.com → auto-deploys on every push.

---

## ⚠️ Medical Disclaimer

DermAI is for **educational and research purposes only**. It is not a substitute for professional medical advice. Always consult a qualified dermatologist.
