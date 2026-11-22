"""Cliente mínimo del endpoint de predicción de Azure Custom Vision (clasificación)."""
import requests

def classify(image_bytes, endpoint, project_id, published_name, key, timeout=30):
    url = f"{endpoint.rstrip('/')}/customvision/v3.0/Prediction/{project_id}/classify/iterations/{published_name}/image"
    r = requests.post(url, headers={"Prediction-Key": key, "Content-Type": "application/octet-stream"},
                      data=image_bytes, timeout=timeout)
    r.raise_for_status()
    return {p["tagName"]: p["probability"] for p in r.json()["predictions"]}
