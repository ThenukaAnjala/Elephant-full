import os
import cv2
import time
import torch
import socketio  # Python Socket.IO client
from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

# Directory for saving uploaded/processed videos
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Path to your YOLOv8 elephant model
MODEL_PATH = "best_yolo8_elephant.pt"
model = YOLO(MODEL_PATH)

# Set up a Socket.IO client to connect to your Node.js backend.
# (Make sure your Node.js Socket.IO server is running at the given URL.)
sio = socketio.Client()
sio.connect("http://127.0.0.1:3000")  # Adjust as needed

# Throttle socket updates: send status updates at most every 1 second.
last_status_sent = 0
status_interval = 1.0  # seconds

@app.route("/", methods=["GET"])
def home():
    return "Flask Elephant Detection Backend Running"

@app.route("/process_videos", methods=["POST"])
def process_videos():
    """
    Processes an uploaded video (form-data field "camera_video") frame-by-frame.
    Draws red bounding boxes for detections with confidence > 64% and returns
    a JSON response with a flag and the processed video filename.
    """
    if "camera_video" not in request.files:
        return jsonify({"error": "No camera_video file provided"}), 400

    file = request.files["camera_video"]
    input_filename = "input_camera.mp4"
    input_path = os.path.join(app.config["UPLOAD_FOLDER"], input_filename)
    file.save(input_path)

    output_filename = "processed_camera.mp4"
    output_path = os.path.join(app.config["UPLOAD_FOLDER"], output_filename)

    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        if os.path.exists(input_path):
            os.remove(input_path)
        return jsonify({"error": "Could not open video file"}), 400

    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    found_elephants = False

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        results = model(frame)[0]
        for box in results.boxes:
            conf = float(box.conf[0].item())
            if conf > 0.64:
                found_elephants = True
                coords = box.xyxy[0].cpu().numpy().astype(int)
                x1, y1, x2, y2 = coords
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
        out.write(frame)

    cap.release()
    out.release()

    if os.path.exists(input_path):
        os.remove(input_path)

    return jsonify({
        "foundElephants": found_elephants,
        "processedVideo": output_filename
    })

@app.route("/uploads/<filename>")
def serve_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

@app.route("/video_feed", methods=["GET"])
def video_feed():
    """
    Streams live video from the server’s local camera device (using cv2.VideoCapture(0)).
    For each frame, YOLO detection is run. If a detection (confidence > 64%) is present,
    a red bounding box is drawn. Every status_interval seconds, a socket event "cameraStatus"
    is emitted with the current detection state (true if a box is drawn, false otherwise).
    The endpoint accepts an optional query parameter "cameraEmail" for identification.
    """
    camera_email = request.args.get("cameraEmail", "default_camera@example.com")

    def generate_frames():
        global last_status_sent
        cap = cv2.VideoCapture(0)  # Local camera device
        if not cap.isOpened():
            return
        prev_state = None
        prev_time = time.time()
        while True:
            ret, frame = cap.read()
            if not ret:
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue

            results = model(frame)[0]
            current_state = any(float(box.conf[0].item()) > 0.64 for box in results.boxes)

            # If state has changed or enough time has passed, emit socket event
            current_time = time.time()
            if prev_state is None or (current_state != prev_state and current_time - prev_time > status_interval):
                duration_ms = (current_time - prev_time) * 1000
                try:
                    sio.emit("cameraStatus", {
                        "cameraEmail": camera_email,
                        "elephants": prev_state if prev_state is not None else current_state,
                        "duration": duration_ms
                    })
                except Exception as e:
                    print("Socket emit error:", e)
                prev_state = current_state
                prev_time = current_time

            if current_state:
                for box in results.boxes:
                    conf = float(box.conf[0].item())
                    if conf > 0.64:
                        coords = box.xyxy[0].cpu().numpy().astype(int)
                        x1, y1, x2, y2 = coords
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)

            ret, buffer = cv2.imencode(".jpg", frame)
            if not ret:
                continue
            yield (b"--frame\r\n"
                   b"Content-Type: image/jpeg\r\n\r\n" + buffer.tobytes() + b"\r\n")
            time.sleep(0.03)
        cap.release()

    return Response(generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")

if __name__ == "__main__":
    app.run(port=5000, debug=True)
