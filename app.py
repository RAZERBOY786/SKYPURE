from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn
import os
import csv
import random
import time

app = FastAPI(title="SkyPure Data Collector")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📁 Setup folder
DATA_FOLDER = "data"
os.makedirs(DATA_FOLDER, exist_ok=True)

CSV_FILE = os.path.join(DATA_FOLDER, "aqi_data.csv")

# Create file if not exists
if not os.path.exists(CSV_FILE):
    with open(CSV_FILE, mode="w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["timestamp", "PM10", "NO2", "PM2.5", "O3"])


@app.get("/")
def home():
    return {"message": "SkyPure Collector Running 🚀"}


# 🔥 MAIN FEATURE
@app.get("/collect/60sec")
def collect_data_60sec():
    try:
        for i in range(60):  # 60 seconds
            pm10 = random.uniform(50, 150)
            no2 = random.uniform(20, 80)
            pm25 = random.uniform(30, 120)
            o3 = random.uniform(10, 60)

            with open(CSV_FILE, mode="a", newline="") as file:
                writer = csv.writer(file)
                writer.writerow([
                    datetime.now().isoformat(),
                    pm10,
                    no2,
                    pm25,
                    o3
                ])

            time.sleep(1)  # wait 1 sec

        return {"message": "60 seconds data collection completed ✅"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)