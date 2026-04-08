import random
import time

def city_to_slug(city: str):
    return city.lower().replace(" ", "_")

def fetch_fast_burst(lat: float, lon: float, slug: str):
    """
    Simulates 6-second burst AQI data collection
    Each reading: [PM10, NO2, PM2.5, O3]
    """
    data = []

    for _ in range(6):
        reading = [
            random.uniform(50, 150),   # PM10
            random.uniform(20, 80),    # NO2
            random.uniform(30, 120),   # PM2.5
            random.uniform(10, 60),    # O3
        ]
        data.append(reading)
        time.sleep(1)  # simulate real-time delay

    return data