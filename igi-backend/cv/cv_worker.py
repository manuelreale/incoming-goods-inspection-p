# cv/cv_worker.py

import cv2
import numpy as np
import onnxruntime as ort
import threading
import time

# Load ONNX model once globally
ort_session = ort.InferenceSession("cv/u2netp.onnx", providers=["CPUExecutionProvider"])

# Shared bounding box result
latest_boxes = []

def get_salient_mask(frame):
    input_size = (224, 224)
    resized = cv2.resize(frame, input_size)
    img = resized.astype(np.float32) / 255.0
    img = img.transpose(2, 0, 1)  # HWC to CHW
    img = np.expand_dims(img, axis=0)  # Add batch dim

    ort_inputs = {ort_session.get_inputs()[0].name: img}
    ort_outs = ort_session.run(None, ort_inputs)
    pred = ort_outs[0][0][0]

    pred = (pred - pred.min()) / (pred.max() - pred.min() + 1e-8)
    mask = (pred * 255).astype(np.uint8)
    mask = cv2.resize(mask, (frame.shape[1], frame.shape[0]))
    return mask

def get_bounding_box(mask, max_boxes=1):
    thresh = cv2.threshold(mask, 128, 255, cv2.THRESH_BINARY)[1]
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return []
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:max_boxes]
    boxes = [cv2.boundingRect(c) for c in contours]
    return [(x, y, x + w, y + h) for (x, y, w, h) in boxes]

def get_latest_boxes():
    return latest_boxes.copy()

def start_cv_loop():
    def loop():
        global latest_boxes
        cap = cv2.VideoCapture(0)
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

        if not cap.isOpened():
            print("❌ Could not open webcam")
            return

        print("✅ CV worker started")
        while True:
            ret, frame = cap.read()
            if not ret:
                continue

            mask = get_salient_mask(frame)
            latest_boxes = get_bounding_box(mask)
            time.sleep(0.001)  # ~20 FPS, tweak as needed

    thread = threading.Thread(target=loop, daemon=True)
    thread.start()