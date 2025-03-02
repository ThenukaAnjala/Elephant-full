# flask-service/detect.py
def detect_elephants(image_path, model):
    """
    Takes image_path + YOLO model,
    returns True if elephants found, else False.
    """
    results = model(image_path)
    return len(results[0].boxes) > 0
