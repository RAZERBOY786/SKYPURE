import numpy as np
import joblib
import os

def predict_aqi_ml(readings: list, city_slug: str):
    input_data = np.array(readings).reshape(1, 6, 4)

    model_path = f"models/aqi_{city_slug}.pkl"

    if os.path.exists(model_path):
        model = joblib.load(model_path)
        return int(model.predict(input_data)[0])

    # Fallback logic
    avg_pm25 = np.mean([r[2] for r in readings])
    return int(avg_pm25 * 2)