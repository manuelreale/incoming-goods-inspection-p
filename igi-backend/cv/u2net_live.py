import cv2
import torch
import numpy as np
import os
import threading
import time

# Download U2Net model definition
# (you can also pip install if you package it, but here's the core)

from torchvision import transforms

import onnxruntime as ort

# Load ONNX model once globally
ort_session = ort.InferenceSession("u2netp.onnx", providers=["CPUExecutionProvider"])

def get_salient_mask(frame):
    # Resize to match ONNX input size
    input_size = (224, 224)
    resized = cv2.resize(frame, input_size)
    img = resized.astype(np.float32) / 255.0
    img = img.transpose(2, 0, 1)  # HWC to CHW
    img = np.expand_dims(img, axis=0)  # Add batch dim

    # Run ONNX model
    ort_inputs = {ort_session.get_inputs()[0].name: img}
    ort_outs = ort_session.run(None, ort_inputs)
    pred = ort_outs[0][0][0]

    # Normalize and resize to original
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

def main():
    print("Loading model...")
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    if not cap.isOpened():
        print("Could not open webcam")
        return

    print("Model loaded. Running...")

    bbox = None
    latest_mask = [None]
    latest_frame = [None]

    def inference_loop():
        while True:
            if latest_frame[0] is not None:
                frame = latest_frame[0].copy()
                mask = get_salient_mask(frame)
                box = get_bounding_box(mask)
                nonlocal bbox
                bbox = box
                latest_mask[0] = mask
            time.sleep(0.001)  # Yield thread

    thread = threading.Thread(target=inference_loop, daemon=True)
    thread.start()

    frame_count = 0
    start_time = time.time()
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        latest_frame[0] = frame.copy()

        if bbox:
            for (x1, y1, x2, y2) in bbox:
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)

        if latest_mask[0] is not None:
            overlay = cv2.applyColorMap(latest_mask[0], cv2.COLORMAP_JET)
            overlay = cv2.addWeighted(frame, 0.7, overlay, 0.3, 0)
            frame = overlay

        cv2.imshow("Salient Object Detection", frame)

        frame_count += 1
        if frame_count % 30 == 0:
            elapsed = time.time() - start_time
            fps = frame_count / elapsed
            print(f"FPS: {fps:.2f}")

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()