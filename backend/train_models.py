import os
import joblib
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import BaggingRegressor, AdaBoostRegressor, RandomForestRegressor
from sklearn.preprocessing import PolynomialFeatures

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "cleaned_stock_data.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")

def train_and_save():
    print(f"Loading data from {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    
    feature_cols = ['Prev Close', 'Open', 'Low', 'Close', 'VWAP', 'Volume', 'Turnover', 'Deliverable Volume', '%Deliverble']
    target_col = 'High'
    
    X = df[feature_cols]
    y = df[target_col]
    
    # 1. Bagging Linear Regression
    print("Training Bagging Linear Regression...")
    bagging_linear = BaggingRegressor(estimator=LinearRegression(), n_estimators=15, random_state=42)
    bagging_linear.fit(X, y)
    joblib.dump(bagging_linear, os.path.join(MODELS_DIR, "stock_model.pkl"))
    
    # 2. Bagging Polynomial Regression (Degree 2)
    print("Training Bagging Polynomial Regression...")
    poly_transformer = PolynomialFeatures(degree=2, include_bias=True)
    X_poly = poly_transformer.fit_transform(X)
    bagging_poly = BaggingRegressor(estimator=LinearRegression(), n_estimators=15, random_state=42)
    bagging_poly.fit(X_poly, y)
    joblib.dump(bagging_poly, os.path.join(MODELS_DIR, "stock_poly_model.pkl"))
    
    # 3. AdaBoost Regressor
    print("Training AdaBoost Regressor...")
    adaboost = AdaBoostRegressor(n_estimators=50, random_state=42)
    adaboost.fit(X, y)
    joblib.dump(adaboost, os.path.join(MODELS_DIR, "stock_adaboost_model.pkl"))
    
    # 4. Random Forest Regressor
    print("Training Random Forest Regressor...")
    rf = RandomForestRegressor(n_estimators=50, random_state=42)
    rf.fit(X, y)
    joblib.dump(rf, os.path.join(MODELS_DIR, "stock_rf_model.pkl"))

    print("All models trained and saved successfully.")

if __name__ == "__main__":
    train_and_save()
