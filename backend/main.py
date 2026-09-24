import os
import random
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

app = FastAPI(
    title="Stock High Price Prediction API",
    description="FastAPI Backend for predicting stock High price using Linear, Polynomial & SVR ML models",
    version="2.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# File paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(BASE_DIR)

def get_file_path(filename, folder="models"):
    candidates = [
        os.path.join(BASE_DIR, folder, filename),
        os.path.join(BASE_DIR, filename),
        os.path.join(PARENT_DIR, folder, filename),
        os.path.join(PARENT_DIR, filename)
    ]
    for candidate in candidates:
        if os.path.exists(candidate):
            return candidate
    return candidates[0]

LINEAR_MODEL_PATH = get_file_path("stock_model.pkl", "models")
POLY_MODEL_PATH = get_file_path("stock_poly_model.pkl", "models")
SVR_MODEL_PATH = get_file_path("stock_SVR_model.pkl", "models")
DATA_PATH = get_file_path("cleaned_stock_data.csv", "data")

# Initialize feature transformers
poly_transformer = PolynomialFeatures(degree=2, include_bias=True)
scaler = StandardScaler()

# Load ML Models
linear_model = None
poly_model = None
svr_model = None

try:
    if os.path.exists(LINEAR_MODEL_PATH):
        linear_model = joblib.load(LINEAR_MODEL_PATH)
        print(f"[OK] Loaded Linear Regression Model from {LINEAR_MODEL_PATH}")
except Exception as e:
    print(f"[ERROR] Failed to load Linear Model: {e}")

try:
    if os.path.exists(POLY_MODEL_PATH):
        poly_model = joblib.load(POLY_MODEL_PATH)
        print(f"[OK] Loaded Polynomial Regression Model from {POLY_MODEL_PATH}")
except Exception as e:
    print(f"[ERROR] Failed to load Polynomial Model: {e}")

try:
    if os.path.exists(SVR_MODEL_PATH):
        svr_model = joblib.load(SVR_MODEL_PATH)
        print(f"[OK] Loaded SVR Model from {SVR_MODEL_PATH}")
except Exception as e:
    print(f"[ERROR] Failed to load SVR Model: {e}")

# Load Dataset & Fit Scaler
feature_cols = ['Prev Close', 'Open', 'Low', 'Close', 'VWAP', 'Volume', 'Turnover', 'Deliverable Volume', '%Deliverble']
try:
    df = pd.read_csv(DATA_PATH)
    if df is not None and len(df) > 0:
        scaler.fit(df[feature_cols])
        print(f"[OK] Loaded Stock Data ({len(df)} rows) & Fitted StandardScaler for SVR")
except Exception as e:
    print(f"[ERROR] Failed to load Stock Data or fit Scaler: {e}")
    df = None


class StockPredictRequest(BaseModel):
    prev_close: float = Field(..., description="Previous Close Price", example=1345.35)
    open_price: float = Field(..., description="Open Price", example=1348.0)
    low_price: float = Field(..., description="Low Price", example=1346.0)
    close_price: float = Field(..., description="Close Price", example=1363.85)
    vwap: float = Field(..., description="Volume Weighted Average Price", example=1362.98)
    volume: float = Field(..., description="Trading Volume", example=9055300.0)
    turnover: float = Field(..., description="Turnover value", example=32.34)
    deliverable_volume: float = Field(..., description="Deliverable Volume", example=2687211.0)
    percent_deliverable: float = Field(..., description="% Deliverable", example=29.68)
    model_type: str = Field("linear", description="Model choice: 'linear', 'polynomial', 'svr', or 'all'")


@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Stock High Price Multi-Model Prediction API is running",
        "models_loaded": {
            "linear": linear_model is not None,
            "polynomial": poly_model is not None,
            "svr": svr_model is not None
        },
        "dataset_rows": len(df) if df is not None else 0
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "models_loaded": {
            "linear": linear_model is not None,
            "polynomial": poly_model is not None,
            "svr": svr_model is not None
        },
        "features_count": 9,
        "target": "High"
    }


@app.post("/api/predict")
def predict_stock_high(data: StockPredictRequest):
    if linear_model is None and poly_model is None and svr_model is None:
        raise HTTPException(status_code=500, detail="No ML models are loaded")
    
    try:
        # Smart Dual Support: Auto-detect whether user provided RAW or SCALED/LOG values
        processed_turnover = data.turnover
        if processed_turnover > 6.0:
            processed_turnover = float(np.log1p(processed_turnover))

        raw_pct = data.percent_deliverable
        processed_percent_deliv = float(raw_pct / 100.0) if raw_pct > 1.0 else float(raw_pct)

        # Prepare 2D array (9 features)
        features = np.array([[
            data.prev_close,
            data.open_price,
            data.low_price,
            data.close_price,
            data.vwap,
            data.volume,
            processed_turnover,
            data.deliverable_volume,
            processed_percent_deliv
        ]])

        # 1. Linear Regression Prediction
        linear_pred = float(linear_model.predict(features)[0]) if linear_model is not None else None

        # 2. Polynomial Regression Prediction (55 polynomial features)
        poly_pred = None
        if poly_model is not None:
            features_poly = poly_transformer.fit_transform(features)
            poly_pred = float(poly_model.predict(features_poly)[0])

        # 3. SVR Prediction (requires StandardScaler transform)
        svr_pred = None
        if svr_model is not None:
            features_scaled = scaler.transform(features)
            svr_pred = float(svr_model.predict(features_scaled)[0])

        # Active prediction selection
        active_model = data.model_type.lower()
        if active_model == "polynomial" and poly_pred is not None:
            active_pred = poly_pred
            model_name_display = "Polynomial Regression (Degree 2)"
        elif active_model == "svr" and svr_pred is not None:
            active_pred = svr_pred
            model_name_display = "Support Vector Regression (SVR)"
        else:
            active_pred = linear_pred if linear_pred is not None else (poly_pred or svr_pred)
            model_name_display = "Linear Regression"

        # Calculate metrics relative to inputs
        diff_from_open = round(active_pred - data.open_price, 2)
        pct_from_open = round((diff_from_open / data.open_price) * 100, 2) if data.open_price > 0 else 0.0
        
        diff_from_close = round(active_pred - data.close_price, 2)
        pct_from_close = round((diff_from_close / data.close_price) * 100, 2) if data.close_price > 0 else 0.0

        return {
            "success": True,
            "active_model": active_model,
            "model_name_display": model_name_display,
            "predicted_high": round(active_pred, 2),
            "raw_prediction": active_pred,
            "all_models": {
                "linear": round(linear_pred, 2) if linear_pred is not None else None,
                "polynomial": round(poly_pred, 2) if poly_pred is not None else None,
                "svr": round(svr_pred, 2) if svr_pred is not None else None,
            },
            "metrics": {
                "diff_from_open": diff_from_open,
                "pct_from_open": pct_from_open,
                "diff_from_close": diff_from_close,
                "pct_from_close": pct_from_close,
            },
            "inputs": data.dict(),
            "transformed_inputs": {
                "turnover_model_input": round(processed_turnover, 4),
                "percent_deliverable_model_input": round(processed_percent_deliv, 4),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {str(e)}")


@app.get("/api/model-metrics")
def get_model_evaluation_metrics():
    """Computes exact MSE, RMSE, MAE, R2 Score for Linear, Polynomial & SVR models"""
    if df is None or len(df) == 0:
        raise HTTPException(status_code=500, detail="Dataset not available for evaluation")
    
    try:
        y_actual = df['High']
        X = df[feature_cols]

        metrics = {}

        # 1. Linear Regression Metrics
        if linear_model is not None:
            pred_lin = linear_model.predict(X)
            mse_lin = mean_squared_error(y_actual, pred_lin)
            metrics['linear'] = {
                "model_name": "Linear Regression",
                "mse": round(float(mse_lin), 2),
                "rmse": round(float(np.sqrt(mse_lin)), 2),
                "mae": round(float(mean_absolute_error(y_actual, pred_lin)), 2),
                "r2_score": round(float(r2_score(y_actual, pred_lin)), 6),
                "accuracy_pct": round(float(r2_score(y_actual, pred_lin)) * 100, 2)
            }

        # 2. Polynomial Regression Metrics
        if poly_model is not None:
            X_poly = poly_transformer.fit_transform(X)
            pred_poly = poly_model.predict(X_poly)
            mse_poly = mean_squared_error(y_actual, pred_poly)
            metrics['polynomial'] = {
                "model_name": "Polynomial Regression (Degree 2)",
                "mse": round(float(mse_poly), 2),
                "rmse": round(float(np.sqrt(mse_poly)), 2),
                "mae": round(float(mean_absolute_error(y_actual, pred_poly)), 2),
                "r2_score": round(float(r2_score(y_actual, pred_poly)), 6),
                "accuracy_pct": round(float(r2_score(y_actual, pred_poly)) * 100, 2)
            }

        # 3. SVR Metrics (Evaluated using StandardScaler)
        if svr_model is not None:
            X_scaled = scaler.transform(X)
            pred_svr = svr_model.predict(X_scaled)
            mse_svr = mean_squared_error(y_actual, pred_svr)
            r2_svr = r2_score(y_actual, pred_svr)
            metrics['svr'] = {
                "model_name": "Support Vector Regression (SVR)",
                "mse": round(float(mse_svr), 2),
                "rmse": round(float(np.sqrt(mse_svr)), 2),
                "mae": round(float(mean_absolute_error(y_actual, pred_svr)), 2),
                "r2_score": round(float(r2_svr), 6),
                "accuracy_pct": round(float(r2_svr) * 100, 2)
            }

        return {
            "success": True,
            "total_eval_samples": len(df),
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Metrics evaluation failed: {str(e)}")


@app.get("/api/sample")
def get_random_sample():
    """Returns a random actual sample from cleaned_stock_data.csv converted back to RAW user values"""
    if df is None or len(df) == 0:
        raise HTTPException(status_code=404, detail="Dataset not loaded")
    
    idx = random.randint(0, len(df) - 1)
    row = df.iloc[idx].to_dict()

    log_turnover = float(row.get("Turnover", 0))
    raw_turnover = round(float(np.expm1(log_turnover)), 2)

    pct_ratio = float(row.get("%Deliverble", 0))
    raw_pct = round(pct_ratio * 100.0, 2) if pct_ratio <= 1.0 else round(pct_ratio, 2)
    
    return {
        "index": idx,
        "sample": {
            "prev_close": float(row.get("Prev Close", 0)),
            "open_price": float(row.get("Open", 0)),
            "low_price": float(row.get("Low", 0)),
            "close_price": float(row.get("Close", 0)),
            "vwap": float(row.get("VWAP", 0)),
            "volume": float(row.get("Volume", 0)),
            "turnover": raw_turnover,
            "deliverable_volume": float(row.get("Deliverable Volume", 0)),
            "percent_deliverable": raw_pct,
            "model_type": "linear"
        },
        "actual_high": float(row.get("High", 0))
    }


@app.get("/api/stats")
def get_dataset_stats():
    """Returns average, min, max values for features from dataset"""
    if df is None:
        raise HTTPException(status_code=404, detail="Dataset not loaded")
    
    cols = ["Prev Close", "Open", "Low", "Close", "VWAP", "Volume", "Turnover", "Deliverable Volume", "%Deliverble", "High"]
    stats = {}
    for col in cols:
        if col in df.columns:
            stats[col] = {
                "mean": round(float(df[col].mean()), 2),
                "min": round(float(df[col].min()), 2),
                "max": round(float(df[col].max()), 2)
            }
    return {"total_rows": len(df), "stats": stats}


@app.get("/api/model-weights")
def get_model_weights():
    """Returns exact trained coefficients and intercept from Linear Regression model"""
    if linear_model is None:
        raise HTTPException(status_code=500, detail="Linear model is not loaded")
    
    feature_names = [
        "Prev Close", "Open", "Low", "Close", "VWAP", 
        "Volume", "Turnover", "Deliverable Volume", "%Deliverble"
    ]
    
    coefs = list(getattr(linear_model, "coef_", []))
    intercept = float(getattr(linear_model, "intercept_", 0.0))
    
    weights = []
    for name, coef in zip(feature_names, coefs):
        weights.append({
            "feature": name,
            "weight": round(float(coef), 6),
            "raw_coef": float(coef)
        })
        
    return {
        "model_type": "LinearRegression",
        "intercept": round(intercept, 6),
        "weights": weights
    }
